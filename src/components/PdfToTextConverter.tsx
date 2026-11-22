"use client";

import { useState } from "react";
import saveAs from "file-saver";
import { Check, Copy, Download } from "lucide-react";
import FileDropzone from "./FileDropzone";
import { DocumentToolStatus, LocalFileNote } from "./DocumentToolStatus";
import useConversionTask from "@/hooks/useConversionTask";
import { extractPdfText } from "@/lib/document-tools";

export default function PdfToTextConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Awaited<ReturnType<typeof extractPdfText>> | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const task = useConversionTask();

  function selectFile(next: File | null) { setFile(next); setResult(null); setCopyStatus(""); task.clear(); }

  async function extract() {
    if (!file) return;
    setResult(null);
    setCopyStatus("");
    const output = await task.run((context) => extractPdfText(file, context));
    if (output) setResult(output);
  }

  async function copyText() {
    if (!result?.text.trim()) return;
    try { await navigator.clipboard.writeText(result.text); setCopyStatus("Text copied."); }
    catch { setCopyStatus("Clipboard access is unavailable. Select and copy the text from the preview."); }
  }

  return <div className="document-tool" data-tool="pdf-to-text">
    <div className="converter-heading"><p className="eyebrow">Document tools</p><h1>PDF to Text</h1><p>Extract selectable text from every PDF page. Preview it, copy it, or save it as a UTF-8 text file.</p></div>
    <div className="image-workspace">
      <FileDropzone accept="application/pdf,.pdf" selectedFile={file} onFileSelect={selectFile} onClearFile={() => selectFile(null)} disabled={task.busy} />
      <p className="document-note">Scanned pages need OCR. This tool extracts existing text; it does not recognize text inside images.</p>
      <div className="document-actions"><button type="button" className="btn btn--primary" disabled={!file || task.busy} onClick={extract}>Extract text</button></div>
      <DocumentToolStatus {...task} onCancel={task.cancel} />
      {result && <div className="text-extraction-result">
        {result.text.trim() ? <>
          <div className="document-result-heading"><h2>Extracted text</h2><span>{result.pageCount} page{result.pageCount !== 1 && "s"} · {result.text.length.toLocaleString()} characters</span></div>
          {result.emptyPages > 0 && <p className="document-note" role="status">{result.emptyPages} page{result.emptyPages !== 1 && "s"} contained no selectable text and may need OCR.</p>}
          <label className="text-preview-label" htmlFor="extracted-text">Text preview</label>
          <textarea id="extracted-text" className="extracted-text" readOnly value={result.text} rows={16} spellCheck={false} />
          <div className="document-actions"><button type="button" className="btn btn--primary" onClick={() => saveAs(new Blob([result.text], { type: "text/plain;charset=utf-8" }), `${file!.name.replace(/\.pdf$/i, "")}.txt`)}><Download size={18} /> Download text</button><button type="button" className="btn btn--secondary" onClick={copyText}>{copyStatus === "Text copied." ? <Check size={18} /> : <Copy size={18} />} Copy text</button></div>
          {copyStatus && <p className="document-note" role="status">{copyStatus}</p>}
        </> : <div className="document-result" role="status"><div><h2>No selectable text found</h2><p>This PDF may contain scanned images. Use an OCR tool to recognize their text.</p></div></div>}
      </div>}
      <LocalFileNote />
    </div>
  </div>;
}
