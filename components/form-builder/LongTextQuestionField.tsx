'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Plus,
  Minus,
  X,
  FileText,
  Code,
  MessageSquare,
  CheckCircle,
  XCircle,
  Volume2,
  Eye,
  Type,
  ChevronDown,
  ChevronRight,
  AlignLeft,
  Palette,
  Keyboard,
  Bell,
  Link,
  Hash,
  TextQuote,
  Wand2,
  Sparkles,
  Maximize2,
  Minimize2
} from 'lucide-react'
import type { LongTextQuestionField as LongTextQuestionFieldType, LongTextInputType, LongTextValidationType, LongTextFormatting, LongTextAccessibilityFeature, ValidationRule } from '@/types'

interface LongTextQuestionFieldProps {
  field: LongTextQuestionFieldType
  onChange: (field: LongTextQuestionFieldType) => void
}

const LongTextQuestionField: React.FC<LongTextQuestionFieldProps> = ({ field, onChange }) => {
  // State management
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic']))
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false)

  // Common styles
  const commonStyles = {
    sectionContainer: 'p-4 space-y-4',
    inputLabel: 'block text-sm font-medium text-gray-700 mb-2',
    inputGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
    checkboxContainer: 'flex items-start space-x-2 p-2 bg-gray-50 rounded-lg',
    checkboxInput: 'mt-1 rounded',
    helpText: 'text-xs text-gray-500',
    badge: 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700',
    divider: 'border-t pt-4'
  }

  // Field update handler
  const updateField = (updates: Partial<LongTextQuestionFieldType>) => {
    onChange({ ...field, ...updates })
  }

  // Section expansion handlers
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

  // Section header component
  const renderSectionHeader = (title: string, section: string, icon: React.ReactNode) => (
    <button
      onClick={() => toggleSection(section)}
      className="flex items-center justify-between w-full p-3 text-left hover:bg-gray-50 transition-colors rounded-lg"
    >
      <div className="flex items-center space-x-2">
        <span className="text-gray-500">{icon}</span>
        <span className="font-medium text-gray-900">{title}</span>
      </div>
      <span className="text-gray-500">
        {isSectionExpanded(section) ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </span>
    </button>
  )

  return (
    <div className="relative space-y-2">
      {/* Preview Button */}
      <div className="sticky top-0 z-10 flex justify-end p-2 bg-white border-b">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}
          className="flex items-center space-x-1"
        >
          {isPreviewExpanded ? (
            <>
              <Minimize2 className="w-4 h-4" />
              <span>Hide Preview</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-4 h-4" />
              <span>Show Preview</span>
            </>
          )}
        </Button>
      </div>

      {/* Preview Panel */}
      {isPreviewExpanded && (
        <div className="p-2 sm:p-4 mb-4 bg-white border rounded-lg shadow-sm">
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <label htmlFor="preview" className="block text-sm font-medium text-gray-700">
                {field.label || 'Long Text Field'}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <div className="flex flex-wrap gap-2">
                {field.readOnly && <Badge variant="outline">Read Only</Badge>}
                {field.disabled && <Badge variant="outline">Disabled</Badge>}
                {field.autoFocus && <Badge variant="outline">Auto Focus</Badge>}
                {field.spellCheck && <Badge variant="outline">Spell Check</Badge>}
              </div>
            </div>
            
            <div className="relative">
              <textarea
                id="preview"
                placeholder={field.placeholder || 'Enter your text here...'}
                defaultValue={field.defaultValue}
                rows={field.rows}
                style={{
                  fontSize: `${field.fontSize}px`,
                  borderRadius: `${field.borderRadius}px`,
                  padding: `${field.padding}px`,
                  color: field.textColor,
                  backgroundColor: field.backgroundColor,
                  borderColor: field.borderColor,
                  resize: field.resize,
                  width: '100%',
                  border: `1px solid ${field.borderColor}`,
                  fontFamily: 'inherit',
                  minHeight: '120px'
                }}
                disabled={field.disabled}
                readOnly={field.readOnly}
                autoFocus={field.autoFocus}
                spellCheck={field.spellCheck}
                autoComplete={field.autoComplete || undefined}
                wrap={field.wrap}
                className="transition-shadow duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              />
              {field.showCharCounter && (
                <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white bg-opacity-75 px-2 py-1 rounded">
                  Character count: 0
                </div>
              )}
            </div>
            
            {field.helpText && (
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{field.helpText}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-4 text-xs text-gray-500">
              <div className="p-2 bg-gray-50 rounded">
                <span className="font-medium">Input Type:</span> {field.inputType}
              </div>
              {field.minLength && (
                <div className="p-2 bg-gray-50 rounded">
                  <span className="font-medium">Min Length:</span> {field.minLength}
                </div>
              )}
              {field.maxLength && (
                <div className="p-2 bg-gray-50 rounded">
                  <span className="font-medium">Max Length:</span> {field.maxLength}
                </div>
              )}
              {field.textFormatting !== 'none' && (
                <div className="p-2 bg-gray-50 rounded">
                  <span className="font-medium">Formatting:</span> {field.textFormatting}
                </div>
              )}
              {field.variableBinding && field.variableName && (
                <div className="p-2 bg-gray-50 rounded">
                  <span className="font-medium">Variable:</span> {field.variableName}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Configuration Sections */}
      <div className="space-y-1 bg-white rounded-lg border divide-y">
        {/* Basic Settings */}
        <div>
          {renderSectionHeader('Basic Settings', 'basic', <TextQuote className="w-4 h-4" />)}
          {isSectionExpanded('basic') && (
            <div className="p-4 space-y-4">
              <div>
                <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-2">Field Label</label>
                <Input
                  id="label"
                  value={field.label}
                  onChange={(e) => updateField({ label: e.target.value })}
                  placeholder="Enter field label"
                />
              </div>
              
              <div>
                <label htmlFor="placeholder" className="block text-sm font-medium text-gray-700 mb-2">Placeholder Text</label>
                <Input
                  id="placeholder"
                  value={field.placeholder}
                  onChange={(e) => updateField({ placeholder: e.target.value })}
                  placeholder="Enter placeholder text"
                />
              </div>

              <div>
                <label htmlFor="helpText" className="block text-sm font-medium text-gray-700 mb-2">Help Text</label>
                <Input
                  id="helpText"
                  value={field.helpText}
                  onChange={(e) => updateField({ helpText: e.target.value })}
                  placeholder="Enter help text"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={field.required}
                  onChange={(e) => updateField({ required: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="required" className="text-sm font-medium text-gray-700">Required field</label>
              </div>
            </div>
          )}
        </div>

        {/* Input Settings */}
        <div>
          {renderSectionHeader('Input Settings', 'input', <AlignLeft className="w-4 h-4" />)}
          {isSectionExpanded('input') && (
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Input Type</label>
                <Select value={field.inputType} onValueChange={(value: string) => updateField({ inputType: value as LongTextInputType })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select input type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="textarea">Text Area</SelectItem>
                    <SelectItem value="rich_text">Rich Text</SelectItem>
                    <SelectItem value="markdown">Markdown</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="plain_text">Plain Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="rows" className="block text-sm font-medium text-gray-700 mb-2">Number of Rows</label>
                  <Input
                    id="rows"
                    type="number"
                    value={field.rows}
                    onChange={(e) => updateField({ rows: parseInt(e.target.value) || 4 })}
                    min="1"
                    max="20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Resize Behavior</label>
                  <Select value={field.resize} onValueChange={(value: string) => updateField({ resize: value as 'none' | 'both' | 'horizontal' | 'vertical' })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select resize behavior" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                      <SelectItem value="horizontal">Horizontal</SelectItem>
                      <SelectItem value="vertical">Vertical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Text Wrap</label>
                  <Select value={field.wrap} onValueChange={(value: string) => updateField({ wrap: value as 'soft' | 'hard' | 'off' })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select text wrap" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="soft">Soft Wrap</SelectItem>
                      <SelectItem value="hard">Hard Wrap</SelectItem>
                      <SelectItem value="off">No Wrap</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="autoComplete" className="block text-sm font-medium text-gray-700 mb-2">Auto-complete</label>
                  <Input
                    id="autoComplete"
                    value={field.autoComplete}
                    onChange={(e) => updateField({ autoComplete: e.target.value })}
                    placeholder="e.g., name, email, tel"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoGrow"
                    checked={field.autoGrow}
                    onChange={(e) => updateField({ autoGrow: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="autoGrow" className="text-sm font-medium text-gray-700">Auto-grow with content</label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showCharCounter"
                    checked={field.showCharCounter}
                    onChange={(e) => updateField({ showCharCounter: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="showCharCounter" className="text-sm font-medium text-gray-700">Show character counter</label>
                </div>
              </div>

              <div>
                <label htmlFor="defaultValue" className="block text-sm font-medium text-gray-700 mb-2">Default Value</label>
                <textarea
                  id="defaultValue"
                  value={field.defaultValue}
                  onChange={(e) => updateField({ defaultValue: e.target.value })}
                  placeholder="Enter default value"
                  className="w-full p-2 border rounded-md"
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>

        {/* Validation Settings */}
        <div>
          {renderSectionHeader('Validation Rules', 'validation', <CheckCircle className="w-4 h-4" />)}
          {isSectionExpanded('validation') && (
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Add Validation Rule</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newRule: ValidationRule = { type: 'min_length', value: 10, message: '' }
                      updateField({ validation: [...field.validation, newRule] })
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Min Length
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newRule: ValidationRule = { type: 'max_length', value: 1000, message: '' }
                      updateField({ validation: [...field.validation, newRule] })
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Max Length
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newRule: ValidationRule = { type: 'required', value: '', message: '' }
                      updateField({ validation: [...field.validation, newRule] })
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Required
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {field.validation.map((rule, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded">
                    <Badge variant="secondary">{rule.type}</Badge>
                    {rule.type === 'min_length' || rule.type === 'max_length' || rule.type === 'exact_length' ? (
                      <Input
                        type="number"
                        value={rule.value as number}
                        onChange={(e) => {
                          const newValidation = [...field.validation]
                          newValidation[index] = { ...rule, value: parseInt(e.target.value) || 0 }
                          updateField({ validation: newValidation })
                        }}
                        className="w-20"
                      />
                    ) : (
                      <Input
                        value={rule.value as string}
                        onChange={(e) => {
                          const newValidation = [...field.validation]
                          newValidation[index] = { ...rule, value: e.target.value }
                          updateField({ validation: newValidation })
                        }}
                        className="flex-1"
                      />
                    )}
                    <Input
                      value={rule.message}
                      onChange={(e) => {
                        const newValidation = [...field.validation]
                        newValidation[index] = { ...rule, message: e.target.value }
                        updateField({ validation: newValidation })
                      }}
                      placeholder="Error message"
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newValidation = field.validation.filter((_, i) => i !== index)
                        updateField({ validation: newValidation })
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="disallowSpecialChars"
                    checked={field.disallowSpecialChars}
                    onChange={(e) => updateField({ disallowSpecialChars: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="disallowSpecialChars" className="text-sm font-medium text-gray-700">Disallow special characters</label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="disallowHtml"
                    checked={field.disallowHtml}
                    onChange={(e) => updateField({ disallowHtml: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="disallowHtml" className="text-sm font-medium text-gray-700">Disallow HTML tags</label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="disallowLinks"
                    checked={field.disallowLinks}
                    onChange={(e) => updateField({ disallowLinks: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="disallowLinks" className="text-sm font-medium text-gray-700">Disallow links</label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="disallowProfanity"
                    checked={field.disallowProfanity}
                    onChange={(e) => updateField({ disallowProfanity: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="disallowProfanity" className="text-sm font-medium text-gray-700">Disallow profanity</label>
                </div>
              </div>

              <div>
                <label htmlFor="customErrorMessage" className="block text-sm font-medium text-gray-700 mb-2">Custom Error Message</label>
                <Input
                  id="customErrorMessage"
                  value={field.customErrorMessage}
                  onChange={(e) => updateField({ customErrorMessage: e.target.value })}
                  placeholder="Enter custom error message"
                />
              </div>
            </div>
          )}
        </div>

        {/* Formatting Settings */}
        <div>
          {renderSectionHeader('Text Formatting', 'formatting', <Type className="w-4 h-4" />)}
          {isSectionExpanded('formatting') && (
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Text Formatting</label>
                <Select value={field.textFormatting} onValueChange={(value: string) => updateField({ textFormatting: value as LongTextFormatting })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select formatting" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="uppercase">Uppercase</SelectItem>
                    <SelectItem value="lowercase">Lowercase</SelectItem>
                    <SelectItem value="capitalize">Capitalize</SelectItem>
                    <SelectItem value="title_case">Title Case</SelectItem>
                    <SelectItem value="remove_spaces">Remove Spaces</SelectItem>
                    <SelectItem value="trim">Trim</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {field.textFormatting === 'custom' && (
                <div>
                  <label htmlFor="customFormatting" className="block text-sm font-medium text-gray-700 mb-2">Custom Formatting</label>
                  <Input
                    id="customFormatting"
                    value={field.customFormatting}
                    onChange={(e) => updateField({ customFormatting: e.target.value })}
                    placeholder="Enter custom formatting rule"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoFormat"
                  checked={field.autoFormat}
                  onChange={(e) => updateField({ autoFormat: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="autoFormat" className="text-sm font-medium text-gray-700">Auto-format on input</label>
              </div>
            </div>
          )}
        </div>

        {/* Advanced Settings */}
        <div>
          {renderSectionHeader('Advanced Features', 'advanced', <Wand2 className="w-4 h-4" />)}
          {isSectionExpanded('advanced') && (
            <div className={commonStyles.sectionContainer}>
              <div className={commonStyles.inputGrid}>
                {[
                  {
                    id: 'smartSuggestions',
                    label: 'Smart suggestions',
                    description: 'Show intelligent input suggestions'
                  },
                  {
                    id: 'autoSave',
                    label: 'Auto-save',
                    description: 'Save input automatically'
                  },
                  {
                    id: 'realTimeValidation',
                    label: 'Real-time validation',
                    description: 'Validate as user types'
                  },
                  {
                    id: 'characterCounter',
                    label: 'Character counter',
                    description: 'Show character count'
                  },
                  {
                    id: 'autoFocus',
                    label: 'Auto-focus',
                    description: 'Focus field on page load'
                  },
                  {
                    id: 'readOnly',
                    label: 'Read-only',
                    description: 'Make field read-only'
                  },
                  {
                    id: 'disabled',
                    label: 'Disabled',
                    description: 'Disable field interaction'
                  },
                  {
                    id: 'clearOnSubmit',
                    label: 'Clear on submit',
                    description: 'Clear field after form submission'
                  },
                  {
                    id: 'preserveOnError',
                    label: 'Preserve on error',
                    description: 'Keep value when validation fails'
                  },
                  {
                    id: 'spellCheck',
                    label: 'Spell check',
                    description: 'Enable browser spell checking'
                  }
                ].map(({ id, label, description }) => (
                  <div key={id} className={commonStyles.checkboxContainer}>
                    <input
                      type="checkbox"
                      id={id}
                      checked={field[id as keyof typeof field] as boolean}
                      onChange={(e) => updateField({ [id]: e.target.checked } as any)}
                      className={commonStyles.checkboxInput}
                    />
                    <div>
                      <label htmlFor={id} className={commonStyles.inputLabel}>{label}</label>
                      <p className={commonStyles.helpText}>{description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className={commonStyles.divider}>
                <div className={commonStyles.checkboxContainer}>
                  <input
                    type="checkbox"
                    id="prefillFromUrl"
                    checked={field.prefillFromUrl}
                    onChange={(e) => updateField({ prefillFromUrl: e.target.checked })}
                    className={commonStyles.checkboxInput}
                  />
                  <div>
                    <label htmlFor="prefillFromUrl" className={commonStyles.inputLabel}>Prefill from URL parameter</label>
                    <p className={commonStyles.helpText}>Auto-fill field value from URL query parameter</p>
                  </div>
                </div>

                {field.prefillFromUrl && (
                  <div>
                    <label htmlFor="urlParamName" className="block text-sm font-medium text-gray-700 mb-2">URL Parameter Name</label>
                    <Input
                      id="urlParamName"
                      value={field.urlParamName}
                      onChange={(e) => updateField({ urlParamName: e.target.value })}
                      placeholder="e.g., name, email"
                    />
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    id="variableBinding"
                    checked={field.variableBinding}
                    onChange={(e) => updateField({ variableBinding: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="variableBinding" className="text-sm font-medium text-gray-700">Variable binding</label>
                </div>

                {field.variableBinding && (
                  <div>
                    <label htmlFor="variableName" className="block text-sm font-medium text-gray-700 mb-2">Variable Name</label>
                    <Input
                      id="variableName"
                      value={field.variableName}
                      onChange={(e) => updateField({ variableName: e.target.value })}
                      placeholder="e.g., user_name, email_address"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Styling Settings */}
        <div>
          {renderSectionHeader('Visual Settings', 'styling', <Palette className="w-4 h-4" />)}
          {isSectionExpanded('styling') && (
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="fontSize" className="block text-sm font-medium text-gray-700 mb-2">Font Size (px)</label>
                  <Input
                    id="fontSize"
                    type="number"
                    value={field.fontSize}
                    onChange={(e) => updateField({ fontSize: parseInt(e.target.value) || 14 })}
                    min="8"
                    max="32"
                  />
                </div>

                <div>
                  <label htmlFor="borderRadius" className="block text-sm font-medium text-gray-700 mb-2">Border Radius (px)</label>
                  <Input
                    id="borderRadius"
                    type="number"
                    value={field.borderRadius}
                    onChange={(e) => updateField({ borderRadius: parseInt(e.target.value) || 6 })}
                    min="0"
                    max="20"
                  />
                </div>

                <div>
                  <label htmlFor="padding" className="block text-sm font-medium text-gray-700 mb-2">Padding (px)</label>
                  <Input
                    id="padding"
                    type="number"
                    value={field.padding}
                    onChange={(e) => updateField({ padding: parseInt(e.target.value) || 12 })}
                    min="0"
                    max="32"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="textColor" className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                  <Input
                    id="textColor"
                    type="color"
                    value={field.textColor}
                    onChange={(e) => updateField({ textColor: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="backgroundColor" className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={field.backgroundColor}
                    onChange={(e) => updateField({ backgroundColor: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="borderColor" className="block text-sm font-medium text-gray-700 mb-2">Border Color</label>
                  <Input
                    id="borderColor"
                    type="color"
                    value={field.borderColor}
                    onChange={(e) => updateField({ borderColor: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Accessibility Settings */}
        <div>
          {renderSectionHeader('Accessibility', 'accessibility', <Eye className="w-4 h-4" />)}
          {isSectionExpanded('accessibility') && (
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Features</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'aria_label', label: 'ARIA Label', icon: <Eye className="w-4 h-4" /> },
                    { value: 'aria_describedby', label: 'ARIA Described By', icon: <MessageSquare className="w-4 h-4" /> },
                    { value: 'aria_required', label: 'ARIA Required', icon: <CheckCircle className="w-4 h-4" /> },
                    { value: 'aria_invalid', label: 'ARIA Invalid', icon: <XCircle className="w-4 h-4" /> },
                    { value: 'screen_reader_text', label: 'Screen Reader Text', icon: <Volume2 className="w-4 h-4" /> },
                    { value: 'high_contrast', label: 'High Contrast', icon: <Eye className="w-4 h-4" /> },
                    { value: 'large_text', label: 'Large Text', icon: <Type className="w-4 h-4" /> },
                    { value: 'keyboard_navigation', label: 'Keyboard Navigation', icon: <Settings className="w-4 h-4" /> }
                  ].map((feature) => (
                    <Button
                      key={feature.value}
                      size="sm"
                      variant={field.accessibilityFeatures.includes(feature.value as LongTextAccessibilityFeature) ? "default" : "outline"}
                      onClick={() => {
                        if (field.accessibilityFeatures.includes(feature.value as LongTextAccessibilityFeature)) {
                          updateField({
                            accessibilityFeatures: field.accessibilityFeatures.filter(f => f !== feature.value)
                          })
                        } else {
                          updateField({
                            accessibilityFeatures: [...field.accessibilityFeatures, feature.value as LongTextAccessibilityFeature]
                          })
                        }
                      }}
                      className="justify-start"
                    >
                      {feature.icon}
                      <span className="ml-2">{feature.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {field.accessibilityFeatures.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Selected Features</label>
                  <div className="flex flex-wrap gap-2">
                    {field.accessibilityFeatures.map((feature) => (
                      <Badge key={feature} variant="secondary">
                        {feature.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Close the main container */}
      </div>
    </div>
  )
}

export { LongTextQuestionField }
export default LongTextQuestionField
