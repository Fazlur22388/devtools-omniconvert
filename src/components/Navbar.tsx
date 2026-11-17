"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";

export function Brand() {
  return <><span className="brand-mark" aria-hidden="true"><span /></span><span className="brand-name">OmniConvert</span></>;
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const regions = [...document.querySelectorAll<HTMLElement>("main, footer")];
    const previousOverflow = document.body.style.overflow;
    regions.forEach((region) => { region.inert = true; });
    document.body.style.overflow = "hidden";
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", close);
    return () => {
      regions.forEach((region) => { region.inert = false; });
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", close);
    };
  }, [open]);
  return <header className="nav site-nav"><div className="wrap nav-inner"><a href="#top" className="skip-link">Skip to content</a><Link href="/" className="brand" aria-label="OmniConvert home" onClick={() => setOpen(false)}><Brand /></Link><nav className={`main-navigation ${open ? "is-open" : ""}`} id="main-navigation" aria-label="Main navigation"><Link href="/#converters" onClick={() => setOpen(false)}>Tools</Link><Link href="/#how-it-works" onClick={() => setOpen(false)}>How it works</Link><Link href="/#privacy" onClick={() => setOpen(false)}>Privacy</Link></nav><div className="nav-actions"><Link href="/converter/pdf-to-jpeg" className="btn btn--primary nav-convert">Convert a PDF <ArrowUpRight size={17} /></Link><button type="button" className="menu-toggle" aria-controls="main-navigation" aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>{open ? <X size={22} /> : <Menu size={22} />}</button></div></div></header>;
}
