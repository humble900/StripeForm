import { Metadata } from "next";
import {
  generateMetadata as generateSEOMetadata,
  getSEOConfig,
} from "@/lib/seo";

export const metadata: Metadata = generateSEOMetadata(getSEOConfig("admin"));

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
