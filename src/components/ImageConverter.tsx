'use client';

import React, { useState } from 'react';
import saveAs from 'file-saver';
import FileDropzone from '@/components/FileDropzone';
import { RefreshCw, Download, Image as ImageIcon, Sliders, CheckCircle2, Sparkles } from 'lucide-react';

interface ImageConverterProps {
  initialFrom?: string;
  initialTo?: string;
}

export default function ImageConverter({ initialFrom = 'JPG', initialTo = 'PNG' }: ImageConverterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>(initialTo.toLowerCase());
  const [quality, setQuality] = useState<number>(0.92);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [convertedDataUrl, setConvertedDataUrl] = useState<string | null>(null);
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setConvertedDataUrl(null);
    setConvertedBlob(null);
    convertImage(selectedFile, targetFormat, quality);
  };

  const convertImage = (fileToConvert: File, toFmt: string, imgQuality: number) => {
    setIsConverting(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (toFmt === 'jpg' || toFmt === 'jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);

        const mime = toFmt === 'png' ? 'image/png' : toFmt === 'webp' ? 'image/webp' : 'image/jpeg';
        canvas.toBlob(
          (blob) => {
            if (blob) {
              setConvertedBlob(blob);
              setConvertedDataUrl(canvas.toDataURL(mime, imgQuality));
            }
            setIsConverting(false);
          },
          mime,
          imgQuality
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(fileToConvert);
  };

  const handleDownload = () => {
    if (!convertedBlob || !file) return;
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    const ext = targetFormat === 'png' ? 'png' : targetFormat === 'webp' ? 'webp' : 'jpg';
    saveAs(convertedBlob, `${nameWithoutExt}-converted.${ext}`);
  };

  return (
    <div className="w-full space-y-8 animate-fade-in">
      {/* Banner */}
      <div className="glass-panel p-6 sm:p-8 bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-slate-900/40">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="badge badge-indigo">
              <Sparkles className="w-3.5 h-3.5" /> Instant Image Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <ImageIcon className="w-8 h-8 text-purple-400" />
            Image Converter ({initialFrom} to {initialTo})
          </h1>
          <p className="text-gray-300 text-sm max-w-2xl leading-relaxed">
            Convert image formats instantly with custom quality settings. Supports PNG, JPG, and WebP formats with 100% client-side rendering.
          </p>
        </div>
      </div>

      {/* Upload Dropzone */}
      <FileDropzone
        accept="image/*"
        title="Upload Image File"
        description="Drag & drop JPG, PNG, or WebP image here (Client-side private)"
        onFileSelect={handleFileSelect}
        selectedFile={file}
        onClearFile={() => {
          setFile(null);
          setConvertedDataUrl(null);
          setConvertedBlob(null);
        }}
        disabled={isConverting}
      />

      {/* Options & Preview */}
      {file && (
        <div className="glass-panel p-6 space-y-6 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-300 font-semibold">Convert To:</span>
              <select
                value={targetFormat}
                onChange={(e) => {
                  setTargetFormat(e.target.value);
                  convertImage(file, e.target.value, quality);
                }}
                className="bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-white font-semibold text-xs"
              >
                <option value="png">PNG (.png)</option>
                <option value="jpg">JPG (.jpg)</option>
                <option value="webp">WebP (.webp)</option>
              </select>
            </div>

            <button
              onClick={handleDownload}
              disabled={!convertedBlob || isConverting}
              className="btn btn-primary btn-sm flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download Converted File
            </button>
          </div>

          {convertedDataUrl && (
            <div className="flex flex-col items-center justify-center p-4 bg-black/40 rounded-xl border border-white/5">
              <img
                src={convertedDataUrl}
                alt="Converted preview"
                className="max-h-72 object-contain rounded shadow-lg"
              />
              <span className="text-xs text-gray-400 mt-3 font-mono">
                Ready to download as .{targetFormat}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
