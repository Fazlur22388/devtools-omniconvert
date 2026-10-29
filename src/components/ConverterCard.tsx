'use client';

import React from 'react';
import Link from 'next/link';
import { ConverterTool } from '@/lib/converters-registry';
import { 
  FileImage, 
  Image as ImageIcon, 
  FilePlus, 
  RefreshCw, 
  Repeat, 
  Zap, 
  FileText, 
  Minimize2, 
  ArrowRight 
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  FileImage: <FileImage className="w-6 h-6 text-indigo-400" />,
  Image: <ImageIcon className="w-6 h-6 text-purple-400" />,
  FilePlus: <FilePlus className="w-6 h-6 text-cyan-400" />,
  RefreshCw: <RefreshCw className="w-6 h-6 text-emerald-400" />,
  Repeat: <Repeat className="w-6 h-6 text-amber-400" />,
  Zap: <Zap className="w-6 h-6 text-rose-400" />,
  FileText: <FileText className="w-6 h-6 text-indigo-400" />,
  Minimize2: <Minimize2 className="w-6 h-6 text-gray-400" />
};

interface ConverterCardProps {
  tool: ConverterTool;
}

export default function ConverterCard({ tool }: ConverterCardProps) {
  const isComingSoon = tool.status === 'coming-soon';

  const cardContent = (
    <div className={`glass-panel p-6 rounded-2xl border transition-all duration-300 relative group flex flex-col justify-between h-full ${
      isComingSoon 
        ? 'opacity-60 cursor-not-allowed border-white/5' 
        : 'hover:border-indigo-500/50 hover:bg-slate-900/80 hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer'
    }`}>
      
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            {ICON_MAP[tool.icon] || <FileImage className="w-6 h-6 text-indigo-400" />}
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs font-semibold">
            <span className="text-gray-400 bg-white/5 px-2 py-1 rounded-md border border-white/5">{tool.fromFormat}</span>
            <span className="text-indigo-400">→</span>
            <span className="text-indigo-300 bg-indigo-500/15 px-2 py-1 rounded-md border border-indigo-500/20">{tool.toFormat}</span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors flex items-center justify-between">
          <span>{tool.name}</span>
        </h3>

        <p className="text-xs text-gray-400 leading-relaxed">
          {tool.description}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
        {tool.badge && (
          <span className={`badge ${isComingSoon ? 'badge-amber' : 'badge-emerald'}`}>
            {tool.badge}
          </span>
        )}
        {!isComingSoon && (
          <span className="text-indigo-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1 ml-auto">
            Open Tool <ArrowRight className="w-3.5 h-3.5" />
          </span>
        )}
      </div>

    </div>
  );

  if (isComingSoon) {
    return cardContent;
  }

  return (
    <Link href={`/converter/${tool.id}`}>
      {cardContent}
    </Link>
  );
}
