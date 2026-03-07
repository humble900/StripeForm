import { Metadata } from "next";
import {
  generateMetadata as generateSEOMetadata,
  getSEOConfig,
} from "@/lib/seo";
import ContactClient from "./ContactClient";

export const metadata: Metadata = generateSEOMetadata(getSEOConfig("contact"));

export default function ContactPage() {
  return <ContactClient />;
}
