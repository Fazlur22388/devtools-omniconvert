"use client";

import { useRef, useState } from "react";
import { AlertCircle, ArrowUp, FileCheck2, FileText, Image, X } from "lucide-react";

interface FileDropzoneProps {
  accept: string;
  title?: string;
  description?: string;
  onFileSelect: (file: File) => void;
  multiple?: boolean;
  onFilesSelect?: (files: File[]) => void;
  selectedFile?: File | null;
  onClearFile?: () => void;
  disabled?: boolean;
}

export default function FileDropzone({ accept, title, description, onFileSelect, multiple = false, onFilesSelect, selectedFile, onClearFile, disabled = false }: FileDropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const isPdf = accept.includes("pdf");
  const select = (files: File[]) => {
    if (!files.length || disabled) return;
    setError("");
    const selection = multiple ? files : files.slice(0, 1);
    for (const file of selection) {
      if (isPdf ? !/\.pdf$/i.test(file.name) : !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setError(isPdf ? "Choose a PDF file with a .pdf extension." : "Choose JPG, PNG, or WebP images only.");
        return;
      }
      if (file.size > 100 * 1024 * 1024) { setError("This file is too large. Choose a file under 100 MB."); return; }
    }
    if (multiple && onFilesSelect) onFilesSelect(selection);
    else onFileSelect(selection[0]);
  };
  const browse = () => { if (input.current) { input.current.value = ""; input.current.click(); } };
  return <div className="file-picker">
    <input ref={input} type="file" accept={accept} multiple={multiple} className="sr-only" tabIndex={-1} aria-label={isPdf ? "Choose a PDF file" : multiple ? "Choose image files" : "Choose an image file"} onChange={(event) => select(Array.from(event.target.files || []))} disabled={disabled} />
    {selectedFile ? <div className="selected-file"><FileCheck2 size={28} /><div><strong>{selectedFile.name}</strong><span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB · On your device</span></div>{onClearFile && <button type="button" className="icon-button" aria-label="Remove file" disabled={disabled} onClick={() => { setError(""); onClearFile(); }}><X size={18} /></button>}</div> :
      <div className={`drop-area ${dragging ? "is-dragging" : ""}`} onDragOver={(event) => { event.preventDefault(); if (!disabled) setDragging(true); }} onDragLeave={(event) => { event.preventDefault(); if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false); }} onDrop={(event) => { event.preventDefault(); setDragging(false); select(Array.from(event.dataTransfer.files)); }}>
        <div className="upload-illustration" aria-hidden="true"><span className="upload-sheet sheet-back" /><span className="upload-sheet">{isPdf ? <FileText size={27} strokeWidth={1.3} /> : <Image size={27} strokeWidth={1.3} />}<span>{isPdf ? "PDF" : "IMG"}</span></span><span className="upload-plus"><ArrowUp size={16} /></span></div>
        <p className="drop-title">{title || (isPdf ? "Drop your PDF here" : multiple ? "Drop your images here" : "Drop your image here")}</p>
        <p>{description || "or browse the files on your device"}</p>
        <button type="button" className="btn btn--primary" disabled={disabled} onClick={browse}>{isPdf ? "Choose a PDF" : multiple ? "Choose images" : "Choose an image"}<ArrowUp size={17} /></button>
        <span className="upload-limit">{isPdf ? "PDF" : "JPG, PNG, WebP"} · Up to 100 MB</span>
      </div>}
    {error && <p className="error-message" role="alert"><AlertCircle size={17} />{error}</p>}
  </div>;
}
