"use client";

import React, { useState, useMemo } from "react";
import { useFormBuilder } from "@/components/providers/FormBuilderProvider";
import { FormField } from "@/types";
import {
  PlusIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  Bars3Icon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { FieldComponent } from "./FieldComponents";
import { ThemeArtBackground } from "./ThemeArtBackground";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface FormBuilderCanvasProps {
  isThemeMode?: boolean;
}

// ── Sortable Field Wrapper (Typeform @dnd-kit pattern) ──
function SortableFieldItem({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: "relative" as const,
    zIndex: isDragging ? 50 : ("auto" as any),
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {/* Drag handle — only the grip icon triggers drag */}
      <div
        {...listeners}
        className="absolute left-0 top-1/2 -translate-y-1/2 -ml-5 w-4 h-8 flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover/row:opacity-40 hover:!opacity-100 transition-opacity z-20"
      >
        <Bars3Icon className="w-3.5 h-3.5 text-gray-400" />
      </div>
      {children}
    </div>
  );
}

export function FormBuilderCanvas({
  isThemeMode = false,
}: FormBuilderCanvasProps) {
  const {
    state,
    selectField,
    updateForm,
    deleteField,
    reorderFields,
    addField,
    setPreviewMode,
  } = useFormBuilder();
  const [activeId, setActiveId] = useState<string | null>(null);

  // @dnd-kit sensors (Typeform uses PointerSensor + KeyboardSensor)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const fieldIds = useMemo(
    () => state.current_form?.fields.map((f) => f.id) || [],
    [state.current_form?.fields],
  );

  const handleDndStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDndEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = state.current_form?.fields.findIndex(
      (f) => f.id === active.id,
    );
    const newIndex = state.current_form?.fields.findIndex(
      (f) => f.id === over.id,
    );
    if (
      oldIndex !== undefined &&
      newIndex !== undefined &&
      oldIndex >= 0 &&
      newIndex >= 0
    ) {
      reorderFields(oldIndex, newIndex);
    }
  };

  const defaultLabels: Record<string, string> = {
    short_text: "Short Text",
    long_text: "Long Text",
    email: "Email",
    number: "Number",
    phone: "Phone",
    url: "URL",
    dropdown: "Dropdown",
    multiple_choice: "Multiple Choice",
    checkbox: "Checkbox",
    radio: "Radio",
    rating: "Rating",
    nps: "NPS",
    file_upload: "File Upload",
    payment: "Payment",
    section: "Section",
    page_break: "Page Break",
    image_upload: "Image Upload",
    location: "Location",
    name: "Name",
    password: "Password",
    likert: "Likert",
    star_rating: "Star Rating",
    linear_scale: "Linear Scale",
    nps_score: "NPS Score",
    likert_scale: "Likert Scale",
    ranking: "Ranking",
    yes_no: "Yes / No",
    multiple_dates: "Multiple Dates",
    time_range: "Time Range",
    captcha: "CAPTCHA",
    matrix_grid: "Matrix Grid",
    signature_upload: "Signature Upload",
    hidden_question: "Hidden Question",
    statement: "Statement",
    legal: "Legal",
    contact_info: "Contact Info",
  };

  const shouldShowTitlePlaceholder = (field: any) => {
    const label = (field.label || "").trim();
    const defaultLabel = defaultLabels[field.type];
    return label.length === 0 || (defaultLabel && label === defaultLabel);
  };

  const handleUpdateField = (
    fieldId: string,
    updates: Partial<FormField> | { settings: any },
  ) => {
    const field = state.current_form?.fields.find((f) => f.id === fieldId);
    if (!field) return;

    let newField = { ...field, ...updates };
    if (updates.settings) {
      newField = {
        ...field,
        settings: { ...field.settings, ...updates.settings },
      };
    }

    updateForm({
      ...state.current_form!,
      fields: state.current_form!.fields.map((f) =>
        f.id === fieldId ? (newField as any) : f,
      ),
    });
  };

  const handleAutoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  const handleFieldDelete = (fieldId: string) => {
    deleteField(fieldId);
  };

  const handleFieldDuplicate = (field: any) => {
    const duplicatedField: FormField = {
      ...field,
      id: `field_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      label: `${field.label} (Copy)`,
    };
    addField(duplicatedField);
  };

  const handleCardClick = (field: any) => {
    selectField(field);
  };

  // HTML5 drag handlers removed — replaced with @dnd-kit above

  if (!state.current_form) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto p-8">
          <div className="w-14 h-14 bg-gradient-to-br from-brand to-brand-dark rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-brand/20">
            <PlusIcon className="h-7 w-7 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Start Building Your Form
          </h3>
          <p className="text-sm text-gray-500 mb-5">
            Click the icons on the left to add fields
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-brand rounded-full" />
              Drag & drop
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-accent-teal rounded-full" />
              Customize
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-accent-warm rounded-full" />
              Publish
            </span>
          </div>
        </div>
      </div>
    );
  }

  const isMobilePreview =
    (state.current_form?.settings as any)?.previewDevice === "mobile";

  // Helpers for Typeform colors
  const tfBg =
    state.current_form?.theme?.background_color ||
    (state.current_form as any)?.brandKit?.colors?.pageBackground?.hex ||
    "#f8fafc";
  const tfText =
    state.current_form?.theme?.text_color ||
    (state.current_form as any)?.brandKit?.colors?.text?.primary?.hex ||
    "#1F2937";
  const tfPrimary =
    state.current_form?.theme?.primary_color ||
    (state.current_form as any)?.brandKit?.colors?.buttonPrimary?.hex ||
    "#6C5CE7";
  const tfFont =
    (state.current_form as any)?.brandKit?.typography?.fontFamily?.primary ||
    state.current_form?.theme?.font_family ||
    "Inter, sans-serif";

  return (
    <div
      className={`flex-1 w-full flex justify-center ${isMobilePreview ? "items-start pt-6 bg-gray-100/50 sidebar-scroll overflow-y-auto" : "items-center py-8"}`}
      style={{ fontFamily: tfFont }}
    >
      <div
        className={`${isMobilePreview ? "mobile-preview-frame" : "w-full max-w-[850px] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200/50 overflow-hidden"} relative flex flex-col`}
        style={
          isMobilePreview
            ? {
                width: "min(375px, 100vw - 32px)",
                minHeight: "667px",
                maxHeight: "calc(100vh - 120px)",
                overflowY: "auto" as const,
                borderRadius: "32px",
                border: "8px solid #1a1a2e",
                boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 0 0 2px #333",
                backgroundColor:
                  (state.current_form?.theme?.background_color as any) ||
                  "#f8fafc",
              }
            : {
                backgroundColor: (() => {
                  // If we have a gallery theme, the SVG art provides the background
                  if (state.current_form?.theme?.gallery_theme_id)
                    return "transparent";
                  return (
                    (state.current_form?.theme?.background_color as any) ||
                    (() => {
                      const cover = state.current_form?.fields.find(
                        (f) => (f as any).type === "cover_slide",
                      ) as any;
                      return cover?.settings?.coverBackgroundColor || "#f8fafc";
                    })()
                  );
                })(),
                backgroundImage: (state.current_form as any)?.brandKit
                  ?.backgroundImageUrl
                  ? `url(${(state.current_form as any).brandKit.backgroundImageUrl})`
                  : undefined,
                backgroundSize: (state.current_form as any)?.brandKit
                  ?.backgroundImageUrl
                  ? "cover"
                  : undefined,
                backgroundPosition: (state.current_form as any)?.brandKit
                  ?.backgroundImageUrl
                  ? "center"
                  : undefined,
                minHeight: "calc(100vh - 160px)",
              }
        }
      >
        {/* Theme art SVG background */}
        <ThemeArtBackground
          themeId={state.current_form?.theme?.gallery_theme_id}
          backgroundColor={state.current_form?.theme?.background_color}
        />
        <div
          className="w-full mx-auto flex justify-center relative z-10"
          style={{
            maxWidth: (() => {
              switch (state.current_form?.settings?.width as any) {
                case "compact":
                  return "24rem";
                case "narrow":
                  return "28rem";
                case "comfortable":
                  return "32rem";
                case "medium":
                  return "36rem";
                case "wide":
                  return "64rem";
                case "full":
                  return "100%";
                case "typeform":
                  return "100%";
                case "stitch":
                  return "100%";
                case "tripe":
                  return "100%";
                default:
                  return "660px"; // Editor mode: tighter width for focused editing
              }
            })(),
          }}
        >
          <div className="w-full">
            {/* Form Fields - Focus or Classic mode */}
            {(() => {
              const displayMode =
                state.current_form?.settings?.display_mode || "single_page";
              const isFocusMode = displayMode === "progressive";

              const sortedFields =
                state.current_form?.fields?.slice().sort((a, b) => {
                  const pri = (t: string) =>
                    t === "cover_slide"
                      ? -2
                      : t === "end_page" || t === "url_redirect"
                        ? 2
                        : 0;
                  const pa = pri((a as any).type);
                  const pb = pri((b as any).type);
                  if (pa !== pb) return pa - pb;
                  return 0;
                }) || [];

              if (isFocusMode && sortedFields.length > 0) {
                // Find active field index
                const activeIdx = state.selected_field
                  ? sortedFields.findIndex(
                      (f) => f.id === state.selected_field?.id,
                    )
                  : sortedFields.findIndex(
                      (f) => (f as any).type !== "cover_slide",
                    );
                const idx = activeIdx >= 0 ? activeIdx : 0;
                const activeField = sortedFields[idx];
                const hasPrev = idx > 0;
                const hasNext = idx < sortedFields.length - 1;
                const field = activeField;
                const isCover = (field as any).type === "cover_slide";
                const isEnd =
                  (field as any).type === "end_page" ||
                  (field as any).type === "url_redirect";
                // Count question number
                let qNum = 0;
                for (let i = 0; i <= idx; i++) {
                  const ft = (sortedFields[i] as any).type;
                  if (
                    ft !== "cover_slide" &&
                    ft !== "end_page" &&
                    ft !== "url_redirect"
                  )
                    qNum++;
                }

                return (
                  <div className="flex flex-col items-center justify-center w-full min-h-0 relative py-8">
                    {/* Single field card */}
                    <div className="w-full max-w-full sm:max-w-2xl md:max-w-3xl relative z-10 flex flex-col justify-center">
                      <div
                        key={field.id}
                        onClick={() => handleCardClick(field)}
                        className={`builder-field-wrapper group/row relative selected !bg-transparent !border-0 !shadow-none`}
                      >
                        <div className="p-3 sm:p-5 md:p-8">
                          {/* Field Preview */}
                          {isCover ? (
                            <div className="text-left w-full relative">
                              {/* Hover actions for cover */}
                              <div className="absolute right-0 top-0 opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center gap-1 z-10 pointer-events-auto">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleFieldDelete(field.id);
                                  }}
                                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                  title="Delete"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>

                              {(() => {
                                const title = field.settings?.coverTitle || "";
                                const subtitle =
                                  field.settings?.coverSubtitle || "";
                                const cta =
                                  field.settings?.coverCtaText || "Start";
                                const ctaBg =
                                  (field.settings as any)?.coverButtonColor ||
                                  "#111827";
                                return (
                                  <div className="w-full flex flex-col items-start justify-center min-h-[200px] sm:min-h-[250px] md:min-h-[300px]">
                                    <textarea
                                      value={title}
                                      onChange={(e) =>
                                        handleUpdateField(field.id, {
                                          settings: {
                                            coverTitle: e.target.value,
                                          },
                                        })
                                      }
                                      onInput={handleAutoResize}
                                      className="w-full text-3xl md:text-5xl font-semibold border-none focus:ring-0 focus:outline-none bg-transparent placeholder:opacity-50 resize-none overflow-hidden m-0 p-0 mb-4 tracking-tight leading-tight"
                                      placeholder="Welcome to my form"
                                      rows={1}
                                      style={{ color: tfText }}
                                    />
                                    <textarea
                                      value={subtitle}
                                      onChange={(e) =>
                                        handleUpdateField(field.id, {
                                          settings: {
                                            coverSubtitle: e.target.value,
                                          },
                                        })
                                      }
                                      onInput={handleAutoResize}
                                      className="w-full text-lg md:text-xl border-none focus:ring-0 focus:outline-none bg-transparent placeholder:opacity-50 font-light resize-none overflow-hidden m-0 p-0 mb-8"
                                      placeholder="Description goes here..."
                                      rows={1}
                                      style={{ color: tfText, opacity: 0.8 }}
                                    />
                                    <div className="flex items-center gap-3 mt-4">
                                      <button
                                        type="button"
                                        className="px-6 py-3 rounded-md text-white text-base md:text-lg font-bold shadow-sm hover:opacity-90 transition-opacity"
                                        style={{ background: ctaBg }}
                                      >
                                        {cta}
                                      </button>
                                      <div className="text-xs text-gray-500 flex items-center gap-1">
                                        press{" "}
                                        <span className="font-bold text-gray-700">
                                          Enter ↵
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          ) : (
                            <div className="w-full relative">
                              {/* Hover actions for questions */}
                              {!isEnd && (
                                <div className="absolute right-0 top-0 opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center gap-1 z-10">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleFieldDuplicate(field);
                                    }}
                                    className="p-2 text-gray-500 hover:text-[#6C5CE7] hover:bg-[#6C5CE7]/10 rounded-lg"
                                    title="Duplicate"
                                  >
                                    <DocumentDuplicateIcon className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleFieldDelete(field.id);
                                    }}
                                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                    title="Delete"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              )}

                              <div className="flex items-start gap-2 md:gap-4 mb-6 relative">
                                <div className="flex-1">
                                  {isEnd ? (
                                    <div className="text-center w-full min-h-[200px] flex flex-col items-center justify-center">
                                      <textarea
                                        value={
                                          (field.settings as any)?.endTitle ||
                                          ""
                                        }
                                        onChange={(e) =>
                                          handleUpdateField(field.id, {
                                            settings: {
                                              endTitle: e.target.value,
                                            },
                                          })
                                        }
                                        onInput={handleAutoResize}
                                        className="w-full text-center text-2xl md:text-4xl font-normal border-none focus:ring-0 focus:outline-none bg-transparent placeholder:opacity-50 resize-none overflow-hidden m-0 p-0 mb-4"
                                        placeholder="Thank you!"
                                        rows={1}
                                        style={{ color: tfText }}
                                      />
                                      <textarea
                                        value={
                                          (field.settings as any)
                                            ?.endSubtitle || ""
                                        }
                                        onChange={(e) =>
                                          handleUpdateField(field.id, {
                                            settings: {
                                              endSubtitle: e.target.value,
                                            },
                                          })
                                        }
                                        onInput={handleAutoResize}
                                        className="w-full text-center text-lg border-none focus:ring-0 focus:outline-none bg-transparent placeholder:opacity-50 font-light resize-none overflow-hidden m-0 p-0 mb-6"
                                        placeholder="We appreciate your time."
                                        rows={1}
                                        style={{ color: tfText, opacity: 0.8 }}
                                      />
                                      {(field.settings as any)
                                        ?.endButtonText && (
                                        <button
                                          disabled
                                          className="px-6 py-3 text-white rounded-md text-base font-bold"
                                          style={{ backgroundColor: tfPrimary }}
                                        >
                                          {
                                            (field.settings as any)
                                              ?.endButtonText
                                          }
                                        </button>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="flex flex-col w-full relative">
                                      <div className="flex items-start relative mb-2">
                                        <span
                                          className="font-bold text-lg md:text-2xl mr-2 leading-tight select-none mt-1"
                                          style={{ color: tfPrimary }}
                                        >
                                          {qNum}
                                          <span
                                            className="transition-colors ml-0.5 animate-pulse"
                                            style={{
                                              color: tfPrimary,
                                              opacity: 0.6,
                                            }}
                                          >
                                            →
                                          </span>
                                        </span>
                                        <textarea
                                          value={field.label || ""}
                                          onChange={(e) =>
                                            handleUpdateField(field.id, {
                                              label: e.target.value,
                                            })
                                          }
                                          onInput={handleAutoResize}
                                          className={`w-full text-xl md:text-3xl font-medium leading-tight border-none focus:ring-0 focus:outline-none bg-transparent resize-none overflow-hidden m-0 p-0 select-text ${shouldShowTitlePlaceholder(field) && !field.label ? "italic opacity-50" : ""}`}
                                          placeholder={
                                            defaultLabels[field.type] ||
                                            "Type your question here"
                                          }
                                          rows={1}
                                          style={{
                                            minHeight: "40px",
                                            color: tfText,
                                          }}
                                        />
                                        {field.required && (
                                          <span
                                            className="absolute -right-4 top-0 text-2xl select-none"
                                            style={{ color: tfPrimary }}
                                          >
                                            *
                                          </span>
                                        )}
                                      </div>
                                      {field.show_description && (
                                        <textarea
                                          value={field.description || ""}
                                          onChange={(e) =>
                                            handleUpdateField(field.id, {
                                              description: e.target.value,
                                            })
                                          }
                                          onInput={handleAutoResize}
                                          className="w-full text-base md:text-lg border-none focus:ring-0 focus:outline-none bg-transparent placeholder:opacity-50 placeholder:italic resize-none overflow-hidden m-0 p-0 ml-8 md:ml-10 mb-4 max-w-[calc(100%-2.5rem)]"
                                          placeholder="add description"
                                          rows={1}
                                          style={{
                                            color: tfText,
                                            opacity: 0.7,
                                          }}
                                        />
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* The actual input field */}
                              {!isEnd && (
                                <div className="mt-4 max-w-2xl typeform-input-wrapper">
                                  <FieldComponent
                                    field={field}
                                    isPreview={true}
                                    disabled={true}
                                    showLabel={false}
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Prev/Next navigation */}
                    <div className="flex items-center gap-3 mt-6 z-20 relative bg-white/40 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50">
                      <button
                        onClick={() =>
                          hasPrev && selectField(sortedFields[idx - 1])
                        }
                        disabled={!hasPrev}
                        className="p-2 rounded-full text-gray-400 hover:text-[#6C5CE7] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronUpIcon className="w-4 h-4" />
                      </button>
                      {/* Dot indicators */}
                      <div className="flex items-center gap-1.5 hidden sm:flex">
                        {sortedFields.map((f, i) => (
                          <button
                            key={f.id}
                            onClick={() => selectField(f)}
                            className={`rounded-full transition-all ${i === idx ? "w-5 h-1.5 bg-[#6C5CE7]" : "w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400"}`}
                          />
                        ))}
                      </div>
                      <button
                        onClick={() =>
                          hasNext && selectField(sortedFields[idx + 1])
                        }
                        disabled={!hasNext}
                        className="p-2 rounded-full text-gray-400 hover:text-[#6C5CE7] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronDownIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              }

              // ─── Grid mode — multi-column CSS Grid layout ───
              if (displayMode === "grid") {
                const gridCols =
                  (state.current_form?.settings as any)?.grid_columns || 2;
                const getColSpan = (field: any) => {
                  const w = field.settings?.styling?.width as
                    | string
                    | undefined;
                  const t = field.type;
                  // Cover/end pages always full
                  if (
                    t === "cover_slide" ||
                    t === "end_page" ||
                    t === "url_redirect"
                  )
                    return gridCols;
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

                return (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDndStart}
                    onDragEnd={handleDndEnd}
                  >
                    <SortableContext
                      items={sortedFields.map((f) => f.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div
                        className="form-grid-layout gap-3"
                        style={{
                          display: "grid",
                          gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                        }}
                      >
                        {sortedFields.map((field, index) => {
                          const span = getColSpan(field);
                          const isCover = (field as any).type === "cover_slide";
                          const isEnd =
                            (field as any).type === "end_page" ||
                            (field as any).type === "url_redirect";
                          // Question numbering (skip cover/end)
                          let qNum = 0;
                          for (let i = 0; i <= index; i++) {
                            const ft = (sortedFields[i] as any).type;
                            if (
                              ft !== "cover_slide" &&
                              ft !== "end_page" &&
                              ft !== "url_redirect"
                            )
                              qNum++;
                          }

                          return (
                            <SortableFieldItem key={field.id} id={field.id}>
                              <div
                                onClick={() => handleCardClick(field)}
                                className={`builder-field-wrapper group/row relative ${activeId === field.id ? "opacity-50" : ""} ${state.selected_field?.id === field.id ? "selected" : ""}`}
                                style={{ gridColumn: `span ${span}` }}
                              >
                                <div className="p-3 md:p-4">
                                  {/* Field width selector — appears on hover in grid mode */}
                                  <div className="absolute top-1 right-1 opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center gap-0.5 z-20 bg-white/90 backdrop-blur rounded-md border border-gray-200 shadow-sm px-1 py-0.5">
                                    {(
                                      [
                                        "full",
                                        "half",
                                        "third",
                                        "quarter",
                                      ] as const
                                    ).map((w) => {
                                      const currentW =
                                        (field.settings as any)?.styling
                                          ?.width || "full";
                                      const labels: Record<string, string> = {
                                        full: "1",
                                        half: "½",
                                        third: "⅓",
                                        quarter: "¼",
                                      };
                                      return (
                                        <button
                                          key={w}
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleUpdateField(field.id, {
                                              settings: {
                                                ...field.settings,
                                                styling: {
                                                  ...(field.settings as any)
                                                    ?.styling,
                                                  width: w,
                                                },
                                              },
                                            });
                                          }}
                                          className={`w-5 h-5 text-[9px] font-bold rounded transition-all ${currentW === w ? "bg-[#6C5CE7] text-white" : "text-gray-500 hover:bg-gray-100"}`}
                                          title={`${w} width`}
                                        >
                                          {labels[w]}
                                        </button>
                                      );
                                    })}
                                    {/* Actions */}
                                    <div className="w-px h-3 bg-gray-200 mx-0.5" />
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleFieldDuplicate(field);
                                      }}
                                      className="p-0.5 text-gray-400 hover:text-[#6C5CE7] rounded"
                                      title="Duplicate"
                                    >
                                      <DocumentDuplicateIcon className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleFieldDelete(field.id);
                                      }}
                                      className="p-0.5 text-gray-400 hover:text-red-500 rounded"
                                      title="Delete"
                                    >
                                      <TrashIcon className="h-3 w-3" />
                                    </button>
                                  </div>

                                  {/* Question number + label */}
                                  {!isCover && !isEnd && (
                                    <div className="flex items-start gap-1.5 mb-2">
                                      <span
                                        className="font-bold text-sm mr-1 select-none"
                                        style={{ color: tfPrimary }}
                                      >
                                        {qNum}
                                        <span
                                          className="ml-0.5 opacity-60"
                                          style={{ color: tfPrimary }}
                                        >
                                          →
                                        </span>
                                      </span>
                                      <textarea
                                        value={field.label || ""}
                                        onChange={(e) =>
                                          handleUpdateField(field.id, {
                                            label: e.target.value,
                                          })
                                        }
                                        onInput={handleAutoResize}
                                        className={`w-full text-sm font-medium leading-tight border-none focus:ring-0 focus:outline-none bg-transparent resize-none overflow-hidden m-0 p-0 ${!field.label ? "italic opacity-50" : ""}`}
                                        placeholder={
                                          defaultLabels[(field as any).type] ||
                                          "Type your question here"
                                        }
                                        rows={1}
                                        style={{
                                          minHeight: "20px",
                                          color: tfText,
                                        }}
                                      />
                                      {field.required && (
                                        <span
                                          className="text-sm select-none"
                                          style={{ color: tfPrimary }}
                                        >
                                          *
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {/* Cover slide inline */}
                                  {isCover && (
                                    <div className="text-center py-4">
                                      <textarea
                                        value={
                                          (field.settings as any)?.coverTitle ||
                                          ""
                                        }
                                        onChange={(e) =>
                                          handleUpdateField(field.id, {
                                            settings: {
                                              coverTitle: e.target.value,
                                            },
                                          })
                                        }
                                        onInput={handleAutoResize}
                                        className="w-full text-xl font-semibold border-none focus:ring-0 focus:outline-none bg-transparent placeholder:opacity-50 resize-none overflow-hidden m-0 p-0 mb-2 text-center"
                                        placeholder="Welcome to my form"
                                        rows={1}
                                        style={{ color: tfText }}
                                      />
                                      <textarea
                                        value={
                                          (field.settings as any)
                                            ?.coverSubtitle || ""
                                        }
                                        onChange={(e) =>
                                          handleUpdateField(field.id, {
                                            settings: {
                                              coverSubtitle: e.target.value,
                                            },
                                          })
                                        }
                                        onInput={handleAutoResize}
                                        className="w-full text-sm border-none focus:ring-0 focus:outline-none bg-transparent placeholder:opacity-50 font-light resize-none overflow-hidden m-0 p-0 text-center"
                                        placeholder="Description goes here..."
                                        rows={1}
                                        style={{ color: tfText, opacity: 0.8 }}
                                      />
                                    </div>
                                  )}

                                  {/* End page inline */}
                                  {isEnd && (
                                    <div className="text-center py-4">
                                      <textarea
                                        value={
                                          (field.settings as any)?.endTitle ||
                                          ""
                                        }
                                        onChange={(e) =>
                                          handleUpdateField(field.id, {
                                            settings: {
                                              endTitle: e.target.value,
                                            },
                                          })
                                        }
                                        onInput={handleAutoResize}
                                        className="w-full text-xl font-normal border-none focus:ring-0 focus:outline-none bg-transparent placeholder:opacity-50 resize-none overflow-hidden m-0 p-0 mb-2 text-center"
                                        placeholder="Thank you!"
                                        rows={1}
                                        style={{ color: tfText }}
                                      />
                                    </div>
                                  )}

                                  {/* Field component */}
                                  {!isCover && !isEnd && (
                                    <div className="mt-1">
                                      <FieldComponent
                                        field={field}
                                        isPreview={true}
                                        disabled={true}
                                        showLabel={false}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </SortableFieldItem>
                          );
                        })}
                      </div>
                    </SortableContext>
                  </DndContext>
                );
              }

              // Classic mode — show all fields with @dnd-kit sortable
              return (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDndStart}
                  onDragEnd={handleDndEnd}
                >
                  <SortableContext
                    items={sortedFields.map((f) => f.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {sortedFields.map((field, index) => (
                        <SortableFieldItem key={field.id} id={field.id}>
                          <div
                            onClick={() => handleCardClick(field)}
                            className={`builder-field-wrapper group/row relative ${activeId === field.id ? "opacity-50" : ""} ${state.selected_field?.id === field.id ? "selected" : ""}`}
                          >
                            {/* selection ring handled by builder-field-wrapper CSS */}
                            {(() => {
                              /* helper to ease TS */ return null;
                            })()}
                            {/**/}
                            <div className="p-1 md:p-2">
                              <div className="flex items-center justify-between mb-0.5 md:mb-1">
                                <div className="flex items-center space-x-1 md:space-x-2 w-full">
                                  <div className="flex-1">
                                    {(() => {
                                      const isCover =
                                        (field as any).type === "cover_slide";
                                      if (isCover) {
                                        return (
                                          <div className="space-y-1">
                                            <div className="flex items-center justify-between"></div>
                                          </div>
                                        );
                                      }
                                      const showPlaceholder =
                                        shouldShowTitlePlaceholder(field);
                                      const t = (field as any).type;
                                      if (
                                        t === "end_page" ||
                                        t === "url_redirect"
                                      ) {
                                        return null;
                                      }
                                      return (
                                        <div className="w-full flex flex-col pt-1">
                                          <textarea
                                            value={field.label || ""}
                                            onChange={(e) =>
                                              handleUpdateField(field.id, {
                                                label: e.target.value,
                                              })
                                            }
                                            onInput={handleAutoResize}
                                            className={`w-full text-[11px] md:text-xs font-medium border-none focus:ring-0 focus:outline-none bg-transparent resize-none overflow-hidden m-0 p-0 ${showPlaceholder && !field.label ? "italic opacity-50" : ""}`}
                                            placeholder={
                                              showPlaceholder
                                                ? "add question"
                                                : "Question"
                                            }
                                            rows={1}
                                            style={{
                                              minHeight: "18px",
                                              color: tfText,
                                            }}
                                          />
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </div>

                                {/* Field Actions */}
                                <div className="flex items-center gap-0.5 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                  {(() => {
                                    const t = (field as any).type;
                                    const restricted =
                                      t === "cover_slide" ||
                                      t === "end_page" ||
                                      t === "url_redirect";
                                    if (!restricted) {
                                      return (
                                        <>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleFieldDuplicate(field);
                                            }}
                                            className="p-1.5 text-gray-400 hover:text-[#6C5CE7] hover:bg-[#6C5CE7]/8 rounded-lg transition-colors"
                                            title="Duplicate field"
                                          >
                                            <DocumentDuplicateIcon className="h-3.5 w-3.5" />
                                          </button>
                                        </>
                                      );
                                    }
                                    return null;
                                  })()}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleFieldDelete(field.id);
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete field"
                                  >
                                    <TrashIcon className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Field Preview - minimal wrapper */}
                              {(field as any).type === "cover_slide" ? (
                                <div className="text-center w-full relative">
                                  {(() => {
                                    const title =
                                      field.settings?.coverTitle || "";
                                    const subtitle =
                                      field.settings?.coverSubtitle || "";
                                    const cta =
                                      field.settings?.coverCtaText || "Start";
                                    const ctaBg =
                                      (field.settings as any)
                                        ?.coverButtonColor || "#111827";
                                    return (
                                      <div className="w-full flex flex-col items-start justify-center py-6 sm:py-8 md:py-12">
                                        <textarea
                                          value={title}
                                          onChange={(e) =>
                                            handleUpdateField(field.id, {
                                              settings: {
                                                coverTitle: e.target.value,
                                              },
                                            })
                                          }
                                          onInput={handleAutoResize}
                                          className="w-full text-3xl md:text-5xl font-semibold border-none focus:ring-0 focus:outline-none bg-transparent placeholder:opacity-50 resize-none overflow-hidden m-0 p-0 mb-4 tracking-tight leading-tight"
                                          placeholder="Welcome to my form"
                                          rows={1}
                                          style={{ color: tfText }}
                                        />
                                        <textarea
                                          value={subtitle}
                                          onChange={(e) =>
                                            handleUpdateField(field.id, {
                                              settings: {
                                                coverSubtitle: e.target.value,
                                              },
                                            })
                                          }
                                          onInput={handleAutoResize}
                                          className="w-full text-lg md:text-xl border-none focus:ring-0 focus:outline-none bg-transparent placeholder:opacity-50 font-light resize-none overflow-hidden m-0 p-0 mb-8"
                                          placeholder="Description goes here..."
                                          rows={1}
                                          style={{
                                            color: tfText,
                                            opacity: 0.8,
                                          }}
                                        />
                                      </div>
                                    );
                                  })()}
                                </div>
                              ) : (field as any).type === "end_page" ||
                                (field as any).type === "url_redirect" ? (
                                <div className="text-center w-full relative">
                                  {(() => {
                                    return (
                                      <div className="text-center w-full min-h-[200px] flex flex-col items-center justify-center">
                                        <textarea
                                          value={
                                            (field.settings as any)?.endTitle ||
                                            ""
                                          }
                                          onChange={(e) =>
                                            handleUpdateField(field.id, {
                                              settings: {
                                                endTitle: e.target.value,
                                              },
                                            })
                                          }
                                          onInput={handleAutoResize}
                                          className="w-full text-center text-2xl md:text-4xl font-normal border-none focus:ring-0 focus:outline-none bg-transparent placeholder:opacity-50 resize-none overflow-hidden m-0 p-0 mb-4"
                                          placeholder="Thank you!"
                                          rows={1}
                                          style={{ color: tfText }}
                                        />
                                        <textarea
                                          value={
                                            (field.settings as any)
                                              ?.endSubtitle || ""
                                          }
                                          onChange={(e) =>
                                            handleUpdateField(field.id, {
                                              settings: {
                                                endSubtitle: e.target.value,
                                              },
                                            })
                                          }
                                          onInput={handleAutoResize}
                                          className="w-full text-center text-lg border-none focus:ring-0 focus:outline-none bg-transparent placeholder:opacity-50 font-light resize-none overflow-hidden m-0 p-0 mb-6"
                                          placeholder="We appreciate your time."
                                          rows={1}
                                          style={{
                                            color: tfText,
                                            opacity: 0.8,
                                          }}
                                        />
                                        {(field.settings as any)
                                          ?.endButtonText && (
                                          <button
                                            disabled
                                            className="px-6 py-3 text-white rounded-md text-base font-bold"
                                            style={{
                                              backgroundColor: tfPrimary,
                                            }}
                                          >
                                            {
                                              (field.settings as any)
                                                ?.endButtonText
                                            }
                                          </button>
                                        )}
                                      </div>
                                    );
                                  })()}
                                </div>
                              ) : (
                                <div className="mobile-field-preview">
                                  <FieldComponent
                                    field={field}
                                    isPreview={true}
                                    disabled={true}
                                    showLabel={false}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </SortableFieldItem>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              );
            })()}

            {/* Enhanced Empty State */}
            {state.current_form?.fields?.length === 0 && (
              <div className="text-center py-16">
                <div className="w-14 h-14 bg-gradient-to-br from-brand to-brand-dark rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-brand/20">
                  <PlusIcon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  No Fields Added Yet
                </h3>
                <p className="text-sm text-gray-500 mb-5 max-w-sm mx-auto">
                  Click the icons on the left sidebar or use Quick Add below to
                  start building.
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-brand rounded-full" />
                    Add fields
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-accent-teal rounded-full" />
                    Drag to reorder
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-accent-warm rounded-full" />
                    Customize
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
