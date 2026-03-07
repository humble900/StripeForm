import React from "react";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

interface StitchDesignCoverProps {
  formTitle: string;
  formDescription?: string;
  onStart: () => void;
  onBack?: () => void;
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
}

export default function StitchDesignCover({
  formTitle,
  formDescription,
  onStart,
  onBack,
  primaryColor = "#4265f0",
  backgroundColor = "#f8f9fc",
  textColor = "#0d101b",
  fontFamily,
}: StitchDesignCoverProps) {
  return (
    <div
      className="relative flex size-full min-h-screen flex-col justify-between group/design-root overflow-x-hidden"
      style={{ backgroundColor, fontFamily }}
    >
      <div>
        <h2
          className="tracking-light text-[clamp(18px,4vw,28px)] font-bold leading-tight px-4 text-center pb-3 pt-8"
          style={{ color: textColor }}
        >
          {formTitle}
        </h2>
        {formDescription && (
          <p
            className="text-[clamp(13px,2.5vw,16px)] font-normal leading-normal pb-3 pt-1 px-4 text-center"
            style={{ color: textColor }}
          >
            {formDescription}
          </p>
        )}
      </div>
      <div>
        <div className="flex justify-center px-4 py-3">
          <button
            onClick={onStart}
            className="inline-flex items-center justify-center overflow-hidden rounded-full h-[44px] px-5 text-sm font-semibold leading-normal tracking-[0.015em] transition-colors"
            style={{ backgroundColor: primaryColor, color: "#f8f9fc" }}
          >
            <span className="truncate">Start</span>
          </button>
        </div>
        <div className="h-5" style={{ backgroundColor }}></div>
      </div>
    </div>
  );
}
