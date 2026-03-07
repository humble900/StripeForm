import "../globals.css";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers/Providers";

const inter = Inter({
  subsets: ["latin"],
  fallback: ["system-ui", "arial"],
});

export default function FormsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.className} h-full antialiased`}>
      <Providers>{children}</Providers>
    </div>
  );
}
