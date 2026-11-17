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
    description: 'Save each PDF page as a JPEG image at your chosen resolution.',
    fromFormat: 'PDF',
    toFormat: 'JPEG',
    category: 'pdf',
    icon: 'FileImage',
    popular: true,
    badge: 'Popular',
    status: 'active'
  },
  {
    id: 'pdf-to-png',
    name: 'PDF to PNG',
    description: 'Export PDF pages as lossless PNG images with adjustable resolution.',
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
    status: 'coming-soon'
  },
  {
    id: 'jpg-to-png',
    name: 'JPG to PNG',
    description: 'Change JPEG images to PNG while keeping their original dimensions.',
    fromFormat: 'JPG',
    toFormat: 'PNG',
    category: 'image',
    icon: 'RefreshCw',
    status: 'active'
  },
  {
    id: 'png-to-jpg',
    name: 'PNG to JPG',
    description: 'Save PNG images as JPEGs with the quality setting you choose.',
    fromFormat: 'PNG',
    toFormat: 'JPG',
    category: 'image',
    icon: 'Repeat',
    status: 'active'
  },
  {
    id: 'webp-to-jpg',
    name: 'WebP to JPG',
    description: 'Turn WebP images into JPEGs for sharing and everyday use.',
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
    status: 'coming-soon'
  },
  {
    id: 'pdf-compressor',
    name: 'PDF Optimizer',
    description: 'Reduce PDF file sizes for sharing and storage.',
    fromFormat: 'PDF',
    toFormat: 'PDF',
    category: 'pdf',
    icon: 'Minimize2',
    badge: 'Coming Soon',
    status: 'coming-soon'
  }
];

export const CATEGORIES = [
  { id: 'all', label: 'All tools' },
  { id: 'pdf', label: 'PDF tools' },
  { id: 'image', label: 'Images' },
  { id: 'document', label: 'Documents' }
];
