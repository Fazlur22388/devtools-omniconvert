import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'DevTools OmniConvert - Free Client-Side PDF & Image Converter Suite',
  description: 'Convert PDF files into JPEG, PNG, and WebP images instantly in your browser. 100% private, zero file uploads to servers, and high DPI resolution export.',
  keywords: 'pdf to jpeg, pdf converter, nextjs pdf renderer, pdf to png, devtools converter, client-side file converter'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#080b11] text-gray-100 antialiased selection:bg-indigo-500 selection:text-white">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
