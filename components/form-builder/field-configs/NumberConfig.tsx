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
  HashtagIcon
} from '@heroicons/react/24/outline'

interface NumberConfigProps {
  field: FormField
  onUpdate: (updates: Partial<FormField>) => void
}

export function NumberConfig({ field, onUpdate }: NumberConfigProps) {
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
            
            {/* Number Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number Type
              </label>
              <select
                value={field.settings?.numberType || 'integer'}
                onChange={(e) => updateSettings({ 
                  numberType: e.target.value as any 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
              >
                <option value="integer">Integer</option>
                <option value="decimal">Decimal</option>
                <option value="currency">Currency</option>
                <option value="percentage">Percentage</option>
                <option value="phone">Phone Number</option>
                <option value="postal">Postal Code</option>
              </select>
            </div>

            {/* Step Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Step Value
              </label>
              <input
                type="number"
                value={field.settings?.step || 1}
                onChange={(e) => updateSettings({ step: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                min="0.01"
                max="1000"
                step="0.01"
              />
              <p className="text-xs text-gray-500 mt-1">Increment/decrement step for number input</p>
            </div>

            {/* Default Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Value
              </label>
              <input
                type="number"
                value={field.settings?.defaultValue || ''}
                onChange={(e) => updateSettings({ defaultValue: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                placeholder="No default value"
              />
            </div>

            {/* Currency Settings */}
            {field.settings?.numberType === 'currency' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  value={field.settings?.currency || 'USD'}
                  onChange={(e) => updateSettings({ currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="CAD">CAD (C$)</option>
                  <option value="AUD">AUD (A$)</option>
                  <option value="CHF">CHF (CHF)</option>
                  <option value="CNY">CNY (¥)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="BRL">BRL (R$)</option>
                </select>
              </div>
            )}

            {/* Decimal Places */}
            {field.settings?.numberType === 'decimal' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Decimal Places
                </label>
                <input
                  type="number"
                  value={field.settings?.decimalPlaces || 2}
                  onChange={(e) => updateSettings({ decimalPlaces: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                  min="0"
                  max="10"
                />
              </div>
            )}
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

            {/* Font Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Font Weight
              </label>
              <select
                value={field.settings?.styling?.fontWeight || 'normal'}
                onChange={(e) => updateSettings({ 
                  styling: { 
                    ...field.settings?.styling, 
                    fontWeight: e.target.value as any 
                  } 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="lighter">Lighter</option>
                <option value="bolder">Bolder</option>
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="300">300</option>
                <option value="400">400</option>
                <option value="500">500</option>
                <option value="600">600</option>
                <option value="700">700</option>
                <option value="800">800</option>
                <option value="900">900</option>
              </select>
            </div>

            {/* Text Alignment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text Alignment
              </label>
              <select
                value={field.settings?.styling?.textAlign || 'left'}
                onChange={(e) => updateSettings({ 
                  styling: { 
                    ...field.settings?.styling, 
                    textAlign: e.target.value as any 
                  } 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="justify">Justify</option>
              </select>
            </div>

            {/* Input Styling */}
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-gray-800">Input Field Styling</h5>
              
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
                  id="readOnly"
                  checked={field.settings?.behavior?.readOnly || false}
                  onChange={(e) => updateSettings({ 
                    behavior: { 
                      ...field.settings?.behavior, 
                      readOnly: e.target.checked 
                    } 
                  })}
                  className="h-4 w-4 text-[#6C5CE7] focus:ring-[#6C5CE7] border-gray-300 rounded"
                />
                <label htmlFor="readOnly" className="ml-2 block text-sm text-gray-900">
                  Read only
                </label>
              </div>

              <div className="flex items-center">
                                <input
                  type="checkbox"
                  id="showSpinner"
                  checked={field.settings?.showSpinner || false}
                  onChange={(e) => updateSettings({
                    showSpinner: e.target.checked
                  })}
                  className="h-4 w-4 text-[#6C5CE7] focus:ring-[#6C5CE7] border-gray-300 rounded"
                />
                <label htmlFor="showSpinner" className="ml-2 block text-sm text-gray-900">
                  Show spinner buttons
                </label>
              </div>

              <div className="flex items-center">
                                <input
                  type="checkbox"
                  id="allowNegative"
                  checked={field.settings?.allowNegative || false}
                  onChange={(e) => updateSettings({
                    allowNegative: e.target.checked
                  })}
                  className="h-4 w-4 text-[#6C5CE7] focus:ring-[#6C5CE7] border-gray-300 rounded"
                />
                <label htmlFor="allowNegative" className="ml-2 block text-sm text-gray-900">
                  Allow negative numbers
                </label>
              </div>

              <div className="flex items-center">
                                <input
                  type="checkbox"
                  id="formatOnBlur"
                  checked={field.settings?.formatOnBlur || false}
                  onChange={(e) => updateSettings({
                    formatOnBlur: e.target.checked
                  })}
                  className="h-4 w-4 text-[#6C5CE7] focus:ring-[#6C5CE7] border-gray-300 rounded"
                />
                <label htmlFor="formatOnBlur" className="ml-2 block text-sm text-gray-900">
                  Format number on blur
                </label>
              </div>
            </div>

            {/* Input Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Mode
              </label>
                            <select
                value={field.settings?.inputMode || 'numeric'}
                onChange={(e) => updateSettings({
                  inputMode: e.target.value as any
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
              >
                <option value="numeric">Numeric</option>
                <option value="decimal">Decimal</option>
                <option value="tel">Telephone</option>
                <option value="text">Text</option>
              </select>
            </div>

            {/* Validation Behavior */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Validation Timing
              </label>
              <select
                value={field.settings?.behavior?.validateOn || 'blur'}
                onChange={(e) => updateSettings({ 
                  behavior: { 
                    ...field.settings?.behavior, 
                    validateOn: e.target.value as any 
                  } 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
              >
                <option value="blur">On blur</option>
                <option value="change">On change</option>
                <option value="submit">On submit only</option>
                <option value="always">Always show</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'validation' && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Validation Settings</h4>
            
            {/* Min/Max Values */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Value
                </label>
                <input
                  type="number"
                  value={field.settings?.min || ''}
                  onChange={(e) => updateSettings({ min: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                  placeholder="No minimum"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Value
                </label>
                <input
                  type="number"
                  value={field.settings?.max || ''}
                  onChange={(e) => updateSettings({ max: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                  placeholder="No maximum"
                />
              </div>
            </div>

            {/* Custom Validation Rules */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Validation Pattern (Regex)
              </label>
              <input
                type="text"
                value={field.settings?.validation?.customRules?.find(r => r.type === 'pattern')?.value || ''}
                onChange={(e) => {
                  const customRules = field.settings?.validation?.customRules || []
                  const patternRule = customRules.find(r => r.type === 'pattern')
                  
                  if (patternRule) {
                    patternRule.value = e.target.value
                  } else {
                    customRules.push({
                      type: 'pattern',
                      value: e.target.value,
                      message: 'Invalid number format'
                    })
                  }
                  
                  updateSettings({ 
                    validation: { 
                      ...field.settings?.validation, 
                      customRules 
                    } 
                  })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                placeholder="e.g., ^[0-9]+$ for integers only"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty for no pattern validation</p>
            </div>

            {/* Number Format Validation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number Format Validation
              </label>
              <select
                value={field.settings?.validation?.numberFormat || 'any'}
                onChange={(e) => updateSettings({ 
                  validation: { 
                    ...field.settings?.validation, 
                    numberFormat: e.target.value as any 
                  } 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
              >
                <option value="any">Any number</option>
                <option value="positive">Positive only</option>
                <option value="negative">Negative only</option>
                <option value="integer">Integer only</option>
                <option value="decimal">Decimal only</option>
                <option value="even">Even numbers only</option>
                <option value="odd">Odd numbers only</option>
              </select>
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
                  placeholder="This field is required"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Value Error
                </label>
                <input
                  type="text"
                  value={field.settings?.validation?.errorMessages?.min || ''}
                  onChange={(e) => updateSettings({ 
                    validation: { 
                      ...field.settings?.validation, 
                      errorMessages: {
                        ...field.settings?.validation?.errorMessages,
                        min: e.target.value
                      }
                    } 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                  placeholder="Value must be at least {min}"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Value Error
                </label>
                <input
                  type="text"
                  value={field.settings?.validation?.errorMessages?.max || ''}
                  onChange={(e) => updateSettings({ 
                    validation: { 
                      ...field.settings?.validation, 
                      errorMessages: {
                        ...field.settings?.validation?.errorMessages,
                        max: e.target.value
                      }
                    } 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                  placeholder="Value must be at most {max}"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invalid Number Error
                </label>
                <input
                  type="text"
                  value={field.settings?.validation?.errorMessages?.number || ''}
                  onChange={(e) => updateSettings({ 
                    validation: { 
                      ...field.settings?.validation, 
                      errorMessages: {
                        ...field.settings?.validation?.errorMessages,
                        number: e.target.value
                      }
                    } 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                  placeholder="Please enter a valid number"
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
                placeholder="Number input field"
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
                placeholder="Enter a number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tab Index
              </label>
              <input
                type="number"
                value={field.settings?.accessibility?.tabIndex || 0}
                onChange={(e) => updateSettings({ 
                  accessibility: { 
                    ...field.settings?.accessibility, 
                    tabIndex: Number(e.target.value) 
                  } 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                min="-1"
                max="100"
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
                placeholder=".custom-number-input { /* your CSS */ }"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 