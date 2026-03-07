"use client";

import { BrandKitContent } from "@/components/brand-kit/BrandKitContent";
import { BrandKitProvider } from "@/components/providers/BrandKitProvider";

export default function BrandKitPage() {
  return (
    <BrandKitProvider>
      <div className="bg-white min-h-screen">
        <BrandKitContent />
      </div>
    </BrandKitProvider>
  );
}
