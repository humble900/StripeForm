"use client";

import React from "react";

export type CoverPreset =
  | "bounce"
  | "typeform"
  | "stitch"
  | "tripe"
  | "plain"
  | "builder";

interface CoverCardProps {
  title: string;
  subtitle?: string;
  cta?: string;
  bgUrl?: string;
  bgColor?: string;
  btnColor?: string;
  preset?: CoverPreset;
  onStart?: () => void;
  brandLogo?: {
    url: string;
    alt: string;
    width?: number;
    height?: number;
  };
}

export function CoverCard({
  title,
  subtitle,
  cta = "Start",
  bgUrl,
  bgColor = "#f8fafc",
  btnColor = "#111827",
  preset = "plain",
  onStart,
  brandLogo,
}: CoverCardProps) {
  const containerClass =
    preset === "bounce"
      ? "min-h-[60vh] flex items-center justify-center rounded-[20px]"
      : preset === "typeform"
        ? "min-h-screen flex items-center justify-center rounded-none"
        : preset === "tripe"
          ? "min-h-[60vh] flex items-center justify-center rounded-[16px]"
          : preset === "builder"
            ? "rounded-[16px]"
            : "rounded-[16px]";

  const paddingClass =
    preset === "typeform"
      ? "p-6 sm:p-8 lg:px-12 xl:px-16"
      : preset === "bounce"
        ? "p-12"
        : preset === "tripe"
          ? "p-10"
          : "p-10";

  const titleClass =
    preset === "typeform"
      ? "text-xl sm:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl"
      : preset === "tripe"
        ? "text-2xl sm:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl"
        : "text-2xl sm:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl";

  const subtitleClass =
    preset === "typeform"
      ? "text-xs sm:text-sm lg:text-base xl:text-lg 2xl:text-xl"
      : preset === "tripe"
        ? "text-sm sm:text-base lg:text-lg xl:text-xl 2xl:text-2xl"
        : "text-sm sm:text-base lg:text-lg xl:text-xl 2xl:text-2xl";

  const buttonClass =
    preset === "typeform"
      ? "px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-2 sm:py-3 lg:py-4 xl:py-5 2xl:py-6 text-sm sm:text-base lg:text-lg xl:text-xl 2xl:text-2xl font-semibold"
      : preset === "tripe"
        ? "px-6 sm:px-8 lg:px-10 xl:px-12 2xl:px-14 py-3 sm:py-4 lg:py-5 xl:py-6 2xl:py-7 text-sm sm:text-base lg:text-lg xl:text-xl 2xl:text-2xl font-medium"
        : "px-6 sm:px-8 lg:px-10 xl:px-12 2xl:px-14 py-3 sm:py-4 lg:py-5 xl:py-6 2xl:py-7 text-sm sm:text-base lg:text-lg xl:text-xl 2xl:text-2xl font-medium";

  return (
    <div
      className={`relative text-center overflow-hidden border border-gray-200 ${containerClass}`}
      style={{ backgroundColor: bgColor }}
    >
      {bgUrl && (
        <img
          src={bgUrl}
          alt="Cover background"
          className="absolute inset-0 w-full h-full object-cover -z-10"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
      <div className={`relative w-full max-w-4xl mx-auto ${paddingClass}`}>
        {/* Brand Logo Area */}
        {brandLogo?.url && (
          <div className="flex justify-center mb-6">
            <img
              src={brandLogo.url}
              alt={brandLogo.alt || "Brand Logo"}
              className="max-w-20 max-h-20 object-contain"
              style={{
                width: brandLogo.width ? `${brandLogo.width}px` : "80px",
                height: brandLogo.height ? `${brandLogo.height}px` : "80px",
              }}
            />
          </div>
        )}

        <h2 className={`font-bold text-gray-900 leading-tight ${titleClass}`}>
          {title}
        </h2>
        {subtitle && (
          <p
            className={`text-gray-600 mt-3 sm:mt-4 lg:mt-5 xl:mt-6 2xl:mt-8 leading-relaxed ${subtitleClass}`}
          >
            {subtitle}
          </p>
        )}
        <div className="mt-6">
          <button
            onClick={onStart}
            className={`inline-flex items-center justify-center rounded-full text-white transition hover:opacity-90 ${buttonClass}`}
            style={{ backgroundColor: btnColor }}
            type="button"
          >
            {cta}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CoverCard;
