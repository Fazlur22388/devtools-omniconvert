"use client";

import { useRef, useState } from "react";
import saveAs from "file-saver";
import { AlertCircle, Download, LockKeyhole } from "lucide-react";
import FileDropzone from "./FileDropzone";

export default function ImageConverter({ initialFrom = "JPG", initialTo = "PNG" }: { initialFrom?: string; initialTo?: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState(initialTo.toLowerCase());
  const [quality, setQuality] = useState(0.9);
  const [result, setResult] = useState<{ url: string; blob: Blob; format: string; width: number; height: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const task = useRef(0);

  async function convert(source: File, target: string, imageQuality: number) {
    const version = ++task.current;
    setBusy(true); setError(""); setResult(null);
    const sourceUrl = URL.createObjectURL(source);
    try {
      const image = new window.Image();
      image.src = sourceUrl;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Your browser could not prepare this image.");
      if (target === "jpg") { context.fillStyle = "#fff"; context.fillRect(0, 0, canvas.width, canvas.height); }
      context.drawImage(image, 0, 0);
      const mime = target === "jpg" ? "image/jpeg" : `image/${target}`;
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("The image could not be converted.")), mime, imageQuality));
      if (version === task.current) setResult({ url: canvas.toDataURL(mime, imageQuality), blob, format: target, width: canvas.width, height: canvas.height });
    } catch (reason) { if (version === task.current) setError(reason instanceof Error ? reason.message : "This image could not be opened. Try another file."); }
    finally { URL.revokeObjectURL(sourceUrl); if (version === task.current) setBusy(false); }
  }

  return <div className="image-tool"><div className="converter-heading"><p className="eyebrow">Image tools</p><h1>{initialFrom} to {initialTo}</h1><p>Change your image format, adjust the quality, and download the result. Your image stays on this device.</p></div><div className="image-workspace"><FileDropzone accept="image/jpeg,image/png,image/webp" onFileSelect={(next) => { setFile(next); void convert(next, format, quality); }} selectedFile={file} onClearFile={() => { ++task.current; setFile(null); setResult(null); setError(""); }} disabled={busy} /><div className="converter-settings"><label><span>Output format</span><select value={format} disabled={busy} onChange={(event) => { setFormat(event.target.value); if (file) void convert(file, event.target.value, quality); }}><option value="png">PNG (.png)</option><option value="jpg">JPEG (.jpg)</option><option value="webp">WebP (.webp)</option></select></label><label className="quality-field"><span>Image quality <output>{Math.round(quality * 100)}%</output></span><input aria-label="Image quality" type="range" min="0.5" max="1" step="0.05" disabled={busy || format === "png"} value={quality} onChange={(event) => setQuality(Number(event.target.value))} onPointerUp={() => { if (file) void convert(file, format, quality); }} onKeyUp={(event) => { if (file && event.key.startsWith("Arrow")) void convert(file, format, quality); }} /></label></div>{busy && <p className="processing-note" role="status">Converting your image…</p>}{error && <p className="error-message" role="alert"><AlertCircle size={17} />{error}</p>}{result && <div className="image-result"><div className="image-result-heading"><span>{result.width} × {result.height} · {(result.blob.size / 1024).toFixed(1)} KB</span><button type="button" className="btn btn--primary" onClick={() => saveAs(result.blob, `${file?.name.replace(/\.[^/.]+$/, "")}-converted.${result.format}`)}><Download size={17} /> Download image</button></div><img src={result.url} alt={`Your converted ${result.format.toUpperCase()} image`} /></div>}<p className="library-note"><LockKeyhole size={15} /> Converted on your device</p></div></div>;
}
