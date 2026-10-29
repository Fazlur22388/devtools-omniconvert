'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, Shield, Cpu, Heart, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[#06090e] text-gray-400 text-sm py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Column 1: Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>DevTools OmniConvert</span>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm max-w-md leading-relaxed">
              High-performance client-side document and image conversion suite. Process high-resolution PDFs into JPEGs, PNGs, and extra formats securely inside your browser with 0% data transmission to external servers.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Shield className="w-4 h-4" /> Zero Server Uploads
              </span>
              <span className="flex items-center gap-1.5 text-indigo-400">
                <Cpu className="w-4 h-4" /> Hardware Accelerated
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400">
                <CheckCircle2 className="w-4 h-4" /> Batch ZIP Archiving
              </span>
            </div>
          </div>

          {/* Column 2: Quick Tools */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-4 text-indigo-300">
              Popular Converters
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/converter/pdf-to-jpeg" className="hover:text-indigo-400 transition-colors">
                  PDF to JPEG Converter
                </Link>
              </li>
              <li>
                <Link href="/converter/pdf-to-png" className="hover:text-indigo-400 transition-colors">
                  PDF to PNG Lossless
                </Link>
              </li>
              <li>
                <Link href="/converter/jpg-to-png" className="hover:text-indigo-400 transition-colors">
                  JPG to PNG Converter
                </Link>
              </li>
              <li>
                <Link href="/converter/image-to-pdf" className="hover:text-indigo-400 transition-colors">
                  Images to PDF Merger
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Tech Architecture */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-4 text-indigo-300">
              Built With
            </h4>
            <ul className="space-y-2 text-xs">
              <li>Next.js 16 (App Router)</li>
              <li>PDF.js HTML5 Canvas Render Engine</li>
              <li>JSZip Archive Compressor</li>
              <li>Client-side Web Assembly Workers</li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} DevTools OmniConvert. Designed for extreme speed & total privacy.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for developers & creators
          </p>
        </div>
      </div>
    </footer>
  );
}
