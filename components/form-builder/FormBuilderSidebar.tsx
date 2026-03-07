"use client";

import React, { useState } from "react";
import { useFormBuilder } from "@/components/providers/FormBuilderProvider";
import { FormField, FieldType } from "@/types";
import {
  MagnifyingGlassIcon,
  SparklesIcon,
  PlusIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  HashtagIcon,
  ListBulletIcon,
  CheckCircleIcon,
  CalendarIcon,
  PaperClipIcon,
  CurrencyDollarIcon,
  PhotoIcon,
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  UserIcon,
  ShieldCheckIcon,
  StarIcon,
  HeartIcon,
  EyeSlashIcon,
  TableCellsIcon,
  PencilIcon,
  LockClosedIcon,
  QuestionMarkCircleIcon,
  LinkIcon,
  MegaphoneIcon,
  ScaleIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

// ─── Category → field mapping ───
// Maps each sidebar category to its relevant field types
const CATEGORY_FIELDS: Record<
  string,
  Array<{
    type: FieldType;
    label: string;
    description: string;
    icon: React.ForwardRefExoticComponent<any>;
  }>
> = {
  text: [
    {
      type: "short_text",
      label: "Short Text",
      description: "Single-line text input",
      icon: DocumentTextIcon,
    },
    {
      type: "long_text",
      label: "Long Text",
      description: "Multi-line text area",
      icon: ChatBubbleLeftRightIcon,
    },
    {
      type: "email",
      label: "Email",
      description: "Email address",
      icon: EnvelopeIcon,
    },
    {
      type: "number",
      label: "Number",
      description: "Numeric input",
      icon: HashtagIcon,
    },
    {
      type: "phone",
      label: "Phone",
      description: "Phone number",
      icon: PhoneIcon,
    },
    {
      type: "name",
      label: "Full Name",
      description: "First & last name",
      icon: UserIcon,
    },
    {
      type: "contact_info",
      label: "Contact Info",
      description: "Name, email & phone",
      icon: UserGroupIcon,
    },
    {
      type: "password",
      label: "Password",
      description: "Secure password",
      icon: ShieldCheckIcon,
    },
  ],
  choice: [
    {
      type: "dropdown",
      label: "Dropdown",
      description: "Select from list",
      icon: ListBulletIcon,
    },
    {
      type: "multiple_choice",
      label: "Multiple Choice",
      description: "Radio options",
      icon: CheckCircleIcon,
    },
    {
      type: "checkbox",
      label: "Checkboxes",
      description: "Multi-select",
      icon: CheckCircleIcon,
    },
    {
      type: "yes_no",
      label: "Yes / No",
      description: "Boolean question",
      icon: QuestionMarkCircleIcon,
    },
    {
      type: "star_rating",
      label: "Star Rating",
      description: "5-star system",
      icon: StarIcon,
    },
    {
      type: "linear_scale",
      label: "Linear Scale",
      description: "1–10 scale",
      icon: HashtagIcon,
    },
    {
      type: "nps_score",
      label: "NPS Score",
      description: "Net Promoter 0–10",
      icon: HeartIcon,
    },
    {
      type: "likert_scale",
      label: "Likert Scale",
      description: "Agreement 1–5",
      icon: CheckCircleIcon,
    },
    {
      type: "ranking",
      label: "Ranking",
      description: "Drag to rank",
      icon: ListBulletIcon,
    },
    {
      type: "matrix_grid",
      label: "Matrix Grid",
      description: "Grid of options",
      icon: TableCellsIcon,
    },
  ],
  media: [
    {
      type: "file_upload",
      label: "File Upload",
      description: "Upload documents",
      icon: PaperClipIcon,
    },
    {
      type: "image_upload",
      label: "Image Upload",
      description: "Upload images",
      icon: PhotoIcon,
    },
    {
      type: "video_upload",
      label: "Video Upload",
      description: "Upload videos",
      icon: PhotoIcon,
    },
    {
      type: "signature_upload",
      label: "Signature",
      description: "Digital signature",
      icon: PencilIcon,
    },
  ],
  payment: [
    {
      type: "payment",
      label: "Payment",
      description: "Collect payments",
      icon: CurrencyDollarIcon,
    },
  ],
  advanced: [
    {
      type: "date",
      label: "Date",
      description: "Date picker",
      icon: CalendarIcon,
    },
    {
      type: "multiple_dates",
      label: "Multi-Date",
      description: "Pick many dates",
      icon: CalendarIcon,
    },
    {
      type: "time",
      label: "Time",
      description: "Time picker",
      icon: ClockIcon,
    },
    {
      type: "time_range",
      label: "Time Range",
      description: "Start & end time",
      icon: ClockIcon,
    },
    {
      type: "location",
      label: "Location",
      description: "Address input",
      icon: MapPinIcon,
    },
    {
      type: "address",
      label: "Address",
      description: "Full address",
      icon: MapPinIcon,
    },
    {
      type: "captcha",
      label: "CAPTCHA",
      description: "Security check",
      icon: LockClosedIcon,
    },
    {
      type: "url_redirect",
      label: "URL Redirect",
      description: "Redirect link",
      icon: LinkIcon,
    },
    {
      type: "legal",
      label: "Legal",
      description: "Terms acceptance",
      icon: ScaleIcon,
    },
  ],
  structure: [
    {
      type: "statement",
      label: "Statement",
      description: "Text-only slide",
      icon: MegaphoneIcon,
    },
  ],
};

// Build the "all" list by combining every category
const ALL_FIELDS = Object.values(CATEGORY_FIELDS).flat();

interface FormBuilderSidebarProps {
  /** Which sidebar category icon is active (text, choice, media, etc.) — null or 'all' shows everything */
  activeCategory?: string | null;
}

export function FormBuilderSidebar({
  activeCategory,
}: FormBuilderSidebarProps) {
  const { state, addField, selectField } = useFormBuilder();
  const [searchQuery, setSearchQuery] = useState("");

  const handleAddField = (fieldType: FieldType, fieldLabel: string) => {
    const newField: FormField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      type: fieldType,
      label: "",
      required: false,
      placeholder: "",
      options:
        fieldType === "dropdown" ||
        fieldType === "multiple_choice" ||
        fieldType === "checkbox"
          ? ["Option 1", "Option 2", "Option 3"]
          : fieldType === "yes_no"
            ? ["Yes", "No"]
            : fieldType === "star_rating"
              ? ["1", "2", "3", "4", "5"]
              : fieldType === "linear_scale"
                ? ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
                : fieldType === "nps_score"
                  ? ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
                  : fieldType === "likert_scale"
                    ? [
                        "Strongly Disagree",
                        "Disagree",
                        "Neutral",
                        "Agree",
                        "Strongly Agree",
                      ]
                    : fieldType === "ranking"
                      ? ["Option 1", "Option 2", "Option 3", "Option 4"]
                      : fieldType === "multiple_dates"
                        ? ["Date 1", "Date 2", "Date 3"]
                        : fieldType === "time_range"
                          ? ["Start Time", "End Time"]
                          : fieldType === "matrix_grid"
                            ? ["Row 1", "Row 2", "Row 3"]
                            : fieldType === "captcha"
                              ? ["Verify", "Refresh"]
                              : undefined,
      validation: [],
      settings: {},
    };
    addField(newField);
  };

  // ─── Determine which fields to show ───
  const resolvedCategory = activeCategory || "all";
  const baseFields =
    resolvedCategory === "all"
      ? ALL_FIELDS
      : CATEGORY_FIELDS[resolvedCategory] || ALL_FIELDS;

  // Apply search filter
  const displayFields = searchQuery.trim()
    ? baseFields.filter(
        (f) =>
          f.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : baseFields;

  return (
    <div className="flex flex-col h-full">
      {/* Search bar — compact, no header */}
      <div className="px-3 pt-3 pb-2">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search fields..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 focus:border-[#6C5CE7] transition-colors"
          />
        </div>
      </div>

      {/* 2×2 Glassmorphism Field Tile Grid */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 sidebar-scroll">
        <div className="grid grid-cols-3 gap-1.5">
          {displayFields.map((field) => {
            const IconComponent = field.icon;
            return (
              <button
                key={field.type}
                type="button"
                onClick={() => handleAddField(field.type, field.label)}
                className="group relative flex flex-col items-center gap-1 p-2.5 rounded-xl border border-gray-100 bg-white/60 backdrop-blur-sm hover:bg-[#6C5CE7]/5 hover:border-[#6C5CE7]/25 hover:shadow-md hover:shadow-[#6C5CE7]/5 transition-all duration-200 cursor-pointer text-center"
              >
                {/* Icon circle */}
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6C5CE7]/10 to-[#6C5CE7]/5 flex items-center justify-center group-hover:from-[#6C5CE7]/18 group-hover:to-[#6C5CE7]/10 group-hover:scale-110 transition-all duration-200">
                  <IconComponent
                    className="w-4 h-4 text-[#6C5CE7]"
                    strokeWidth={2}
                  />
                </div>
                {/* Label */}
                <span className="text-[11px] font-semibold text-gray-600 group-hover:text-[#6C5CE7] transition-colors leading-tight">
                  {field.label}
                </span>
                {/* Hover plus badge */}
                <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#6C5CE7] flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-200">
                  <PlusIcon className="w-2 h-2 text-white" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Empty state */}
        {displayFields.length === 0 && (
          <div className="text-center py-10">
            <MagnifyingGlassIcon className="h-7 w-7 mx-auto text-gray-300 mb-2" />
            <p className="text-xs text-gray-500">
              No fields match "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-2 text-xs text-[#6C5CE7] hover:underline"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
