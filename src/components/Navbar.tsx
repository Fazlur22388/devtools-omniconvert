'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, Zap, ShieldCheck, Sparkles, FileText, ArrowRight } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[rgba(255,255,255,0.08)] bg-[#080b11]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
            <div className="w-full h-full bg-[#0d121f] rounded-[11px] flex items-center justify-center">
              <Layers className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                DevTools <span className="gradient-text-accent">OmniConvert</span>
              </span>
              <span className="badge badge-indigo text-[10px]">v1.0</span>
            </div>
            <p className="text-[11px] text-gray-400 hidden sm:block">PDF & Media Format Converter Suite</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link 
            href="/#converters" 
            className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 py-2"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            All Converters
          </Link>
          <Link 
            href="/converter/pdf-to-jpeg" 
            className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors flex items-center gap-1.5 py-2 px-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20"
          >
            <FileText className="w-4 h-4 text-indigo-400" />
            PDF to JPEG
          </Link>
          <div className="h-4 w-[1px] bg-white/10" />
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Client-Side Private</span>
          </div>
        </nav>

        {/* Call to Action */}
        <div className="flex items-center gap-3">
          <Link
            href="/converter/pdf-to-jpeg"
            className="btn btn-primary btn-sm flex items-center gap-2 shadow-indigo-500/20"
          >
            <span>Convert PDF Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </header>
  );
}
