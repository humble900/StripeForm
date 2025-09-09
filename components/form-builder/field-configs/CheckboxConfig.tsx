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

interface CheckboxConfigProps {
  field: FormField
  updateField: (updates: Partial<FormField>) => void
}

export default function CheckboxConfig({ field, updateField }: CheckboxConfigProps) {
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
          {/* Checkbox Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Checkbox Type
            </label>
            <select
              value={field.settings?.checkboxType || 'single'}
              onChange={(e) => updateSettings({
                checkboxType: e.target.value as any
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            >
              <option value="single">Single Checkbox</option>
              <option value="multiple">Multiple Checkboxes</option>
              <option value="toggle">Toggle Switch</option>
              <option value="custom">Custom Style</option>
            </select>
          </div>

          {/* Default Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Value
            </label>
            <select
              value={field.settings?.defaultValue || 'unchecked'}
              onChange={(e) => updateSettings({
                defaultValue: e.target.value as any
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            >
              <option value="unchecked">Unchecked</option>
              <option value="checked">Checked</option>
              <option value="indeterminate">Indeterminate</option>
            </select>
          </div>

          {/* Label Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Label Position
            </label>
            <select
              value={field.settings?.labelPosition || 'right'}
              onChange={(e) => updateSettings({
                labelPosition: e.target.value as any
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            >
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>

          {/* Checkbox Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Checkbox Size
            </label>
            <select
              value={field.settings?.checkboxSize || 'medium'}
              onChange={(e) => updateSettings({
                checkboxSize: e.target.value as any
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="custom">Custom</option>
            </select>
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

          {/* Indeterminate State */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="allowIndeterminate"
              checked={field.settings?.allowIndeterminate || false}
              onChange={(e) => updateSettings({
                allowIndeterminate: e.target.checked
              })}
              className="h-4 w-4 text-[#6C5CE7] focus:ring-[#6C5CE7] border-gray-300 rounded"
            />
            <label htmlFor="allowIndeterminate" className="ml-2 block text-sm text-gray-900">
              Allow indeterminate state
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
          {/* Checkbox Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Checkbox Style
            </label>
            <select
              value={field.settings?.checkboxStyle || 'default'}
              onChange={(e) => updateSettings({
                checkboxStyle: e.target.value as any
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            >
              <option value="default">Default</option>
              <option value="rounded">Rounded</option>
              <option value="square">Square</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Checked Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Checked Color
            </label>
            <input
              type="color"
              value={field.settings?.checkedColor || '#6C5CE7'}
              onChange={(e) => updateSettings({
                checkedColor: e.target.value
              })}
              className="w-full h-10 border border-gray-300 rounded-md"
            />
          </div>

          {/* Unchecked Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unchecked Color
            </label>
            <input
              type="color"
              value={field.settings?.uncheckedColor || '#D1D5DB'}
              onChange={(e) => updateSettings({
                uncheckedColor: e.target.value
              })}
              className="w-full h-10 border border-gray-300 rounded-md"
            />
          </div>

          {/* Border Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Border Color
            </label>
            <input
              type="color"
              value={field.settings?.borderColor || '#9CA3AF'}
              onChange={(e) => updateSettings({
                borderColor: e.target.value
              })}
              className="w-full h-10 border border-gray-300 rounded-md"
            />
          </div>

          {/* Border Width */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Border Width
            </label>
            <select
              value={field.settings?.borderWidth || '1px'}
              onChange={(e) => updateSettings({
                borderWidth: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            >
              <option value="0px">None</option>
              <option value="1px">Thin</option>
              <option value="2px">Medium</option>
              <option value="3px">Thick</option>
            </select>
          </div>

          {/* Animation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Animation
            </label>
            <select
              value={field.settings?.animation || 'fade'}
              onChange={(e) => updateSettings({
                animation: e.target.value as any
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            >
              <option value="none">None</option>
              <option value="fade">Fade</option>
              <option value="scale">Scale</option>
              <option value="slide">Slide</option>
              <option value="bounce">Bounce</option>
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
              Auto-focus on checkbox
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

          {/* Read Only */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="readOnly"
              checked={field.settings?.behavior?.readOnly || false}
              onChange={(e) => updateBehavior({
                readOnly: e.target.checked
              })}
              className="h-4 w-4 text-[#6C5CE7] focus:ring-[#6C5CE7] border-gray-300 rounded"
            />
            <label htmlFor="readOnly" className="ml-2 block text-sm text-gray-900">
              Read only
            </label>
          </div>

          {/* Auto Save */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoSave"
              checked={field.settings?.autoSave || false}
              onChange={(e) => updateSettings({
                autoSave: e.target.checked
              })}
              className="h-4 w-4 text-[#6C5CE7] focus:ring-[#6C5CE7] border-gray-300 rounded"
            />
            <label htmlFor="autoSave" className="ml-2 block text-sm text-gray-900">
              Auto-save on change
            </label>
          </div>

          {/* Show Check Mark */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showCheckMark"
              checked={field.settings?.showCheckMark || true}
              onChange={(e) => updateSettings({
                showCheckMark: e.target.checked
              })}
              className="h-4 w-4 text-[#6C5CE7] focus:ring-[#6C5CE7] border-gray-300 rounded"
            />
            <label htmlFor="showCheckMark" className="ml-2 block text-sm text-gray-900">
              Show check mark when checked
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
          {/* Must Be Checked */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="mustBeChecked"
              checked={field.settings?.validation?.mustBeChecked || false}
              onChange={(e) => updateValidation({
                mustBeChecked: e.target.checked
              })}
              className="h-4 w-4 text-[#6C5CE7] focus:ring-[#6C5CE7] border-gray-300 rounded"
            />
            <label htmlFor="mustBeChecked" className="ml-2 block text-sm text-gray-900">
              Must be checked to proceed
            </label>
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
                  pattern: e.target.value,
                  message: 'Invalid checkbox state'
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
                placeholder="This checkbox must be checked"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Custom</label>
              <input
                type="text"
                value={field.settings?.validation?.errorMessages?.custom || ''}
                onChange={(e) => updateValidation({
                  errorMessages: {
                    ...field.settings?.validation?.errorMessages,
                    custom: e.target.value
                  }
                })}
                placeholder="Custom validation error message"
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
              value={field.settings?.accessibility?.role || 'checkbox'}
              onChange={(e) => updateAccessibility({
                role: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            >
              <option value="checkbox">Checkbox</option>
              <option value="switch">Switch</option>
              <option value="button">Button</option>
              <option value="menuitemcheckbox">Menu Item Checkbox</option>
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