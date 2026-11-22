"use client";

import { useState } from "react";
import saveAs from "file-saver";
import { Download, FileCheck2 } from "lucide-react";
import FileDropzone from "./FileDropzone";
import { DocumentToolStatus, LocalFileNote } from "./DocumentToolStatus";
import useConversionTask from "@/hooks/useConversionTask";
import { formatBytes, optimizePdf, type OptimizeOptions } from "@/lib/document-tools";

export default function PdfOptimizer() {
  const [file, setFile] = useState<File | null>(null);
  const [options, setOptions] = useState<OptimizeOptions>({ mode: "preserve", dpi: 144, quality: 0.75 });
  const [result, setResult] = useState<Awaited<ReturnType<typeof optimizePdf>> | null>(null);
  const task = useConversionTask();

  function selectFile(next: File | null) { setFile(next); setResult(null); task.clear(); }
  function changeOptions(next: Partial<OptimizeOptions>) { setOptions({ ...options, ...next }); setResult(null); task.clear(); }

  async function optimize() {
    if (!file) return;
    setResult(null);
    const output = await task.run((context) => optimizePdf(file, options, context));
    if (output) setResult(output);
  }

  return <div className="document-tool" data-tool="pdf-compressor">
    <div className="converter-heading"><p className="eyebrow">PDF tools</p><h1>PDF Optimizer</h1><p>Reduce PDF overhead or compress pages as images. Compare the file sizes before downloading.</p></div>
    <div className="image-workspace">
      <FileDropzone accept="application/pdf,.pdf" selectedFile={file} onFileSelect={selectFile} onClearFile={() => selectFile(null)} disabled={task.busy} />
      <div className="converter-settings document-settings">
        <label className="optimizer-mode"><span>Optimization mode</span><select value={options.mode} disabled={task.busy} onChange={(event) => changeOptions({ mode: event.target.value as OptimizeOptions["mode"] })}><option value="preserve">Preserve text and links</option><option value="images">Compress pages as images</option></select></label>
        {options.mode === "images" && <>
          <label><span>Maximum image resolution</span><select value={options.dpi} disabled={task.busy} onChange={(event) => changeOptions({ dpi: Number(event.target.value) })}><option value={144}>144 DPI · Higher detail</option><option value={96}>96 DPI · Balanced</option><option value={72}>72 DPI · Smaller size</option></select></label>
          <label className="quality-field"><span>JPEG quality <output>{Math.round(options.quality * 100)}%</output></span><input type="range" min="0.3" max="0.95" step="0.05" value={options.quality} disabled={task.busy} onChange={(event) => changeOptions({ quality: Number(event.target.value) })} /></label>
        </>}
      </div>
      <p className="document-note" id="optimization-note">{options.mode === "preserve" ? "Compacts the PDF structure while keeping existing text and links. Some files are already optimized; image-heavy PDFs may need image compression." : "Image compression converts each page to a JPEG image. Selectable text, links, and form fields are removed. Lower resolution or quality can reduce file size further."}</p>
      <div className="document-actions"><button type="button" className="btn btn--primary" aria-describedby="optimization-note" disabled={!file || task.busy} onClick={optimize}>Optimize PDF</button></div>
      <DocumentToolStatus {...task} onCancel={task.cancel} />
      {result && <div className="optimization-result">
        <div className="document-result-heading"><h2><FileCheck2 size={22} />{result.improved ? "Your optimized PDF is ready" : "Your original is already smaller"}</h2></div>
        <dl className="file-size-comparison"><div><dt>Original</dt><dd>{formatBytes(result.originalSize)}</dd></div><div><dt>Download size</dt><dd>{formatBytes(result.outputSize)}</dd></div><div><dt>Space saved</dt><dd>{result.improved ? `${((1 - result.outputSize / result.originalSize) * 100).toFixed(1)}%` : "0%"}</dd></div></dl>
        <p className="document-note" role="status">{result.improved ? `${result.pageCount} page${result.pageCount !== 1 ? "s" : ""}. ${result.mode === "preserve" ? "Existing text and links are preserved." : "Pages are saved as images; text is not selectable."}` : `The attempted output was ${formatBytes(result.candidateSize)}. Your original PDF is kept unchanged instead of making it larger.`}</p>
        <div className="document-actions"><button type="button" className="btn btn--primary" onClick={() => saveAs(result.blob, result.improved ? `${file!.name.replace(/\.pdf$/i, "")}-optimized.pdf` : file!.name)}><Download size={18} />{result.improved ? "Download optimized PDF" : "Download original PDF"}</button></div>
      </div>}
      <LocalFileNote />
    </div>
  </div>;
}
