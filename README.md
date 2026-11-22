OmniConvert is a browser-local PDF and image conversion app built with Next.js. Files are processed on the user's device.

## Document tools

- **Image to PDF:** add multiple JPG, PNG, or WebP files, reorder or remove pages, and export an A4, Letter, or image-sized PDF with adjustable orientation and margins. The combined input limit is 100 MB.
- **PDF to Text:** preview, copy, and download selectable text as UTF-8. Scanned pages need OCR; OCR is not included.
- **PDF Optimizer:** compact PDF structure while preserving text and links, or compress pages as JPEG images with adjustable quality and resolution. Image compression removes selectable text, links, and form fields. If optimization would increase file size, the original is kept unchanged.

The existing PDF-to-image and image-format tools remain available. All eight tool cards link to active converters.

## Browser tests

Use Node.js 22 or later and an installed Chrome, Edge, or Chromium. Start the app, then run tests in a second terminal:

```powershell
npm.cmd run build
npm.cmd run start -- --port 3217
```

```powershell
npm.cmd run test:documents
```

Tests use isolated browser profiles and generated fixtures. They inspect actual downloaded PDFs and text files, image order and page sizes, clipboard text, compression results, cancellation, error recovery, mobile overflow, and existing single-file conversion paths. Set `TEST_BASE_URL` for another running server or `CHROME_PATH` for a browser installed in a nonstandard location. On macOS/Linux, use `npm` in place of `npm.cmd`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

Instrument Sans and DM Mono are served locally from `public/fonts` with their licenses.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
