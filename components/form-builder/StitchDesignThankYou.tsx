import React from "react";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

interface StitchDesignThankYouProps {
  formTitle: string;
  thankYouTitle?: string;
  thankYouDescription?: string;
  onRestart: () => void;
  onBack?: () => void;
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
}

export default function StitchDesignThankYou({
  formTitle,
  thankYouTitle = "Thank you for your submission!",
  thankYouDescription = "We appreciate you taking the time to complete this form. Your information has been successfully received.",
  onRestart,
  onBack,
  primaryColor = "#4265f0",
  backgroundColor = "#f8f9fc",
  textColor = "#0d101b",
  fontFamily,
}: StitchDesignThankYouProps) {
  return (
    <div
      className="relative flex size-full min-h-screen flex-col justify-between group/design-root overflow-x-hidden"
      style={{ backgroundColor, fontFamily }}
    >
      <div>
        <div
          className="flex items-center p-4 pb-2 justify-between"
          style={{ backgroundColor }}
        >
          <div
            className="flex size-12 shrink-0 items-center cursor-pointer rounded-lg transition-colors"
            style={{ color: textColor }}
            onClick={onBack}
            data-icon="ArrowLeft"
            data-size="24px"
            data-weight="regular"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </div>
          <h2
            className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12"
            style={{ color: textColor }}
          >
            {formTitle}
          </h2>
        </div>
        <h2
          className="tracking-light text-[clamp(18px,4vw,28px)] font-bold leading-tight px-4 text-center pb-3 pt-5"
          style={{ color: textColor }}
        >
          {thankYouTitle}
        </h2>
        <p
          className="text-[clamp(13px,2.5vw,16px)] font-normal leading-normal pb-3 pt-1 px-4 text-center"
          style={{ color: textColor }}
        >
          {thankYouDescription}
        </p>
      </div>
      <div>
        <div className="flex justify-center px-4 py-3">
          <button
            onClick={onRestart}
            className="inline-flex items-center justify-center overflow-hidden rounded-full h-[44px] px-5 text-sm font-semibold leading-normal tracking-[0.015em] transition-colors"
            style={{ backgroundColor: primaryColor, color: "#f8f9fc" }}
          >
            <span className="truncate">Submit another response</span>
          </button>
        </div>
        <div className="h-5" style={{ backgroundColor }}></div>
      </div>
    </div>
  );
}
