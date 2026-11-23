# OmniConvert

**PDF and image conversion in your browser.**

OmniConvert is a web app for converting PDF pages into images, changing image formats, combining images into PDFs, extracting text, and optimizing PDF file sizes. Processing happens locally on your device, and results download directly from the browser.

## Available tools

| Tool | What it does |
| --- | --- |
| **PDF to JPEG** | Export PDF pages as JPEG images with adjustable resolution and quality. |
| **PDF to PNG** | Export PDF pages as lossless PNG images. |
| **Image to PDF** | Combine JPG, PNG, and WebP images into one PDF with control over page order and layout. |
| **JPG to PNG** | Convert JPEG images to PNG while keeping their dimensions. |
| **PNG to JPG** | Convert PNG images to JPEG with adjustable quality. |
| **WebP to JPG** | Convert WebP images to JPEG. |
| **PDF to Text** | Extract selectable text, preview or copy it, and download a UTF-8 `.txt` file. |
| **PDF Optimizer** | Compact PDF structure or compress pages as images, with a comparison of the original and output file sizes. |

All eight tools are available from a searchable library with PDF, image, and document filters.

## Features

### PDF page export

- Choose JPEG, PNG, or WebP output from either PDF-to-image tool.
- Select 72, 144, or 300 DPI resolution.
- Preview individual pages and select which pages to download.
- Save a single image or download selected pages together in a ZIP archive.

### Images to PDF

- Add multiple JPG, PNG, and WebP images.
- Move images up or down to set the page order, or remove individual images.
- Choose A4, US Letter, or pages sized to fit each image.
- Set orientation and page margins. Images fit within the page without cropping.

### Text extraction and PDF optimization

- Preview extracted text before copying or downloading it.
- Cancel document processing and choose another file.
- Optimize PDF structure while preserving existing text and links.
- Use adjustable JPEG quality and resolution for stronger image-based compression.
- Compare file sizes before downloading. If optimization would make the PDF larger, the app keeps the original unchanged.

## How to use

1. Open the app and choose a tool from the library, or use the PDF converter on the home page.
2. Select a file or drag it into the upload area. Image to PDF accepts multiple images.
3. Choose the output settings. PDF-to-image and image-format conversions start after selection; the document tools have a separate conversion button.
4. Preview the result where available and download your file.

## File privacy

Conversion, text extraction, and PDF generation happen in the browser. File contents are not uploaded to a conversion server. No account or API key is required.

The PDF worker, fonts, and UI assets are served with the app. PDF documents, decoded images, and conversion results use your device's memory while being processed.

## Limits and known issues

- **File size:** uploads are limited to 100 MB per file. Image to PDF also limits the combined image selection to 100 MB.
- **Large documents:** processing time and supported image dimensions depend on the browser and available memory. The upload limit does not guarantee that every file can be processed on every device.
- **Scanned PDFs:** PDF to Text extracts existing selectable text. It does not perform OCR on scanned pages or text inside images.
- **Protected PDFs:** use unlocked PDFs; password-protected documents are not supported.
- **Image-based PDF compression:** converting pages to JPEG images removes selectable text, links, and form fields. Use the text-preserving mode when those features matter.
- **Compression results:** some PDFs are already optimized, so a smaller output is not guaranteed.
- **Transparency:** JPEG output uses a white background for transparent image areas. Quality controls apply to JPEG and WebP; PNG uses lossless encoding.
- **Known quality-slider issue:** in the image-format converter, Home/End keys update the displayed quality without re-encoding the image. Use the pointer or arrow keys to apply a quality change.

## Run locally

### Requirements

- Node.js 22 or later and npm.
- A modern browser with JavaScript enabled.
- Chrome, Edge, or Chromium for the automated browser tests.

Clone this repository, open its directory in a terminal, then install dependencies and start the development server:

```bash
npm ci
npm run dev
```

Open the local URL printed in the terminal, usually [http://localhost:3000](http://localhost:3000).

On Windows PowerShell, use `npm.cmd` instead of `npm` if execution policy prevents `npm.ps1` from running. To choose another port:

```bash
npm run dev -- --port 3001
```

### Production build

```bash
npm run build
npm run start
```

## Automated browser tests

Build the app and start a production server on the test suite's default port:

```bash
npm run build
npm run start -- --port 3217
```

Keep that server running. In a second terminal, run:

```bash
npm run test:documents
```

The suite uses generated files and an isolated headless browser profile. It checks actual downloaded PDF and text contents, page order and dimensions, clipboard copying, compression, cancellation, error recovery, mobile overflow, and existing single-file conversion paths.

Optional environment variables:

| Variable | Purpose | Default |
| --- | --- | --- |
| `TEST_BASE_URL` | Address of the running app to test. | `http://localhost:3217` |
| `CHROME_PATH` | Full path to a Chrome, Edge, or Chromium executable. | Checks common installation locations. |

## Built with

| Technology | Role |
| --- | --- |
| Next.js 16 and React 19 | App routing and interactive UI. |
| TypeScript and CSS | Application logic, responsive layouts, and styling. |
| PDF.js | PDF reading, page rendering, and text extraction. |
| pdf-lib | PDF creation and optimization. |
| Browser Canvas API | Image conversion and page image encoding. |
| JSZip and FileSaver.js | ZIP creation and file downloads. |
| Lucide React | Interface icons. |

Instrument Sans and DM Mono are served locally with their font licenses.

## Project structure

```text
src/
  app/             Home page, converter routes, and global styles
  components/      Converter interfaces and shared UI
  hooks/           Conversion progress and cancellation handling
  lib/             Tool registry and PDF/image processing helpers
public/            Fonts, PDF worker, icons, and UI assets
tests/             Browser automation and document conversion tests
```
