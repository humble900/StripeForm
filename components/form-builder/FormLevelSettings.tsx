"use client";

import React, { useState } from "react";
import { useFormBuilder } from "@/components/providers/FormBuilderProvider";
import {
  LockClosedIcon,
  CalendarIcon,
  GlobeAltIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

type SettingsTab = "general" | "access" | "language";

// ─────────────────────────────────────────────────
// Toggle row (label + description + toggle switch)
// ─────────────────────────────────────────────────
function Toggle({
  label,
  description,
  checked,
  onChange,
  badge,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  badge?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex-1 min-w-0 pr-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-medium text-gray-800">{label}</span>
          {badge && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-100 text-emerald-700">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">
            {description}
          </p>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${checked ? "bg-[#6C5CE7]" : "bg-gray-200"}`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[18px]" : "translate-x-[3px]"}`}
        />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────
// Collapsible section for Language tab
// ─────────────────────────────────────────────────
function LangSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-2.5 text-left"
      >
        <span className="text-[13px] font-semibold text-gray-700">{title}</span>
        {open ? (
          <ChevronDownIcon className="w-3.5 h-3.5 text-gray-400" />
        ) : (
          <ChevronRightIcon className="w-3.5 h-3.5 text-gray-400" />
        )}
      </button>
      {open && <div className="pb-3 space-y-3">{children}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────
// Language string input row
// ─────────────────────────────────────────────────
function LangInput({
  label,
  value,
  defaultValue,
  onChange,
  maxLength = 100,
}: {
  label: string;
  value: string | undefined;
  defaultValue: string;
  onChange: (v: string) => void;
  maxLength?: number;
}) {
  const displayValue = value ?? defaultValue;
  return (
    <div>
      <label className="block text-[11px] text-gray-500 mb-1">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7]/50 bg-white transition-colors"
          maxLength={maxLength}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-gray-300">
          {displayValue.length} / {maxLength}
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════
export function FormLevelSettings({ isThemeMode }: { isThemeMode?: boolean }) {
  const { state, updateForm } = useFormBuilder();
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  const settings = state.current_form?.settings || ({} as any);
  const updateSettings = (partial: Record<string, any>) => {
    if (!state.current_form) return;
    updateForm({
      ...state.current_form,
      settings: { ...state.current_form.settings, ...partial },
    });
  };

  const TABS: { id: SettingsTab; label: string }[] = [
    { id: "general", label: "General" },
    { id: "access", label: "Access & Scheduling" },
    { id: "language", label: "Language" },
  ];

  // ─── General Tab ─────────────────────────────────
  const renderGeneral = () => (
    <div className="space-y-6">
      {/* Form Mode */}
      <div>
        <h3 className="text-[15px] font-semibold text-gray-900 mb-1">
          Form mode
        </h3>
        <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">
          Modes give you the right tools for your form, so you can create and
          publish faster.
        </p>
        <label className="block text-[11px] text-gray-600 mb-1.5 font-medium">
          Choose a mode
        </label>
        <select
          value={settings.display_mode || "progressive"}
          onChange={(e) => updateSettings({ display_mode: e.target.value })}
          className="w-full text-xs px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7]/50 bg-white"
        >
          <option value="progressive">Progressive (Typeform-style)</option>
          <option value="single_page">Single Page (Classic)</option>
          <option value="grid">Grid (Multi-column)</option>
        </select>
        <p className="text-[10px] text-gray-400 mt-1.5">
          Switching modes might result in changes to form settings.
        </p>
        {settings.display_mode === "grid" && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <label className="block text-[11px] text-gray-600 mb-1.5 font-medium">
              Number of columns
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => updateSettings({ grid_columns: n })}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                    (settings.grid_columns || 2) === n
                      ? "bg-[#6C5CE7] text-white border-[#6C5CE7] shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-2">
              Each field can span full, half, third, or quarter width. Change
              per-field width in field settings.
            </p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Display */}
      <div>
        <h3 className="text-[15px] font-semibold text-gray-900 mb-3">
          Display
        </h3>
        <div className="divide-y divide-gray-50">
          <Toggle
            label="StripeForm branding"
            checked={settings.show_branding !== false}
            onChange={(v) => updateSettings({ show_branding: v })}
          />
          <Toggle
            label="Navigation arrows"
            checked={settings.show_navigation_arrows !== false}
            onChange={(v) => updateSettings({ show_navigation_arrows: v })}
          />
          <Toggle
            label="Progress bar"
            checked={settings.show_progress_bar !== false}
            onChange={(v) => updateSettings({ show_progress_bar: v })}
          />
          <Toggle
            label="Question number"
            checked={settings.show_question_numbers !== false}
            onChange={(v) => updateSettings({ show_question_numbers: v })}
          />
          <Toggle
            label="Letters on answers"
            checked={settings.show_letters_on_answers !== false}
            onChange={(v) => updateSettings({ show_letters_on_answers: v })}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Preferences */}
      <div>
        <h3 className="text-[15px] font-semibold text-gray-900 mb-3">
          Preferences
        </h3>
        <div className="divide-y divide-gray-50">
          <Toggle
            label="Autosave progress"
            description="Save respondent answers automatically"
            checked={settings.autosave_progress !== false}
            onChange={(v) => updateSettings({ autosave_progress: v })}
          />
          <Toggle
            label="Free form navigation"
            description="Allow respondents to jump between questions"
            checked={settings.free_navigation === true}
            onChange={(v) => updateSettings({ free_navigation: v })}
          />
          <Toggle
            label="Cookie consent"
            description="Show a cookie consent banner"
            checked={settings.cookie_consent === true}
            onChange={(v) => updateSettings({ cookie_consent: v })}
          />
          <Toggle
            label="Enrich form responses"
            description="Collect additional metadata with responses"
            checked={settings.enrich_responses === true}
            onChange={(v) => updateSettings({ enrich_responses: v })}
            badge="PRO"
          />
          <Toggle
            label="Spam prevention"
            description="Use reCAPTCHA to prevent spam submissions"
            checked={settings.spam_prevention === true}
            onChange={(v) => updateSettings({ spam_prevention: v })}
            badge="PRO"
          />
          <Toggle
            label="Duplicate response prevention"
            description="Prevent the same person from submitting twice"
            checked={settings.duplicate_prevention === true}
            onChange={(v) => updateSettings({ duplicate_prevention: v })}
            badge="PRO"
          />
        </div>
      </div>
    </div>
  );

  // ─── Access & Scheduling Tab ─────────────────────
  const renderAccess = () => (
    <div className="space-y-5">
      {/* Status banner */}
      <div
        className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border ${
          settings.is_open !== false
            ? "border-emerald-200 bg-emerald-50/60"
            : "border-red-200 bg-red-50/60"
        }`}
      >
        <LockClosedIcon
          className={`w-4 h-4 flex-shrink-0 ${settings.is_open !== false ? "text-emerald-600" : "text-red-500"}`}
        />
        <span className="text-[13px] text-gray-700">
          Your form is{" "}
          <strong>{settings.is_open !== false ? "open" : "closed"}</strong> to
          new responses.
        </span>
      </div>

      <div>
        <h3 className="text-[15px] font-semibold text-gray-900 mb-3">
          Access & Scheduling
        </h3>
        <div className="divide-y divide-gray-50">
          <Toggle
            label="Open this form to new responses"
            checked={settings.is_open !== false}
            onChange={(v) => updateSettings({ is_open: v })}
          />
          <div>
            <Toggle
              label="Schedule a close date"
              checked={settings.schedule_close === true}
              onChange={(v) => updateSettings({ schedule_close: v })}
              badge="PRO"
            />
            {settings.schedule_close && (
              <div className="pb-3 pl-1">
                <input
                  type="datetime-local"
                  value={settings.schedule_close_date || ""}
                  onChange={(e) =>
                    updateSettings({ schedule_close_date: e.target.value })
                  }
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7]/50 bg-white"
                />
              </div>
            )}
          </div>
          <div>
            <Toggle
              label="Set a response limit"
              checked={settings.response_limit_enabled === true}
              onChange={(v) => updateSettings({ response_limit_enabled: v })}
              badge="PRO"
            />
            {settings.response_limit_enabled && (
              <div className="pb-3 pl-1">
                <input
                  type="number"
                  min={1}
                  value={settings.response_limit || 100}
                  onChange={(e) =>
                    updateSettings({ response_limit: Number(e.target.value) })
                  }
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7]/50 bg-white"
                  placeholder="Max responses"
                />
              </div>
            )}
          </div>
          <div>
            <Toggle
              label="Show custom closed message"
              checked={settings.show_closed_message === true}
              onChange={(v) => updateSettings({ show_closed_message: v })}
            />
            {settings.show_closed_message && (
              <div className="pb-3 pl-1">
                <textarea
                  rows={3}
                  value={settings.closed_message || ""}
                  onChange={(e) =>
                    updateSettings({ closed_message: e.target.value })
                  }
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7]/50 bg-white resize-none"
                  placeholder="This form is no longer accepting responses."
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // ─── Language Tab ────────────────────────────────
  const renderLanguage = () => (
    <div className="space-y-1">
      <LangSection title="Buttons, hints & shortcuts" defaultOpen={true}>
        <LangInput
          label="Button to confirm answer"
          value={settings.lang_confirm_button}
          defaultValue="OK"
          onChange={(v) => updateSettings({ lang_confirm_button: v })}
        />
        <LangInput
          label="Keyboard instruction to go to next question"
          value={settings.lang_enter_hint}
          defaultValue="press Enter ↵"
          onChange={(v) => updateSettings({ lang_enter_hint: v })}
          maxLength={200}
        />
        <LangInput
          label="Hint for multiple selection"
          value={settings.lang_multi_select_hint}
          defaultValue="Choose as many as you like"
          onChange={(v) => updateSettings({ lang_multi_select_hint: v })}
          maxLength={165}
        />
        <LangInput
          label="Instruction for Dropdown question"
          value={settings.lang_dropdown_instruction}
          defaultValue="Type or select an option"
          onChange={(v) => updateSettings({ lang_dropdown_instruction: v })}
        />
        <LangInput
          label="Instruction for Dropdown on touch screens"
          value={settings.lang_dropdown_touch}
          defaultValue="Select an option"
          onChange={(v) => updateSettings({ lang_dropdown_touch: v })}
        />
        <LangInput
          label='Label for "Other" answer option'
          value={settings.lang_other_label}
          defaultValue="Other"
          onChange={(v) => updateSettings({ lang_other_label: v })}
        />
        <LangInput
          label='Hint for adding text for "Other" option'
          value={settings.lang_other_hint}
          defaultValue="Type your answer"
          onChange={(v) => updateSettings({ lang_other_hint: v })}
        />
        <LangInput
          label='Button to respond "Yes"'
          value={settings.lang_yes_label}
          defaultValue="Yes"
          onChange={(v) => updateSettings({ lang_yes_label: v })}
          maxLength={255}
        />
        <LangInput
          label='Button to respond "No"'
          value={settings.lang_no_label}
          defaultValue="No"
          onChange={(v) => updateSettings({ lang_no_label: v })}
          maxLength={255}
        />
        <LangInput
          label="Button to accept a Legal statement"
          value={settings.lang_accept_label}
          defaultValue="I accept"
          onChange={(v) => updateSettings({ lang_accept_label: v })}
          maxLength={255}
        />
        <LangInput
          label="Button to reject a Legal statement"
          value={settings.lang_reject_label}
          defaultValue="I don't accept"
          onChange={(v) => updateSettings({ lang_reject_label: v })}
          maxLength={255}
        />
        <LangInput
          label="Button to revise errors"
          value={settings.lang_review_button}
          defaultValue="Review"
          onChange={(v) => updateSettings({ lang_review_button: v })}
        />
        <LangInput
          label="Button to send form"
          value={settings.lang_submit_button}
          defaultValue="Submit"
          onChange={(v) => updateSettings({ lang_submit_button: v })}
        />
        <LangInput
          label="Button to continue (quiz)"
          value={settings.lang_continue_button}
          defaultValue="Continue"
          onChange={(v) => updateSettings({ lang_continue_button: v })}
        />
      </LangSection>

      <LangSection title="Error messages">
        <LangInput
          label="If an answer is required"
          value={settings.lang_err_required}
          defaultValue="Please fill this in"
          onChange={(v) => updateSettings({ lang_err_required: v })}
          maxLength={64}
        />
        <LangInput
          label="If an answer requires a selection"
          value={settings.lang_err_selection}
          defaultValue="Oops! Please make a selection"
          onChange={(v) => updateSettings({ lang_err_selection: v })}
          maxLength={386}
        />
        <LangInput
          label="If a value is required"
          value={settings.lang_err_value}
          defaultValue="Oops! Please enter a value"
          onChange={(v) => updateSettings({ lang_err_value: v })}
          maxLength={255}
        />
        <LangInput
          label="If a legal statement is rejected"
          value={settings.lang_err_legal}
          defaultValue="Please agree to the terms & conditions"
          onChange={(v) => updateSettings({ lang_err_legal: v })}
          maxLength={250}
        />
        <LangInput
          label="If an email address is incorrect"
          value={settings.lang_err_email}
          defaultValue="Hmm... that email doesn't look right"
          onChange={(v) => updateSettings({ lang_err_email: v })}
          maxLength={216}
        />
        <LangInput
          label="If a URL is incorrect"
          value={settings.lang_err_url}
          defaultValue="Hmm… that web address doesn't look right. Check for any typos or errors."
          onChange={(v) => updateSettings({ lang_err_url: v })}
          maxLength={163}
        />
        <LangInput
          label="If respondent's suggestion isn't found in Dropdown"
          value={settings.lang_err_dropdown_empty}
          defaultValue="No suggestions found"
          onChange={(v) => updateSettings({ lang_err_dropdown_empty: v })}
          maxLength={64}
        />
        <LangInput
          label="If a phone number is not valid"
          value={settings.lang_err_phone}
          defaultValue="Hmm... that phone number doesn't look right"
          onChange={(v) => updateSettings({ lang_err_phone: v })}
          maxLength={200}
        />
      </LangSection>

      <LangSection title="Loading & completing">
        <LangInput
          label="Confirmation that form was sent"
          value={settings.lang_completion_message}
          defaultValue="All done! Thanks for your time."
          onChange={(v) => updateSettings({ lang_completion_message: v })}
          maxLength={1099}
        />
        <LangInput
          label="Error if there's a problem with the server"
          value={settings.lang_server_error}
          defaultValue="Server error! Your request wasn't completed"
          onChange={(v) => updateSettings({ lang_server_error: v })}
          maxLength={128}
        />
      </LangSection>

      <LangSection title="File upload">
        <LangInput
          label="Message to let respondent know a file is required"
          value={settings.lang_file_required}
          defaultValue="Oops! Please upload a file"
          onChange={(v) => updateSettings({ lang_file_required: v })}
          maxLength={255}
        />
        <LangInput
          label="Button that asks respondent to upload"
          value={settings.lang_file_button}
          defaultValue="Choose file"
          onChange={(v) => updateSettings({ lang_file_button: v })}
          maxLength={550}
        />
        <LangInput
          label="Hint telling respondent where to drop file"
          value={settings.lang_file_drag}
          defaultValue="or drag here"
          onChange={(v) => updateSettings({ lang_file_drag: v })}
          maxLength={35}
        />
        <LangInput
          label="Error when file exceeds size limit"
          value={settings.lang_file_too_big}
          defaultValue="Your file is too big"
          onChange={(v) => updateSettings({ lang_file_too_big: v })}
          maxLength={255}
        />
        <LangInput
          label="Message that file is still uploading"
          value={settings.lang_file_uploading}
          defaultValue="Your file is still uploading, please wait..."
          onChange={(v) => updateSettings({ lang_file_uploading: v })}
          maxLength={128}
        />
      </LangSection>

      <LangSection title="Other">
        <LangInput
          label="Hint for making a line break in Long Text"
          value={settings.lang_line_break_hint}
          defaultValue="Shift ⇧ + Enter ↵ to make a line break"
          onChange={(v) => updateSettings({ lang_line_break_hint: v })}
          maxLength={128}
        />
      </LangSection>
    </div>
  );

  // ─── Render ──────────────────────────────────────
  return (
    <div className="h-full flex flex-col flex-1">
      {/* Header */}
      <div className="px-5 pt-5 pb-0">
        <h2 className="text-[17px] font-semibold text-gray-900">
          Form settings
        </h2>
      </div>

      {/* Tabs - vertical sidebar style like Typeform */}
      <div className="flex flex-1 overflow-hidden">
        {/* Tab sidebar */}
        <div className="w-[120px] flex-shrink-0 pt-4 pl-3 pr-1 space-y-0.5 border-r border-gray-100">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-[12px] font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-[#6C5CE7]/8 text-[#6C5CE7] border-l-2 border-[#6C5CE7]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div
          className="flex-1 overflow-y-auto sidebar-scroll px-5 py-4"
          style={{ maxHeight: "calc(100vh - 120px)" }}
        >
          {activeTab === "general" && renderGeneral()}
          {activeTab === "access" && renderAccess()}
          {activeTab === "language" && renderLanguage()}
        </div>
      </div>
    </div>
  );
}
