"use client";

import { useEffect, useRef, useState } from "react";
import saveAs from "file-saver";
import { ArrowDown, ArrowUp, Download, FileCheck2, X } from "lucide-react";
import FileDropzone from "./FileDropzone";
import { DocumentToolStatus, LocalFileNote } from "./DocumentToolStatus";
import useConversionTask from "@/hooks/useConversionTask";
import { formatBytes, imagesToPdf, type ImagePdfOptions } from "@/lib/document-tools";

type ImageItem = { id: string; file: File; preview: string };

export default function ImageToPdfConverter() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const filesRef = useRef<ImageItem[]>([]);
  const [options, setOptions] = useState<ImagePdfOptions>({ pageSize: "a4", orientation: "auto", margin: 18 });
  const [result, setResult] = useState<Awaited<ReturnType<typeof imagesToPdf>> | null>(null);
  const task = useConversionTask();

  useEffect(() => () => { filesRef.current.forEach((item) => URL.revokeObjectURL(item.preview)); }, []);

  function updateImages(next: ImageItem[]) {
    filesRef.current = next;
    setImages(next);
    setResult(null);
    task.clear();
  }

  function addFiles(files: File[]) {
    if (files.reduce((sum, file) => sum + file.size, 0) + images.reduce((sum, item) => sum + item.file.size, 0) > 100 * 1024 * 1024) {
      task.setError("Choose images with a combined size of 100 MB or less.");
      return;
    }
    updateImages([...images, ...files.map((file) => ({ id: crypto.randomUUID(), file, preview: URL.createObjectURL(file) }))]);
  }

  function move(index: number, direction: -1 | 1) {
    const next = [...images];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    updateImages(next);
  }

  function remove(index: number) {
    URL.revokeObjectURL(images[index].preview);
    updateImages(images.filter((_, position) => position !== index));
  }

  function changeOptions(next: Partial<ImagePdfOptions>) {
    setOptions({ ...options, ...next });
    setResult(null);
    task.clear();
  }

  async function createPdf() {
    setResult(null);
    const output = await task.run((context) => imagesToPdf(images.map((item) => item.file), options, context));
    if (output) setResult(output);
  }

  return <div className="document-tool" data-tool="image-to-pdf">
    <div className="converter-heading"><p className="eyebrow">PDF tools</p><h1>Image to PDF</h1><p>Combine JPG, PNG, and WebP images into one PDF. Put the pages in order and choose how each image fits.</p></div>
    <div className="image-workspace">
      <FileDropzone accept="image/jpeg,image/png,image/webp" multiple onFileSelect={(file) => addFiles([file])} onFilesSelect={addFiles} disabled={task.busy} description="Add one or more images. Up to 100 MB combined." />
      {images.length > 0 && <>
        <div className="document-list-heading"><h2>{images.length} image{images.length !== 1 && "s"}</h2><button type="button" className="btn btn--secondary" disabled={task.busy} onClick={() => { images.forEach((item) => URL.revokeObjectURL(item.preview)); updateImages([]); }}>Clear images</button></div>
        <ol className="image-pdf-list">{images.map((item, index) => <li key={item.id}>
          <img src={item.preview} alt={`Page ${index + 1}: ${item.file.name}`} />
          <div className="image-pdf-name"><strong>{item.file.name}</strong><span>Page {index + 1} · {formatBytes(item.file.size)}</span></div>
          <div className="image-pdf-actions"><button type="button" className="icon-button" aria-label={`Move image ${index + 1} up`} disabled={task.busy || index === 0} onClick={() => move(index, -1)}><ArrowUp size={18} /></button><button type="button" className="icon-button" aria-label={`Move image ${index + 1} down`} disabled={task.busy || index === images.length - 1} onClick={() => move(index, 1)}><ArrowDown size={18} /></button><button type="button" className="icon-button" aria-label={`Remove image ${index + 1}`} disabled={task.busy} onClick={() => remove(index)}><X size={18} /></button></div>
        </li>)}</ol>
      </>}
      <div className="converter-settings document-settings">
        <label><span>Page size</span><select value={options.pageSize} disabled={task.busy} onChange={(event) => changeOptions({ pageSize: event.target.value as ImagePdfOptions["pageSize"] })}><option value="a4">A4</option><option value="letter">US Letter</option><option value="image">Fit to image (96 DPI)</option></select></label>
        <label><span>Orientation</span><select value={options.orientation} disabled={task.busy || options.pageSize === "image"} onChange={(event) => changeOptions({ orientation: event.target.value as ImagePdfOptions["orientation"] })}><option value="auto">Match each image</option><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></label>
        <label><span>Page margins</span><select value={options.margin} disabled={task.busy} onChange={(event) => changeOptions({ margin: Number(event.target.value) })}><option value={0}>No margin</option><option value={18}>Small · 0.25 inch</option><option value={36}>Wide · 0.5 inch</option></select></label>
      </div>
      <div className="document-actions"><button type="button" className="btn btn--primary" disabled={!images.length || task.busy} onClick={createPdf}>Create PDF</button></div>
      <DocumentToolStatus {...task} onCancel={task.cancel} />
      {result && <div className="document-result" role="status"><div><h2><FileCheck2 size={22} /> Your PDF is ready</h2><p>{result.pageCount} page{result.pageCount !== 1 && "s"} · {formatBytes(result.blob.size)}</p></div><button type="button" className="btn btn--primary" onClick={() => saveAs(result.blob, "combined-images.pdf")}><Download size={18} /> Download PDF</button></div>}
      <LocalFileNote />
    </div>
  </div>;
}
