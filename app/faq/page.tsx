import { Metadata } from "next";
import {
  generateMetadata as generateSEOMetadata,
  getSEOConfig,
} from "@/lib/seo";
import FAQClient from "./FAQClient";

export const metadata: Metadata = generateSEOMetadata(getSEOConfig("faq"));

export default function FAQPage() {
  return <FAQClient />;
}
