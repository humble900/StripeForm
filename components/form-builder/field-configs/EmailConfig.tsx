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
  EnvelopeIcon
} from '@heroicons/react/24/outline'

interface EmailConfigProps {
  field: FormField
  onUpdate: (updates: Partial<FormField>) => void
}

export function EmailConfig({ field, onUpdate }: EmailConfigProps) {
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
            
            {/* Max Length */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Characters
              </label>
              <input
                type="number"
                value={field.settings?.maxLength || ''}
                onChange={(e) => updateSettings({ maxLength: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                placeholder="No limit"
                min="1"
                max="254"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum 254 characters for email addresses</p>
            </div>

            {/* Email Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Input Type
              </label>
              <select
                value={field.settings?.emailType || 'standard'}
                onChange={(e) => updateSettings({ 
                  emailType: e.target.value as any 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
              >
                <option value="standard">Standard email</option>
                <option value="multiple">Multiple emails (comma-separated)</option>
                <option value="confirm">Email with confirmation</option>
              </select>
            </div>

            {/* Auto-complete */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Auto-complete
              </label>
              <select
                value={field.settings?.behavior?.autoComplete || 'email'}
                onChange={(e) => updateSettings({ 
                  behavior: { 
                    ...field.settings?.behavior, 
                    autoComplete: e.target.value as any 
                  } 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
              >
                <option value="email">Email</option>
                <option value="username">Username</option>
                <option value="off">Off</option>
              </select>
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
                  id="spellCheck"
                  checked={field.settings?.behavior?.spellCheck || false}
                  onChange={(e) => updateSettings({ 
                    behavior: { 
                      ...field.settings?.behavior, 
                      spellCheck: e.target.checked 
                    } 
                  })}
                  className="h-4 w-4 text-[#6C5CE7] focus:ring-[#6C5CE7] border-gray-300 rounded"
                />
                <label htmlFor="spellCheck" className="ml-2 block text-sm text-gray-900">
                  Enable spell check
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showEmailIcon"
                  checked={field.settings?.showEmailIcon || false}
                  onChange={(e) => updateSettings({ 
                    showEmailIcon: e.target.checked 
                  })}
                  className="h-4 w-4 text-[#6C5CE7] focus:ring-[#6C5CE7] border-gray-300 rounded"
                />
                <label htmlFor="showEmailIcon" className="ml-2 block text-sm text-gray-900">
                  Show email icon
                </label>
              </div>
            </div>

            {/* Validation Behavior */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Validation Timing
              </label>
              <select
                value={field.settings?.validateOn || 'blur'}
                onChange={(e) => updateSettings({ 
                  validateOn: e.target.value as any 
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
            
            {/* Email Validation Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Validation Type
              </label>
              <select
                value={field.settings?.validation?.emailType || 'standard'}
                onChange={(e) => updateSettings({ 
                  validation: { 
                    ...field.settings?.validation, 
                    emailType: e.target.value as any 
                  } 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
              >
                <option value="standard">Standard email format</option>
                <option value="strict">Strict validation</option>
                <option value="custom">Custom regex pattern</option>
                <option value="none">No validation</option>
              </select>
            </div>

            {/* Custom Pattern */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Email Pattern (Regex)
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
                      message: 'Invalid email format'
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
                placeholder="e.g., ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to use default email validation</p>
            </div>

            {/* Domain Restrictions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allowed Domains (comma-separated)
              </label>
              <input
                type="text"
                value={field.settings?.allowedDomains?.join(', ') || ''}
                onChange={(e) => updateSettings({ 
                  allowedDomains: e.target.value.split(',').map(d => d.trim()).filter(d => d)
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                placeholder="gmail.com, yahoo.com, company.com"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to allow all domains</p>
            </div>

            {/* Blocked Domains */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blocked Domains (comma-separated)
              </label>
              <input
                type="text"
                value={field.settings?.blockedDomains?.join(', ') || ''}
                onChange={(e) => updateSettings({ 
                  blockedDomains: e.target.value.split(',').map(d => d.trim()).filter(d => d)
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                placeholder="tempmail.com, disposable.com"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to allow all domains</p>
            </div>

            {/* Error Messages */}
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-gray-800">Error Messages</h5>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invalid Email Error
                </label>
                <input
                  type="text"
                  value={field.settings?.validation?.errorMessages?.email || ''}
                  onChange={(e) => updateSettings({ 
                    validation: { 
                      ...field.settings?.validation, 
                      errorMessages: {
                        ...field.settings?.validation?.errorMessages,
                        email: e.target.value
                      }
                    } 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                  placeholder="Please enter a valid email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Domain Not Allowed Error
                </label>
                <input
                  type="text"
                  value={field.settings?.validation?.errorMessages?.domainNotAllowed || ''}
                  onChange={(e) => updateSettings({ 
                    validation: { 
                      ...field.settings?.validation, 
                      errorMessages: {
                        ...field.settings?.validation?.errorMessages,
                        domainNotAllowed: e.target.value
                      }
                    } 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                  placeholder="This email domain is not allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Domain Blocked Error
                </label>
                <input
                  type="text"
                  value={field.settings?.validation?.errorMessages?.domainBlocked || ''}
                  onChange={(e) => updateSettings({ 
                    validation: { 
                      ...field.settings?.validation, 
                      errorMessages: {
                        ...field.settings?.validation?.errorMessages,
                        domainBlocked: e.target.value
                      }
                    } 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                  placeholder="This email domain is blocked"
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
                placeholder="Email address input"
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
                placeholder="Enter your email address"
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
                placeholder=".custom-email-input { /* your CSS */ }"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 