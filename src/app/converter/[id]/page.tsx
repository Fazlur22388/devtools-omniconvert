import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock3, FileQuestion } from "lucide-react";
import { CONVERTER_TOOLS } from "@/lib/converters-registry";
import PDFToImageConverter from "@/components/PDFToImageConverter";
import ImageConverter from "@/components/ImageConverter";

export default async function ConverterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tool = CONVERTER_TOOLS.find((item) => item.id === id);
  return <section className="converter-page"><div className="wrap"><div className="breadcrumbs"><Link href="/#converters"><ArrowLeft size={16} /> All tools</Link><span>/</span><span>{tool?.name || "Tool not found"}</span></div>{!tool || tool.status === "coming-soon" ? <div className="unavailable-page">{tool ? <Clock3 size={40} /> : <FileQuestion size={40} />}<h1>{tool ? `${tool.name} is in development` : "This tool could not be found"}</h1><p>{tool ? "This converter is not available yet. You can use our PDF-to-image and image-format converters now." : "Choose a converter from the tool library."}</p><Link href="/#converters" className="btn btn--primary">See available tools <ArrowRight size={17} /></Link></div> : tool.category === "image" ? <ImageConverter key={tool.id} initialFrom={tool.fromFormat} initialTo={tool.toFormat} /> : <PDFToImageConverter key={tool.id} initialFormat={tool.id === "pdf-to-png" ? "image/png" : "image/jpeg"} />}</div></section>;
}
