import type { TextContent, TextItem } from "pdfjs-dist/types/src/display/api";
import { getPdfJs } from "./pdf-utils";

export type TaskContext = {
  signal: AbortSignal;
  progress: (message: string) => void;
};

export type ImagePdfOptions = {
  pageSize: "a4" | "letter" | "image";
  orientation: "auto" | "portrait" | "landscape";
  margin: number;
};

export type OptimizeOptions = {
  mode: "preserve" | "images";
  dpi: number;
  quality: number;
};

export function formatBytes(bytes: number) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function pdfBlob(bytes: Uint8Array) {
  return new Blob([Uint8Array.from(bytes)], { type: "application/pdf" });
}

function readablePdfError(error: unknown): Error {
  if (error instanceof Error && error.name === "AbortError") return error;
  const message = error instanceof Error ? error.message : "";
  if (/password|encrypted/i.test(message)) {
    return new Error("Password-protected PDFs are not supported. Choose an unlocked copy.");
  }
  return new Error("This PDF could not be read. Choose a valid, unlocked PDF and try again.");
}

async function openPdf(file: File, signal: AbortSignal) {
  signal.throwIfAborted();
  const pdfjs = await getPdfJs();
  if (!pdfjs) throw new Error("Open this tool in your browser to process PDFs.");
  const data = new Uint8Array(await file.arrayBuffer());
  signal.throwIfAborted();
  const loadingTask = pdfjs.getDocument({ data });
  const abort = () => { void loadingTask.destroy(); };
  signal.addEventListener("abort", abort, { once: true });
  try {
    const document = await loadingTask.promise;
    signal.throwIfAborted();
    return {
      document,
      async close() {
        signal.removeEventListener("abort", abort);
        await loadingTask.destroy();
      },
    };
  } catch (error) {
    signal.removeEventListener("abort", abort);
    await loadingTask.destroy();
    signal.throwIfAborted();
    throw readablePdfError(error);
  }
}

async function imageCanvas(file: File, signal: AbortSignal) {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    signal.throwIfAborted();
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context || !canvas.width || !canvas.height) throw new Error("Image dimensions could not be read.");
    context.drawImage(image, 0, 0);
    return canvas;
  } catch (error) {
    signal.throwIfAborted();
    throw new Error(`Could not read “${file.name}”. Choose a valid JPG, PNG, or WebP image.`, { cause: error });
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function canvasBytes(canvas: HTMLCanvasElement, type: "image/png" | "image/jpeg", quality = 0.95) {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => value ? resolve(value) : reject(new Error("This image is too large for the browser to encode.")), type, quality);
  });
  return new Uint8Array(await blob.arrayBuffer());
}

export async function imagesToPdf(files: File[], options: ImagePdfOptions, task: TaskContext) {
  if (!files.length) throw new Error("Choose at least one image.");
  const { PDFDocument, PageSizes } = await import("pdf-lib");
  task.signal.throwIfAborted();
  const document = await PDFDocument.create();

  for (const [index, file] of files.entries()) {
    task.signal.throwIfAborted();
    task.progress(`Adding image ${index + 1} of ${files.length}…`);
    // Decode with the browser first so EXIF orientation is applied consistently.
    const canvas = await imageCanvas(file, task.signal);
    try {
      const jpeg = file.type === "image/jpeg";
      const bytes = await canvasBytes(canvas, jpeg ? "image/jpeg" : "image/png");
      task.signal.throwIfAborted();
      const image = jpeg ? await document.embedJpg(bytes) : await document.embedPng(bytes);
      let width: number, height: number;
      if (options.pageSize === "image") {
        width = image.width * 72 / 96 + options.margin * 2;
        height = image.height * 72 / 96 + options.margin * 2;
      } else {
        [width, height] = options.pageSize === "letter" ? PageSizes.Letter : PageSizes.A4;
        const landscape = options.orientation === "landscape" || (options.orientation === "auto" && image.width > image.height);
        if (landscape) [width, height] = [height, width];
      }
      const scale = Math.min((width - options.margin * 2) / image.width, (height - options.margin * 2) / image.height);
      const page = document.addPage([width, height]);
      page.drawImage(image, { x: (width - image.width * scale) / 2, y: (height - image.height * scale) / 2, width: image.width * scale, height: image.height * scale });
    } finally {
      canvas.width = 0;
      canvas.height = 0;
    }
  }

  task.progress("Saving your PDF…");
  const bytes = await document.save({ useObjectStreams: true });
  task.signal.throwIfAborted();
  return { blob: pdfBlob(bytes), pageCount: files.length };
}

function pageText(content: TextContent) {
  const lines: string[] = [];
  let line = "";
  let previous: TextItem | undefined;
  const flush = () => { if (line.trim()) lines.push(line.trimEnd()); line = ""; previous = undefined; };
  for (const item of content.items) {
    if (!("str" in item)) continue;
    if (previous && Math.abs(Number(item.transform[5]) - Number(previous.transform[5])) > Math.max(2, previous.height * 0.5)) flush();
    if (line && previous && !/\s$/.test(line) && !/^\s/.test(item.str)) {
      const gap = Number(item.transform[4]) - (Number(previous.transform[4]) + previous.width);
      if (gap > Math.max(1, item.height * 0.1)) line += " ";
    }
    line += item.str;
    previous = item;
    if (item.hasEOL) flush();
  }
  flush();
  return lines.join("\n").trim();
}

export async function extractPdfText(file: File, task: TaskContext) {
  const pdf = await openPdf(file, task.signal);
  try {
    const pages: string[] = [];
    for (let number = 1; number <= pdf.document.numPages; number++) {
      task.signal.throwIfAborted();
      task.progress(`Reading page ${number} of ${pdf.document.numPages}…`);
      const page = await pdf.document.getPage(number);
      pages.push(pageText(await page.getTextContent()));
      page.cleanup();
    }
    task.signal.throwIfAborted();
    return { text: pages.join("\n\n"), pageCount: pages.length, emptyPages: pages.filter((text) => !text).length };
  } finally {
    await pdf.close();
  }
}

export async function optimizePdf(file: File, options: OptimizeOptions, task: TaskContext) {
  const { PDFDocument } = await import("pdf-lib");
  task.signal.throwIfAborted();
  let bytes: Uint8Array;
  let pageCount: number;

  if (options.mode === "preserve") {
    task.progress("Optimizing the PDF structure…");
    let document;
    try {
      document = await PDFDocument.load(await file.arrayBuffer(), { updateMetadata: false });
    } catch (error) {
      throw readablePdfError(error);
    }
    task.signal.throwIfAborted();
    pageCount = document.getPageCount();
    if (!pageCount) throw new Error("This PDF has no pages to optimize.");
    bytes = await document.save({ useObjectStreams: true, updateFieldAppearances: false, objectsPerTick: 50 });
  } else {
    const source = await openPdf(file, task.signal);
    try {
      const output = await PDFDocument.create();
      pageCount = source.document.numPages;
      for (let number = 1; number <= pageCount; number++) {
        task.signal.throwIfAborted();
        task.progress(`Compressing page ${number} of ${pageCount}…`);
        const page = await source.document.getPage(number);
        const size = page.getViewport({ scale: 1 });
        const scale = Math.min(options.dpi / 72, Math.sqrt(16_000_000 / (size.width * size.height)), 8192 / Math.max(size.width, size.height));
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.floor(viewport.width));
        canvas.height = Math.max(1, Math.floor(viewport.height));
        try {
          const context = canvas.getContext("2d");
          if (!context) throw new Error("Your browser could not prepare this page.");
          const render = page.render({ canvas, viewport, background: "rgb(255,255,255)" });
          const cancelRender = () => render.cancel();
          task.signal.addEventListener("abort", cancelRender, { once: true });
          try { await render.promise; }
          finally { task.signal.removeEventListener("abort", cancelRender); }
          task.signal.throwIfAborted();
          const image = await output.embedJpg(await canvasBytes(canvas, "image/jpeg", options.quality));
          output.addPage([size.width, size.height]).drawImage(image, { x: 0, y: 0, width: size.width, height: size.height });
          page.cleanup();
        } finally {
          canvas.width = 0;
          canvas.height = 0;
        }
      }
      task.progress("Saving the optimized PDF…");
      bytes = await output.save({ useObjectStreams: true });
    } finally {
      await source.close();
    }
  }

  task.signal.throwIfAborted();
  const improved = bytes.length < file.size;
  return {
    blob: improved ? pdfBlob(bytes) : file,
    originalSize: file.size,
    outputSize: improved ? bytes.length : file.size,
    candidateSize: bytes.length,
    improved,
    pageCount,
    mode: options.mode,
  };
}
