'use client'

import React from 'react'
import { 
  Cog6ToothIcon, 
  PaintBrushIcon, 
  CursorArrowRaysIcon, 
  ShieldCheckIcon, 
  EyeIcon, 
  WrenchScrewdriverIcon 
} from '@heroicons/react/24/outline'
import { FormField } from '@/types'

interface MultipleChoiceConfigProps {
  field: FormField
  updateField: (updates: Partial<FormField>) => void
}

export default function MultipleChoiceConfig({ field, updateField }: MultipleChoiceConfigProps) {
  const updateSettings = (updates: any) => {
    updateField({
      settings: {
        ...field.settings,
        ...updates
      }
    })
  }

  const updateValidation = (updates: any) => {
    updateSettings({
      validation: {
        ...field.settings?.validation,
        ...updates
      }
    })
  }

  const updateBehavior = (updates: any) => {
    updateSettings({
      behavior: {
        ...field.settings?.behavior,
        ...updates
      }
    })
  }

  const updateStyling = (updates: any) => {
    updateSettings({
      styling: {
        ...field.settings?.styling,
        ...updates
      }
    })
  }

  const updateAccessibility = (updates: any) => {
    updateSettings({
      accessibility: {
        ...field.settings?.accessibility,
        ...updates
      }
    })
  }

  const updateIntegration = (updates: any) => {
    updateSettings({
      integration: {
        ...field.settings?.integration,
        ...updates
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Basic Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Cog6ToothIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Basic Settings</h3>
        </div>
        
        <div className="space-y-4">
          {/* Multiple Choice Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Multiple Choice Type
            </label>
            <select
              value={field.settings?.multipleChoiceType || 'radio'}
              onChange={(e) => updateSettings({
                multipleChoiceType: e.target.value as any
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            >
              <option value="radio">Single Selection (Radio)</option>
              <option value="checkbox">Multiple Selection (Checkbox)</option>
              <option value="buttons">Button Group</option>
              <option value="cards">Card Selection</option>
              <option value="dropdown">Dropdown List</option>
            </select>
          </div>

          {/* Default Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Value
            </label>
            <input
              type="text"
              value={field.settings?.defaultValue || ''}
              onChange={(e) => updateSettings({
                defaultValue: e.target.value
              })}
              placeholder="Enter default selected option"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            />
          </div>

          {/* Layout */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Layout
            </label>
            <select
              value={field.settings?.layout || 'vertical'}
              onChange={(e) => updateSettings({
                layout: e.target.value as any
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            >
              <option value="vertical">Vertical Stack</option>
              <option value="horizontal">Horizontal Row</option>
              <option value="grid">Grid Layout</option>
              <option value="inline">Inline</option>
            </select>
          </div>

          {/* Max Selections */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Selections
            </label>
            <input
              type="number"
              min="1"
              value={field.settings?.maxSelections || ''}
              onChange={(e) => updateSettings({
                maxSelections: e.target.value ? parseInt(e.target.value) : undefined
              })}
              placeholder="No limit"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            />
          </div>

          {/* Show "Other" Option */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showOther"
              checked={field.settings?.showOther || false}
              onChange={(e) => updateSettings({
                showOther: e.target.checked
              })}
              className="h-4 w-4 text-[#6C5CE7] focus:ring-[#6C5CE7] border-gray-300 rounded"
            />
            <label htmlFor="showOther" className="ml-2 block text-sm text-gray-900">
              Show "Other" option with text input
            </label>
          </div>

          {/* Randomize Options */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="randomizeOptions"
              checked={field.settings?.randomizeOptions || false}
              onChange={(e) => updateSettings({
                randomizeOptions: e.target.checked
              })}
              className="h-4 w-4 text-[#6C5CE7] focus:ring-[#6C5CE7] border-gray-300 rounded"
            />
            <label htmlFor="randomizeOptions" className="ml-2 block text-sm text-gray-900">
              Randomize option order
            </label>
          </div>
        </div>
      </div>

      {/* Styling Options */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <PaintBrushIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Styling</h3>
        </div>
        
        <div className="space-y-4">
          {/* Option Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Option Style
            </label>
            <select
              value={field.settings?.optionStyle || 'default'}
              onChange={(e) => updateSettings({
                optionStyle: e.target.value as any
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            >
              <option value="default">Default</option>
              <option value="cards">Cards</option>
              <option value="buttons">Buttons</option>
              <option value="minimal">Minimal</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Selected State Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selected State Color
            </label>
            <input
              type="color"
              value={field.settings?.selectedColor || '#6C5CE7'}
              onChange={(e) => updateSettings({
                selectedColor: e.target.value
              })}
              className="w-full h-10 border border-gray-300 rounded-md"
            />
          </div>

          {/* Hover State Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hover State Color
            </label>
            <input
              type="color"
              value={field.settings?.hoverColor || '#F8F9FA'}
              onChange={(e) => updateSettings({
                hoverColor: e.target.value
              })}
              className="w-full h-10 border border-gray-300 rounded-md"
            />
          </div>

          {/* Border Radius */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Border Radius
            </label>
            <select
              value={field.settings?.borderRadius || 'medium'}
              onChange={(e) => updateSettings({
                borderRadius: e.target.value as any
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            >
              <option value="none">None</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="full">Full</option>
            </select>
          </div>

          {/* Spacing */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Option Spacing
            </label>
            <select
              value={field.settings?.spacing || 'normal'}
              onChange={(e) => updateSettings({
                spacing: e.target.value as any
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            >
              <option value="compact">Compact</option>
              <option value="normal">Normal</option>
              <option value="loose">Loose</option>
            </select>
          </div>
        </div>
      </div>

      {/* Behavior Options */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <CursorArrowRaysIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Behavior</h3>
        </div>
        
        <div className="space-y-4">
          {/* Auto Focus */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoFocus"
              checked={field.settings?.behavior?.autoFocus || false}
              onChange={(e) => updateBehavior({
                autoFocus: e.target.checked
              })}
              className="h-4 w-4 text-[#6C5CE7] focus:ring-[#6C5CE7] border-gray-300 rounded"
            />
            <label htmlFor="autoFocus" className="ml-2 block text-sm text-gray-900">
              Auto-focus on first option
            </label>
          </div>

          {/* Required */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="required"
              checked={field.required}
              onChange={(e) => updateField({
                required: e.target.checked
              })}
              className="h-4 w-4 text-[#6C5CE7] focus:ring-[#6C5CE7] border-gray-300 rounded"
            />
            <label htmlFor="required" className="ml-2 block text-sm text-gray-900">
              Required field
            </label>
          </div>

          {/* Disabled */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="disabled"
              checked={field.settings?.behavior?.disabled || false}
              onChange={(e) => updateBehavior({
                disabled: e.target.checked
              })}
              className="h-4 w-4 text-[#6C5CE7] focus:ring-[#6C5CE7] border-gray-300 rounded"
            />
            <label htmlFor="disabled" className="ml-2 block text-sm text-gray-900">
              Disabled
            </label>
          </div>

          {/* Clear Selection */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="allowClear"
              checked={field.settings?.allowClear || false}
              onChange={(e) => updateSettings({
                allowClear: e.target.checked
              })}
              className="h-4 w-4 text-[#6C5CE7] focus:ring-[#6C5CE7] border-gray-300 rounded"
            />
            <label htmlFor="allowClear" className="ml-2 block text-sm text-gray-900">
              Allow clearing selection
            </label>
          </div>

          {/* Show Selection Count */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showSelectionCount"
              checked={field.settings?.showSelectionCount || false}
              onChange={(e) => updateSettings({
                showSelectionCount: e.target.checked
              })}
              className="h-4 w-4 text-[#6C5CE7] focus:ring-[#6C5CE7] border-gray-300 rounded"
            />
            <label htmlFor="showSelectionCount" className="ml-2 block text-sm text-gray-900">
              Show selection count
            </label>
          </div>
        </div>
      </div>

      {/* Validation Options */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheckIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Validation</h3>
        </div>
        
        <div className="space-y-4">
          {/* Minimum Selections */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Selections
            </label>
            <input
              type="number"
              min="0"
              value={field.settings?.validation?.minSelections || ''}
              onChange={(e) => updateValidation({
                minSelections: e.target.value ? parseInt(e.target.value) : undefined
              })}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            />
          </div>

          {/* Maximum Selections */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Selections
            </label>
            <input
              type="number"
              min="1"
              value={field.settings?.validation?.maxSelections || ''}
              onChange={(e) => updateValidation({
                maxSelections: e.target.value ? parseInt(e.target.value) : undefined
              })}
              placeholder="No limit"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            />
          </div>

          {/* Custom Validation Pattern */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Validation Pattern
            </label>
            <input
              type="text"
              value={field.settings?.validation?.customRules?.[0]?.pattern || ''}
              onChange={(e) => updateValidation({
                customRules: [{
                  type: 'pattern',
                  value: e.target.value,
                  message: 'Invalid selection'
                }]
              })}
              placeholder="Enter regex pattern"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            />
          </div>

          {/* Error Messages */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Error Messages</h4>
            
            <div>
              <label className="block text-xs text-gray-600 mb-1">Required</label>
              <input
                type="text"
                value={field.settings?.validation?.errorMessages?.required || ''}
                onChange={(e) => updateValidation({
                  errorMessages: {
                    ...field.settings?.validation?.errorMessages,
                    required: e.target.value
                  }
                })}
                placeholder="This field is required"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Minimum Selections</label>
              <input
                type="text"
                value={field.settings?.validation?.errorMessages?.minSelections || ''}
                onChange={(e) => updateValidation({
                  errorMessages: {
                    ...field.settings?.validation?.errorMessages,
                    minSelections: e.target.value
                  }
                })}
                placeholder="Please select at least {min} options"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Maximum Selections</label>
              <input
                type="text"
                value={field.settings?.validation?.errorMessages?.maxSelections || ''}
                onChange={(e) => updateValidation({
                  errorMessages: {
                    ...field.settings?.validation?.errorMessages,
                    maxSelections: e.target.value
                  }
                })}
                placeholder="Please select no more than {max} options"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Accessibility Options */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <EyeIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Accessibility</h3>
        </div>
        
        <div className="space-y-4">
          {/* ARIA Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ARIA Label
            </label>
            <input
              type="text"
              value={field.settings?.accessibility?.ariaLabel || ''}
              onChange={(e) => updateAccessibility({
                ariaLabel: e.target.value
              })}
              placeholder="Enter ARIA label for screen readers"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            />
          </div>

          {/* ARIA Described By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ARIA Described By
            </label>
            <input
              type="text"
              value={field.settings?.accessibility?.ariaDescribedBy || ''}
              onChange={(e) => updateAccessibility({
                ariaDescribedBy: e.target.value
              })}
              placeholder="ID of element that describes this field"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            />
          </div>

          {/* Tab Index */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tab Index
            </label>
            <input
              type="number"
              value={field.settings?.accessibility?.tabIndex || ''}
              onChange={(e) => updateAccessibility({
                tabIndex: e.target.value ? parseInt(e.target.value) : undefined
              })}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ARIA Role
            </label>
            <select
              value={field.settings?.accessibility?.role || 'radiogroup'}
              onChange={(e) => updateAccessibility({
                role: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            >
              <option value="radiogroup">Radio Group</option>
              <option value="group">Group</option>
              <option value="listbox">List Box</option>
              <option value="menu">Menu</option>
            </select>
          </div>
        </div>
      </div>

      {/* Integration Options */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <WrenchScrewdriverIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Integration</h3>
        </div>
        
        <div className="space-y-4">
          {/* Webhook URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Webhook URL
            </label>
            <input
              type="url"
              value={field.settings?.integration?.webhookUrl || ''}
              onChange={(e) => updateIntegration({
                webhookUrl: e.target.value
              })}
              placeholder="https://api.example.com/webhook"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            />
          </div>

          {/* Custom CSS */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom CSS
            </label>
            <textarea
              value={field.settings?.integration?.customCSS || ''}
              onChange={(e) => updateIntegration({
                customCSS: e.target.value
              })}
              placeholder="Enter custom CSS for this field"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            />
          </div>

          {/* Custom JavaScript */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom JavaScript
            </label>
            <textarea
              value={field.settings?.integration?.customJS || ''}
              onChange={(e) => updateIntegration({
                customJS: e.target.value
              })}
              placeholder="Enter custom JavaScript for this field"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            />
          </div>
        </div>
      </div>
    </div>
  )
} 