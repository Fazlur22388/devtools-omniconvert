import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TasteMotion from '@/components/TasteMotion';

export const metadata: Metadata = {
  title: 'OmniConvert — PDF and image tools for your browser',
  description: 'Convert PDF pages to JPEG, PNG, or WebP and switch image formats. Free file tools with local processing and no account required.',
  icons: { icon: '/icon.svg' },
  other: { 'page-type': 'software', 'site-kind': 'software' },
  openGraph: { title: 'OmniConvert — PDF and image tools', description: 'Convert your files in your browser. Files stay on your device.', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'OmniConvert — PDF and image tools', description: 'File conversion inside your browser.' },
};

export const viewport: Viewport = { themeColor: '#0a0d14' };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-type="software" data-radius="sharp" data-buttons="tonal" data-motion="" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="/taste/motion/motion.css" />
        <link rel="preload" href="/fonts/instrument-sans-400.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/instrument-sans-500.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('m-enter');setTimeout(()=>document.documentElement.classList.add('m-enter-done'),700)" }} />
      </head>
      <body>
        <Navbar />
        <main id="top">
          {children}
        </main>
        <Footer />
        <TasteMotion />
      </body>
    </html>
  );
}
