"use client";

import React, { useState } from "react";
import { ConditionalLogic, FormField, FieldType } from "@/types";

interface ConditionalLogicEditorProps {
  field: FormField;
  allFields: FormField[];
  onUpdate: (conditional: ConditionalLogic) => void;
  onRemove: () => void;
}

export function ConditionalLogicEditor({
  field,
  allFields,
  onUpdate,
  onRemove,
}: ConditionalLogicEditorProps) {
  const [conditional, setConditional] = useState<ConditionalLogic>(
    field.conditional || {
      fieldId: "",
      operator: "equals",
      value: "",
      action: "show",
    },
  );

  const availableFields = allFields.filter(
    (f) => f.id !== field.id && f.type !== "section" && f.type !== "page_break",
  );

  const operators = [
    { value: "equals", label: "equals" },
    { value: "not_equals", label: "does not equal" },
    { value: "contains", label: "contains" },
    { value: "greater_than", label: "greater than" },
    { value: "less_than", label: "less than" },
    { value: "is_empty", label: "is empty" },
    { value: "is_not_empty", label: "is not empty" },
  ];

  const actions = [
    { value: "show", label: "Show this field" },
    { value: "hide", label: "Hide this field" },
  ];

  const handleUpdate = (updates: Partial<ConditionalLogic>) => {
    const updated = { ...conditional, ...updates };
    setConditional(updated);
    onUpdate(updated);
  };

  const getValueInput = () => {
    const targetField = allFields.find((f) => f.id === conditional.fieldId);
    if (!targetField) return null;

    switch (targetField.type) {
      case "multiple_choice":
      case "dropdown":
      case "radio":
        return (
          <select
            value={conditional.value as string}
            onChange={(e) => handleUpdate({ value: e.target.value })}
            className="w-full min-w-0 px-2.5 py-2 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/15 focus:border-[#6C5CE7]/30 transition-all shadow-sm text-xs truncate text-gray-700"
          >
            <option value="">Select an option</option>
            {targetField.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case "checkbox":
        return (
          <select
            value={conditional.value as string}
            onChange={(e) => handleUpdate({ value: e.target.value })}
            className="w-full min-w-0 px-2.5 py-2 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/15 focus:border-[#6C5CE7]/30 transition-all shadow-sm text-xs truncate text-gray-700"
          >
            <option value="true">Checked</option>
            <option value="false">Unchecked</option>
          </select>
        );

      case "number":
      case "rating":
      case "nps":
        return (
          <input
            type="number"
            value={conditional.value as string}
            onChange={(e) => handleUpdate({ value: e.target.value })}
            className="w-full min-w-0 px-2.5 py-2 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/15 focus:border-[#6C5CE7]/30 transition-all shadow-sm text-xs truncate text-gray-700"
            placeholder="Enter value"
          />
        );

      default:
        return (
          <input
            type="text"
            value={conditional.value as string}
            onChange={(e) => handleUpdate({ value: e.target.value })}
            className="w-full min-w-0 px-2.5 py-2 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/15 focus:border-[#6C5CE7]/30 transition-all shadow-sm text-xs truncate text-gray-700"
            placeholder="Enter value"
          />
        );
    }
  };

  return (
    <div className="pt-1">
      <div className="flex justify-end mb-3">
        <button
          onClick={onRemove}
          className="text-[11px] font-semibold text-red-400 hover:text-red-500 transition-colors"
        >
          Remove logic
        </button>
      </div>

      <div className="space-y-3">
        {/* Field Selection */}
        <div>
          <label className="block text-[11px] font-medium text-gray-500/80 mb-1.5 uppercase tracking-wider">
            When this field:
          </label>
          <select
            value={conditional.fieldId}
            onChange={(e) => handleUpdate({ fieldId: e.target.value })}
            className="w-full min-w-0 px-2.5 py-2 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/15 focus:border-[#6C5CE7]/30 transition-all shadow-sm text-xs truncate text-gray-700"
          >
            <option value="">Select a field</option>
            {availableFields.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        {/* Operator Selection */}
        <div>
          <label className="block text-[11px] font-medium text-gray-500/80 mb-1.5 uppercase tracking-wider">
            Condition:
          </label>
          <select
            value={conditional.operator}
            onChange={(e) =>
              handleUpdate({
                operator: e.target.value as ConditionalLogic["operator"],
              })
            }
            className="w-full min-w-0 px-2.5 py-2 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/15 focus:border-[#6C5CE7]/30 transition-all shadow-sm text-xs truncate text-gray-700"
          >
            {operators.map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>
        </div>

        {/* Value Input (only show for non-empty operators) */}
        {!["is_empty", "is_not_empty"].includes(conditional.operator) && (
          <div>
            <label className="block text-[11px] font-medium text-gray-500/80 mb-1.5 uppercase tracking-wider">
              Value:
            </label>
            {getValueInput()}
          </div>
        )}

        {/* Action Selection */}
        <div>
          <label className="block text-[11px] font-medium text-gray-500/80 mb-1.5 uppercase tracking-wider">
            Then it will:
          </label>
          <select
            value={conditional.action}
            onChange={(e) =>
              handleUpdate({
                action: e.target.value as ConditionalLogic["action"],
              })
            }
            className="w-full min-w-0 px-2.5 py-2 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/15 focus:border-[#6C5CE7]/30 transition-all shadow-sm text-xs truncate text-gray-700"
          >
            {actions.map((action) => (
              <option key={action.value} value={action.value}>
                {action.label}
              </option>
            ))}
          </select>
        </div>

        {/* Preview */}
        {conditional.fieldId && (
          <div className="bg-[#6C5CE7]/5 border border-[#6C5CE7]/10 rounded-xl p-3 flex gap-2">
            <svg
              className="w-4 h-4 text-[#6C5CE7]/60 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-[11px] text-[#6C5CE7]/80 leading-relaxed">
              When{" "}
              <strong>
                "
                {allFields.find((f) => f.id === conditional.fieldId)?.label ||
                  "Field"}
                "
              </strong>{" "}
              {operators.find((o) => o.value === conditional.operator)?.label}{" "}
              {conditional.value ? <strong>"{conditional.value}"</strong> : ""},
              this question will be{" "}
              <strong>
                {conditional.action === "show" ? "shown" : "hidden"}
              </strong>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
