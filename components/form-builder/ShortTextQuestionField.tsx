'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Type,
  Settings,
  Palette,
  Eye,
  ChevronDown,
  ChevronRight,
  Check,
  Shield,
  Zap,
  Smartphone,
  Globe,
  AtSign,
  Hash,
  Phone,
  MapPin,
  Calendar,
  Clock,
  CreditCard,
  User,
  Lock,
  EyeOff,
  Sparkles,
  Target,
  AlertTriangle,
  Info,
  Copy,
  RotateCcw
} from 'lucide-react'

// Advanced input types for short text
export type ShortTextInputType = 
  | 'text'
  | 'email'
  | 'password'
  | 'tel'
  | 'url'
  | 'number'
  | 'date'
  | 'time'
  | 'datetime-local'
  | 'search'
  | 'name'
  | 'company'
  | 'address'
  | 'city'
  | 'state'
  | 'zip'
  | 'country'
  | 'currency'
  | 'percentage'
  | 'social_security'
  | 'credit_card'
  | 'phone_with_country'
  | 'custom'

// Validation types
export type ValidationType = 
  | 'required'
  | 'min_length'
  | 'max_length'
  | 'exact_length'
  | 'pattern'
  | 'email'
  | 'url'
  | 'phone'
  | 'credit_card'
  | 'social_security'
  | 'zip_code'
  | 'currency'
  | 'percentage'
  | 'custom_regex'
  | 'no_special_chars'

// Formatting options
export type TextFormatting = 
  | 'none'
  | 'uppercase'
  | 'lowercase'
  | 'capitalize'
  | 'title_case'
  | 'remove_spaces'
  | 'trim'
  | 'custom'

// Accessibility features
export type AccessibilityFeature = 
  | 'aria_label'
  | 'aria_describedby'
  | 'aria_required'
  | 'aria_invalid'
  | 'screen_reader_text'
  | 'high_contrast'
  | 'large_text'
  | 'keyboard_navigation'

export interface ShortTextQuestionField {
  // Basic settings
  label: string
  placeholder: string
  required: boolean
  helpText: string
  
  // Advanced input settings
  inputType: ShortTextInputType
  customInputType: string
  defaultValue: string
  autoComplete: string
  
  // Validation settings
  validation: ValidationRule[]
  minLength: number
  maxLength: number
  exactLength: number
  pattern: string
  customRegex: string
  customErrorMessage: string
  disallowSpecialChars: boolean
  
  // Input masking
  inputMask: string
  maskPlaceholder: string
  maskAutoComplete: boolean
  
  // Formatting settings
  textFormatting: TextFormatting
  customFormatting: string
  autoFormat: boolean
  
  // Prefill settings
  prefillFromUrl: boolean
  urlParamName: string
  
  // Variable binding
  variableBinding: boolean
  variableName: string
  
  // Visual settings
  textColor: string
  backgroundColor: string
  borderColor: string
  fontSize: number
  borderRadius: number
  padding: number
  
  // Advanced features
  smartSuggestions: boolean
  autoSave: boolean
  realTimeValidation: boolean
  characterCounter: boolean
  passwordStrength: boolean
  accessibilityFeatures: AccessibilityFeature[]
  
  // Behavior settings
  autoFocus: boolean
  readOnly: boolean
  disabled: boolean
  clearOnSubmit: boolean
  preserveOnError: boolean
  
  // Conditional logic
  showCondition: string
  hideCondition: string
  
  // Integration settings
  webhookUrl: string
  apiKey: string
  customValidation: string
}

interface ValidationRule {
  type: ValidationType
  value: string | number
  message: string
  enabled: boolean
}

interface ShortTextQuestionFieldProps {
  field: ShortTextQuestionField
  onChange: (field: ShortTextQuestionField) => void
}

const inputTypes = [
  { id: 'text', label: 'Text', icon: Type, description: 'General text input' },
  { id: 'email', label: 'Email', icon: AtSign, description: 'Email address validation' },
  { id: 'password', label: 'Password', icon: Lock, description: 'Secure password input' },
  { id: 'tel', label: 'Phone', icon: Phone, description: 'Phone number input' },
  { id: 'url', label: 'URL', icon: Globe, description: 'Website URL input' },
  { id: 'number', label: 'Number', icon: Hash, description: 'Numeric input' },
  { id: 'date', label: 'Date', icon: Calendar, description: 'Date picker' },
  { id: 'time', label: 'Time', icon: Clock, description: 'Time picker' },
  { id: 'datetime-local', label: 'Date & Time', icon: Calendar, description: 'Date and time picker' },
  { id: 'search', label: 'Search', icon: Target, description: 'Search input' },
  { id: 'name', label: 'Name', icon: User, description: 'Full name input' },
  { id: 'company', label: 'Company', icon: User, description: 'Company name' },
  { id: 'address', label: 'Address', icon: MapPin, description: 'Street address' },
  { id: 'city', label: 'City', icon: MapPin, description: 'City name' },
  { id: 'state', label: 'State', icon: MapPin, description: 'State/province' },
  { id: 'zip', label: 'ZIP Code', icon: Hash, description: 'Postal code' },
  { id: 'country', label: 'Country', icon: Globe, description: 'Country selection' },
  { id: 'currency', label: 'Currency', icon: CreditCard, description: 'Monetary value' },
  { id: 'percentage', label: 'Percentage', icon: Hash, description: 'Percentage value' },
  { id: 'social_security', label: 'SSN', icon: Hash, description: 'Social Security Number' },
  { id: 'credit_card', label: 'Credit Card', icon: CreditCard, description: 'Credit card number' },
  { id: 'phone_with_country', label: 'Phone (Intl)', icon: Phone, description: 'International phone' },
  { id: 'custom', label: 'Custom', icon: Settings, description: 'Custom input type' }
]

const formattingOptions = [
  { id: 'none', label: 'No Formatting', description: 'Keep as entered' },
  { id: 'uppercase', label: 'Uppercase', description: 'Convert to UPPERCASE' },
  { id: 'lowercase', label: 'Lowercase', description: 'Convert to lowercase' },
  { id: 'capitalize', label: 'Capitalize', description: 'Capitalize Each Word' },
  { id: 'title_case', label: 'Title Case', description: 'Title Case Formatting' },
  { id: 'remove_spaces', label: 'Remove Spaces', description: 'Remove all spaces' },
  { id: 'trim', label: 'Trim Whitespace', description: 'Remove leading/trailing spaces' },
  { id: 'custom', label: 'Custom Format', description: 'Custom formatting rules' }
]

const accessibilityFeatures = [
  { id: 'aria_label', label: 'ARIA Label', description: 'Screen reader label' },
  { id: 'aria_describedby', label: 'ARIA Description', description: 'Additional description' },
  { id: 'aria_required', label: 'ARIA Required', description: 'Required field indicator' },
  { id: 'aria_invalid', label: 'ARIA Invalid', description: 'Invalid state indicator' },
  { id: 'screen_reader_text', label: 'Screen Reader Text', description: 'Custom screen reader text' },
  { id: 'high_contrast', label: 'High Contrast', description: 'High contrast mode support' },
  { id: 'large_text', label: 'Large Text', description: 'Large text mode support' },
  { id: 'keyboard_navigation', label: 'Keyboard Navigation', description: 'Enhanced keyboard support' }
]

const inputMasks = [
  { id: '', label: 'No Mask', description: 'No input masking' },
  { id: 'phone', label: 'Phone Number', description: '(###) ###-####', mask: '(000) 000-0000' },
  { id: 'ssn', label: 'Social Security', description: '###-##-####', mask: '000-00-0000' },
  { id: 'zip', label: 'ZIP Code', description: '##### or #####-####', mask: '00000' },
  { id: 'credit_card', label: 'Credit Card', description: '#### #### #### ####', mask: '0000 0000 0000 0000' },
  { id: 'date', label: 'Date', description: 'MM/DD/YYYY', mask: '00/00/0000' },
  { id: 'time', label: 'Time', description: 'HH:MM', mask: '00:00' },
  { id: 'currency', label: 'Currency', description: '$###,###.##', mask: '$000,000.00' },
  { id: 'percentage', label: 'Percentage', description: '##%', mask: '00%' },
  { id: 'custom', label: 'Custom Mask', description: 'Define your own mask' }
]

export function ShortTextQuestionField({ field, onChange }: ShortTextQuestionFieldProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic', 'input', 'validation']))
  const [activeTab, setActiveTab] = useState<'basic' | 'input' | 'validation' | 'masking' | 'formatting' | 'advanced' | 'styling' | 'accessibility' | 'preview'>('basic')

  const updateField = (updates: Partial<ShortTextQuestionField>) => {
    onChange({ ...field, ...updates })
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
      className="flex items-center justify-between w-full p-3 text-left hover:bg-gray-50 transition-colors rounded-lg"
    >
      <div className="flex items-center space-x-2">
        {icon}
        <span className="font-medium text-gray-900">{title}</span>
      </div>
      {isSectionExpanded(section) ? (
        <ChevronDown className="w-4 h-4 text-gray-500" />
      ) : (
        <ChevronRight className="w-4 h-4 text-gray-500" />
      )}
    </button>
  )

  const renderBasicSettings = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Field Label
        </label>
        <Input
          value={field.label}
          onChange={(e) => updateField({ label: e.target.value })}
          placeholder="Enter field label..."
          className="text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Placeholder Text
        </label>
        <Input
          value={field.placeholder}
          onChange={(e) => updateField({ placeholder: e.target.value })}
          placeholder="Enter placeholder text..."
          className="text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Help Text (Optional)
        </label>
        <textarea
          value={field.helpText}
          onChange={(e) => updateField({ helpText: e.target.value })}
          placeholder="Enter help text to guide users..."
          className="w-full min-h-[60px] p-2 text-sm border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
          <label className="text-sm font-medium text-gray-900">Required Field</label>
          <p className="text-xs text-gray-500">Make this field mandatory</p>
        </div>
        <button
          onClick={() => updateField({ required: !field.required })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            field.required ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            field.required ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>
    </div>
  )

  const renderInputTypeSettings = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Input Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {inputTypes.map((typeInfo) => {
            const isSelected = field.inputType === typeInfo.id
            const Icon = typeInfo.icon

            return (
              <button
                key={typeInfo.id}
                onClick={() => updateField({ inputType: typeInfo.id as ShortTextInputType })}
                className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                  isSelected 
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Icon className="w-4 h-4 text-gray-600" />
                  <span className="text-xs font-medium">{typeInfo.label}</span>
                </div>
                <p className="text-xs text-gray-500 leading-tight">
                  {typeInfo.description}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {field.inputType === 'custom' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Input Type
          </label>
          <Input
            value={field.customInputType}
            onChange={(e) => updateField({ customInputType: e.target.value })}
            placeholder="e.g., tel, search, url..."
            className="text-sm"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Default Value
        </label>
        <Input
          value={field.defaultValue}
          onChange={(e) => updateField({ defaultValue: e.target.value })}
          placeholder="Enter default value..."
          className="text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Auto Complete
        </label>
        <Select 
          value={field.autoComplete} 
          onValueChange={(value: string) => updateField({ autoComplete: value })}
        >
          <SelectTrigger className="text-sm">
            <SelectValue placeholder="Select auto-complete type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            <SelectItem value="name">Full Name</SelectItem>
            <SelectItem value="given-name">First Name</SelectItem>
            <SelectItem value="family-name">Last Name</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="tel">Phone</SelectItem>
            <SelectItem value="url">Website</SelectItem>
            <SelectItem value="organization">Company</SelectItem>
            <SelectItem value="street-address">Address</SelectItem>
            <SelectItem value="postal-code">ZIP Code</SelectItem>
            <SelectItem value="country">Country</SelectItem>
            <SelectItem value="cc-number">Credit Card</SelectItem>
            <SelectItem value="cc-exp">Expiry Date</SelectItem>
            <SelectItem value="cc-csc">Security Code</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  const renderValidationSettings = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Length
          </label>
          <Input
            type="number"
            min="0"
            value={field.minLength || ''}
            onChange={(e) => updateField({ minLength: parseInt(e.target.value) || 0 })}
            className="text-sm"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Length
          </label>
          <Input
            type="number"
            min="1"
            value={field.maxLength || ''}
            onChange={(e) => updateField({ maxLength: parseInt(e.target.value) || undefined })}
            className="text-sm"
            placeholder="No limit"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Exact Length (Optional)
        </label>
        <Input
          type="number"
          min="1"
          value={field.exactLength || ''}
          onChange={(e) => updateField({ exactLength: parseInt(e.target.value) || undefined })}
          className="text-sm"
          placeholder="e.g., 5 for ZIP code"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pattern/Regex
        </label>
        <Input
          value={field.pattern}
          onChange={(e) => updateField({ pattern: e.target.value })}
          placeholder="e.g., [A-Za-z]{2,} for letters only"
          className="text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">
          Use regex pattern for custom validation
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Custom Error Message
        </label>
        <Input
          value={field.customErrorMessage}
          onChange={(e) => updateField({ customErrorMessage: e.target.value })}
          placeholder="Enter custom error message..."
          className="text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">
          Leave empty to use default error messages
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Disallow Special Characters</label>
            <p className="text-xs text-gray-500">Only allow letters, numbers, and spaces</p>
          </div>
          <button
            onClick={() => updateField({ disallowSpecialChars: !field.disallowSpecialChars })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              field.disallowSpecialChars ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              field.disallowSpecialChars ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Real-time Validation</label>
            <p className="text-xs text-gray-500">Validate as user types</p>
          </div>
          <button
            onClick={() => updateField({ realTimeValidation: !field.realTimeValidation })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              field.realTimeValidation ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              field.realTimeValidation ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Character Counter</label>
            <p className="text-xs text-gray-500">Show character count</p>
          </div>
          <button
            onClick={() => updateField({ characterCounter: !field.characterCounter })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              field.characterCounter ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              field.characterCounter ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {field.inputType === 'password' && (
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Password Strength</label>
              <p className="text-xs text-gray-500">Show password strength indicator</p>
            </div>
            <button
              onClick={() => updateField({ passwordStrength: !field.passwordStrength })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                field.passwordStrength ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                field.passwordStrength ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        )}
      </div>
    </div>
  )

  const renderInputMaskingSettings = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Input Mask
        </label>
        <Select 
          value={field.inputMask} 
          onValueChange={(value: string) => {
            const selectedMask = inputMasks.find(mask => mask.id === value)
            updateField({ 
              inputMask: value,
              maskPlaceholder: selectedMask?.mask || ''
            })
          }}
        >
          <SelectTrigger className="text-sm">
            <SelectValue placeholder="Select input mask" />
          </SelectTrigger>
          <SelectContent>
            {inputMasks.map((mask) => (
              <SelectItem key={mask.id} value={mask.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{mask.label}</span>
                  <span className="text-xs text-gray-500">{mask.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {field.inputMask === 'custom' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Mask Pattern
          </label>
          <Input
            value={field.maskPlaceholder}
            onChange={(e) => updateField({ maskPlaceholder: e.target.value })}
            placeholder="e.g., 000-000-0000 for phone"
            className="text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Use 0 for digits, A for letters, * for any character
          </p>
        </div>
      )}

      {field.inputMask && field.inputMask !== '' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mask Preview
          </label>
          <div className="p-3 bg-gray-50 rounded-lg border">
            <code className="text-sm font-mono text-gray-700">
              {field.maskPlaceholder || 'No mask applied'}
            </code>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700">Auto-complete Mask</label>
          <p className="text-xs text-gray-500">Automatically fill mask characters</p>
        </div>
        <button
          onClick={() => updateField({ maskAutoComplete: !field.maskAutoComplete })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            field.maskAutoComplete ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            field.maskAutoComplete ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>
    </div>
  )

  const renderFormattingSettings = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Text Formatting
        </label>
        <Select 
          value={field.textFormatting} 
          onValueChange={(value: string) => updateField({ textFormatting: value as TextFormatting })}
        >
          <SelectTrigger className="text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {formattingOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{option.label}</span>
                  <span className="text-xs text-gray-500">{option.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {field.textFormatting === 'custom' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Formatting Rules
          </label>
          <textarea
            value={field.customFormatting}
            onChange={(e) => updateField({ customFormatting: e.target.value })}
            placeholder="Enter custom formatting rules..."
            className="w-full min-h-[60px] p-2 text-sm border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700">Auto Format</label>
          <p className="text-xs text-gray-500">Apply formatting automatically</p>
        </div>
        <button
          onClick={() => updateField({ autoFormat: !field.autoFormat })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            field.autoFormat ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            field.autoFormat ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>
    </div>
  )

  const renderAdvancedFeatures = () => (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Smart Suggestions</label>
            <p className="text-xs text-gray-500">Show intelligent input suggestions</p>
          </div>
          <button
            onClick={() => updateField({ smartSuggestions: !field.smartSuggestions })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              field.smartSuggestions ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              field.smartSuggestions ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Auto Save</label>
            <p className="text-xs text-gray-500">Save input automatically</p>
          </div>
          <button
            onClick={() => updateField({ autoSave: !field.autoSave })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              field.autoSave ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              field.autoSave ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Auto Focus</label>
            <p className="text-xs text-gray-500">Focus field on page load</p>
          </div>
          <button
            onClick={() => updateField({ autoFocus: !field.autoFocus })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              field.autoFocus ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              field.autoFocus ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Read Only</label>
            <p className="text-xs text-gray-500">Make field read-only</p>
          </div>
          <button
            onClick={() => updateField({ readOnly: !field.readOnly })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              field.readOnly ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              field.readOnly ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Clear on Submit</label>
            <p className="text-xs text-gray-500">Clear field after form submission</p>
          </div>
          <button
            onClick={() => updateField({ clearOnSubmit: !field.clearOnSubmit })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              field.clearOnSubmit ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              field.clearOnSubmit ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Preserve on Error</label>
            <p className="text-xs text-gray-500">Keep value when validation fails</p>
          </div>
          <button
            onClick={() => updateField({ preserveOnError: !field.preserveOnError })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              field.preserveOnError ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              field.preserveOnError ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Prefill from URL</label>
            <p className="text-xs text-gray-500">Auto-fill from query parameter</p>
          </div>
          <button
            onClick={() => updateField({ prefillFromUrl: !field.prefillFromUrl })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              field.prefillFromUrl ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              field.prefillFromUrl ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {field.prefillFromUrl && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Parameter Name
            </label>
            <Input
              value={field.urlParamName}
              onChange={(e) => updateField({ urlParamName: e.target.value })}
              placeholder="e.g., name, email, user_id"
              className="text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Will prefill from ?{field.urlParamName || 'param'}=value
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Variable Binding</label>
            <p className="text-xs text-gray-500">Bind response to a variable</p>
          </div>
          <button
            onClick={() => updateField({ variableBinding: !field.variableBinding })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              field.variableBinding ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              field.variableBinding ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {field.variableBinding && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Variable Name
            </label>
            <Input
              value={field.variableName}
              onChange={(e) => updateField({ variableName: e.target.value })}
              placeholder="e.g., user_name, email_address"
              className="text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use this variable in conditional logic and personalization
            </p>
          </div>
        )}
      </div>
    </div>
  )

  const renderStylingSettings = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Font Size (px)
        </label>
        <Input
          type="number"
          min="12"
          max="48"
          value={field.fontSize || 16}
          onChange={(e) => updateField({ fontSize: parseInt(e.target.value) || 16 })}
          className="text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Border Radius (px)
          </label>
          <Input
            type="number"
            min="0"
            max="20"
            value={field.borderRadius || 8}
            onChange={(e) => updateField({ borderRadius: parseInt(e.target.value) || 8 })}
            className="text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Padding (px)
          </label>
          <Input
            type="number"
            min="8"
            max="24"
            value={field.padding || 12}
            onChange={(e) => updateField({ padding: parseInt(e.target.value) || 12 })}
            className="text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Text Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={field.textColor || '#000000'}
              onChange={(e) => updateField({ textColor: e.target.value })}
              className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <Input
              value={field.textColor || '#000000'}
              onChange={(e) => updateField({ textColor: e.target.value })}
              className="text-sm"
              placeholder="#000000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Background Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={field.backgroundColor || '#ffffff'}
              onChange={(e) => updateField({ backgroundColor: e.target.value })}
              className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <Input
              value={field.backgroundColor || '#ffffff'}
              onChange={(e) => updateField({ backgroundColor: e.target.value })}
              className="text-sm"
              placeholder="#ffffff"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Border Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={field.borderColor || '#d1d5db'}
              onChange={(e) => updateField({ borderColor: e.target.value })}
              className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <Input
              value={field.borderColor || '#d1d5db'}
              onChange={(e) => updateField({ borderColor: e.target.value })}
              className="text-sm"
              placeholder="#d1d5db"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderAccessibilitySettings = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Accessibility Features
        </label>
        <div className="space-y-2">
          {accessibilityFeatures.map((feature) => {
            const isEnabled = field.accessibilityFeatures?.includes(feature.id as AccessibilityFeature)
            
            return (
              <div key={feature.id} className="flex items-center justify-between p-2 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => {
                      const currentFeatures = field.accessibilityFeatures || []
                      if (e.target.checked) {
                        updateField({ 
                          accessibilityFeatures: [...currentFeatures, feature.id as AccessibilityFeature]
                        })
                      } else {
                        updateField({ 
                          accessibilityFeatures: currentFeatures.filter(f => f !== feature.id)
                        })
                      }
                    }}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-700">{feature.label}</div>
                    <div className="text-xs text-gray-500">{feature.description}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  const renderPreview = () => {
    const getInputType = () => {
      if (field.inputType === 'custom') return field.customInputType || 'text'
      return field.inputType
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Live Preview</h3>
          <Badge variant="outline" className="text-xs">
            {getInputType()}
          </Badge>
        </div>
        
        <div 
          className="p-4 rounded-lg border-2 border-dashed border-gray-200"
          style={{
            backgroundColor: field.backgroundColor || '#ffffff',
            color: field.textColor || '#000000',
            fontSize: `${field.fontSize || 16}px`,
            borderRadius: `${field.borderRadius || 8}px`
          }}
        >
          <div className="space-y-3">
            {/* Field Label */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {field.label || 'Field Label'}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {field.helpText && (
                <p className="text-xs text-gray-500 mb-2">{field.helpText}</p>
              )}
            </div>

            {/* Input Preview */}
            <div className="relative">
              <input
                type={getInputType()}
                placeholder={field.placeholder || 'Enter text...'}
                defaultValue={field.defaultValue}
                className="w-full px-3 py-2 border rounded transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{
                  backgroundColor: field.backgroundColor || '#ffffff',
                  color: field.textColor || '#000000',
                  fontSize: `${field.fontSize || 16}px`,
                  borderRadius: `${field.borderRadius || 8}px`,
                  padding: `${field.padding || 12}px`,
                  borderColor: field.borderColor || '#d1d5db'
                }}
                readOnly={field.readOnly}
                disabled={field.disabled}
                autoFocus={field.autoFocus}
                autoComplete={field.autoComplete}
                minLength={field.minLength}
                maxLength={field.maxLength}
                pattern={field.pattern}
              />
              {field.characterCounter && (
                <div className="text-xs text-gray-500 mt-1 text-right">
                  0 / {field.maxLength || '∞'}
                </div>
              )}
            </div>

            {/* Settings Summary */}
            <div className="grid grid-cols-2 gap-2 text-xs opacity-75">
              <div>
                <div className="font-medium">Type</div>
                <div className="capitalize">{getInputType()}</div>
              </div>
              <div>
                <div className="font-medium">Required</div>
                <div>{field.required ? 'Yes' : 'No'}</div>
              </div>
              {field.minLength && (
                <div>
                  <div className="font-medium">Min Length</div>
                  <div>{field.minLength}</div>
                </div>
              )}
              {field.maxLength && (
                <div>
                  <div className="font-medium">Max Length</div>
                  <div>{field.maxLength}</div>
                </div>
              )}
              {field.inputMask && field.inputMask !== '' && (
                <div>
                  <div className="font-medium">Mask</div>
                  <div>{field.maskPlaceholder}</div>
                </div>
              )}
              {field.disallowSpecialChars && (
                <div>
                  <div className="font-medium">No Special Chars</div>
                  <div>Yes</div>
                </div>
              )}
              {field.prefillFromUrl && (
                <div>
                  <div className="font-medium">URL Prefill</div>
                  <div>?{field.urlParamName || 'param'}</div>
                </div>
              )}
              {field.variableBinding && (
                <div>
                  <div className="font-medium">Variable</div>
                  <div>{field.variableName || 'unnamed'}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'basic', label: 'Basic', icon: Type },
            { id: 'input', label: 'Input', icon: Settings },
            { id: 'validation', label: 'Validation', icon: Shield },
            { id: 'masking', label: 'Masking', icon: Hash },
            { id: 'formatting', label: 'Formatting', icon: Sparkles },
            { id: 'advanced', label: 'Advanced', icon: Zap },
            { id: 'styling', label: 'Styling', icon: Palette },
            { id: 'accessibility', label: 'Accessibility', icon: Eye },
            { id: 'preview', label: 'Preview', icon: Eye }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'basic' && (
          <Card>
            <CardContent className="p-4">
              {renderSectionHeader('Basic Settings', 'basic', <Type className="w-4 h-4" />)}
              {isSectionExpanded('basic') && (
                <div className="p-3 pt-0">
                  {renderBasicSettings()}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'input' && (
          <Card>
            <CardContent className="p-4">
              {renderSectionHeader('Input Settings', 'input', <Settings className="w-4 h-4" />)}
              {isSectionExpanded('input') && (
                <div className="p-3 pt-0">
                  {renderInputTypeSettings()}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'validation' && (
          <Card>
            <CardContent className="p-4">
              {renderSectionHeader('Validation Settings', 'validation', <Shield className="w-4 h-4" />)}
              {isSectionExpanded('validation') && (
                <div className="p-3 pt-0">
                  {renderValidationSettings()}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'masking' && (
          <Card>
            <CardContent className="p-4">
              {renderSectionHeader('Input Masking', 'masking', <Hash className="w-4 h-4" />)}
              {isSectionExpanded('masking') && (
                <div className="p-3 pt-0">
                  {renderInputMaskingSettings()}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'formatting' && (
          <Card>
            <CardContent className="p-4">
              {renderSectionHeader('Formatting Settings', 'formatting', <Sparkles className="w-4 h-4" />)}
              {isSectionExpanded('formatting') && (
                <div className="p-3 pt-0">
                  {renderFormattingSettings()}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'advanced' && (
          <Card>
            <CardContent className="p-4">
              {renderSectionHeader('Advanced Features', 'advanced', <Zap className="w-4 h-4" />)}
              {isSectionExpanded('advanced') && (
                <div className="p-3 pt-0">
                  {renderAdvancedFeatures()}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'styling' && (
          <Card>
            <CardContent className="p-4">
              {renderSectionHeader('Styling Settings', 'styling', <Palette className="w-4 h-4" />)}
              {isSectionExpanded('styling') && (
                <div className="p-3 pt-0">
                  {renderStylingSettings()}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'accessibility' && (
          <Card>
            <CardContent className="p-4">
              {renderSectionHeader('Accessibility Settings', 'accessibility', <Eye className="w-4 h-4" />)}
              {isSectionExpanded('accessibility') && (
                <div className="p-3 pt-0">
                  {renderAccessibilitySettings()}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'preview' && (
          <Card>
            <CardContent className="p-4">
              {renderPreview()}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
