"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { AlertCircle, ArrowRight, Check, CheckCheck, Download, FileText, Image, Loader2, LockKeyhole, Maximize2, RefreshCw, X } from "lucide-react";
import FileDropzone from "./FileDropzone";
import { downloadPagesAsZip, downloadSinglePage, parsePdfDocument, renderPdfPage, type RenderedPage } from "@/lib/pdf-utils";

type Format = "image/jpeg" | "image/png" | "image/webp";
const FORMATS: { value: Format; label: string; extension: string }[] = [{ value: "image/jpeg", label: "JPEG", extension: "jpg" }, { value: "image/png", label: "PNG", extension: "png" }, { value: "image/webp", label: "WebP", extension: "webp" }];

export default function PDFToImageConverter({ embedded = false, initialFormat = "image/jpeg" }: { embedded?: boolean; initialFormat?: Format }) {
  const [file, setFile] = useState<File | null>(null);
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [format, setFormat] = useState<Format>(initialFormat);
  const [resultFormat, setResultFormat] = useState<Format>(initialFormat);
  const [scale, setScale] = useState(2);
  const [quality, setQuality] = useState(0.9);
  const [pages, setPages] = useState<RenderedPage[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [processing, setProcessing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<RenderedPage | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const documentRef = useRef<PDFDocumentProxy | null>(null);
  const runId = useRef(0);

  useEffect(() => () => { runId.current++; void documentRef.current?.destroy(); }, []);
  useEffect(() => { if (preview) dialog.current?.showModal(); else dialog.current?.close(); }, [preview]);

  async function convert(pdf: PDFDocumentProxy, task: number) {
    setProcessing(true);
    setPages([]);
    setError("");
    setProgress({ current: 0, total: pdf.numPages });
    const rendered: RenderedPage[] = [];
    try {
      for (let number = 1; number <= pdf.numPages; number++) {
        const page = await renderPdfPage(pdf, number, { format, scale, quality });
        if (task !== runId.current) return;
        rendered.push(page);
        setProgress({ current: number, total: pdf.numPages });
      }
      setPages(rendered);
      setSelected(new Set(rendered.map((page) => page.pageNumber)));
      setResultFormat(format);
      setDirty(false);
    } catch (reason) { if (task === runId.current) setError(reason instanceof Error ? reason.message : "This PDF could not be converted. Try another file."); }
    finally { if (task === runId.current) setProcessing(false); }
  }

  async function loadFile(nextFile: File) {
    const task = ++runId.current;
    setFile(nextFile);
    setDoc(null);
    setPages([]);
    setError("");
    setProcessing(true);
    setProgress({ current: 0, total: 0 });
    try {
      await documentRef.current?.destroy();
      documentRef.current = null;
      const parsed = await parsePdfDocument(nextFile);
      if (task !== runId.current) { await parsed.pdfDoc.destroy(); return; }
      documentRef.current = parsed.pdfDoc;
      setDoc(parsed.pdfDoc);
      await convert(parsed.pdfDoc, task);
    } catch (reason) {
      if (task === runId.current) { setError(reason instanceof Error ? reason.message : "This PDF could not be opened. Choose an unencrypted PDF."); setProcessing(false); }
    }
  }

  function reset() { ++runId.current; void documentRef.current?.destroy(); documentRef.current = null; setDoc(null); setFile(null); setPages([]); setSelected(new Set()); setError(""); setDirty(false); setPreview(null); }
  function toggle(number: number) { setSelected((previous) => { const next = new Set(previous); if (next.has(number)) next.delete(number); else next.add(number); return next; }); }
  const extension = FORMATS.find((item) => item.value === resultFormat)!.extension;
  async function downloadZip() {
    if (!selected.size || downloading) return;
    setDownloading(true);
    try { await downloadPagesAsZip(pages.filter((page) => selected.has(page.pageNumber)), `${file?.name.replace(/\.pdf$/i, "") || "converted"}-images.zip`, extension); }
    catch { setError("The ZIP download could not be created. Try downloading individual pages."); }
    finally { setDownloading(false); }
  }
  const Heading = embedded ? "h2" : "h1";
  return <div className={`pdf-tool ${embedded ? "is-embedded" : ""}`}>
    {!embedded && <div className="converter-heading"><p className="eyebrow">PDF tools / {FORMATS.find((item) => item.value === initialFormat)?.label}</p><Heading>PDF to {FORMATS.find((item) => item.value === initialFormat)?.label}</Heading><p>Export PDF pages as images. Choose your format and resolution, preview each page, and download the ones you need.</p></div>}
    <div className="converter-window app-frame">
      <div className="window-titlebar"><div className="window-title"><span className="window-file-icon"><FileText size={18} /></span><ArrowRight size={14} /><Image size={19} /><p className="window-heading">PDF to image</p></div><span className="window-status"><span /> Local processing</span></div>
      <div className="converter-body">
        <div className="output-format"><span className="field-label" id={embedded ? "output-label-home" : "output-label"}>Convert to</span><div className="format-options" role="group" aria-labelledby={embedded ? "output-label-home" : "output-label"}>{FORMATS.map((item) => <button type="button" key={item.value} aria-pressed={format === item.value} disabled={processing} onClick={() => { setFormat(item.value); if (doc) setDirty(true); }}>{item.label}{format === item.value && <Check size={14} />}</button>)}</div></div>
        <FileDropzone accept="application/pdf,.pdf" onFileSelect={loadFile} selectedFile={file} onClearFile={reset} disabled={processing || downloading} />
        <div className="converter-settings"><label><span>Resolution</span><select aria-label="Output resolution" value={scale} disabled={processing} onChange={(event) => { setScale(Number(event.target.value)); if (doc) setDirty(true); }}><option value={1}>72 DPI</option><option value={2}>144 DPI (2x)</option><option value={300 / 72}>300 DPI</option></select></label><label className="quality-field"><span>Image quality <output>{Math.round(quality * 100)}%</output></span><input aria-label="Image quality" type="range" min="0.5" max="1" step="0.05" value={quality} disabled={processing || format === "image/png"} onChange={(event) => { setQuality(Number(event.target.value)); if (doc) setDirty(true); }} /></label></div>
        {dirty && doc && <button type="button" className="btn btn--primary apply-settings" onClick={() => void convert(doc, ++runId.current)} disabled={processing}><RefreshCw size={16} /> Apply settings</button>}
        {processing && <div className="conversion-progress" role="status"><div><Loader2 size={17} className="spinner" /><span>{progress.total ? `Converting page ${Math.min(progress.current + 1, progress.total)} of ${progress.total}` : "Opening your PDF…"}</span></div><progress max={progress.total || 1} value={progress.current} /></div>}
        {error && <p role="alert" className="error-message"><AlertCircle size={17} />{error}</p>}
      </div>
      <div className="window-foot"><span><LockKeyhole size={13} /> Your file never leaves this device</span><span>PDF → {FORMATS.find((item) => item.value === format)?.label}</span></div>
    </div>
    {pages.length > 0 && !processing && <div className="conversion-results"><div className="results-toolbar"><div><h2><CheckCheck size={21} /> {pages.length} page{pages.length !== 1 && "s"} ready</h2><p>{dirty ? "Apply your new settings to update these images." : "Preview your pages and save the ones you need."}</p></div><button type="button" className="btn btn--primary" disabled={!selected.size || downloading} onClick={downloadZip}>{downloading ? <Loader2 className="spinner" size={17} /> : <Download size={17} />}{downloading ? "Creating ZIP…" : `Download ZIP (${selected.size})`}</button></div><button type="button" className="selection-toggle" onClick={() => setSelected(selected.size === pages.length ? new Set() : new Set(pages.map((page) => page.pageNumber)))}>{selected.size === pages.length ? "Deselect all pages" : "Select all pages"}</button><div className="page-previews">{pages.map((page) => <article key={page.pageNumber} className={`page-preview ${selected.has(page.pageNumber) ? "is-selected" : ""}`}><div className="page-preview-top"><label><input type="checkbox" checked={selected.has(page.pageNumber)} onChange={() => toggle(page.pageNumber)} />Page {page.pageNumber}</label><button type="button" className="icon-button" aria-label={`Preview page ${page.pageNumber}`} onClick={() => setPreview(page)}><Maximize2 size={16} /></button></div><button type="button" className="preview-image-button" onClick={() => setPreview(page)} aria-label={`Enlarge page ${page.pageNumber}`}><img src={page.dataUrl} alt={`Converted PDF page ${page.pageNumber}`} /></button><div className="page-preview-foot"><span>{page.width} × {page.height}</span><button type="button" className="icon-button" aria-label={`Download page ${page.pageNumber}`} onClick={() => downloadSinglePage(page, `page-${page.pageNumber}.${extension}`)}><Download size={17} /></button></div></article>)}</div></div>}
    <dialog ref={dialog} className="preview-dialog" onCancel={() => setPreview(null)} onClick={(event) => { if (event.target === event.currentTarget) setPreview(null); }}>{preview && <><div className="dialog-header"><h2>Page {preview.pageNumber}</h2><button className="icon-button" type="button" aria-label="Close preview" onClick={() => setPreview(null)}><X size={21} /></button></div><img src={preview.dataUrl} alt={`Full preview of PDF page ${preview.pageNumber}`} /><div className="dialog-actions"><span>{preview.width} × {preview.height} pixels</span><button className="btn btn--primary" type="button" onClick={() => downloadSinglePage(preview, `page-${preview.pageNumber}.${extension}`)}><Download size={17} /> Download image</button></div></>}</dialog>
  </div>;
}
