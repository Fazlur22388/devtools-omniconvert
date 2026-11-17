"use client";

import { useState } from "react";
import { ArrowDown, ArrowRight, Check, FileImage, LockKeyhole, Search, ShieldCheck, X } from "lucide-react";
import ConverterCard from "@/components/ConverterCard";
import PDFToImageConverter from "@/components/PDFToImageConverter";
import { CATEGORIES, CONVERTER_TOOLS } from "@/lib/converters-registry";

export default function Home() {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const tools = CONVERTER_TOOLS.filter((tool) =>
    (category === "all" || tool.category === category) &&
    `${tool.name} ${tool.description}`.toLowerCase().includes(query.toLowerCase().trim()),
  );

  return (
    <>
      {/* software; blue-black-cornflower / instrument; collage adapted for a live file tool;
          nav-centre / footer-columns / close-type / surface-pairs / tonal / ring. */}
      <section className="hero hero--collage conversion-hero" data-enter aria-labelledby="hero-h">
        <div className="wrap">
          <div className="hero-columns hero-text">
            <div className="hero-copy hero__text">
              <p className="eyebrow"><span className="status-dot" /> Your files stay on your device</p>
              <h1 id="hero-h">File conversion<br /><span>inside your<br className="desktop-break" /> browser.</span></h1>
              <p className="hero__lead">Turn PDF pages into images and switch image formats. Open a file, choose your settings, and save it straight to your device.</p>
              <div className="hero-links">
                <a href="#converters" className="btn btn--secondary">Browse all tools <ArrowRight size={18} className="m-arrow" /></a>
                <span className="small-note">Free to use. No account.</span>
              </div>
              <div className="hero-specs"><span><LockKeyhole size={16} /> No file uploads</span><span><FileImage size={16} /> Files up to 100 MB</span></div>
            </div>
            <div id="convert" className="hero-workspace" data-enter-media><PDFToImageConverter embedded /></div>
          </div>
          <div className="hero-bottom"><a className="scroll-link" href="#converters"><ArrowDown size={16} /> Find the right format</a><p>PDF <span>/</span> JPEG <span>/</span> PNG <span>/</span> WebP</p><span className="local-note"><ShieldCheck size={16} /> Processed on your device</span></div>
        </div>
      </section>

      <section id="converters" className="tools-section section" aria-labelledby="tools-h">
        <div className="wrap">
          <div className="section-heading"><div><h2 id="tools-h">A tool for your next file.</h2></div><p>Choose the format you need. <br />Everything happens in your browser.</p></div>
          <div className="library-toolbar">
            <div className="category-filters" aria-label="Filter tools">{CATEGORIES.map((item) => <button type="button" key={item.id} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item.label}<span>{item.id === "all" ? CONVERTER_TOOLS.length : CONVERTER_TOOLS.filter((tool) => tool.category === item.id).length}</span></button>)}</div>
            <div className="tool-search"><label htmlFor="tool-search">Search tools</label><div><Search size={17} /><input id="tool-search" placeholder="Try “PNG”" value={query} onChange={(event) => setQuery(event.target.value)} />{query && <button type="button" aria-label="Clear search" onClick={() => setQuery("")}><X size={16} /></button>}</div></div>
          </div>
          <p className="sr-only" role="status">{tools.length} tools found</p>
          <div className="tools-grid grid" data-visual>{tools.map((tool) => <ConverterCard key={tool.id} tool={tool} />)}</div>
          {tools.length === 0 && <div className="empty-search"><Search size={28} /><h3>No matching tools</h3><p>Try a file format such as PDF, JPG, or PNG.</p><button className="btn btn--secondary" onClick={() => { setQuery(""); setCategory("all"); }}>See all tools</button></div>}
          <p className="library-note"><LockKeyhole size={15} /> Your files are processed locally. Nothing to sign up for.</p>
        </div>
      </section>

      <section id="how-it-works" className="process-section section" aria-labelledby="process-h">
        <div className="wrap">
          <div className="section-heading"><div><h2 id="process-h">From file to download.</h2></div><p>Keep control over the format, <br />the quality, and the final download.</p></div>
          <div className="process-grid grid">
            <article><span className="step-number">01 /</span><h3>Choose your file</h3><p>Drop a PDF or an image into its converter, or browse the files on your device.</p><div className="step-visual file-visual" role="img" aria-label="A PDF file converted to a JPG file" data-visual><span className="file-outline">PDF</span><ArrowRight size={24} /><span className="file-outline file-outline-alt">JPG</span></div></article>
            <article><span className="step-number">02 /</span><h3>Choose the output format</h3><p>Choose an image format. For PDFs, adjust the resolution and select the pages you want.</p><div className="step-visual format-visual" role="img" aria-label="JPEG, PNG, and WebP format choices with PNG selected" data-visual><span>JPEG</span><span className="selected-format">PNG <Check size={15} /></span><span>WebP</span></div></article>
            <article><span className="step-number">03 /</span><h3>Download your images</h3><p>Download an individual image, or collect your selected PDF pages in one ZIP file.</p><div className="step-visual download-visual" role="img" aria-label="An image ready for download" data-visual><span><Check size={17} /> Ready to download</span><ArrowDown size={22} /></div></article>
          </div>
        </div>
      </section>

      <section id="privacy" className="privacy-section section" aria-labelledby="privacy-h">
        <div className="wrap">
          <div className="privacy-top"><span className="privacy-symbol"><LockKeyhole size={32} strokeWidth={1.3} /></span><span className="eyebrow">Local by design</span></div>
          <h2 id="privacy-h" className="mo-lt__type" data-moment="liquid-type" data-moment-opts='{"strength":0.4}'>Your browser.<br />Your files.</h2>
          <div className="privacy-bottom"><p>OmniConvert reads and converts your files on this device. File contents are never sent to a conversion server.</p><div><p>Large documents use your device’s memory and may take longer to process.</p><a className="link" href="/converter/pdf-to-jpeg">Convert a PDF</a></div></div>
        </div>
      </section>
    </>
  );
}
