'use client'

import React, { useState } from 'react'
import { useFormBuilder } from '@/components/providers/FormBuilderProvider'
import { Form, FormField, FieldType } from '@/types'
import { ConditionalLogicEditor } from './ConditionalLogicEditor'
import { CaptchaQuestionField } from './CaptchaQuestionField'
import { LongTextQuestionField } from './LongTextQuestionField'
import GeoRestrictionsConfig from './GeoRestrictionsConfig'
import { getDefaultGeoRestrictions, validateGeoRestrictions } from '@/lib/geo-location'
import { 
  ChevronDownIcon,
  ChevronUpIcon,
  PaintBrushIcon, 
  ShieldCheckIcon, 
  CursorArrowRaysIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
  TrashIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  ListBulletIcon,
  CheckCircleIcon,
  PencilIcon,
  MapPinIcon,
  PhotoIcon,
  PlayCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { GlobeAltIcon, NoSymbolIcon } from '@heroicons/react/24/outline'
import { ImageUploader } from '@/components/upload/ImageUploader'

interface FormBuilderInspectorProps {
  isThemeMode?: boolean
}

export function FormBuilderInspector({ isThemeMode = false }: FormBuilderInspectorProps) {
  const { state, updateField, updateForm } = useFormBuilder()
  const selectedField = state.selected_field
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  if (!selectedField) {
    return (
      <div className="h-full bg-white border-l border-gray-200 flex flex-col">
        <div className="p-3 md:p-4 border-b border-gray-200">
          <h2 className="text-sm md:text-lg font-semibold text-gray-900">
            {isThemeMode ? 'Theme Editor' : 'Form Settings'}
          </h2>
          <p className="text-xs md:text-sm text-gray-600 mt-1">
            {isThemeMode 
              ? 'Customize your form\'s appearance and styling'
              : 'Configure form-level settings and restrictions'
            }
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 md:p-4">
          {isThemeMode ? (
            <div className="text-center text-gray-500">
              <svg className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 md:mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a4 4 0 004-4V5z" />
              </svg>
              <p className="text-sm md:font-medium">Theme Editor Active</p>
              <p className="text-xs md:text-sm">Use the Theme Editor panel to customize colors, fonts, and layout</p>
            </div>
          ) : (
            <div className="space-y-4">
              <GeoRestrictionsConfig
                restrictions={validateGeoRestrictions(state.current_form?.geoRestrictions)}
                onChange={(restrictions) => updateForm({ geoRestrictions: restrictions })}
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  const handleUpdateField = (updates: Partial<FormField>) => {
    updateField(selectedField.id, updates)
  }

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const isSectionExpanded = (section: string) => expandedSections.has(section)

  const renderSectionHeader = (title: string, section: string, icon: React.ReactNode) => (
    <button
      onClick={() => toggleSection(section)}
      className="flex items-center justify-between w-full p-1.5 md:p-2 text-left hover:bg-gray-50 transition-colors"
      title={title}
    >
      <div className="flex items-center space-x-1.5 md:space-x-2">
          {icon}
        <span className="sr-only">{title}</span>
      </div>
      {isSectionExpanded(section) ? (
        <ChevronDownIcon className="w-3 h-3 text-gray-600" />
      ) : (
        <ChevronRightIcon className="w-3 h-3 text-gray-600" />
      )}
    </button>
  )

  return (
    <div className="h-full bg-white border-l border-gray-200 flex flex-col sidebar-scroll">
      {/* Header */}
      <div className="p-2 md:p-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm md:text-base font-semibold text-gray-800">Question</h2>
          </div>
          <div className="flex items-center space-x-1 md:space-x-2">
            <span className={`px-1.5 md:px-2 py-0.5 text-xs font-medium rounded-full ${
              selectedField.required 
                ? 'bg-red-100 text-red-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {selectedField.required ? 'Required' : 'Optional'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto sidebar-scroll">
        {isThemeMode && (
          /* Theme Mode - Show theme-focused banner */
          <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a4 4 0 004-4V5z" />
              </svg>
              <div>
                <p className="text-xs font-semibold text-purple-900">Theme Editor Active</p>
                <p className="text-xs text-purple-700">Use the Theme Editor panel to customize appearance</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Theme (Background & Header Colors) */}
        <div className="border-b border-gray-200">
          {renderSectionHeader('Theme', 'theme', <PaintBrushIcon className="w-4 h-4" />)}
          {isSectionExpanded('theme') && (
            <div className="p-3 space-y-3">
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Page Background Color (theme.background_color)</label>
                  <input
                    type="color"
                    value={String(state.current_form?.theme?.background_color || '#ffffff')}
                    onChange={(e) => {
                      const color = e.target.value
                      updateForm({
                        ...state.current_form,
                        theme: {
                          ...(state.current_form?.theme || {} as any),
                          background_color: color
                        }
                      })
                    }}
                    className="w-full h-9 p-0 border border-gray-200 rounded"
                    aria-label="Theme background color"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Header Color (theme.header_color)</label>
                  <input
                    type="color"
                    value={String(state.current_form?.theme?.header_color || '#ffffff')}
                    onChange={(e) => {
                      const color = e.target.value
                      updateForm({
                        ...state.current_form,
                        theme: {
                          ...(state.current_form?.theme || {} as any),
                          header_color: color
                        }
                      })
                    }}
                    className="w-full h-9 p-0 border border-gray-200 rounded"
                    aria-label="Theme header color"
                  />
                </div>
                <div className="pt-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Theme Logo (image upload)</label>
                  <div className="flex items-center gap-2">
                    <ImageUploader
                      accept="image/*"
                      maxFiles={1}
                      maxSizeMB={6}
                      onChange={(items) => {
                        const asset = items?.[0]
                        const url = asset?.remoteUrl || asset?.previewUrl || ''
                        updateForm({
                          ...state.current_form,
                          theme: {
                            ...(state.current_form?.theme || {} as any),
                            logo: url ? { url, alt: (state.current_form as any)?.theme?.logo?.alt || 'Logo' } : undefined
                          }
                        })
                      }}
                      uploadHandler={async (file) => {
                        // fallback local data URL
                        const reader = new FileReader()
                        return await new Promise<string>((resolve) => { reader.onload = () => resolve(String(reader.result)); reader.readAsDataURL(file) })
                      }}
                      compact
                    />
                    { (state.current_form as any)?.theme?.logo?.url && (
                      <button
                        className="text-[11px] px-2 py-1 rounded border hover:bg-gray-50"
                        onClick={() => updateForm({
                          ...state.current_form,
                          theme: { ...(state.current_form?.theme || {} as any), logo: undefined }
                        })}
                      >Remove</button>
                    )}
                  </div>
                  { (state.current_form as any)?.theme?.logo?.url && (
                    <div className="mt-2">
                      <label className="block text-[11px] text-gray-600 mb-1">Alt text</label>
                      <input
                        type="text"
                        value={String((state.current_form as any)?.theme?.logo?.alt || '')}
                        onChange={(e) => updateForm({
                          ...state.current_form,
                          theme: { ...(state.current_form?.theme || {} as any), logo: { ...((state.current_form as any)?.theme?.logo || {}), alt: e.target.value } }
                        })}
                        className="form-input text-xs w-full"
                        placeholder="Logo alt text"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Theme Text Logo</label>
                  <input
                    type="text"
                    value={String((state.current_form as any)?.theme?.textLogo?.text || '')}
                    onChange={(e) => updateForm({
                      ...state.current_form,
                      theme: { ...(state.current_form?.theme || {} as any), textLogo: { ...((state.current_form as any)?.theme?.textLogo || {}), text: e.target.value } }
                    })}
                    className="form-input text-xs w-full mb-2"
                    placeholder="Your brand name"
                    aria-label="Theme text logo text"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-gray-600 mb-1">Text color</label>
                      <input
                        type="color"
                        value={String((state.current_form as any)?.theme?.textLogo?.color || '#111827')}
                        onChange={(e) => updateForm({
                          ...state.current_form,
                          theme: { ...(state.current_form?.theme || {} as any), textLogo: { ...((state.current_form as any)?.theme?.textLogo || {}), color: e.target.value } }
                        })}
                        className="w-full h-9 p-0 border border-gray-200 rounded"
                        aria-label="Theme text logo color"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-600 mb-1">Font size</label>
                      <select
                        value={String((state.current_form as any)?.theme?.textLogo?.fontSize || '2xl')}
                        onChange={(e) => updateForm({
                          ...state.current_form,
                          theme: { ...(state.current_form?.theme || {} as any), textLogo: { ...((state.current_form as any)?.theme?.textLogo || {}), fontSize: e.target.value } }
                        })}
                        className="form-select text-xs w-full"
                      >
                        <option value="sm">sm</option>
                        <option value="base">base</option>
                        <option value="lg">lg</option>
                        <option value="xl">xl</option>
                        <option value="2xl">2xl</option>
                        <option value="3xl">3xl</option>
                        <option value="4xl">4xl</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <label className="block text-[11px] text-gray-600 mb-1">Font family</label>
                      <input
                        type="text"
                        value={String((state.current_form as any)?.theme?.textLogo?.fontFamily || '')}
                        onChange={(e) => updateForm({
                          ...state.current_form,
                          theme: { ...(state.current_form?.theme || {} as any), textLogo: { ...((state.current_form as any)?.theme?.textLogo || {}), fontFamily: e.target.value } }
                        })}
                        className="form-input text-xs w-full"
                        placeholder="e.g. Inter, sans-serif"
                        aria-label="Theme text logo font family"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-600 mb-1">Font weight</label>
                      <select
                        value={String((state.current_form as any)?.theme?.textLogo?.fontWeight || '700')}
                        onChange={(e) => updateForm({
                          ...state.current_form,
                          theme: { ...(state.current_form?.theme || {} as any), textLogo: { ...((state.current_form as any)?.theme?.textLogo || {}), fontWeight: e.target.value } }
                        })}
                        className="form-select text-xs w-full"
                        aria-label="Theme text logo font weight"
                      >
                        <option value="400">Regular (400)</option>
                        <option value="500">Medium (500)</option>
                        <option value="600">Semi-bold (600)</option>
                        <option value="700">Bold (700)</option>
                        <option value="800">Extra-bold (800)</option>
                        <option value="900">Black (900)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-gray-500">These apply immediately to the preview and will reflect on the published form.</p>
            </div>
          )}
        </div>
        {/* Basic Settings - simplified to Required only per spec */}
        <div className="border-b border-gray-200">
          {renderSectionHeader('Basic Settings', 'basic', <ChevronDownIcon className="w-4 h-4" />)}
          {isSectionExpanded('basic') && (
            <div className="p-2 space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                <div>
                  <label className="text-xs font-medium text-gray-800">Required Field</label>
                  <p className="text-xs text-gray-500">Make this field mandatory</p>
                </div>
                <button
                  onClick={() => handleUpdateField({ required: !selectedField.required })}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    selectedField.required ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    selectedField.required ? 'translate-x-4' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Field Type Specific Settings */}
        {renderFieldTypeSettings(selectedField, handleUpdateField, isSectionExpanded, renderSectionHeader, updateForm, state.current_form)}

        {/* Validation Settings (hidden for many types including captcha, uploads, and payment) */}
        {!(['dropdown','multiple_choice','radio','checkbox','yes_no','matrix_grid','signature_upload','date','multiple_dates','time','time_range','star_rating','rating','linear_scale','likert_scale','ranking','nps_score','nps','address','location','captcha','image_upload','file_upload','video_upload','payment','name','password','geo_restriction','cover_slide'] as any).includes(selectedField.type) && (
        <div className="border-b border-gray-200">
          {renderSectionHeader('Validation & Rules', 'validation', <ShieldCheckIcon className="w-4 h-4" />)}
          {isSectionExpanded('validation') && (
              <div className="p-2 space-y-2">
              {renderValidationSettings(selectedField, handleUpdateField)}
            </div>
          )}
        </div>
        )}

        {/* Styling Settings (hidden for many types including captcha, uploads, and payment appearance per request) */}
        {!(['dropdown','multiple_choice','radio','checkbox','yes_no','matrix_grid','signature_upload','date','multiple_dates','time','time_range','star_rating','rating','linear_scale','likert_scale','ranking','nps_score','nps','address','location','captcha','image_upload','file_upload','video_upload','payment','name','password','geo_restriction','cover_slide'] as any).includes(selectedField.type) && (
        <div className="border-b border-gray-200">
          {renderSectionHeader('Styling & Appearance', 'styling', <PaintBrushIcon className="w-4 h-4" />)}
          {isSectionExpanded('styling') && (
              <div className="p-2 space-y-2">
              {renderStylingSettings(selectedField, handleUpdateField)}
            </div>
          )}
        </div>
        )}

        {/* Conditional Logic */}
        <div className="border-b border-gray-200">
          {renderSectionHeader('Conditional Logic', 'conditional', <EyeIcon className="w-4 h-4" />)}
          {isSectionExpanded('conditional') && (
            <div className="p-3">
              <ConditionalLogicEditor
                field={selectedField}
                allFields={state.current_form?.fields || []}
                onUpdate={(conditional) => handleUpdateField({ conditional })}
                onRemove={() => handleUpdateField({ conditional: undefined })}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function renderFieldTypeSettings(field: FormField, handleUpdateField: (updates: Partial<FormField>) => void, isExpanded: (section: string) => boolean, renderSectionHeader: (title: string, section: string, icon: React.ReactNode) => React.ReactNode, updateForm: (updates: any) => void, currentForm: Form | null) {
  const fieldType = field.type

  switch (fieldType) {
    case 'cover_slide':
      return (
        <div className="border-b border-gray-200">
          {renderSectionHeader('Cover Slide', 'cover', <PhotoIcon className="w-4 h-4" />)}
          {isExpanded('cover') && (
            <div className="p-3 space-y-3">
              <div className="p-2 rounded border bg-blue-50">
                <p className="text-[11px] text-blue-700 mb-2">
                  <strong>Note:</strong> Global settings like page background, header styling, form mode, and layout have been moved to the Theme Editor (🎨 button).
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={String((field.settings as any)?.coverTitle || '')}
                  onChange={(e)=> handleUpdateField({ settings: { ...field.settings, coverTitle: e.target.value } })}
                  className="form-input text-xs w-full"
                  placeholder="Welcome"
                  aria-label="Cover title"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Subtitle / Description</label>
                <textarea
                  rows={3}
                  value={String((field.settings as any)?.coverSubtitle || '')}
                  onChange={(e)=> handleUpdateField({ settings: { ...field.settings, coverSubtitle: e.target.value } })}
                  className="form-input text-xs w-full"
                  placeholder="Tell people what this form is about"
                  aria-label="Cover subtitle"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Button label</label>
                <input
                  type="text"
                  value={String((field.settings as any)?.coverCtaText || 'Start')}
                  onChange={(e)=> handleUpdateField({ settings: { ...field.settings, coverCtaText: e.target.value } })}
                  className="form-input text-xs w-full"
                  placeholder="Start"
                  aria-label="Cover button label"
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Background color</label>
                  <input
                    type="color"
                    value={String((field.settings as any)?.coverBackgroundColor || '#0f172a')}
                    onChange={(e)=> handleUpdateField({ settings: { ...field.settings, coverBackgroundColor: e.target.value } })}
                    className="w-full h-9 p-0 border border-gray-200 rounded"
                    aria-label="Cover background color"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Start button color</label>
                  <input
                    type="color"
                    value={String((field.settings as any)?.coverButtonColor || '#111827')}
                    onChange={(e)=> handleUpdateField({ settings: { ...field.settings, coverButtonColor: e.target.value } })}
                    className="w-full h-9 p-0 border border-gray-200 rounded"
                    aria-label="Cover button color"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Background image (upload)</label>
                  <ImageUploader
                    accept="image/*"
                    maxFiles={1}
                    maxSizeMB={6}
                    onChange={(items)=> handleUpdateField({ settings: { ...field.settings, coverMediaUrl: items?.[0]?.remoteUrl || items?.[0]?.previewUrl || '' } })}
                    uploadHandler={async (file, onP)=> {
                      // Reuse default simulated upload (stored locally) or wire to real handler
                      const reader = new FileReader()
                      return await new Promise<string>((resolve) => { reader.onload = ()=> resolve(String(reader.result)); reader.readAsDataURL(file) })
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Background media URL (optional)</label>
                  <input
                    type="url"
                    value={String((field.settings as any)?.coverMediaUrl || '')}
                    onChange={(e)=> handleUpdateField({ settings: { ...field.settings, coverMediaUrl: e.target.value } })}
                    className="form-input text-xs w-full"
                    placeholder="https://... (image or video)"
                    aria-label="Cover media URL"
                  />
                </div>
              </div>

              {/* Global form settings have been moved to Theme Editor */}
            </div>
          )}
        </div>
      )
    case 'geo_restriction':
      return (
        <div className="border-b border-gray-200">
          {renderSectionHeader('Geo Restriction', 'geo', <GlobeAltIcon className="w-4 h-4" />)}
          {isExpanded('geo') && (
            <div className="p-3 space-y-3">
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Countries</label>
                  <input
                    type="text"
                    value={((field.settings as any)?.geoAllowedCountries || []).join(',')}
                    onChange={(e) => handleUpdateField({ settings: { ...field.settings, geoAllowedCountries: e.target.value.split(',').map(s=>s.trim().toUpperCase()).filter(Boolean) } })}
                    className="form-input text-xs w-full"
                    placeholder="US, GB, NG"
                    aria-label="Allowed/blocked countries"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Comma-separated ISO country codes.</p>
                </div>
                <div className="flex items-center justify-between p-2 rounded border">
                  <div>
                    <label className="text-xs font-medium text-gray-800">Mode</label>
                    <p className="text-[10px] text-gray-500">Switch between Allow-list and Block-list</p>
                  </div>
                  <div className="inline-flex items-center rounded-full border border-gray-200 overflow-hidden">
                <button
                      type="button"
                      onClick={() => handleUpdateField({ settings: { ...field.settings, geoBlockMode: 'allow' } })}
                      className={`flex items-center gap-1 px-3 py-1 text-xs ${(((field.settings as any)?.geoBlockMode || 'allow') === 'allow') ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                      aria-pressed={(((field.settings as any)?.geoBlockMode || 'allow') === 'allow')}
                    >
                      <ShieldCheckIcon className="w-3.5 h-3.5" />
                      <span>Allow</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateField({ settings: { ...field.settings, geoBlockMode: 'block' } })}
                      className={`flex items-center gap-1 px-3 py-1 text-xs ${(((field.settings as any)?.geoBlockMode || 'allow') === 'block') ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                      aria-pressed={(((field.settings as any)?.geoBlockMode || 'allow') === 'block')}
                    >
                      <NoSymbolIcon className="w-3.5 h-3.5" />
                      <span>Block</span>
                </button>
              </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Custom IP addresses</label>
                  <textarea
                    rows={3}
                    value={((field.settings as any)?.geoIpList || []).join('\n')}
                    onChange={(e) => handleUpdateField({ settings: { ...field.settings, geoIpList: e.target.value.split(/\r?\n|,/).map(s=>s.trim()).filter(Boolean) } })}
                    className="form-input text-xs w-full"
                    placeholder={"192.168.0.1\n10.0.0.2"}
                    aria-label="Custom IPs"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Separate with commas or new lines.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    case 'payment':
      return (
        <div className="border-b border-gray-200">
          {renderSectionHeader('Payment Settings', 'payment', <CurrencyDollarIcon className="w-4 h-4" />)}
          {isExpanded('payment') && (
            <div className="p-2 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={Number((field.settings as any)?.amount || 0)}
                    onChange={(e) => handleUpdateField({ settings: { ...field.settings, amount: Number(e.target.value) } })}
                    className="form-input text-xs w-full"
                    placeholder="Amount in cents"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Currency</label>
                  <select
                    value={String((field.settings as any)?.currency || 'usd')}
                    onChange={(e) => handleUpdateField({ settings: { ...field.settings, currency: e.target.value } })}
                    className="form-select text-xs w-full"
                  >
                    {['usd','eur','gbp','cad','aud'].map((c)=> (
                      <option key={c} value={c}>{c.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded border">
                <div>
                  <label className="text-xs font-medium text-gray-800">Allow custom amount</label>
                  <p className="text-[10px] text-gray-500">Let respondents enter an amount</p>
                </div>
                    <button
                  onClick={() => handleUpdateField({ settings: { ...field.settings, allowCustomAmount: !field.settings?.allowCustomAmount } })}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${field.settings?.allowCustomAmount ? 'bg-blue-600' : 'bg-gray-200'}`}
                    >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${field.settings?.allowCustomAmount ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={String((field as any)?.payment_description || '')}
                    onChange={(e) => handleUpdateField({ payment_description: e.target.value } as any)}
                    className="form-input text-xs w-full"
                    placeholder="What is this payment for?"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Blocked countries</label>
                  <input
                    type="text"
                    value={((field.settings as any)?.blockedCountries || []).join(',')}
                    onChange={(e) => handleUpdateField({ settings: { ...field.settings, blockedCountries: e.target.value.split(',').map(s=>s.trim().toUpperCase()).filter(Boolean) } })}
                    className="form-input text-xs w-full"
                    placeholder="ISO codes, e.g. US, GB, NG"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Comma-separated ISO codes to block payments from (country selection on the payment form will be restricted).</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded border">
                <div>
                  <label className="text-xs font-medium text-gray-800">Recurring payment (subscription)</label>
                  <p className="text-[10px] text-gray-500">Charge on a schedule via Stripe subscriptions</p>
                </div>
                <button
                  onClick={() => handleUpdateField({ settings: { ...field.settings, recurring: !(field.settings as any)?.recurring } })}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${(field.settings as any)?.recurring ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${(field.settings as any)?.recurring ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          )}
        </div>
      )
    case 'address':
      return null
    case 'dropdown':
      return (
        <div className="border-b border-gray-200">
          {renderSectionHeader('Options & Choices', 'options', <PlusIcon className="w-4 h-4" />)}
          {isExpanded('options') && (
            <div className="p-2 space-y-2">
              <div className="space-y-2">
                {field.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...(field.options || [])]
                        newOptions[index] = e.target.value
                        handleUpdateField({ options: newOptions })
                      }}
                      className="form-input flex-1 text-xs"
                      placeholder={`Option ${index + 1}`}
                    />
                    <button
                      onClick={() => {
                        const newOptions = field.options?.filter((_, i) => i !== index) || []
                        handleUpdateField({ options: newOptions })
                      }}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <TrashIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`]
                    handleUpdateField({ options: newOptions })
                  }}
                  className="flex items-center space-x-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-md transition-colors"
                >
                  <PlusIcon className="w-3 h-3" />
                  <span>Add Option</span>
                </button>
                {/* Removed appearance/basic extras per spec */}
              </div>
            </div>
          )}
        </div>
      )

    case 'matrix_grid':
      return (
        <div className="border-b border-gray-200">
          {renderSectionHeader('Matrix Settings', 'matrix', <ListBulletIcon className="w-4 h-4" />)}
          {isExpanded('matrix') && (
            <div className="p-2 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Rows</label>
                  <textarea
                    rows={4}
                    value={((field.settings as any)?.matrixRows || []).join('\n')}
                    onChange={(e) => handleUpdateField({ settings: { ...field.settings, matrixRows: e.target.value.split(/\r?\n/).filter(Boolean) } })}
                    className="form-input text-xs"
                    placeholder={"Enter each row on a new line\nRow 1\nRow 2"}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Columns</label>
                  <textarea
                    rows={4}
                    value={((field.settings as any)?.matrixColumns || []).join('\n')}
                    onChange={(e) => handleUpdateField({ settings: { ...field.settings, matrixColumns: e.target.value.split(/\r?\n/).filter(Boolean) } })}
                    className="form-input text-xs"
                    placeholder={"Enter each column on a new line\nCol 1\nCol 2"}
                  />
                </div>
              </div>
              {/* Removed extra appearance controls per spec */}
            </div>
          )}
        </div>
      )
    case 'multiple_choice':
    case 'radio':
    case 'checkbox':
      return (
        <div className="border-b border-gray-200">
          {renderSectionHeader('Options & Choices', 'options', <PlusIcon className="w-4 h-4" />)}
          {isExpanded('options') && (
            <div className="p-2 space-y-2">
              <div className="space-y-2">
                {field.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...(field.options || [])]
                        newOptions[index] = e.target.value
                        handleUpdateField({ options: newOptions })
                      }}
                      className="form-input flex-1 text-xs"
                      placeholder={`Option ${index + 1}`}
                    />
                    <button
                      onClick={() => {
                        const newOptions = field.options?.filter((_, i) => i !== index) || []
                        handleUpdateField({ options: newOptions })
                      }}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <TrashIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`]
                    handleUpdateField({ options: newOptions })
                  }}
                  className="flex items-center space-x-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-md transition-colors"
                >
                  <PlusIcon className="w-3 h-3" />
                  <span>Add Option</span>
                </button>
                {/* Removed appearance/basic extras per spec */}
              </div>
            </div>
          )}
        </div>
      )

    case 'yes_no':
      return (
        <div className="border-b border-gray-200">
          {renderSectionHeader('Yes/No Appearance', 'yesno', <PaintBrushIcon className="w-4 h-4" />)}
          {isExpanded('yesno') && (
            <div className="p-2 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Style</label>
                  <select
                    value={(field.settings as any)?.yesNoStyle || 'buttons'}
                    onChange={(e) => handleUpdateField({ settings: { ...field.settings, yesNoStyle: e.target.value as any } })}
                    className="form-select text-xs w-full"
                  >
                    <option value="buttons">Buttons</option>
                    <option value="cards">Cards</option>
                    <option value="chips">Chips</option>
                    <option value="toggle">Toggle</option>
                    <option value="thumbs">Thumbs</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Accent Color</label>
                  <input
                    type="color"
                    value={(field.settings as any)?.checkedColor || '#2563eb'}
                    onChange={(e) => handleUpdateField({ settings: { ...field.settings, checkedColor: e.target.value } })}
                    className="w-full h-8 p-0 border border-gray-200 rounded"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )

    case 'star_rating':
      return (
        <div className="border-b border-gray-200">
          {renderSectionHeader('Star Rating Settings', 'star_rating', <PaintBrushIcon className="w-4 h-4" />)}
          {isExpanded('star_rating') && (
            <div className="p-2 space-y-2">
                <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Max Stars</label>
                  <input
                    type="number"
                  min={1}
                  max={20}
                  value={(field.settings as any)?.maxRating || 5}
                  onChange={(e) => handleUpdateField({ settings: { ...field.settings, maxRating: Math.max(1, Math.min(20, Number(e.target.value) || 5)) } })}
                    className="form-input text-xs"
                  />
                </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Style</label>
                <select
                  value={(field.settings as any)?.ratingType || 'stars'}
                  onChange={(e) => handleUpdateField({ settings: { ...field.settings, ratingType: e.target.value as any } })}
                  className="form-select text-xs w-full"
                >
                  <option value="stars">Stars</option>
                  <option value="hearts">Hearts</option>
                  <option value="thumbs">Thumbs</option>
                  <option value="circles">Circles</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )

    case 'nps_score':
    case 'nps':
      return (
        <div className="border-b border-gray-200">
          {renderSectionHeader('NPS Settings', 'nps', <PaintBrushIcon className="w-4 h-4" />)}
          {isExpanded('nps') && (
            <div className="p-2 space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Style</label>
                <select
                  value={(field.settings as any)?.npsStyle || 'buttons'}
                  onChange={(e) => handleUpdateField({ settings: { ...field.settings, npsStyle: e.target.value as any } })}
                  className="form-select text-xs w-full"
                >
                  <option value="buttons">Buttons</option>
                  <option value="chips">Chips</option>
                  <option value="cards">Cards</option>
                  <option value="scale">Scale</option>
                  <option value="typeform">Typeform</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-2 rounded border">
                <div>
                  <label className="text-xs font-medium text-gray-800">Card View</label>
                  <p className="text-[10px] text-gray-500">More spacing and larger targets</p>
                </div>
                <button
                  onClick={() => handleUpdateField({ settings: { ...field.settings, npsCardView: !(field.settings as any)?.npsCardView } })}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${(field.settings as any)?.npsCardView ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${(field.settings as any)?.npsCardView ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Accent Color</label>
                <input
                  type="color"
                  value={(field.settings as any)?.checkedColor || '#2563eb'}
                  onChange={(e) => handleUpdateField({ settings: { ...field.settings, checkedColor: e.target.value } })}
                  className="w-full h-8 p-0 border border-gray-200 rounded"
                />
              </div>
            </div>
          )}
        </div>
      )

    case 'linear_scale':
      return (
        <div className="border-b border-gray-200">
          {renderSectionHeader('Linear Scale Settings', 'linear', <PaintBrushIcon className="w-4 h-4" />)}
          {isExpanded('linear') && (
            <div className="p-2 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Min</label>
                  <input type="number" min={0} value={(field.settings as any)?.minRating ?? 1}
                    onChange={(e) => handleUpdateField({ settings: { ...field.settings, minRating: Number(e.target.value) } })}
                    className="form-input text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Max</label>
                  <input type="number" min={1} value={(field.settings as any)?.maxRating ?? 5}
                    onChange={(e) => handleUpdateField({ settings: { ...field.settings, maxRating: Number(e.target.value) } })}
                    className="form-input text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Left Label</label>
                  <input type="text" value={(field.settings as any)?.leftLabel || 'Low'}
                    onChange={(e) => handleUpdateField({ settings: { ...field.settings, leftLabel: e.target.value } })}
                    className="form-input text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Right Label</label>
                  <input type="text" value={(field.settings as any)?.rightLabel || 'High'}
                    onChange={(e) => handleUpdateField({ settings: { ...field.settings, rightLabel: e.target.value } })}
                    className="form-input text-xs" />
                </div>
              </div>
            </div>
          )}
        </div>
      )

    case 'likert_scale':
      return (
        <div className="border-b border-gray-200">
          {renderSectionHeader('Likert Scale Settings', 'likert', <PaintBrushIcon className="w-4 h-4" />)}
          {isExpanded('likert') && (
            <div className="p-2 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Statements (rows)</label>
                <textarea rows={4} value={((field.settings as any)?.likertRows || []).join('\n')}
                  onChange={(e) => handleUpdateField({ settings: { ...field.settings, likertRows: e.target.value.split(/\r?\n/).filter(Boolean) } })}
                  className="form-input text-xs" placeholder={"Enter each statement on a new line\nStatement 1\nStatement 2"} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Scale Options (columns)</label>
                <textarea rows={3} value={((field.settings as any)?.likertCols || ['Strongly Disagree','Disagree','Neutral','Agree','Strongly Agree']).join('\n')}
                  onChange={(e) => handleUpdateField({ settings: { ...field.settings, likertCols: e.target.value.split(/\r?\n/).filter(Boolean) } })}
                  className="form-input text-xs" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Selection</label>
                <select value={(field.settings as any)?.likertSelection || 'single'}
                  onChange={(e) => handleUpdateField({ settings: { ...field.settings, likertSelection: e.target.value as any } })}
                  className="form-select text-xs w-full">
                  <option value="single">Single per row</option>
                  <option value="multiple">Multiple</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )

    case 'ranking':
      return (
        <div className="border-b border-gray-200">
          {renderSectionHeader('Ranking Settings', 'ranking', <PaintBrushIcon className="w-4 h-4" />)}
          {isExpanded('ranking') && (
            <div className="p-2 space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Items</label>
                <textarea rows={4} value={(field.options || []).join('\n')}
                  onChange={(e) => handleUpdateField({ options: e.target.value.split(/\r?\n/).filter(Boolean) })}
                  className="form-input text-xs" placeholder={"Enter each item on a new line\nItem 1\nItem 2"} />
              </div>
            </div>
          )}
        </div>
      )

    case 'signature_upload':
      return (
        <div className="border-b border-gray-200">
          {renderSectionHeader('Signature Settings', 'signature', <PencilIcon className="w-4 h-4" />)}
          {isExpanded('signature') && (
            <div className="p-2 space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Mode</label>
                <select
                  value={(field.settings as any)?.signatureMode || 'draw'}
                  onChange={(e) => handleUpdateField({ settings: { ...field.settings, signatureMode: e.target.value as any } })}
                  className="form-select text-xs w-full"
                >
                  <option value="draw">Draw</option>
                  <option value="type">Type</option>
                  <option value="upload">Upload</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Pen Size</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={(field.settings as any)?.penSize || 3}
                  onChange={(e) => handleUpdateField({ settings: { ...field.settings, penSize: Number(e.target.value) || 3 } })}
                  className="form-input text-xs"
                />
              </div>
            </div>
          )}
        </div>
      )

    case 'number':
      return null

    case 'long_text':
      return (
        <div className="p-3">
          <LongTextQuestionField
            field={{
              label: field.label,
              placeholder: field.placeholder || '',
              required: field.required,
              helpText: (field.settings as any)?.helpText || '',
              inputType: (field.settings as any)?.inputType || 'textarea',
              customInputType: (field.settings as any)?.customInputType || '',
              defaultValue: field.settings?.defaultValue?.toString() || '',
              autoComplete: (field.settings as any)?.autoComplete || '',
              rows: field.settings?.rows || 4,
              resize: field.settings?.resize || 'vertical',
              wrap: field.settings?.wrap || 'soft',
              autoGrow: field.settings?.autoGrow || false,
              showCharCounter: field.settings?.showCharCounter || false,
              minLength: field.settings?.minLength || 0,
              maxLength: field.settings?.maxLength || 0,
              validation: field.validation || [],
              exactLength: (field.settings as any)?.exactLength || 0,
              pattern: (field.settings as any)?.pattern || '',
              customRegex: (field.settings as any)?.customRegex || '',
              customErrorMessage: (field.settings as any)?.customErrorMessage || '',
              disallowSpecialChars: (field.settings as any)?.disallowSpecialChars || false,
              disallowHtml: (field.settings as any)?.disallowHtml || false,
              disallowLinks: (field.settings as any)?.disallowLinks || false,
              disallowProfanity: (field.settings as any)?.disallowProfanity || false,
              textFormatting: (field.settings as any)?.textFormatting || 'none',
              customFormatting: (field.settings as any)?.customFormatting || '',
              autoFormat: (field.settings as any)?.autoFormat || false,
              prefillFromUrl: (field.settings as any)?.prefillFromUrl || false,
              urlParamName: (field.settings as any)?.urlParamName || '',
              variableBinding: (field.settings as any)?.variableBinding || false,
              variableName: (field.settings as any)?.variableName || '',
              textColor: (field.settings as any)?.textColor || '#000000',
              backgroundColor: (field.settings as any)?.backgroundColor || '#ffffff',
              borderColor: (field.settings as any)?.borderColor || '#d1d5db',
              fontSize: (field.settings as any)?.fontSize || 14,
              borderRadius: (field.settings as any)?.borderRadius || 6,
              padding: (field.settings as any)?.padding || 12,
              smartSuggestions: (field.settings as any)?.smartSuggestions || false,
              autoSave: (field.settings as any)?.autoSave || false,
              realTimeValidation: (field.settings as any)?.realTimeValidation || false,
              characterCounter: (field.settings as any)?.characterCounter || false,
              accessibilityFeatures: (field.settings as any)?.accessibilityFeatures || [],
              autoFocus: (field.settings as any)?.autoFocus || false,
              readOnly: (field.settings as any)?.readOnly || false,
              disabled: (field.settings as any)?.disabled || false,
              clearOnSubmit: (field.settings as any)?.clearOnSubmit || false,
              preserveOnError: (field.settings as any)?.preserveOnError || false,
              spellCheck: (field.settings as any)?.spellCheck || true,
              showCondition: (field.settings as any)?.showCondition || '',
              hideCondition: (field.settings as any)?.hideCondition || '',
              webhookUrl: (field.settings as any)?.webhookUrl || '',
              apiKey: (field.settings as any)?.apiKey || '',
              customValidation: (field.settings as any)?.customValidation || ''
            }}
            onChange={(updatedField) => {
              handleUpdateField({
                label: updatedField.label,
                placeholder: updatedField.placeholder,
                required: updatedField.required,
                settings: {
                  ...field.settings,
                  helpText: updatedField.helpText,
                  inputType: updatedField.inputType,
                  customInputType: updatedField.customInputType,
                  defaultValue: updatedField.defaultValue,
                  autoComplete: updatedField.autoComplete,
                  rows: updatedField.rows,
                  resize: updatedField.resize,
                  wrap: updatedField.wrap,
                  autoGrow: updatedField.autoGrow,
                  showCharCounter: updatedField.showCharCounter,
                  minLength: updatedField.minLength,
                  maxLength: updatedField.maxLength,
                  exactLength: updatedField.exactLength,
                  pattern: updatedField.pattern,
                  customRegex: updatedField.customRegex,
                  customErrorMessage: updatedField.customErrorMessage,
                  disallowSpecialChars: updatedField.disallowSpecialChars,
                  disallowHtml: updatedField.disallowHtml,
                  disallowLinks: updatedField.disallowLinks,
                  disallowProfanity: updatedField.disallowProfanity,
                  textFormatting: updatedField.textFormatting,
                  customFormatting: updatedField.customFormatting,
                  autoFormat: updatedField.autoFormat,
                  prefillFromUrl: updatedField.prefillFromUrl,
                  urlParamName: updatedField.urlParamName,
                  variableBinding: updatedField.variableBinding,
                  variableName: updatedField.variableName,
                  textColor: updatedField.textColor,
                  backgroundColor: updatedField.backgroundColor,
                  borderColor: updatedField.borderColor,
                  fontSize: updatedField.fontSize,
                  borderRadius: updatedField.borderRadius,
                  padding: updatedField.padding,
                  smartSuggestions: updatedField.smartSuggestions,
                  autoSave: updatedField.autoSave,
                  realTimeValidation: updatedField.realTimeValidation,
                  characterCounter: updatedField.characterCounter,
                  accessibilityFeatures: updatedField.accessibilityFeatures,
                  autoFocus: updatedField.autoFocus,
                  readOnly: updatedField.readOnly,
                  disabled: updatedField.disabled,
                  clearOnSubmit: updatedField.clearOnSubmit,
                  preserveOnError: updatedField.preserveOnError,
                  spellCheck: updatedField.spellCheck,
                  showCondition: updatedField.showCondition,
                  hideCondition: updatedField.hideCondition,
                  webhookUrl: updatedField.webhookUrl,
                  apiKey: updatedField.apiKey,
                  customValidation: updatedField.customValidation
                } as any,
                validation: updatedField.validation
              })
            }}
          />
        </div>
      )

    case 'payment':
      return (
        <div className="border-b border-gray-200">
          {renderSectionHeader('Payment Settings', 'payment', <ChevronDownIcon className="w-4 h-4" />)}
          {isExpanded('payment') && (
            <div className="p-2 space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Amount (in cents)</label>
                <input
                  type="number"
                  value={field.settings?.amount || 1000}
                  onChange={(e) => handleUpdateField({ 
                    settings: { ...field.settings, amount: Number(e.target.value) }
                  })}
                  className="form-input text-xs"
                  min="0"
                  step="100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Currency</label>
                <select
                  value={field.settings?.currency || 'USD'}
                  onChange={(e) => handleUpdateField({ 
                    settings: { ...field.settings, currency: e.target.value }
                  })}
                  className="form-select text-xs"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD (C$)</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                <div>
                  <label className="text-xs font-medium text-gray-800">Allow Custom Amount</label>
                  <p className="text-xs text-gray-500">Let users enter their own amount</p>
                </div>
                <button
                  onClick={() => handleUpdateField({ 
                    settings: { ...field.settings, allowCustomAmount: !field.settings?.allowCustomAmount }
                  })}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    field.settings?.allowCustomAmount ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    field.settings?.allowCustomAmount ? 'translate-x-4' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          )}
        </div>
      )

         case 'file_upload':
    case 'image_upload':
    case 'video_upload':
       return (
         <div className="border-b border-gray-200">
          {renderSectionHeader('Upload Settings', 'upload', field.type==='image_upload' ? <PhotoIcon className="w-4 h-4" /> : field.type==='video_upload' ? <PlayCircleIcon className="w-4 h-4" /> : <DocumentTextIcon className="w-4 h-4" />)}
          {isExpanded('upload') && (
            <div className="p-2 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Max files</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={(field.settings as any)?.maxFiles || 10}
                  onChange={(e)=> handleUpdateField({ settings: { ...field.settings, maxFiles: Math.max(1, parseInt(e.target.value) || 1) } })}
                  className="form-input text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">MIME whitelist (accept string)</label>
                <input
                  type="text"
                  placeholder={field.type==='image_upload' ? 'image/*' : field.type==='video_upload' ? 'video/*' : '.pdf,.docx,.xlsx,.csv,.zip'}
                  value={(field.settings as any)?.allowedMimeList || ''}
                  onChange={(e)=> handleUpdateField({ settings: { ...field.settings, allowedMimeList: e.target.value } })}
                  className="form-input text-xs"
                />
                <p className="text-[10px] text-gray-500 mt-1">Examples: image/* | video/* | .pdf,.docx,.xlsx</p>
              </div>
             </div>
           )}
         </div>
       )

     case 'captcha':
       return (
         <div className="border-b border-gray-200">
           {renderSectionHeader('CAPTCHA Configuration', 'captcha', <ShieldCheckIcon className="w-4 h-4" />)}
           {isExpanded('captcha') && (
             <div className="p-3">
               <CaptchaQuestionField 
                 field={{
                   type: ((field.settings as Record<string, any>)?.captchaType) || 'text',
                   difficulty: ((field.settings as Record<string, any>)?.captchaDifficulty) || 'medium',
                   questionText: ((field.settings as Record<string, any>)?.captchaQuestionText) || 'Please complete the security verification',
                   customInstructions: ((field.settings as Record<string, any>)?.captchaCustomInstructions) || '',
                   caseSensitive: ((field.settings as Record<string, any>)?.captchaCaseSensitive) || false,
                   maxAttempts: ((field.settings as Record<string, any>)?.captchaMaxAttempts) || 3,
                   timeLimit: ((field.settings as Record<string, any>)?.captchaTimeLimit) || 60,
                   allowRetry: ((field.settings as Record<string, any>)?.captchaAllowRetry) || true,
                   textColor: ((field.settings as Record<string, any>)?.captchaTextColor) || '#000000',
                   backgroundColor: ((field.settings as Record<string, any>)?.captchaBackgroundColor) || '#ffffff',
                   fontSize: ((field.settings as Record<string, any>)?.captchaFontSize) || 16
                 }}
                 onChange={(captchaConfig) => {
                    const cfg = captchaConfig as Record<string, any>
                   handleUpdateField({
                     settings: {
                       ...field.settings,
                        captchaType: cfg.type,
                        captchaDifficulty: cfg.difficulty,
                        captchaQuestionText: cfg.questionText,
                        captchaCustomInstructions: cfg.customInstructions,
                        captchaCaseSensitive: cfg.caseSensitive,
                        captchaMaxAttempts: cfg.maxAttempts,
                        captchaTimeLimit: cfg.timeLimit,
                        captchaAllowRetry: cfg.allowRetry,
                        captchaTextColor: cfg.textColor,
                        captchaBackgroundColor: cfg.backgroundColor,
                        captchaFontSize: cfg.fontSize,
                     } as any
                   })
                 }}
               />
             </div>
           )}
         </div>
       )

     default:
       return null
  }
}

function renderValidationSettings(field: FormField, handleUpdateField: (updates: Partial<FormField>) => void) {
  const selectedEmailTypeRaw = ((field.settings as any)?.emailType ?? 'standard') as string
  const selectedEmailType = (selectedEmailTypeRaw === 'custom' ? 'standard' : selectedEmailTypeRaw) as string
  return (
    <div className="space-y-2">
      {field.type !== 'email' && !(['multiple_choice','radio','checkbox','dropdown'] as any).includes(field.type) && (
        <>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Minimum Length</label>
        <input
          type="number"
          value={field.settings?.minLength || ''}
          onChange={(e) => handleUpdateField({ 
            settings: { ...field.settings, minLength: e.target.value ? Number(e.target.value) : undefined }
          })}
          className="form-input text-xs"
          placeholder="No minimum"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Maximum Length</label>
        <input
          type="number"
          value={field.settings?.maxLength || ''}
          onChange={(e) => handleUpdateField({ 
            settings: { ...field.settings, maxLength: e.target.value ? Number(e.target.value) : undefined }
          })}
          className="form-input text-xs"
          placeholder="No maximum"
        />
      </div>
        </>
      )}

      {field.type === 'email' && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Email Validation</label>
          <select
            value={selectedEmailType}
            onChange={(e) => handleUpdateField({ 
              settings: { ...field.settings, emailType: e.target.value as any }
            })}
            className="form-select text-xs"
          >
            <option value="standard">Standard</option>
            <option value="strict">Strict</option>
          </select>
          {selectedEmailType === 'standard' && (
            <p className="text-xs text-gray-500 mt-1"><span className="font-medium">Standard</span>: Accepts common email formats (e.g., name@domain.com).</p>
          )}
          {selectedEmailType === 'strict' && (
            <div className="text-xs text-gray-500 mt-1 space-y-1">
              <p><span className="font-medium">Strict</span>: Tighter checks (no consecutive dots, no leading/trailing dot, requires valid TLD).</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Allowed: <span className="font-mono">user.name+tag@sub.example.co.uk</span></li>
                <li>Rejected: <span className="font-mono">a..b@domain.com</span>, <span className="font-mono">.abc@domain.com</span>, <span className="font-mono">abc@domain</span>, <span className="font-mono">abc@-example.com</span></li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function renderStylingSettings(field: FormField, handleUpdateField: (updates: Partial<FormField>) => void) {
  return (
    <div className="space-y-2">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Field Width</label>
        <select
          value={field.settings?.styling?.width || 'full'}
          onChange={(e) => handleUpdateField({ 
            settings: { 
              ...field.settings, 
              styling: { ...field.settings?.styling, width: e.target.value as 'full' | 'half' | 'third' | 'quarter' }
            }
          })}
          className="form-select text-xs"
        >
          <option value="full">Full Width</option>
          <option value="half">Half Width</option>
          <option value="third">One Third</option>
          <option value="quarter">One Quarter</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Text Alignment</label>
        <select
          value={field.settings?.styling?.textAlign || 'left'}
          onChange={(e) => handleUpdateField({ 
            settings: { 
              ...field.settings, 
              styling: { ...field.settings?.styling, textAlign: e.target.value as any }
            }
          })}
          className="form-select text-xs"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
    </div>
  )
} 