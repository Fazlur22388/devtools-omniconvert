'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import FileDropzone from '@/components/FileDropzone';
import { 
  parsePdfDocument, 
  renderPdfPage, 
  downloadPagesAsZip, 
  downloadSinglePage,
  RenderedPage 
} from '@/lib/pdf-utils';
import { 
  Sliders, 
  Download, 
  CheckSquare, 
  Square, 
  Maximize2, 
  Sparkles, 
  Loader2, 
  RefreshCw, 
  FileCheck, 
  Layers, 
  X,
  FileImage,
  CheckCircle2
} from 'lucide-react';

export default function PDFToImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(0);
  
  // Settings
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [scale, setScale] = useState<number>(2); // 1 = 72dpi, 2 = 150dpi, 3 = 300dpi
  const [quality, setQuality] = useState<number>(0.92); // 10% to 100%

  // Rendering state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [renderedPages, setRenderedPages] = useState<RenderedPage[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());

  // Lightbox Modal state
  const [activePreviewPage, setActivePreviewPage] = useState<RenderedPage | null>(null);

  // 1. File Upload & Processing Handler
  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setRenderedPages([]);
    setSelectedPages(new Set());
    setIsProcessing(true);
    setProgressMsg('Analyzing PDF document structure...');

    try {
      const { pdfDoc: parsedDoc, numPages: count } = await parsePdfDocument(selectedFile);
      setPdfDoc(parsedDoc);
      setNumPages(count);

      // Render all pages
      await processAllPages(parsedDoc, count, format, scale, quality);
    } catch (err: any) {
      console.error(err);
      alert('Error parsing PDF file: ' + (err.message || 'Unknown error'));
      setIsProcessing(false);
    }
  };

  // 2. Render PDF pages into Canvas & JPEG images
  const processAllPages = async (
    doc: any, 
    totalPages: number, 
    imgFormat: 'image/jpeg' | 'image/png' | 'image/webp', 
    imgScale: number, 
    imgQuality: number
  ) => {
    setIsProcessing(true);
    const pages: RenderedPage[] = [];
    const selected = new Set<number>();

    for (let i = 1; i <= totalPages; i++) {
      setProgressMsg(`Rendering Page ${i} of ${totalPages}...`);
      try {
        const page = await renderPdfPage(doc, i, {
          scale: imgScale,
          format: imgFormat,
          quality: imgQuality
        });
        pages.push(page);
        selected.add(i);
      } catch (err) {
        console.error(`Failed rendering page ${i}`, err);
      }
    }

    setRenderedPages(pages);
    setSelectedPages(selected);
    setIsProcessing(false);
    setProgressMsg('');

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e) {
      // ignore
    }
  };

  // 3. Re-render when user changes resolution scale, format, or quality
  const handleSettingsChange = (
    newFormat: 'image/jpeg' | 'image/png' | 'image/webp',
    newScale: number,
    newQuality: number
  ) => {
    setFormat(newFormat);
    setScale(newScale);
    setQuality(newQuality);

    if (pdfDoc && numPages > 0) {
      processAllPages(pdfDoc, numPages, newFormat, newScale, newQuality);
    }
  };

  // Selection Toggles
  const toggleSelectPage = (pageNum: number) => {
    const next = new Set(selectedPages);
    if (next.has(pageNum)) {
      next.delete(pageNum);
    } else {
      next.add(pageNum);
    }
    setSelectedPages(next);
  };

  const toggleSelectAll = () => {
    if (selectedPages.size === renderedPages.length) {
      setSelectedPages(new Set());
    } else {
      const all = new Set(renderedPages.map(p => p.pageNumber));
      setSelectedPages(all);
    }
  };

  // ZIP Download Handler
  const handleDownloadZip = async () => {
    if (renderedPages.length === 0) return;
    const pagesToDownload = renderedPages.filter(p => selectedPages.has(p.pageNumber));

    if (pagesToDownload.length === 0) {
      alert('Please select at least 1 page to download.');
      return;
    }

    const ext = format === 'image/png' ? 'png' : format === 'image/webp' ? 'webp' : 'jpg';
    const filename = file ? `${file.name.replace(/\.[^/.]+$/, '')}-images.zip` : 'pdf-converted-images.zip';

    await downloadPagesAsZip(pagesToDownload, filename, ext);
  };

  const resetAll = () => {
    setFile(null);
    setPdfDoc(null);
    setNumPages(0);
    setRenderedPages([]);
    setSelectedPages(new Set());
    setIsProcessing(false);
  };

  return (
    <div className="w-full space-y-8 animate-fade-in">
      
      {/* Tool Header Banner */}
      <div className="glass-panel p-6 sm:p-8 bg-gradient-to-r from-indigo-900/30 via-purple-900/20 to-slate-900/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="badge badge-emerald">
                <CheckCircle2 className="w-3.5 h-3.5" /> High DPI Support
              </span>
              <span className="badge badge-indigo">Browser Native Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <FileImage className="w-8 h-8 text-indigo-400" />
              PDF to JPEG Image Converter
            </h1>
            <p className="text-gray-300 text-sm max-w-2xl leading-relaxed">
              Convert every PDF page into crystal clear JPEG or PNG images. Adjust DPI resolution, set quality levels, select individual pages, and download everything as a ZIP archive.
            </p>
          </div>
        </div>
      </div>

      {/* Main Upload Dropzone */}
      <FileDropzone
        accept="application/pdf,.pdf"
        title="Upload your PDF Document"
        description="Drag and drop your PDF here, or click to browse (100% private, processed client-side)"
        onFileSelect={handleFileSelect}
        selectedFile={file}
        onClearFile={resetAll}
        disabled={isProcessing}
      />

      {/* Processing Progress Indicator */}
      {isProcessing && (
        <div className="glass-panel p-6 text-center space-y-4 animate-fade-in">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{progressMsg}</h3>
            <p className="text-xs text-gray-400 mt-1">Rendering high resolution canvas elements...</p>
          </div>
        </div>
      )}

      {/* Results & Conversion Controls */}
      {renderedPages.length > 0 && !isProcessing && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Settings & Toolbar Header */}
          <div className="glass-panel p-5 bg-slate-900/60 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Format & Quality Settings */}
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-gray-300 font-semibold">Format:</span>
                <select
                  value={format}
                  onChange={(e) => handleSettingsChange(e.target.value as any, scale, quality)}
                  className="bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs font-semibold focus:outline-none focus:border-indigo-500"
                >
                  <option value="image/jpeg">JPEG (.jpg)</option>
                  <option value="image/png">PNG Lossless (.png)</option>
                  <option value="image/webp">WebP (.webp)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-300 font-semibold">Resolution:</span>
                <select
                  value={scale}
                  onChange={(e) => handleSettingsChange(format, Number(e.target.value), quality)}
                  className="bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs font-semibold focus:outline-none focus:border-indigo-500"
                >
                  <option value={1}>1x (72 DPI - Standard)</option>
                  <option value={2}>2x (150 DPI - High Quality HD)</option>
                  <option value={3}>3x (300 DPI - Ultra Print HD)</option>
                </select>
              </div>

              {format === 'image/jpeg' && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-300 font-semibold">Quality:</span>
                  <input
                    type="range"
                    min="0.5"
                    max="1.0"
                    step="0.05"
                    value={quality}
                    onChange={(e) => handleSettingsChange(format, scale, Number(e.target.value))}
                    className="w-24 accent-indigo-500 cursor-pointer"
                  />
                  <span className="text-indigo-300 font-mono text-xs">{Math.round(quality * 100)}%</span>
                </div>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSelectAll}
                className="btn btn-secondary btn-sm text-xs flex items-center gap-1.5"
              >
                {selectedPages.size === renderedPages.length ? (
                  <>
                    <Square className="w-3.5 h-3.5 text-indigo-400" /> Deselect All
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-3.5 h-3.5 text-indigo-400" /> Select All ({renderedPages.length})
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadZip}
                disabled={selectedPages.size === 0}
                className="btn btn-primary btn-sm flex items-center gap-2 text-xs"
              >
                <Download className="w-4 h-4" />
                <span>Download {selectedPages.size} Page{selectedPages.size === 1 ? '' : 's'} (ZIP)</span>
              </button>
            </div>

          </div>

          {/* Grid Preview of Rendered Pages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {renderedPages.map((page) => {
              const isSelected = selectedPages.has(page.pageNumber);
              return (
                <div
                  key={page.pageNumber}
                  className={`glass-panel p-3 rounded-xl border transition-all duration-300 relative group flex flex-col justify-between ${
                    isSelected ? 'border-indigo-500/60 bg-indigo-950/20 shadow-lg shadow-indigo-500/10' : 'border-white/5 opacity-70 hover:opacity-100'
                  }`}
                >
                  {/* Thumbnail Header */}
                  <div className="flex items-center justify-between gap-2 mb-2 px-1">
                    <span className="text-xs font-semibold text-gray-300 font-mono">
                      Page {page.pageNumber}
                    </span>
                    <button
                      onClick={() => toggleSelectPage(page.pageNumber)}
                      className="text-indigo-400 hover:text-indigo-300 p-1"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-indigo-400 fill-indigo-500/20" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  </div>

                  {/* Thumbnail Image Container */}
                  <div 
                    onClick={() => setActivePreviewPage(page)}
                    className="relative aspect-[3/4] bg-black/40 rounded-lg overflow-hidden border border-white/5 cursor-pointer group-hover:border-indigo-500/40 transition-colors flex items-center justify-center p-2"
                  >
                    <img
                      src={page.dataUrl}
                      alt={`Page ${page.pageNumber}`}
                      className="max-h-full max-w-full object-contain rounded shadow"
                    />

                    {/* Overlay Zoom Icon */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="btn btn-secondary btn-sm text-xs bg-slate-900/80 border-white/20">
                        <Maximize2 className="w-3.5 h-3.5 text-indigo-300" /> Preview
                      </span>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between gap-2 px-1">
                    <span className="text-[11px] text-gray-400 font-mono">
                      {page.width}x{page.height}px
                    </span>
                    <button
                      onClick={() => downloadSinglePage(page, `page-${page.pageNumber}.${format === 'image/png' ? 'png' : format === 'image/webp' ? 'webp' : 'jpg'}`)}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 hover:underline"
                    >
                      <Download className="w-3.5 h-3.5" /> Save
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Lightbox Modal */}
      {activePreviewPage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel max-w-4xl w-full max-h-[90vh] p-6 rounded-2xl flex flex-col gap-4 border-indigo-500/30">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Page {activePreviewPage.pageNumber} Preview</span>
                  <span className="badge badge-indigo text-xs">
                    {activePreviewPage.width} x {activePreviewPage.height} px
                  </span>
                </h3>
              </div>
              <button
                onClick={() => setActivePreviewPage(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center bg-black/50 p-4 rounded-xl border border-white/5">
              <img
                src={activePreviewPage.dataUrl}
                alt={`Preview page ${activePreviewPage.pageNumber}`}
                className="max-h-[65vh] object-contain rounded shadow-2xl"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <button
                onClick={() => setActivePreviewPage(null)}
                className="btn btn-secondary btn-sm"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  downloadSinglePage(activePreviewPage, `page-${activePreviewPage.pageNumber}.${format === 'image/png' ? 'png' : format === 'image/webp' ? 'webp' : 'jpg'}`);
                  setActivePreviewPage(null);
                }}
                className="btn btn-primary btn-sm flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download Image
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
