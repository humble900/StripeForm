'use client'

import React, { useState } from 'react'
import { FormField } from '@/types'
import { 
  PaintBrushIcon, 
  CogIcon, 
  ShieldCheckIcon,
  EyeIcon,
  CodeBracketIcon,
  AdjustmentsHorizontalIcon,
  ExclamationTriangleIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline'

interface DropdownConfigProps {
  field: FormField
  onUpdate: (updates: Partial<FormField>) => void
}

export function DropdownConfig({ field, onUpdate }: DropdownConfigProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'styling' | 'behavior' | 'validation' | 'accessibility' | 'integration'>('basic')

  const updateSettings = (updates: any) => {
    onUpdate({
      settings: {
        ...field.settings,
        ...updates
      }
    })
  }

  const tabs = [
    { id: 'basic', label: 'Basic', icon: CogIcon },
    { id: 'styling', label: 'Styling', icon: PaintBrushIcon },
    { id: 'behavior', label: 'Behavior', icon: AdjustmentsHorizontalIcon },
    { id: 'validation', label: 'Validation', icon: ExclamationTriangleIcon },
    { id: 'accessibility', label: 'Accessibility', icon: EyeIcon },
    { id: 'integration', label: 'Integration', icon: CodeBracketIcon }
  ]

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-1 ${
                  activeTab === tab.id
                    ? 'border-[#6C5CE7] text-[#6C5CE7]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'basic' && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Basic Settings</h4>
            
            {/* Dropdown Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dropdown Type
              </label>
              <select
                value={field.settings?.dropdownType || 'single'}
                onChange={(e) => updateSettings({ 
                  dropdownType: e.target.value as any 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
              >
                <option value="single">Single Selection</option>
                <option value="multiple">Multiple Selection</option>
                <option value="searchable">Searchable Dropdown</option>
                <option value="tags">Tags Input</option>
              </select>
            </div>

            {/* Default Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Selected Option
              </label>
              <input
                type="text"
                value={field.settings?.defaultValue || ''}
                onChange={(e) => updateSettings({ defaultValue: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                placeholder="Enter option value or leave empty"
              />
            </div>

            {/* Placeholder Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Placeholder Text
              </label>
              <input
                type="text"
                value={field.placeholder || 'Select an option...'}
                onChange={(e) => onUpdate({ placeholder: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                placeholder="Select an option..."
              />
            </div>

            {/* Max Selections */}
            {field.settings?.dropdownType === 'multiple' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Selections
                </label>
                <input
                  type="number"
                  value={field.settings?.maxSelections || ''}
                  onChange={(e) => updateSettings({ maxSelections: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                  placeholder="No limit"
                  min="1"
                  max="50"
                />
              </div>
            )}

            {/* Options Management */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Options (one per line)
              </label>
              <textarea
                value={field.options?.join('\n') || ''}
                onChange={(e) => onUpdate({ options: e.target.value.split('\n').filter(option => option.trim()) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                rows={6}
                placeholder="Option 1&#10;Option 2&#10;Option 3"
              />
            </div>
          </div>
        )}

        {activeTab === 'styling' && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Styling Options</h4>
            
            {/* Text Styling */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Text Color
                </label>
                <input
                  type="color"
                  value={field.settings?.styling?.textColor || '#000000'}
                  onChange={(e) => updateSettings({ 
                    styling: { 
                      ...field.settings?.styling, 
                      textColor: e.target.value 
                    } 
                  })}
                  className="w-full h-10 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Font Size (px)
                </label>
                <input
                  type="number"
                  value={field.settings?.styling?.fontSize || 16}
                  onChange={(e) => updateSettings({ 
                    styling: { 
                      ...field.settings?.styling, 
                      fontSize: Number(e.target.value) 
                    } 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                  min="8"
                  max="72"
                />
              </div>
            </div>

            {/* Dropdown Styling */}
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-gray-800">Dropdown Styling</h5>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Background Color
                  </label>
                  <input
                    type="color"
                    value={field.settings?.styling?.inputBackgroundColor || '#ffffff'}
                    onChange={(e) => updateSettings({ 
                      styling: { 
                        ...field.settings?.styling, 
                        inputBackgroundColor: e.target.value 
                      } 
                    })}
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Border Color
                  </label>
                  <input
                    type="color"
                    value={field.settings?.styling?.inputBorderColor || '#d1d5db'}
                    onChange={(e) => updateSettings({ 
                      styling: { 
                        ...field.settings?.styling, 
                        inputBorderColor: e.target.value 
                      } 
                    })}
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Border Width (px)
                  </label>
                  <input
                    type="number"
                    value={field.settings?.styling?.inputBorderWidth || 1}
                    onChange={(e) => updateSettings({ 
                      styling: { 
                        ...field.settings?.styling, 
                        inputBorderWidth: Number(e.target.value) 
                      } 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                    min="0"
                    max="10"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Border Radius (px)
                  </label>
                  <input
                    type="number"
                    value={field.settings?.styling?.inputBorderRadius || 6}
                    onChange={(e) => updateSettings({ 
                      styling: { 
                        ...field.settings?.styling, 
                        inputBorderRadius: Number(e.target.value) 
                      } 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                    min="0"
                    max="50"
                  />
                </div>
              </div>

              {/* Focus States */}
              <div className="space-y-3">
                <h6 className="text-sm font-medium text-gray-700">Focus States</h6>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Focus Border Color
                    </label>
                    <input
                      type="color"
                      value={field.settings?.styling?.focusBorderColor || '#6C5CE7'}
                      onChange={(e) => updateSettings({ 
                        styling: { 
                          ...field.settings?.styling, 
                          focusBorderColor: e.target.value 
                        } 
                      })}
                      className="w-full h-10 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Focus Background Color
                    </label>
                    <input
                      type="color"
                      value={field.settings?.styling?.focusBackgroundColor || '#ffffff'}
                      onChange={(e) => updateSettings({ 
                        styling: { 
                          ...field.settings?.styling, 
                          focusBackgroundColor: e.target.value 
                        } 
                      })}
                      className="w-full h-10 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'behavior' && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Behavior Settings</h4>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoFocus"
                  checked={field.settings?.behavior?.autoFocus || false}
                  onChange={(e) => updateSettings({ 
                    behavior: { 
                      ...field.settings?.behavior, 
                      autoFocus: e.target.checked 
                    } 
                  })}
                  className="h-4 w-4 text-[#6C5CE7] focus:ring-[#6C5CE7] border-gray-300 rounded"
                />
                <label htmlFor="autoFocus" className="ml-2 block text-sm text-gray-900">
                  Auto focus on page load
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="disabled"
                  checked={field.settings?.behavior?.disabled || false}
                  onChange={(e) => updateSettings({ 
                    behavior: { 
                      ...field.settings?.behavior, 
                      disabled: e.target.checked 
                    } 
                  })}
                  className="h-4 w-4 text-[#6C5CE7] focus:ring-[#6C5CE7] border-gray-300 rounded"
                />
                <label htmlFor="disabled" className="ml-2 block text-sm text-gray-900">
                  Disabled
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="clearable"
                  checked={field.settings?.clearable || false}
                  onChange={(e) => updateSettings({ 
                    clearable: e.target.checked 
                  })}
                  className="h-4 w-4 text-[#6C5CE7] focus:ring-[#6C5CE7] border-gray-300 rounded"
                />
                <label htmlFor="clearable" className="ml-2 block text-sm text-gray-900">
                  Allow clearing selection
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="searchable"
                  checked={field.settings?.searchable || false}
                  onChange={(e) => updateSettings({ 
                    searchable: e.target.checked 
                  })}
                  className="h-4 w-4 text-[#6C5CE7] focus:ring-[#6C5CE7] border-gray-300 rounded"
                />
                <label htmlFor="searchable" className="ml-2 block text-sm text-gray-900">
                  Enable search functionality
                </label>
              </div>
            </div>

            {/* Dropdown Behavior */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dropdown Position
              </label>
              <select
                value={field.settings?.dropdownPosition || 'bottom'}
                onChange={(e) => updateSettings({ 
                  dropdownPosition: e.target.value as any 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
              >
                <option value="bottom">Bottom</option>
                <option value="top">Top</option>
                <option value="auto">Auto</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'validation' && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Validation Settings</h4>
            
            {/* Required Validation */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="required"
                checked={field.required || false}
                onChange={(e) => updateSettings({ required: e.target.checked })}
                className="h-4 w-4 text-[#6C5CE7] focus:ring-[#6C5CE7] border-gray-300 rounded"
              />
              <label htmlFor="required" className="ml-2 block text-sm text-gray-900">
                Required field
              </label>
            </div>

            {/* Error Messages */}
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-gray-800">Error Messages</h5>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required Error
                </label>
                <input
                  type="text"
                  value={field.settings?.validation?.errorMessages?.required || ''}
                  onChange={(e) => updateSettings({ 
                    validation: { 
                      ...field.settings?.validation, 
                      errorMessages: {
                        ...field.settings?.validation?.errorMessages,
                        required: e.target.value
                      }
                    } 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                  placeholder="Please select an option"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'accessibility' && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Accessibility Settings</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ARIA Label
              </label>
              <input
                type="text"
                value={field.settings?.accessibility?.ariaLabel || ''}
                onChange={(e) => updateSettings({ 
                  accessibility: { 
                    ...field.settings?.accessibility, 
                    ariaLabel: e.target.value 
                  } 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                placeholder="Dropdown selection field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ARIA Description
              </label>
              <input
                type="text"
                value={field.settings?.accessibility?.ariaDescribedBy || ''}
                onChange={(e) => updateSettings({ 
                  accessibility: { 
                    ...field.settings?.accessibility, 
                    ariaDescribedBy: e.target.value 
                  } 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                placeholder="Select an option from the dropdown"
              />
            </div>
          </div>
        )}

        {activeTab === 'integration' && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Integration Settings</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Webhook URL
              </label>
              <input
                type="url"
                value={field.settings?.integration?.webhookUrl || ''}
                onChange={(e) => updateSettings({ 
                  integration: { 
                    ...field.settings?.integration, 
                    webhookUrl: e.target.value 
                  } 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                placeholder="https://api.example.com/webhook"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom CSS
              </label>
              <textarea
                value={field.settings?.integration?.customCSS || ''}
                onChange={(e) => updateSettings({ 
                  integration: { 
                    ...field.settings?.integration, 
                    customCSS: e.target.value 
                  } 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                rows={4}
                placeholder=".custom-dropdown { /* your CSS */ }"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 