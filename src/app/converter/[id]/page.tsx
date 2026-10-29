'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { CONVERTER_TOOLS } from '@/lib/converters-registry';
import PDFToImageConverter from '@/components/PDFToImageConverter';
import ImageConverter from '@/components/ImageConverter';
import { ArrowLeft, AlertCircle } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DynamicConverterPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const toolId = resolvedParams.id;
  const tool = CONVERTER_TOOLS.find(t => t.id === toolId);

  if (!tool) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="inline-flex p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Converter Tool Not Found</h2>
        <p className="text-gray-400 text-sm">The tool &quot;{toolId}&quot; does not exist or has been moved.</p>
        <div className="pt-4">
          <Link href="/" className="btn btn-primary btn-sm">
            <ArrowLeft className="w-4 h-4" /> Back to All Converters
          </Link>
        </div>
      </div>
    );
  }

  // Render component based on tool type
  const renderToolComponent = () => {
    if (tool.id === 'pdf-to-jpeg' || tool.id === 'pdf-to-png') {
      return <PDFToImageConverter />;
    }
    if (tool.category === 'image' || tool.id === 'jpg-to-png' || tool.id === 'png-to-jpg' || tool.id === 'webp-to-jpg') {
      return <ImageConverter initialFrom={tool.fromFormat} initialTo={tool.toFormat} />;
    }
    // Default fallback to PDFToImageConverter for other PDF tools
    return <PDFToImageConverter />;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-2">
        <Link 
          href="/" 
          className="text-xs font-semibold text-gray-400 hover:text-indigo-300 transition-colors flex items-center gap-1 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-white/5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <span className="text-gray-600">/</span>
        <span className="text-xs text-indigo-400 font-semibold">{tool.name}</span>
      </div>

      {renderToolComponent()}
    </div>
  );
}
