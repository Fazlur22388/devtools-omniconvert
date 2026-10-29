import saveAs from 'file-saver';
import JSZip from 'jszip';

// Helper for dynamically configuring pdfjs client-side
let pdfjsLib: typeof import('pdfjs-dist') | null = null;

export async function getPdfJs() {
  if (typeof window === 'undefined') return null;
  if (!pdfjsLib) {
    const pdfjs = await import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
    pdfjsLib = pdfjs;
  }
  return pdfjsLib;
}

export interface PDFPageInfo {
  pageNumber: number;
  width: number;
  height: number;
  aspectRatio: number;
}

export interface RenderedPage {
  pageNumber: number;
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
  selected: boolean;
}

/**
 * Parses PDF file and returns document summary + page infos
 */
export async function parsePdfDocument(file: File) {
  const pdfjs = await getPdfJs();
  if (!pdfjs) throw new Error('PDF.js is only available in browser');

  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  
  const numPages = pdfDoc.numPages;
  const pagesInfo: PDFPageInfo[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: 1.0 });
    pagesInfo.push({
      pageNumber: i,
      width: Math.round(viewport.width),
      height: Math.round(viewport.height),
      aspectRatio: viewport.width / viewport.height
    });
  }

  return {
    pdfDoc,
    numPages,
    pagesInfo
  };
}

/**
 * Renders a single PDF page to JPEG/PNG/WebP blob & dataURL
 */
export async function renderPdfPage(
  pdfDoc: any,
  pageNumber: number,
  options: {
    scale?: number; // 1 = standard, 2 = HD (150-200DPI), 3 = Ultra HD (300DPI)
    format?: 'image/jpeg' | 'image/png' | 'image/webp';
    quality?: number; // 0.1 to 1.0
  } = {}
): Promise<RenderedPage> {
  const { scale = 2, format = 'image/jpeg', quality = 0.92 } = options;
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  if (!context) throw new Error('Could not get 2d canvas context');

  // Fill white background for JPEGs (PDF background can be transparent)
  context.fillStyle = '#FFFFFF';
  context.fillRect(0, 0, canvas.width, canvas.height);

  const renderContext = {
    canvasContext: context,
    viewport: viewport
  };

  await page.render(renderContext).promise;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error(`Failed to render page ${pageNumber}`));
          return;
        }
        const dataUrl = canvas.toDataURL(format, quality);
        resolve({
          pageNumber,
          dataUrl,
          blob,
          width: Math.round(viewport.width),
          height: Math.round(viewport.height),
          selected: true
        });
      },
      format,
      quality
    );
  });
}

/**
 * Package selected pages into a ZIP file and trigger browser download
 */
export async function downloadPagesAsZip(
  pages: RenderedPage[],
  zipFilename: string = 'converted-pages.zip',
  formatExtension: string = 'jpg'
) {
  const zip = new JSZip();
  const folder = zip.folder('converted-images') || zip;

  pages.forEach((page) => {
    const formattedNum = String(page.pageNumber).padStart(3, '0');
    folder.file(`page_${formattedNum}.${formatExtension}`, page.blob);
  });

  const zipContent = await zip.generateAsync({ type: 'blob' });
  saveAs(zipContent, zipFilename);
}

/**
 * Downloads a single page image file
 */
export function downloadSinglePage(
  page: RenderedPage,
  filename: string = `page-${page.pageNumber}.jpg`
) {
  saveAs(page.blob, filename);
}
