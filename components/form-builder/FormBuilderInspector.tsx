"use client";

import React, { useState } from "react";
import { useFormBuilder } from "@/components/providers/FormBuilderProvider";
import { FormField } from "@/types";
import { TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import {
  StarIcon,
  HeartIcon,
  HandThumbUpIcon,
} from "@heroicons/react/24/solid";
import { ConditionalLogicEditor } from "./ConditionalLogicEditor";

interface FormBuilderInspectorProps {
  isThemeMode?: boolean;
}

// ─── Glassmorphic Toggle ───
function GlassToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/40 transition-all duration-200 group">
      <div className="flex-1 min-w-0 pr-2">
        <span className="text-[12px] font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
          {label}
        </span>
        {description && (
          <p className="text-[10px] text-gray-400 leading-tight">
            {description}
          </p>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-[22px] w-[42px] flex-shrink-0 items-center rounded-full transition-all duration-300 shadow-inner ${
          checked
            ? "bg-gradient-to-r from-[#6C5CE7] to-[#a78bfa] shadow-[#6C5CE7]/20"
            : "bg-gray-200/80"
        }`}
      >
        <span
          className={`inline-block h-[16px] w-[16px] rounded-full bg-white shadow-md transition-all duration-300 ${
            checked ? "translate-x-[22px] scale-105" : "translate-x-[3px]"
          }`}
        />
      </button>
    </div>
  );
}

// ─── Glassmorphic Input ───
function GlassInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  ...rest
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  [k: string]: any;
}) {
  return (
    <div>
      <label className="block text-[10px] font-medium text-gray-500/80 mb-1 uppercase tracking-wider">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-[12px] px-3 py-1.5 bg-white/60 backdrop-blur-sm border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 focus:border-[#6C5CE7]/40 focus:bg-white/80 transition-all duration-200 shadow-sm placeholder:text-gray-300"
        placeholder={placeholder}
        {...rest}
      />
    </div>
  );
}

// ─── Glassmorphic Textarea ───
function GlassTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-[10px] font-medium text-gray-500/80 mb-1 uppercase tracking-wider">
        {label}
      </label>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-[12px] px-3 py-1.5 bg-white/60 backdrop-blur-sm border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 focus:border-[#6C5CE7]/40 focus:bg-white/80 transition-all duration-200 shadow-sm resize-none placeholder:text-gray-300"
        placeholder={placeholder}
      />
    </div>
  );
}

// ─── Glassmorphic Select ───
function GlassSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-[10px] font-medium text-gray-500/80 mb-1 uppercase tracking-wider">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-[12px] px-3 py-1.5 bg-white/60 backdrop-blur-sm border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 focus:border-[#6C5CE7]/40 focus:bg-white/80 transition-all duration-200 shadow-sm appearance-none cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── Bento Card Wrapper ───
function BentoCard({
  children,
  className = "",
  glow = false,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={`relative rounded-xl bg-white/50 backdrop-blur-md border border-white/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-2.5 transition-all duration-300 hover:shadow-[0_4px_20px_rgba(108,92,231,0.06)] hover:border-[#6C5CE7]/10 ${glow ? "ring-1 ring-[#6C5CE7]/10" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Bento Section Title ───
function SectionTitle({
  children,
  color = "#6C5CE7",
}: {
  children: React.ReactNode;
  color?: string;
  icon?: string;
}) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <div
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      <h3 className="text-[10px] font-semibold text-gray-500/70 uppercase tracking-widest">
        {children}
      </h3>
    </div>
  );
}

// ─── Color Picker Bento ───
function ColorPick({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[12px] text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-7 h-7 p-0 rounded-lg border-2 border-white/80 shadow-sm cursor-pointer"
        />
        <span className="text-[10px] text-gray-400 font-mono w-16">
          {value.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════
export function FormBuilderInspector({
  isThemeMode = false,
}: FormBuilderInspectorProps) {
  const { state, updateField, updateForm } = useFormBuilder();
  const selectedField = state.selected_field;

  // ─── No field selected ───
  if (!selectedField) {
    return (
      <div
        className="h-full border-l border-gray-200/60 flex flex-col"
        style={{
          background:
            "linear-gradient(165deg, #f8f7ff 0%, #f1f0fb 40%, #f5f3ff 100%)",
        }}
      >
        <div className="px-4 pt-3 pb-2">
          <h2 className="text-[14px] font-semibold text-gray-800">
            Properties
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-11 h-11 mx-auto mb-3 rounded-xl bg-white/70 backdrop-blur border border-white/80 shadow-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-[#6C5CE7]/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </div>
            <p className="text-[13px] font-medium text-gray-500">
              No question selected
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              Click a question to edit
            </p>
          </div>
        </div>
      </div>
    );
  }

  const update = (u: Partial<FormField>) => updateField(selectedField.id, u);
  const updateSettings = (s: Record<string, any>) =>
    update({ settings: { ...selectedField.settings, ...s } });
  const fieldType = selectedField.type as string;

  // Type label + colored icon
  const typeInfo = (() => {
    const i = (color: string, path: string) => (
      <svg
        className="w-3.5 h-3.5"
        viewBox="0 0 20 20"
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={path} />
      </svg>
    );
    const map: Record<string, { label: string; icon: React.ReactNode }> = {
      short_text: { label: "Short Text", icon: i("#6C5CE7", "M4 7h12M4 10h8") },
      long_text: {
        label: "Long Text",
        icon: i("#6C5CE7", "M4 6h12M4 9h12M4 12h8"),
      },
      email: { label: "Email", icon: i("#E84393", "M3 6l7 5 7-5M3 6v9h14V6") },
      phone: { label: "Phone", icon: i("#00B894", "M6 3h8v14H6zM9 15h2") },
      number: {
        label: "Number",
        icon: i("#FDCB6E", "M7 4v12M4 8h6M11 4l4 12M12 10h4"),
      },
      url: {
        label: "Website",
        icon: i("#0984E3", "M8 12l4-4M8 8h0M12 12h0M6 16A6 6 0 1 1 16 10"),
      },
      date: {
        label: "Date",
        icon: i("#E17055", "M4 4h12v12H4zM4 8h12M8 4v4M12 4v4"),
      },
      time: {
        label: "Time",
        icon: i("#E17055", "M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM10 6v4l3 2"),
      },
      multiple_choice: {
        label: "Multiple Choice",
        icon: i("#6C5CE7", "M4 5h3v3H4zM4 9h3v3H4zM9 6h7M9 10h7"),
      },
      radio: {
        label: "Multiple Choice",
        icon: i("#6C5CE7", "M4 5h3v3H4zM4 9h3v3H4zM9 6h7M9 10h7"),
      },
      checkbox: {
        label: "Checkboxes",
        icon: i("#00B894", "M4 5h3v3H4zM4 9h3v3H4zM5 6.5l1 1 2-2M9 6h7M9 10h7"),
      },
      dropdown: {
        label: "Dropdown",
        icon: i("#0984E3", "M4 6h12M4 10h12M4 14h12M14 6l-4 4 4 4"),
      },
      yes_no: { label: "Yes / No", icon: i("#00CEC9", "M5 10l3 3 7-7") },
      rating: {
        label: "Rating",
        icon: i(
          "#FDCB6E",
          "M10 3l2.5 5 5.5.8-4 3.9 1 5.5L10 15.5 4.5 18.2l1-5.5L1.5 8.8l5.5-.8z",
        ),
      },
      star_rating: {
        label: "Rating",
        icon: i(
          "#FDCB6E",
          "M10 3l2.5 5 5.5.8-4 3.9 1 5.5L10 15.5 4.5 18.2l1-5.5L1.5 8.8l5.5-.8z",
        ),
      },
      nps: {
        label: "NPS Score",
        icon: i("#A29BFE", "M3 14V6l4 8V6l4 8V6l4 8V6"),
      },
      nps_score: {
        label: "NPS Score",
        icon: i("#A29BFE", "M3 14V6l4 8V6l4 8V6l4 8V6"),
      },
      linear_scale: {
        label: "Opinion Scale",
        icon: i("#6C5CE7", "M3 10h14M5 8v4M10 7v6M15 8v4"),
      },
      likert_scale: {
        label: "Likert Scale",
        icon: i("#A29BFE", "M3 10h14M5 8v4M10 7v6M15 8v4"),
      },
      ranking: {
        label: "Ranking",
        icon: i("#FDCB6E", "M10 4l-6 12h12zM10 8v4"),
      },
      file_upload: {
        label: "File Upload",
        icon: i("#636E72", "M10 3v10M6 9l4-4 4 4M4 15h12"),
      },
      image_upload: {
        label: "Image Upload",
        icon: i("#00CEC9", "M3 5h14v10H3zM3 12l4-3 3 2 4-4"),
      },
      video_upload: {
        label: "Video Upload",
        icon: i("#E84393", "M3 5h10v10H3zM13 8l4-2v8l-4-2"),
      },
      signature_upload: {
        label: "Signature",
        icon: i("#6C5CE7", "M4 16c2-2 4-6 6-6s4 4 6 2"),
      },
      payment: { label: "Payment", icon: i("#00B894", "M3 6h14v9H3zM3 9h14") },
      address: {
        label: "Address",
        icon: i(
          "#E17055",
          "M10 17S4 12 4 8a6 6 0 1 1 12 0c0 4-6 9-6 9zM10 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
        ),
      },
      name: {
        label: "Name",
        icon: i(
          "#0984E3",
          "M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM4 17a6 6 0 0 1 12 0",
        ),
      },
      password: {
        label: "Password",
        icon: i("#636E72", "M6 9V7a4 4 0 1 1 8 0v2M4 9h12v8H4z"),
      },
      matrix_grid: {
        label: "Matrix",
        icon: i(
          "#A29BFE",
          "M3 3h5v5H3zM12 3h5v5h-5zM3 12h5v5H3zM12 12h5v5h-5z",
        ),
      },
      cover_slide: {
        label: "Welcome Screen",
        icon: i(
          "#6C5CE7",
          "M10 3v2M6 5l-1-1M14 5l1-1M4 10a6 6 0 0 0 12 0M7 13l-1 4M13 13l1 4",
        ),
      },
      end_page: {
        label: "Ending",
        icon: i(
          "#00B894",
          "M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM7 10l2 2 4-4",
        ),
      },
      url_redirect: {
        label: "Redirect",
        icon: i("#0984E3", "M7 17l6-7-6-7M13 10H3"),
      },
      captcha: {
        label: "CAPTCHA",
        icon: i("#636E72", "M5 5h10v10H5zM8 9l1.5 1.5L13 7"),
      },
      location: {
        label: "Location",
        icon: i("#E17055", "M10 17S4 12 4 8a6 6 0 1 1 12 0c0 4-6 9-6 9z"),
      },
      multiple_dates: {
        label: "Date Range",
        icon: i("#E17055", "M4 4h12v12H4zM4 8h12M8 4v4M12 4v4M7 11h6"),
      },
      time_range: {
        label: "Time Range",
        icon: i(
          "#E17055",
          "M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM10 6v4l3 2M6 17h8",
        ),
      },
      statement: {
        label: "Statement",
        icon: i("#6C5CE7", "M4 5h12M4 9h8M4 13h10"),
      },
      legal: {
        label: "Legal",
        icon: i("#636E72", "M10 3L3 7v10l7 4 7-4V7zM10 7v6M7 10h6"),
      },
      contact_info: {
        label: "Contact Info",
        icon: i(
          "#0984E3",
          "M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM4 17a6 6 0 0 1 12 0M16 7h3M16 10h3",
        ),
      },
    };
    return (
      map[fieldType] || {
        label: fieldType.replace(/_/g, " "),
        icon: i("#6C5CE7", "M4 6h12M4 10h8"),
      }
    );
  })();

  const isWelcome = fieldType === "cover_slide";
  const isEnding = fieldType === "end_page" || fieldType === "url_redirect";
  const isChoiceType = [
    "multiple_choice",
    "radio",
    "checkbox",
    "dropdown",
  ].includes(fieldType);
  const isRating = [
    "star_rating",
    "rating",
    "nps",
    "nps_score",
    "linear_scale",
    "likert_scale",
  ].includes(fieldType);

  return (
    <div
      className="h-full border-l border-gray-200/40 flex flex-col"
      style={{
        background:
          "linear-gradient(165deg, #f8f7ff 0%, #f1f0fb 40%, #f5f3ff 100%)",
      }}
    >
      {/* ─── Body ─── */}
      <div
        className="flex-1 overflow-y-auto sidebar-scroll px-3 pb-4"
        style={{ maxHeight: "calc(100vh - 100px)" }}
      >
        <div className="space-y-2">
          {/* ═══ WELCOME SCREEN ═══ */}
          {isWelcome && (
            <BentoCard>
              <SectionTitle color="#6C5CE7">Welcome Screen</SectionTitle>
              <div className="space-y-3">
                <GlassInput
                  label="Heading"
                  value={(selectedField.settings as any)?.coverTitle || ""}
                  onChange={(v) => updateSettings({ coverTitle: v })}
                  placeholder="Welcome"
                />
                <GlassTextarea
                  label="Description"
                  value={(selectedField.settings as any)?.coverSubtitle || ""}
                  onChange={(v) => updateSettings({ coverSubtitle: v })}
                  placeholder="Tell people what this form is about"
                />
                <GlassInput
                  label="Button Label"
                  value={
                    (selectedField.settings as any)?.coverCtaText || "Start"
                  }
                  onChange={(v) => updateSettings({ coverCtaText: v })}
                  placeholder="Start"
                />
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <ColorPick
                    label="Background"
                    value={
                      (selectedField.settings as any)?.coverBackgroundColor ||
                      "#0f172a"
                    }
                    onChange={(v) =>
                      updateSettings({ coverBackgroundColor: v })
                    }
                  />
                  <ColorPick
                    label="Button"
                    value={
                      (selectedField.settings as any)?.coverButtonColor ||
                      "#111827"
                    }
                    onChange={(v) => updateSettings({ coverButtonColor: v })}
                  />
                </div>
                <GlassInput
                  label="Background Image URL"
                  value={
                    (selectedField.settings as any)?.coverBackgroundImage || ""
                  }
                  onChange={(v) => updateSettings({ coverBackgroundImage: v })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </BentoCard>
          )}

          {/* ═══ ENDING SCREEN ═══ */}
          {isEnding && (
            <BentoCard>
              <SectionTitle color="#00B894">Ending</SectionTitle>
              <div className="space-y-3">
                {fieldType === "url_redirect" ? (
                  <GlassInput
                    label="Redirect URL"
                    value={(selectedField.settings as any)?.redirectUrl || ""}
                    onChange={(v) => updateSettings({ redirectUrl: v })}
                    placeholder="https://example.com"
                    type="url"
                  />
                ) : (
                  <>
                    <GlassInput
                      label="Heading"
                      value={selectedField.label || ""}
                      onChange={(v) => update({ label: v })}
                      placeholder="Thanks for your time!"
                    />
                    <GlassTextarea
                      label="Description"
                      value={selectedField.description || ""}
                      onChange={(v) => update({ description: v })}
                      placeholder="Add a closing message"
                    />
                    <GlassToggle
                      label="Show button"
                      checked={
                        (selectedField.settings as any)?.showButton !== false
                      }
                      onChange={(v) => updateSettings({ showButton: v })}
                    />
                    <GlassToggle
                      label="Share icons"
                      description="Show social sharing buttons"
                      checked={
                        (selectedField.settings as any)?.shareIcons === true
                      }
                      onChange={(v) => updateSettings({ shareIcons: v })}
                    />
                  </>
                )}
              </div>
            </BentoCard>
          )}

          {/* ═══ REGULAR QUESTION SETTINGS ═══ */}
          {!isWelcome && !isEnding && (
            <>
              {/* ─── Toggles Card ─── */}
              <BentoCard>
                <SectionTitle color="#636E72">Settings</SectionTitle>
                <div className="space-y-0.5">
                  <GlassToggle
                    label="Required"
                    checked={selectedField.required || false}
                    onChange={(v) => update({ required: v })}
                  />
                  <GlassToggle
                    label="Description"
                    description="Add a description below the question"
                    checked={
                      (selectedField.settings as any)?.showDescription === true
                    }
                    onChange={(v) => updateSettings({ showDescription: v })}
                  />
                  {(selectedField.settings as any)?.showDescription && (
                    <div className="pt-1 pb-1 px-1">
                      <GlassTextarea
                        label=""
                        value={selectedField.description || ""}
                        onChange={(v) => update({ description: v })}
                        placeholder="Add a description..."
                        rows={2}
                      />
                    </div>
                  )}
                  <GlassToggle
                    label="Image or media"
                    description="Add an image, video, or icon"
                    checked={(selectedField.settings as any)?.hasMedia === true}
                    onChange={(v) => updateSettings({ hasMedia: v })}
                  />
                </div>
              </BentoCard>

              {/* ─── Choice-type Settings ─── */}
              {isChoiceType && (
                <BentoCard glow>
                  <SectionTitle color="#6C5CE7">Choices</SectionTitle>
                  <div className="space-y-2">
                    {/* Choice list */}
                    <div className="space-y-1.5">
                      {selectedField.options?.map((option, i) => (
                        <div key={i} className="flex items-center gap-2 group">
                          <span className="w-6 h-6 flex items-center justify-center text-[10px] font-bold text-[#6C5CE7]/60 bg-[#6C5CE7]/5 rounded-lg border border-[#6C5CE7]/10 flex-shrink-0">
                            {String.fromCharCode(65 + i)}
                          </span>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOpts = [
                                ...(selectedField.options || []),
                              ];
                              newOpts[i] = e.target.value;
                              update({ options: newOpts });
                            }}
                            className="flex-1 text-[12px] px-3 py-2 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/15 focus:border-[#6C5CE7]/30 transition-all shadow-sm"
                            placeholder={`Choice ${i + 1}`}
                          />
                          <button
                            onClick={() =>
                              update({
                                options: selectedField.options?.filter(
                                  (_, j) => j !== i,
                                ),
                              })
                            }
                            className="p-1 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() =>
                        update({
                          options: [
                            ...(selectedField.options || []),
                            `Choice ${(selectedField.options?.length || 0) + 1}`,
                          ],
                        })
                      }
                      className="flex items-center gap-1.5 text-[11px] text-[#6C5CE7] hover:text-[#5A4BD1] font-semibold py-1.5 px-3 rounded-xl hover:bg-[#6C5CE7]/5 transition-all"
                    >
                      <PlusIcon className="w-3.5 h-3.5" /> Add choice
                    </button>

                    <div className="pt-2 border-t border-gray-100/60">
                      {(fieldType === "multiple_choice" ||
                        fieldType === "checkbox") && (
                        <GlassToggle
                          label="Multiple selection"
                          checked={
                            (selectedField.settings as any)?.allowMultiple !==
                            false
                          }
                          onChange={(v) => updateSettings({ allowMultiple: v })}
                        />
                      )}
                      <GlassToggle
                        label='"Other" option'
                        checked={
                          (selectedField.settings as any)?.allowOther === true
                        }
                        onChange={(v) => updateSettings({ allowOther: v })}
                      />
                      <GlassToggle
                        label="Randomize"
                        description="Shuffle order each time"
                        checked={
                          (selectedField.settings as any)?.randomize === true
                        }
                        onChange={(v) => updateSettings({ randomize: v })}
                      />
                    </div>
                  </div>
                </BentoCard>
              )}

              {/* ─── Rating Settings ─── */}
              {isRating && (
                <BentoCard glow>
                  <SectionTitle color="#FDCB6E">Rating</SectionTitle>
                  <div className="space-y-3">
                    {![
                      "nps",
                      "nps_score",
                      "linear_scale",
                      "likert_scale",
                    ].includes(fieldType) && (
                      <>
                        <GlassInput
                          label="Steps"
                          value={
                            (selectedField.settings as any)?.maxRating || 5
                          }
                          onChange={(v) =>
                            updateSettings({
                              maxRating: Math.max(
                                1,
                                Math.min(20, Number(v) || 5),
                              ),
                            })
                          }
                          type="number"
                        />
                        <div>
                          <label className="block text-[11px] font-medium text-gray-500/80 mb-2 uppercase tracking-wider">
                            Shape
                          </label>
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              {
                                id: "stars",
                                icon: (
                                  <StarIcon className="w-5 h-5 text-yellow-400" />
                                ),
                              },
                              {
                                id: "hearts",
                                icon: (
                                  <HeartIcon className="w-5 h-5 text-red-500" />
                                ),
                              },
                              {
                                id: "thumbs",
                                icon: (
                                  <HandThumbUpIcon className="w-5 h-5 text-blue-500" />
                                ),
                              },
                              {
                                id: "circles",
                                icon: (
                                  <div className="w-4 h-4 rounded-full bg-gray-800" />
                                ),
                              },
                            ].map((shape) => (
                              <button
                                key={shape.id}
                                onClick={() =>
                                  updateSettings({ ratingType: shape.id })
                                }
                                className={`py-2.5 text-base rounded-xl border-2 transition-all duration-300 ${
                                  ((selectedField.settings as any)
                                    ?.ratingType || "stars") === shape.id
                                    ? "border-[#6C5CE7] bg-[#6C5CE7]/5 shadow-md shadow-[#6C5CE7]/10 scale-105"
                                    : "border-white/60 bg-white/40 hover:border-gray-200 hover:bg-white/60"
                                }`}
                              >
                                {shape.icon}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                    {["nps", "nps_score"].includes(fieldType) && (
                      <GlassSelect
                        label="Style"
                        value={
                          (selectedField.settings as any)?.npsStyle || "buttons"
                        }
                        onChange={(v) => updateSettings({ npsStyle: v })}
                        options={[
                          { value: "buttons", label: "Buttons" },
                          { value: "slider", label: "Slider" },
                        ]}
                      />
                    )}
                    {["linear_scale", "likert_scale"].includes(fieldType) && (
                      <div className="grid grid-cols-2 gap-3">
                        <GlassSelect
                          label="Start at"
                          value={String(
                            (selectedField.settings as any)?.scaleStart || 0,
                          )}
                          onChange={(v) =>
                            updateSettings({ scaleStart: Number(v) })
                          }
                          options={[
                            { value: "0", label: "0" },
                            { value: "1", label: "1" },
                          ]}
                        />
                        <GlassSelect
                          label="End at"
                          value={String(
                            (selectedField.settings as any)?.scaleEnd || 10,
                          )}
                          onChange={(v) =>
                            updateSettings({ scaleEnd: Number(v) })
                          }
                          options={[
                            { value: "5", label: "5" },
                            { value: "7", label: "7" },
                            { value: "10", label: "10" },
                          ]}
                        />
                      </div>
                    )}
                  </div>
                </BentoCard>
              )}

              {/* ─── Yes/No ─── */}
              {fieldType === "yes_no" && (
                <BentoCard>
                  <SectionTitle color="#00CEC9">Appearance</SectionTitle>
                  <GlassSelect
                    label="Style"
                    value={
                      (selectedField.settings as any)?.yesNoStyle || "buttons"
                    }
                    onChange={(v) => updateSettings({ yesNoStyle: v })}
                    options={[
                      { value: "buttons", label: "Buttons" },
                      { value: "cards", label: "Cards" },
                      { value: "chips", label: "Chips" },
                      { value: "toggle", label: "Toggle" },
                      { value: "thumbs", label: "Thumbs" },
                    ]}
                  />
                </BentoCard>
              )}

              {/* ─── Matrix ─── */}
              {fieldType === "matrix_grid" && (
                <BentoCard glow>
                  <SectionTitle color="#A29BFE">Matrix</SectionTitle>
                  <div className="space-y-3">
                    <GlassTextarea
                      label="Rows"
                      value={(
                        (selectedField.settings as any)?.matrixRows || []
                      ).join("\n")}
                      onChange={(v) =>
                        updateSettings({
                          matrixRows: v.split(/\r?\n/).filter(Boolean),
                        })
                      }
                      placeholder={"Row 1\nRow 2\nRow 3"}
                    />
                    <GlassTextarea
                      label="Columns"
                      value={(
                        (selectedField.settings as any)?.matrixColumns || []
                      ).join("\n")}
                      onChange={(v) =>
                        updateSettings({
                          matrixColumns: v.split(/\r?\n/).filter(Boolean),
                        })
                      }
                      placeholder={"Col 1\nCol 2\nCol 3"}
                    />
                  </div>
                </BentoCard>
              )}

              {/* ─── Number Validation ─── */}
              {fieldType === "number" && (
                <BentoCard>
                  <SectionTitle color="#FDCB6E">Validation</SectionTitle>
                  <div className="grid grid-cols-2 gap-3">
                    <GlassInput
                      label="Min"
                      value={(selectedField.settings as any)?.minLength || ""}
                      onChange={(v) =>
                        updateSettings({ minLength: v ? Number(v) : undefined })
                      }
                      placeholder="None"
                      type="number"
                    />
                    <GlassInput
                      label="Max"
                      value={(selectedField.settings as any)?.maxLength || ""}
                      onChange={(v) =>
                        updateSettings({ maxLength: v ? Number(v) : undefined })
                      }
                      placeholder="None"
                      type="number"
                    />
                  </div>
                </BentoCard>
              )}

              {/* ─── Text Validation ─── */}
              {["short_text", "long_text"].includes(fieldType) && (
                <BentoCard>
                  <SectionTitle color="#6C5CE7">Validation</SectionTitle>
                  <GlassInput
                    label="Max characters"
                    value={(selectedField.settings as any)?.maxLength || ""}
                    onChange={(v) =>
                      updateSettings({ maxLength: v ? Number(v) : undefined })
                    }
                    placeholder="Unlimited"
                    type="number"
                  />
                </BentoCard>
              )}

              {/* ─── Email Validation ─── */}
              {fieldType === "email" && (
                <BentoCard>
                  <SectionTitle color="#E84393">Validation</SectionTitle>
                  <GlassSelect
                    label="Level"
                    value={
                      (selectedField.settings as any)?.emailType ?? "standard"
                    }
                    onChange={(v) => updateSettings({ emailType: v })}
                    options={[
                      { value: "standard", label: "Standard" },
                      { value: "strict", label: "Strict" },
                    ]}
                  />
                </BentoCard>
              )}

              {/* ─── Payment ─── */}
              {fieldType === "payment" && (
                <BentoCard glow>
                  <SectionTitle color="#00B894">Payment</SectionTitle>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <GlassInput
                        label="Amount"
                        value={(selectedField.settings as any)?.amount || 0}
                        onChange={(v) => updateSettings({ amount: Number(v) })}
                        type="number"
                      />
                      <GlassSelect
                        label="Currency"
                        value={
                          (selectedField.settings as any)?.currency || "usd"
                        }
                        onChange={(v) => updateSettings({ currency: v })}
                        options={["usd", "eur", "gbp", "cad", "aud"].map(
                          (c) => ({ value: c, label: c.toUpperCase() }),
                        )}
                      />
                    </div>
                    <GlassToggle
                      label="Custom amount"
                      description="Let respondents enter any amount"
                      checked={
                        (selectedField.settings as any)?.allowCustomAmount ===
                        true
                      }
                      onChange={(v) => updateSettings({ allowCustomAmount: v })}
                    />
                    <GlassToggle
                      label="Recurring"
                      description="Charge on a schedule via Stripe"
                      checked={
                        (selectedField.settings as any)?.recurring === true
                      }
                      onChange={(v) => updateSettings({ recurring: v })}
                    />
                    <GlassInput
                      label="Description"
                      value={(selectedField as any)?.payment_description || ""}
                      onChange={(v) =>
                        update({ payment_description: v } as any)
                      }
                      placeholder="What is this payment for?"
                    />
                  </div>
                </BentoCard>
              )}

              {/* ─── File Upload ─── */}
              {["file_upload", "image_upload", "video_upload"].includes(
                fieldType,
              ) && (
                <BentoCard>
                  <SectionTitle color="#636E72">Upload</SectionTitle>
                  <GlassSelect
                    label="Max file size"
                    value={String(
                      (selectedField.settings as any)?.maxFileSizeMB || 10,
                    )}
                    onChange={(v) =>
                      updateSettings({ maxFileSizeMB: Number(v) })
                    }
                    options={[
                      { value: "2", label: "2 MB" },
                      { value: "5", label: "5 MB" },
                      { value: "10", label: "10 MB" },
                      { value: "25", label: "25 MB" },
                      { value: "50", label: "50 MB" },
                    ]}
                  />
                </BentoCard>
              )}

              {/* ─── Logic ─── */}
              <LogicCard field={selectedField} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Logic Bento Card ───
function LogicCard({ field }: { field: FormField }) {
  const { state, updateField } = useFormBuilder();
  const [open, setOpen] = useState(false);
  return (
    <BentoCard>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left gap-2 min-w-0"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#A29BFE] flex-shrink-0" />
          <h3 className="text-[10px] font-semibold text-gray-500/70 uppercase tracking-widest truncate">
            Conditional Logic
          </h3>
        </div>
        <svg
          className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <div className="mt-3 pt-3 border-t border-gray-100/60">
          <ConditionalLogicEditor
            field={field}
            allFields={state.current_form?.fields || []}
            onUpdate={(conditional: any) =>
              updateField(field.id, { conditional })
            }
            onRemove={() => updateField(field.id, { conditional: undefined })}
          />
        </div>
      )}
    </BentoCard>
  );
}
