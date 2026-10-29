'use client';

import React, { useState } from 'react';
import PDFToImageConverter from '@/components/PDFToImageConverter';
import ConverterCard from '@/components/ConverterCard';
import { CONVERTER_TOOLS, CATEGORIES } from '@/lib/converters-registry';
import { Sparkles, Shield, Cpu, Zap, Layers, FileImage, Grid, ArrowDown } from 'lucide-react';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'featured-pdf' | 'grid'>('featured-pdf');

  const filteredTools = CONVERTER_TOOLS.filter(tool => {
    if (activeCategory === 'all') return true;
    return tool.category === activeCategory;
  });

  return (
    <div className="space-y-16 animate-fade-in">
      
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-4 pb-8 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Next-Generation Format Conversion Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Convert PDF & Media Files <br />
          <span className="gradient-text-accent">100% Privately In Your Browser</span>
        </h1>

        <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Transform PDFs into high-DPI JPEGs, PNGs, and extra formats instantly. Fast, hardware-accelerated processing with zero server uploads.
        </p>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs font-semibold text-gray-400">
          <div className="flex items-center gap-2 bg-slate-900/60 px-4 py-2 rounded-xl border border-white/5">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Zero Data Leakage</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/60 px-4 py-2 rounded-xl border border-white/5">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>Canvas WebWorker GPU Engine</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/60 px-4 py-2 rounded-xl border border-white/5">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Batch ZIP Download</span>
          </div>
        </div>

        {/* Tab Selector: Direct Converter vs Grid */}
        <div className="pt-6 flex justify-center">
          <div className="inline-flex p-1 bg-slate-900/90 rounded-2xl border border-white/10 shadow-xl">
            <button
              onClick={() => setActiveTab('featured-pdf')}
              className={`px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                activeTab === 'featured-pdf'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FileImage className="w-4 h-4" /> PDF to JPEG Tool
            </button>
            <button
              onClick={() => setActiveTab('grid')}
              className={`px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                activeTab === 'grid'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4" /> All Converter Tools ({CONVERTER_TOOLS.length})
            </button>
          </div>
        </div>
      </section>

      {/* Primary Tool View: PDF to JPEG Converter */}
      {activeTab === 'featured-pdf' && (
        <section id="pdf-converter-main" className="space-y-6">
          <PDFToImageConverter />
        </section>
      )}

      {/* Grid View: Many-to-Many Options Suite */}
      <section id="converters" className="space-y-8 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Layers className="w-6 h-6 text-indigo-400" />
              <span>Multi-Format Converter Suite</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Select any from-to format pair for instant client-side conversion.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setActiveTab('grid');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeCategory === cat.id && activeTab === 'grid'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                    : 'bg-slate-900/60 text-gray-400 hover:text-white border border-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map(tool => (
            <ConverterCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="glass-panel p-8 sm:p-12 rounded-3xl space-y-8 border-indigo-500/20 bg-gradient-to-b from-slate-900/80 to-[#0c101a]">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h3 className="text-2xl font-bold text-white">
            Designed for Developers, Professionals & Creators
          </h3>
          <p className="text-gray-400 text-xs sm:text-sm">
            Everything you need for clean, private, high-fidelity file format conversions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="space-y-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto sm:mx-0">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-white font-semibold text-base">100% Air-Gapped Privacy</h4>
            <p className="text-gray-400 text-xs leading-relaxed">
              Your sensitive documents never leave your computer. Parsing and rendering are handled strictly inside your browser memory.
            </p>
          </div>

          <div className="space-y-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto sm:mx-0">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-white font-semibold text-base">Custom Resolution DPI</h4>
            <p className="text-gray-400 text-xs leading-relaxed">
              Render PDFs at standard (72 DPI), HD (150 DPI), or Ultra High Print Quality (300 DPI) for flawless sharp text & graphics.
            </p>
          </div>

          <div className="space-y-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto sm:mx-0">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-white font-semibold text-base">Expandable Tool Architecture</h4>
            <p className="text-gray-400 text-xs leading-relaxed">
              Easily handles PDF to JPEG/PNG, Image to PDF, and format transformations with modular converter plugins.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
