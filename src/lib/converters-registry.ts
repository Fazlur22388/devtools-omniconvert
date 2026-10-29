export interface ConverterTool {
  id: string;
  name: string;
  description: string;
  fromFormat: string;
  toFormat: string;
  category: 'pdf' | 'image' | 'document' | 'utilities';
  icon: string;
  popular?: boolean;
  badge?: string;
  status: 'active' | 'coming-soon';
}

export const CONVERTER_TOOLS: ConverterTool[] = [
  {
    id: 'pdf-to-jpeg',
    name: 'PDF to JPEG',
    description: 'Convert PDF pages into high-resolution JPG images instantly in your browser.',
    fromFormat: 'PDF',
    toFormat: 'JPEG',
    category: 'pdf',
    icon: 'FileImage',
    popular: true,
    badge: 'Fast & Private',
    status: 'active'
  },
  {
    id: 'pdf-to-png',
    name: 'PDF to PNG',
    description: 'Extract PDF pages as lossless transparent PNG images with customizable DPI.',
    fromFormat: 'PDF',
    toFormat: 'PNG',
    category: 'pdf',
    popular: true,
    icon: 'Image',
    status: 'active'
  },
  {
    id: 'image-to-pdf',
    name: 'Image to PDF',
    description: 'Merge JPG, PNG, or WebP images into a single clean PDF document.',
    fromFormat: 'IMAGES',
    toFormat: 'PDF',
    category: 'pdf',
    icon: 'FilePlus',
    status: 'active'
  },
  {
    id: 'jpg-to-png',
    name: 'JPG to PNG',
    description: 'Convert JPEG images to crisp PNG format with transparent background support.',
    fromFormat: 'JPG',
    toFormat: 'PNG',
    category: 'image',
    icon: 'RefreshCw',
    status: 'active'
  },
  {
    id: 'png-to-jpg',
    name: 'PNG to JPG',
    description: 'Compress and transform PNG images to standard JPEG format.',
    fromFormat: 'PNG',
    toFormat: 'JPG',
    category: 'image',
    icon: 'Repeat',
    status: 'active'
  },
  {
    id: 'webp-to-jpg',
    name: 'WebP to JPG',
    description: 'Convert modern WebP images to universally compatible JPEG graphics.',
    fromFormat: 'WEBP',
    toFormat: 'JPG',
    category: 'image',
    icon: 'Zap',
    status: 'active'
  },
  {
    id: 'pdf-to-text',
    name: 'PDF to Text',
    description: 'Extract raw selectable text contents from any unencrypted PDF file.',
    fromFormat: 'PDF',
    toFormat: 'TXT',
    category: 'document',
    icon: 'FileText',
    status: 'active'
  },
  {
    id: 'pdf-compressor',
    name: 'PDF Optimizer',
    description: 'Reduce PDF file size while retaining crystal clear visual clarity.',
    fromFormat: 'PDF',
    toFormat: 'PDF',
    category: 'pdf',
    icon: 'Minimize2',
    badge: 'Coming Soon',
    status: 'coming-soon'
  }
];

export const CATEGORIES = [
  { id: 'all', label: 'All Tools' },
  { id: 'pdf', label: '📄 PDF Suite' },
  { id: 'image', label: '🖼️ Image Tools' },
  { id: 'document', label: '📝 Documents' }
];
