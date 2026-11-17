import Link from "next/link";
import { ArrowRight, FileImage, FilePlus2, FileText, Image, Minimize2 } from "lucide-react";
import { ConverterTool } from "@/lib/converters-registry";

export default function ConverterCard({ tool }: { tool: ConverterTool }) {
  const unavailable = tool.status === "coming-soon";
  const Icon = tool.id === "pdf-compressor" ? Minimize2 : tool.id === "image-to-pdf" ? FilePlus2 : tool.category === "image" ? Image : tool.category === "document" ? FileText : FileImage;
  const content = <><div className="tool-card-top"><span className={`tool-icon ${tool.category === "image" ? "tool-icon-image" : ""}`}><Icon size={23} strokeWidth={1.5} /></span>{tool.popular && !unavailable && <span className="tool-label">Popular</span>}{unavailable && <span className="tool-label muted-label">Coming soon</span>}</div><div className="format-pair"><span>{tool.fromFormat}</span><ArrowRight size={15} /><span>{tool.toFormat}</span></div><h3>{tool.name}</h3><p>{tool.description}</p><div className="tool-card-foot"><span>{unavailable ? "In development" : "Open converter"}</span>{!unavailable && <ArrowRight size={18} className="m-arrow" />}</div></>;
  return unavailable ? <article className="tool-card card is-unavailable">{content}</article> : <Link href={`/converter/${tool.id}`} className="tool-card card" aria-label={`Open ${tool.name} converter`}>{content}</Link>;
}
