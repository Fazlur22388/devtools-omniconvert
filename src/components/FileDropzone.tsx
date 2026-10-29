'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, AlertCircle, X, Check } from 'lucide-react';

interface FileDropzoneProps {
  accept: string; // e.g. "application/pdf" or "image/*"
  title?: string;
  description?: string;
  onFileSelect: (file: File) => void;
  selectedFile?: File | null;
  onClearFile?: () => void;
  disabled?: boolean;
}

export default function FileDropzone({
  accept,
  title = "Drop your PDF file here",
  description = "or click to select from your device (Max 100MB)",
  onFileSelect,
  selectedFile,
  onClearFile,
  disabled = false
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndPassFile(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndPassFile(file);
    }
  };

  const validateAndPassFile = (file: File) => {
    setErrorMsg(null);

    // Format verification
    if (accept.includes('pdf') && !file.type.includes('pdf') && !file.name.endsWith('.pdf')) {
      setErrorMsg('Please select a valid PDF document (.pdf)');
      return;
    }

    onFileSelect(file);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />

      {selectedFile ? (
        /* Selected File Card */
        <div className="glass-panel p-6 border-indigo-500/30 bg-indigo-950/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-white text-base truncate max-w-[240px] sm:max-w-md">
                  {selectedFile.name}
                </h4>
                <span className="badge badge-indigo">
                  <Check className="w-3 h-3" /> Ready
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Size: <span className="text-indigo-300 font-mono">{formatFileSize(selectedFile.size)}</span>
              </p>
            </div>
          </div>

          {onClearFile && !disabled && (
            <button
              onClick={onClearFile}
              className="btn btn-secondary btn-sm text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 self-stretch sm:self-auto"
            >
              <X className="w-4 h-4" /> Change File
            </button>
          )}
        </div>
      ) : (
        /* Dropzone Box */
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`dropzone ${isDragging ? 'active' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-400">
                {description}
              </p>
            </div>
            <div className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-indigo-300 bg-indigo-500/15 px-4 py-2 rounded-xl border border-indigo-500/25">
              <span>Choose PDF File</span>
            </div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
