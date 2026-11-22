import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock3, FileQuestion } from "lucide-react";
import { CONVERTER_TOOLS } from "@/lib/converters-registry";
import PDFToImageConverter from "@/components/PDFToImageConverter";
import ImageConverter from "@/components/ImageConverter";
import ImageToPdfConverter from "@/components/ImageToPdfConverter";
import PdfToTextConverter from "@/components/PdfToTextConverter";
import PdfOptimizer from "@/components/PdfOptimizer";

export default async function ConverterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tool = CONVERTER_TOOLS.find((item) => item.id === id);
  let converter;
  if (tool?.id === "image-to-pdf") converter = <ImageToPdfConverter />;
  else if (tool?.id === "pdf-to-text") converter = <PdfToTextConverter />;
  else if (tool?.id === "pdf-compressor") converter = <PdfOptimizer />;
  else if (tool?.category === "image") converter = <ImageConverter key={tool.id} initialFrom={tool.fromFormat} initialTo={tool.toFormat} />;
  else converter = <PDFToImageConverter key={tool?.id} initialFormat={tool?.id === "pdf-to-png" ? "image/png" : "image/jpeg"} />;

  return <section className="converter-page"><div className="wrap"><div className="breadcrumbs"><Link href="/#converters"><ArrowLeft size={16} /> All tools</Link><span>/</span><span>{tool?.name || "Tool not found"}</span></div>{!tool || tool.status === "coming-soon" ? <div className="unavailable-page">{tool ? <Clock3 size={40} /> : <FileQuestion size={40} />}<h1>{tool ? `${tool.name} is in development` : "This tool could not be found"}</h1><p>{tool ? "This converter is not available yet. You can use our PDF-to-image and image-format converters now." : "Choose a converter from the tool library."}</p><Link href="/#converters" className="btn btn--primary">See available tools <ArrowRight size={17} /></Link></div> : converter}</div></section>;
}
