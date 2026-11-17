import Link from "next/link";
import { ArrowUpRight, LockKeyhole } from "lucide-react";
import { Brand } from "./Navbar";

export default function Footer() {
  return <footer className="site-footer closing" id="contact"><div className="wrap"><div className="footer-close"><div><h2>Your next file,<br />in the right format.</h2></div><Link href="/converter/pdf-to-jpeg" className="btn btn--primary">Convert a PDF <ArrowUpRight size={18} /></Link></div><div className="footer-tail"><div className="footer-directory"><div><Link href="/" className="brand"><Brand /></Link><p>PDF and image tools that run<br />where your files already are.</p></div><div className="footer-links"><h3>PDF tools</h3><Link href="/converter/pdf-to-jpeg">PDF to JPEG</Link><Link href="/converter/pdf-to-png">PDF to PNG</Link></div><div className="footer-links"><h3>Image tools</h3><Link href="/converter/jpg-to-png">JPG to PNG</Link><Link href="/converter/png-to-jpg">PNG to JPG</Link><Link href="/converter/webp-to-jpg">WebP to JPG</Link></div><div className="footer-links"><h3>OmniConvert</h3><Link href="/#converters">All tools</Link><Link href="/#how-it-works">How it works</Link><Link href="/#privacy">File privacy</Link></div></div><div className="footer-legal"><span>© {new Date().getFullYear()} DevTools OmniConvert</span><span><LockKeyhole size={14} /> Files stay on your device.</span></div></div></div></footer>;
}
