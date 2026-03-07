"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowPathIcon,
  CreditCardIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";
import { FieldComponent } from "./FieldComponents";
import CoverCard from "./CoverCard";
import { ThemeArtBackground } from "./ThemeArtBackground";
import StitchDesignThankYou from "./StitchDesignThankYou";
import { Form } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EnhancedFormPreviewProps {
  form: Form;
  isPreview?: boolean;
  onClose?: () => void;
  submitMode?: "simulate" | "api";
}

interface FormData {
  [key: string]: any;
}

export default function EnhancedFormPreview({
  form,
  isPreview = true,
  onClose,
  submitMode = "simulate",
}: EnhancedFormPreviewProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [hasStartedForm, setHasStartedForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Form settings
  const isTypeformPreset =
    form.theme?.custom_css?.includes("typeform") || false;
  const isTripePreset = form.theme?.custom_css?.includes("tripe") || false;
  const isStitchPreset = form.theme?.custom_css?.includes("stitch") || false;
  const isProgressive = form.settings?.display_mode === "progressive";
  const isGrid = form.settings?.display_mode === "grid";

  // Layout settings
  const layoutSetting = form.settings.layout || "vertical";
  const containerLayoutClass =
    layoutSetting === "grid"
      ? "layout-grid"
      : layoutSetting === "horizontal"
        ? "layout-horizontal"
        : "layout-vertical";

  // Evaluate logic
  const evaluateCondition = (conditional: any, currentData: FormData) => {
    if (!conditional || !conditional.fieldId) return true;

    const value = currentData[conditional.fieldId];
    const targetValue = conditional.value;
    let conditionMet = false;

    switch (conditional.operator) {
      case "equals":
        conditionMet = String(value || "") === String(targetValue || "");
        break;
      case "not_equals":
        conditionMet = String(value || "") !== String(targetValue || "");
        break;
      case "contains":
        conditionMet = String(value || "")
          .toLowerCase()
          .includes(String(targetValue || "").toLowerCase());
        break;
      case "greater_than":
        conditionMet = Number(value || 0) > Number(targetValue || 0);
        break;
      case "less_than":
        conditionMet = Number(value || 0) < Number(targetValue || 0);
        break;
      case "is_empty":
        conditionMet = !value || String(value).trim() === "";
        break;
      case "is_not_empty":
        conditionMet = !!value && String(value).trim() !== "";
        break;
      default:
        conditionMet = true;
    }

    return conditional.action === "show" ? conditionMet : !conditionMet;
  };

  // Filter out utility slides and evaluate conditional visibility
  const visibleFields =
    form.fields?.filter((field) => {
      const isSpecialField = [
        "cover_slide",
        "end_page",
        "geo_restriction",
        "url_redirect",
      ].includes(field.type as string);
      if (isSpecialField) return false;

      if (field.conditional && field.conditional.fieldId) {
        return evaluateCondition(field.conditional, formData);
      }

      return true;
    }) || [];

  const totalSteps = isProgressive ? visibleFields.length : 1;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  // Grid mode helpers
  const gridCols = (form.settings as any)?.grid_columns || 2;
  const getGridColSpan = (field: any) => {
    const w = field.settings?.styling?.width as string | undefined;
    switch (w) {
      case "quarter":
        return Math.max(1, Math.ceil(gridCols / 4));
      case "third":
        return Math.max(1, Math.ceil(gridCols / 3));
      case "half":
        return Math.max(1, Math.ceil(gridCols / 2));
      case "full":
      default:
        return gridCols;
    }
  };

  // Get current field for progressive mode or all fields for single page mode
  const getCurrentFields = () => {
    if (!isProgressive) return visibleFields;

    // Progressive mode: show one field at a time
    return visibleFields[currentStep] ? [visibleFields[currentStep]] : [];
  };

  const currentFields = getCurrentFields();

  // Handle field value changes
  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));

    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (fieldId: string) => {
    setShowPassword((prev) => ({
      ...prev,
      [fieldId]: !prev[fieldId],
    }));
  };

  // Validation
  const validateField = (field: any, value: any): string | null => {
    if (
      field.required &&
      (!value || (typeof value === "string" && value.trim() === ""))
    ) {
      return `${field.label || "This field"} is required`;
    }

    if (field.type === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return "Please enter a valid email address";
      }
    }

    if (field.type === "url" && value) {
      try {
        new URL(value);
      } catch {
        return "Please enter a valid URL";
      }
    }

    if (field.validation) {
      for (const rule of field.validation) {
        if (rule.type === "min_length" && value && value.length < rule.value) {
          return rule.message || `Minimum length is ${rule.value} characters`;
        }
        if (rule.type === "max_length" && value && value.length > rule.value) {
          return rule.message || `Maximum length is ${rule.value} characters`;
        }
        if (rule.type === "pattern" && rule.pattern && value) {
          const regex = new RegExp(rule.pattern);
          if (!regex.test(value)) {
            return rule.message || "Invalid format";
          }
        }
      }
    }

    return null;
  };

  // Validate current step
  const validateCurrentStep = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    currentFields.forEach((field) => {
      const value = formData[field.id];
      const error = validateField(field, value);

      if (error) {
        newErrors[field.id] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Navigation
  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCurrentStep()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (submitMode === "api") {
        // Handle payment if present and payment API available
        const paymentField = form?.fields?.find(
          (f: any) => f.type === "payment",
        ) as any;
        if (
          paymentField &&
          paymentField.settings?.paymentApiRef &&
          typeof paymentField.settings.paymentApiRef.confirm === "function"
        ) {
          const result = await paymentField.settings.paymentApiRef.confirm();
          if (!result?.ok) {
            throw new Error(result?.error || "Payment failed");
          }
        }

        const response = await fetch("/api/forms/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formId: form.id, data: formData }),
        });
        if (!response.ok) {
          throw new Error("Failed to submit form");
        }
        setShowThankYou(true);
      } else {
        // Simulate form submission
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setShowThankYou(true);
      }

      // Reset form data
      setFormData({});
      setCurrentStep(0);
      setErrors({});
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({});
    setCurrentStep(0);
    setErrors({});
    setShowThankYou(false);
  };

  // --- Typeform-style progressive helpers ---
  const directionRef = useRef<"up" | "down">("down");
  const prevStepRef = useRef(0);

  useEffect(() => {
    directionRef.current = currentStep > prevStepRef.current ? "down" : "up";
    prevStepRef.current = currentStep;
  }, [currentStep]);

  const goNext = useCallback(() => {
    if (isProgressive && validateCurrentStep()) {
      if (currentStep < totalSteps - 1) {
        setCurrentStep((s) => s + 1);
      } else {
        // Last step — auto-submit
        const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
        handleSubmit(fakeEvent);
      }
    }
  }, [currentStep, totalSteps, isProgressive]);

  const goPrev = useCallback(() => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }, [currentStep]);

  // Keyboard navigation for progressive mode
  useEffect(() => {
    if (!isProgressive) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isProgressive, goNext, goPrev]);

  // Helpers for Typeform colors
  const tfBg =
    form.theme?.background_color ||
    (form as any)?.brandKit?.colors?.pageBackground?.hex ||
    "#FFFFFF";
  const tfText =
    form.theme?.text_color ||
    (form as any)?.brandKit?.colors?.text?.primary?.hex ||
    "#1F2937";
  const tfPrimary =
    form.theme?.primary_color ||
    (form as any)?.brandKit?.colors?.buttonPrimary?.hex ||
    "#6C5CE7";
  const tfFont =
    (form as any)?.brandKit?.typography?.fontFamily?.primary ||
    form.theme?.font_family ||
    "Inter, sans-serif";

  // If showing thank you page
  if (showThankYou) {
    const endPageField = form.fields?.find((f) => f.type === "end_page") as any;
    const tyTitle =
      endPageField?.settings?.endPageTitle ||
      form.settings?.success_message ||
      "Thank you!";
    const tyMsg =
      endPageField?.settings?.endPageMessage ||
      "Your response has been submitted successfully.";
    const tyBtnText = endPageField?.settings?.endPageButtonText;
    const tyBtnUrl = endPageField?.settings?.endPageButtonUrl;
    const tyBg = endPageField?.settings?.endPageBackgroundColor || tfBg;

    // Typeform-style thank-you page
    if (isProgressive) {
      return (
        <div
          className="tf-thankyou"
          style={{ backgroundColor: tyBg, color: tfText, fontFamily: tfFont }}
        >
          <div className="tf-thankyou-content">
            {/* Animated check icon */}
            <div
              className="tf-thankyou-icon tf-scale-in"
              style={{ backgroundColor: `${tfPrimary}18` }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path
                  className="tf-check-anim"
                  d="M5 13l4 4L19 7"
                  stroke={tfPrimary}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="tf-thankyou-title" style={{ color: tfText }}>
              {tyTitle}
            </h1>
            <p className="tf-thankyou-desc" style={{ color: tfText }}>
              {tyMsg}
            </p>

            {tyBtnText && (
              <a
                href={tyBtnUrl || "#"}
                onClick={(e) => {
                  if (!tyBtnUrl) {
                    e.preventDefault();
                    onClose?.();
                  }
                }}
                className="tf-ok-btn mt-4"
                style={{ backgroundColor: tfPrimary }}
              >
                {tyBtnText}
              </a>
            )}

            {/* Social share row */}
            <div className="tf-share-row">
              <button
                className="tf-share-btn"
                title="Copy link"
                onClick={() =>
                  navigator.clipboard?.writeText(window.location.href)
                }
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </button>
              <button
                className="tf-share-btn"
                title="Share on X"
                onClick={() =>
                  window.open(
                    `https://x.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`,
                    "_blank",
                  )
                }
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>
              <button
                className="tf-share-btn"
                title="Share on LinkedIn"
                onClick={() =>
                  window.open(
                    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
                    "_blank",
                  )
                }
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </button>
            </div>

            {isPreview && (
              <button
                onClick={handleReset}
                className="mt-4 text-sm opacity-50 hover:opacity-80 underline"
                style={{ color: tfText }}
              >
                Restart form
              </button>
            )}
          </div>
        </div>
      );
    }

    // Non-progressive thank-you (existing behavior)
    if (endPageField) {
      const hasBgImage =
        endPageField.settings?.coverBackgroundImage ||
        form.theme?.header_image_url;
      const bgColor = endPageField.settings?.coverBackgroundColor || tfBg;
      const textColor = hasBgImage ? "#FFFFFF" : tfText;

      return (
        <div
          className="min-h-screen flex items-center justify-center relative overflow-hidden"
          style={{
            backgroundColor: form.theme?.gallery_theme_id
              ? "transparent"
              : bgColor,
            fontFamily: tfFont,
          }}
        >
          <ThemeArtBackground
            themeId={form.theme?.gallery_theme_id}
            backgroundColor={bgColor}
          />

          {hasBgImage && (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${hasBgImage})` }}
              />
              <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
            </>
          )}

          <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-12 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-8 backdrop-blur-sm border border-green-500/20">
              <svg
                className="w-10 h-10 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight leading-tight"
              style={{ color: textColor }}
            >
              {tyTitle}
            </h1>

            <p
              className="text-xl md:text-2xl mb-12 max-w-2xl text-center leading-relaxed"
              style={{ color: textColor, opacity: 0.8 }}
            >
              {tyMsg}
            </p>

            <div className="flex flex-col items-center gap-4">
              {tyBtnText && (
                <button
                  onClick={onClose}
                  className="group relative inline-flex items-center justify-center px-12 py-5 text-lg font-bold text-white transition-all duration-300 ease-in-out bg-gray-900 rounded-lg hover:bg-gray-800 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-gray-900/30 overflow-hidden"
                  style={{ backgroundColor: tfPrimary }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {tyBtnText}
                  </span>
                  <div className="absolute inset-0 h-full w-full border-2 border-white/20 rounded-lg group-hover:border-white/40 transition-colors" />
                </button>
              )}

              {isPreview && (
                <button
                  onClick={handleReset}
                  className="mt-6 text-base font-medium opacity-60 hover:opacity-100 transition-opacity flex items-center gap-2"
                  style={{ color: textColor }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Restart preview
                </button>
              )}
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <StitchDesignThankYou
          formTitle={form.title || "Form"}
          thankYouTitle={
            form.settings?.success_message || "Thank you for your submission!"
          }
          thankYouDescription="We appreciate you taking the time to complete this form. Your information has been successfully received."
          onRestart={handleReset}
          onBack={onClose}
          primaryColor={tfPrimary}
          backgroundColor={tfBg}
          textColor={tfText}
          fontFamily={tfFont}
        />
      );
    }
  }

  // If showing cover page
  const coverField = form.fields?.find((f) => f.type === "cover_slide") as any;
  if (coverField && !hasStartedForm && isProgressive) {
    const hasCoverBgImage =
      coverField.settings?.coverBackgroundImage || form.theme?.header_image_url;
    const coverBgColor = coverField.settings?.coverBackgroundColor || tfBg;
    const coverTextColor = hasCoverBgImage ? "#FFFFFF" : tfText;
    const estimatedMinutes = Math.max(1, Math.ceil(visibleFields.length * 0.5));

    if (isProgressive) {
      // Typeform-style full-viewport cover
      return (
        <div
          className="tf-cover relative"
          style={{
            backgroundColor: form.theme?.gallery_theme_id
              ? "transparent"
              : coverBgColor,
            fontFamily: tfFont,
          }}
        >
          <ThemeArtBackground
            themeId={form.theme?.gallery_theme_id}
            backgroundColor={coverBgColor}
          />
          {hasCoverBgImage && (
            <>
              <div
                className="tf-cover-bg"
                style={{ backgroundImage: `url(${hasCoverBgImage})` }}
              />
              <div className="tf-cover-overlay" />
            </>
          )}
          <div className="tf-cover-content">
            {form.brandKit?.logo?.url && (
              <img
                src={form.brandKit.logo.url}
                alt={form.brandKit.logo.alt || "Logo"}
                style={{ maxHeight: 56, maxWidth: 180, objectFit: "contain" }}
              />
            )}
            <h1 className="tf-cover-title" style={{ color: coverTextColor }}>
              {coverField.settings?.coverTitle || form.title || "Welcome"}
            </h1>
            {coverField.settings?.coverSubtitle && (
              <p className="tf-cover-desc" style={{ color: coverTextColor }}>
                {coverField.settings.coverSubtitle}
              </p>
            )}
            <div className="tf-action-row" style={{ justifyContent: "center" }}>
              <button
                onClick={() => setHasStartedForm(true)}
                className="tf-ok-btn"
                style={{
                  backgroundColor:
                    coverField.settings?.coverButtonColor || tfPrimary,
                  fontSize: "1.0625rem",
                  padding: "0.75rem 2rem",
                  borderRadius: "999px",
                }}
              >
                {coverField.settings?.coverCtaText || "Start"}
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
              <span className="tf-hint" style={{ color: coverTextColor }}>
                press <kbd>Enter</kbd> ↵
              </span>
            </div>
            <div className="tf-cover-meta" style={{ color: coverTextColor }}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              Takes {estimatedMinutes} min
            </div>
          </div>
        </div>
      );
    }

    // Non-progressive cover (Landing Page Style)
    return (
      <div
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{
          backgroundColor: form.theme?.gallery_theme_id
            ? "transparent"
            : coverBgColor,
          fontFamily: tfFont,
        }}
      >
        <ThemeArtBackground
          themeId={form.theme?.gallery_theme_id}
          backgroundColor={coverBgColor}
        />

        {hasCoverBgImage && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${hasCoverBgImage})` }}
            />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          </>
        )}

        {!hasCoverBgImage && !form.theme?.gallery_theme_id && (
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, ${tfPrimary} 0%, transparent 50%), radial-gradient(circle at 75% 75%, #8b5cf6 0%, transparent 50%)`,
              }}
            />
          </div>
        )}

        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-12 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          {form.brandKit?.logo?.url && (
            <div className="flex justify-center mb-10">
              <img
                src={form.brandKit.logo.url}
                alt={form.brandKit.logo.alt || "Logo"}
                className="max-w-32 max-h-24 object-contain shadow-2xl rounded-xl"
              />
            </div>
          )}

          <div className="space-y-6 mb-12">
            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight drop-shadow-sm"
              style={{ color: coverTextColor }}
            >
              {coverField.settings?.coverTitle || form.title || "Welcome"}
            </h1>

            {coverField.settings?.coverSubtitle && (
              <p
                className="text-xl md:text-2xl lg:text-3xl max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-sm"
                style={{ color: coverTextColor, opacity: 0.85 }}
              >
                {coverField.settings.coverSubtitle}
              </p>
            )}
          </div>

          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => setHasStartedForm(true)}
              className="group relative inline-flex items-center justify-center px-12 py-5 text-xl font-bold text-white transition-all duration-300 ease-in-out bg-gray-900 rounded-lg hover:bg-gray-800 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-gray-900/30 overflow-hidden"
              style={{
                background: coverField.settings?.coverButtonColor || tfPrimary,
              }}
            >
              <span className="relative z-10 flex items-center gap-3">
                {coverField.settings?.coverCtaText || "Get Started"}
                <svg
                  className="w-6 h-6 group-hover:translate-x-1.5 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 5l7 7-7 7M5 5l7 7-7 7"
                  />
                </svg>
              </span>
              <div className="absolute inset-0 h-full w-full border-2 border-white/20 rounded-lg group-hover:border-white/40 transition-colors" />
            </button>
            <div
              className="text-sm font-medium mt-3 flex items-center gap-2 opacity-70"
              style={{ color: coverTextColor }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              Takes {estimatedMinutes} minute{estimatedMinutes !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =============================================
  // TYPEFORM-STYLE PROGRESSIVE RENDERING
  // =============================================
  if (isProgressive) {
    const progressPercent =
      totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;
    // Offset for cover slide: visibleFields index starts at 0 but cover is step 0
    const coverPresent = !!coverField;
    const qOffset = coverPresent ? 0 : 0; // numbering starts at 1

    return (
      <div
        className="tf-viewport relative"
        style={{
          backgroundColor: form.theme?.gallery_theme_id ? "transparent" : tfBg,
          fontFamily: tfFont,
          color: tfText,
        }}
      >
        {/* Theme art SVG background */}
        <ThemeArtBackground
          themeId={form.theme?.gallery_theme_id}
          backgroundColor={tfBg}
        />
        {/* Inject custom CSS */}
        {isPreview && form.theme?.custom_css && (
          <style
            dangerouslySetInnerHTML={{ __html: String(form.theme.custom_css) }}
          />
        )}

        {/* Preview banner */}
        {isPreview && (
          <div
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-1.5"
            style={{
              background: `${tfPrimary}18`,
              backdropFilter: "blur(8px)",
            }}
          >
            <Badge variant="secondary" className="text-xs">
              Preview
            </Badge>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="h-6 px-2 text-xs"
                onClick={handleReset}
              >
                Reset
              </Button>
              {onClose && (
                <Button
                  variant="outline"
                  className="h-6 px-2 text-xs"
                  onClick={onClose}
                >
                  Close
                </Button>
              )}
            </div>
          </div>
        )}

        {/* All visible fields as slides */}
        {visibleFields.map((field, idx) => {
          const slideClass =
            idx === currentStep
              ? "tf-slide tf-active"
              : idx < currentStep
                ? "tf-slide tf-exit-up"
                : "tf-slide tf-exit-down";
          const isLast = idx === visibleFields.length - 1;
          const qNum = idx + 1;

          return (
            <div key={field.id} className={slideClass}>
              <div className="tf-slide-content">
                {/* Question number */}
                <div className="tf-q-number" style={{ color: tfText }}>
                  {qNum} <span className="tf-arrow">→</span>
                </div>

                {/* Question heading */}
                <h2 className="tf-q-heading" style={{ color: tfText }}>
                  {field.label || "Untitled question"}
                  {field.required && (
                    <span style={{ color: tfPrimary }}> *</span>
                  )}
                </h2>

                {/* Description */}
                {field.description && (
                  <p className="tf-q-desc" style={{ color: tfText }}>
                    {field.description}
                  </p>
                )}

                {/* Input area */}
                <div className="tf-input-area">
                  <FieldComponent
                    field={{ ...field, label: "" }}
                    value={formData[field.id]}
                    onChange={(value) => handleFieldChange(field.id, value)}
                    error={errors[field.id]}
                    isPreview={isPreview}
                    disabled={isSubmitting}
                    showLabel={false}
                  />
                </div>

                {/* Error */}
                {errors[field.id] && (
                  <div className="tf-error">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    {errors[field.id]}
                  </div>
                )}

                {/* Action row */}
                <div className="tf-action-row">
                  <button
                    type="button"
                    className="tf-ok-btn"
                    style={{ backgroundColor: tfPrimary }}
                    onClick={() => {
                      if (isLast) {
                        const fakeEvent = {
                          preventDefault: () => {},
                        } as React.FormEvent;
                        handleSubmit(fakeEvent);
                      } else {
                        goNext();
                      }
                    }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />{" "}
                        Submitting...
                      </>
                    ) : isLast ? (
                      <>
                        {(form as any)?.settings?.submit_button_text ||
                          "Submit"}{" "}
                        <svg
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </>
                    ) : (
                      <>
                        OK{" "}
                        <svg
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                  <span className="tf-hint" style={{ color: tfText }}>
                    press <kbd>Enter</kbd> ↵
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Bottom-right navigation arrows */}
        <div className="tf-nav-widget">
          <button
            className="tf-nav-btn hover:opacity-90"
            onClick={goPrev}
            disabled={currentStep === 0}
            aria-label="Previous"
            style={{
              backgroundColor: tfPrimary,
              color: (form.theme as any)?.button_text_color || "#FFFFFF",
              borderColor: tfPrimary,
            }}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>
          <button
            className="tf-nav-btn hover:opacity-90"
            onClick={goNext}
            disabled={currentStep >= totalSteps - 1}
            aria-label="Next"
            style={{
              backgroundColor: tfPrimary,
              color: (form.theme as any)?.button_text_color || "#FFFFFF",
              borderColor: tfPrimary,
            }}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        {/* Bottom progress bar */}
        <div className="tf-progress-bar">
          <div
            className="tf-progress-fill"
            style={{ width: `${progressPercent}%`, backgroundColor: tfPrimary }}
          />
        </div>
      </div>
    );
  }

  // =============================================
  // STANDARD SINGLE-PAGE RENDERING
  // =============================================
  const getCanvasBgColor = () => {
    if (form.theme?.gallery_theme_id) return "transparent";
    return (
      form.theme?.background_color ||
      (() => {
        const cover = form.fields?.find(
          (f: any) => f.type === "cover_slide",
        ) as any;
        return cover?.settings?.coverBackgroundColor || "#f8fafc";
      })()
    );
  };

  return (
    <div
      className={`w-full min-h-screen flex justify-center py-6 px-3 sm:px-6 md:px-8 ${isPreview ? "bg-transparent items-start" : "bg-gray-50/50 items-center"}`}
      style={{ fontFamily: tfFont }}
    >
      {/* Inject custom CSS */}
      {isPreview && form.theme?.custom_css && (
        <style
          dangerouslySetInnerHTML={{ __html: String(form.theme.custom_css) }}
        />
      )}

      {/* Main Floating Canvas Slide */}
      <div
        className="w-full max-w-[850px] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200/50 overflow-hidden relative flex flex-col"
        style={{
          backgroundColor: getCanvasBgColor(),
          backgroundImage: (form as any)?.brandKit?.backgroundImageUrl
            ? `url(${(form as any).brandKit.backgroundImageUrl})`
            : undefined,
          backgroundSize: (form as any)?.brandKit?.backgroundImageUrl
            ? "cover"
            : undefined,
          backgroundPosition: (form as any)?.brandKit?.backgroundImageUrl
            ? "center"
            : undefined,
          minHeight: "calc(100vh - 160px)",
        }}
      >
        {/* Theme art SVG background */}
        <ThemeArtBackground
          themeId={form.theme?.gallery_theme_id}
          backgroundColor={undefined}
        />

        {/* Preview Banner */}
        {isPreview && (
          <div className="relative z-50 flex items-center justify-between px-4 py-2 bg-[#6C5CE7]/5 border-b border-[#6C5CE7]/10 backdrop-blur-sm">
            <Badge
              variant="outline"
              className="text-[#6C5CE7] border-[#6C5CE7]/20 bg-white/50 shadow-sm text-[10px] uppercase font-bold tracking-wider"
            >
              Preview Mode
            </Badge>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="h-7 px-3 text-xs text-gray-500 hover:text-gray-900 bg-white/50 border border-transparent shadow-sm hover:border-gray-200 transition-all rounded-lg"
                onClick={handleReset}
              >
                Reset
              </Button>
              {onClose && (
                <Button
                  variant="ghost"
                  className="h-7 px-3 text-xs text-gray-500 hover:text-gray-900 bg-white/50 border border-transparent shadow-sm hover:border-gray-200 transition-all rounded-lg"
                  onClick={onClose}
                >
                  Close
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Inner Content Constrainer */}
        <div className="flex-1 w-full max-w-[660px] mx-auto py-12 px-6 sm:px-8 flex flex-col relative z-20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header Section — only for logos/branding, NOT bare form title */}
            {(form.brandKit?.logo?.url ||
              (form.theme as any)?.logo?.url ||
              (form.theme as any)?.textLogo?.text ||
              form.theme?.header_image_url) && (
              <div
                className="relative w-full py-8 px-6 rounded-2xl overflow-hidden mb-8 shadow-sm border border-gray-100/50"
                style={{
                  backgroundColor: ((form as any)?.brandKit?.colors
                    ?.headerBackground?.hex ||
                    form.theme?.header_color ||
                    "rgba(255, 255, 255, 0.7)") as string,
                  backdropFilter: !form.theme?.header_color
                    ? "blur(12px)"
                    : "none",
                  backgroundImage: form.theme?.header_image_url
                    ? `url(${form.theme.header_image_url})`
                    : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              >
                {form.theme?.header_image_url && (
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundColor: form.theme?.header_color
                        ? `${form.theme.header_color}CC`
                        : "rgba(0,0,0,0.4)",
                    }}
                  />
                )}
                <div className="relative z-10 max-w-4xl mx-auto">
                  {(form.brandKit?.logo?.url ||
                    (form.theme as any)?.logo?.url ||
                    (form.theme as any)?.textLogo?.text) && (
                    <div className="w-full flex items-center justify-center mb-4">
                      {form.brandKit?.logo?.url ||
                      (form.theme as any)?.logo?.url ? (
                        <img
                          src={
                            (form.brandKit?.logo?.url ||
                              (form.theme as any)?.logo?.url) as string
                          }
                          alt={
                            (form.brandKit?.logo?.alt ||
                              (form.theme as any)?.logo?.alt ||
                              "Brand Logo") as string
                          }
                          className="object-contain"
                          style={{ maxHeight: "64px", maxWidth: "220px" }}
                        />
                      ) : (
                        <h1
                          className="font-bold"
                          style={{
                            color: form.theme?.header_image_url
                              ? "#FFFFFF"
                              : (form.brandKit as any)?.textLogo?.color ||
                                "#111827",
                            fontFamily:
                              (form.brandKit as any)?.textLogo?.fontFamily ||
                              "inherit",
                            fontWeight: ((form.brandKit as any)?.textLogo
                              ?.fontWeight || 700) as any,
                            fontSize: "1.25rem",
                          }}
                        >
                          {(form.brandKit as any)?.textLogo?.text ||
                            (form.theme as any)?.textLogo?.text}
                        </h1>
                      )}
                    </div>
                  )}
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="space-y-4 max-w-2xl">
                      {!coverField && form.title && (
                        <h1
                          className="text-3xl md:text-4xl font-bold"
                          style={{
                            color: form.theme?.header_image_url
                              ? "#FFFFFF"
                              : tfText,
                            fontFamily: tfFont,
                            textShadow: form.theme?.header_image_url
                              ? "0 2px 4px rgba(0,0,0,0.5)"
                              : "none",
                          }}
                        >
                          {form.title}
                        </h1>
                      )}
                      {!coverField && form.description && (
                        <p
                          className="text-lg md:text-xl"
                          style={{
                            color: form.theme?.header_image_url
                              ? "#F3F4F6"
                              : tfText,
                            opacity: 0.7,
                            fontFamily: tfFont,
                            textShadow: form.theme?.header_image_url
                              ? "0 2px 4px rgba(0,0,0,0.5)"
                              : "none",
                          }}
                        >
                          {form.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Inline Cover Slide for Classic Mode */}
            {!isProgressive && coverField && (
              <div className="mb-12 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1
                  className="text-4xl md:text-5xl font-extrabold tracking-tight"
                  style={{ color: tfText }}
                >
                  {coverField.settings?.coverTitle || form.title || "Welcome"}
                </h1>
                {coverField.settings?.coverSubtitle && (
                  <p
                    className="text-xl opacity-80 max-w-2xl mx-auto"
                    style={{ color: tfText }}
                  >
                    {coverField.settings.coverSubtitle}
                  </p>
                )}
              </div>
            )}

            {isGrid ? (
              /* ─── Grid Layout ─── */
              <div
                className="form-grid-layout"
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                  gap: "1.5rem",
                }}
              >
                {currentFields.map((field) => (
                  <div
                    key={field.id}
                    className="relative group py-4 transition-all duration-300"
                    style={{ gridColumn: `span ${getGridColSpan(field)}` }}
                  >
                    <h2
                      className="text-lg font-bold mb-3 leading-tight"
                      style={{ color: tfText }}
                    >
                      {field.label || "Untitled question"}
                      {field.required && (
                        <span className="text-red-500 ml-1.5">*</span>
                      )}
                    </h2>
                    {field.description && (
                      <p
                        className="text-sm opacity-80 mb-3 leading-relaxed"
                        style={{ color: tfText }}
                      >
                        {field.description}
                      </p>
                    )}
                    <div className="relative mt-1">
                      <FieldComponent
                        field={{ ...field, label: "", description: "" }}
                        value={formData[field.id]}
                        onChange={(value) => handleFieldChange(field.id, value)}
                        error={errors[field.id]}
                        isPreview={isPreview}
                        disabled={isSubmitting}
                        showLabel={false}
                      />
                    </div>
                    {errors[field.id] && (
                      <div className="mt-2 text-[13px] font-medium text-red-500 flex items-center gap-1.5">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="15" y1="9" x2="9" y2="15" />
                          <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                        {errors[field.id]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative space-y-8">
                {currentFields.map((field) => (
                  <div
                    key={field.id}
                    className="relative group py-6 transition-all duration-300"
                  >
                    <h2
                      className="text-2xl font-bold mb-4 leading-tight"
                      style={{ color: tfText }}
                    >
                      {field.label || "Untitled question"}
                      {field.required && (
                        <span className="text-red-500 ml-1.5">*</span>
                      )}
                    </h2>
                    {field.description && (
                      <p
                        className="text-lg opacity-80 mb-5 leading-relaxed"
                        style={{ color: tfText }}
                      >
                        {field.description}
                      </p>
                    )}
                    <div className="relative mt-2">
                      <FieldComponent
                        field={{ ...field, label: "", description: "" }}
                        value={formData[field.id]}
                        onChange={(value) => handleFieldChange(field.id, value)}
                        error={errors[field.id]}
                        isPreview={isPreview}
                        disabled={isSubmitting}
                        showLabel={false}
                      />
                    </div>
                    {errors[field.id] && (
                      <div className="absolute -bottom-6 left-6 text-[13px] font-medium text-red-500 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="15" y1="9" x2="9" y2="15" />
                          <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                        {errors[field.id]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-12 flex justify-start">
              <Button
                className="h-12 px-8 text-[15px] font-semibold text-white rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 focus:ring-4 focus:ring-offset-2"
                type="submit"
                style={{
                  backgroundColor: tfPrimary,
                  fontFamily: tfFont,
                  padding:
                    (form as any)?.brandKit?.formStyling?.button?.primary
                      ?.padding || undefined,
                  borderRadius:
                    (form as any)?.brandKit?.formStyling?.button?.primary
                      ?.borderRadius || undefined,
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2.5">
                    <span className="inline-block w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2.5">
                    {(form as any)?.settings?.submit_button_text || "Submit"}
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Payment Field Preview Component
function PreviewStripePaymentSection({ field }: { field: any }) {
  const amountCents = Number(field?.settings?.amount || 0);
  const currency = String(field?.settings?.currency || "usd");
  const allowCustom = Boolean(field?.settings?.allowCustomAmount);

  return (
    <div className="space-y-4 p-6 border rounded-lg bg-gray-50">
      <div className="text-center">
        <div className="text-blue-600 mb-3 flex justify-center">
          <CreditCardIcon className="w-12 h-12" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Payment Field Preview
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          This is a preview of the payment field. Configure Stripe settings in
          the form builder.
        </p>

        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm font-medium text-gray-700 mb-2">Amount:</div>
          <div className="text-2xl font-bold text-gray-900">
            {allowCustom ? (
              <span className="text-blue-600">Custom Amount</span>
            ) : (
              new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: currency.toUpperCase(),
              }).format(amountCents / 100)
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Currency: {currency.toUpperCase()}
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500 flex items-center justify-center gap-1.5">
          <LightBulbIcon className="w-4 h-4 text-yellow-500" /> Enable Stripe
          integration in form settings to collect real payments
        </div>
      </div>
    </div>
  );
}
