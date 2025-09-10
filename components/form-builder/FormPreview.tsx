'use client'

import React, { useState, useRef } from 'react'
import { Form, FormField } from '@/types'

import { FieldComponent } from './FieldComponents'
import { FormFillingAutoSave } from './FormFillingAutoSave'
import { ResumeDialog } from './ResumeDialog'
import { 
  CheckIcon, 
  ArrowRightIcon,
  ArrowLeftIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface FormPreviewProps {
  form: Form
  onClose: () => void
}

export function FormPreview({ form, onClose }: FormPreviewProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [hasStarted, setHasStarted] = useState(() => {
    const hasCover = form.fields.some(f => f.type === 'cover_slide')
    
    // Always start with cover if it exists, regardless of preset
    return hasCover ? false : true
  })

  // Resume functionality state
  const [showResumeDialog, setShowResumeDialog] = useState(false)
  const [pendingDraft, setPendingDraft] = useState<any | null>(null)
  const autoSaveRef = useRef<any>(null)

  const visibleFields = form.fields.filter(field => {
    // Filter out cover_slide, end_page, geo_restriction, and url_redirect fields for question display
    if (field.type === 'cover_slide' || field.type === 'end_page' || field.type === 'geo_restriction' || field.type === 'url_redirect') {
      return false
    }
    
    // Filter out hidden fields based on conditional logic
    if (field.conditional?.action === 'hide') {
      const dependentField = form.fields.find(f => f.id === field.conditional?.fieldId)
      if (dependentField) {
        const dependentValue = formData[dependentField.id]
        const operator = field.conditional?.operator
        const expectedValue = field.conditional?.value
        
        switch (operator) {
          case 'equals':
            return dependentValue !== expectedValue
          case 'not_equals':
            return dependentValue === expectedValue
          case 'contains':
            return !String(dependentValue).includes(String(expectedValue))
          case 'is_empty':
            return dependentValue && dependentValue !== ''
          case 'is_not_empty':
            return !dependentValue || dependentValue === ''
          default:
            return true
        }
      }
    }
    return true
  })

  const currentField = visibleFields[currentStep]
  const totalSteps = visibleFields.length
  const isLastStep = currentStep === totalSteps - 1
  const isFirstStep = currentStep === 0

  const layoutSetting = form.settings.layout || 'vertical'
  const containerLayoutClass = layoutSetting === 'grid'
    ? 'layout-grid'
    : layoutSetting === 'horizontal'
      ? 'layout-horizontal'
      : 'layout-vertical'

  const isTripePreset = (form.settings.width as any) === 'tripe'
  const isStitchPreset = form.theme?.custom_css?.includes('stitch') || false
  const isStitchProgressive = form.settings.display_mode === 'progressive'
  
  // Always show cover first if it exists, regardless of preset
  const shouldShowCover = form.fields.some(f => f.type === 'cover_slide') && !hasStarted

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }))
    
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({
        ...prev,
        [fieldId]: ''
      }))
    }
  }

  const validateField = (field: FormField, value: any): string | null => {
    if (field.required && (!value || value === '' || (Array.isArray(value) && value.length === 0))) {
      return 'This field is required'
    }

    if (value && field.settings?.minLength && String(value).length < field.settings.minLength) {
      return `Minimum ${field.settings.minLength} characters required`
    }

    if (value && field.settings?.maxLength && String(value).length > field.settings.maxLength) {
      return `Maximum ${field.settings.maxLength} characters allowed`
    }

    if (value && field.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address'
      }
    }

    if (value && field.type === 'number') {
      const numValue = Number(value)
      if (field.settings?.min !== undefined && numValue < field.settings.min) {
        return `Minimum value is ${field.settings.min}`
      }
      if (field.settings?.max !== undefined && numValue > field.settings.max) {
        return `Maximum value is ${field.settings.max}`
      }
    }

    return null
  }

  const handleNext = () => {
    const error = validateField(currentField, formData[currentField.id])
    if (error) {
      setErrors(prev => ({
        ...prev,
        [currentField.id]: error
      }))
      return
    }

    if (isLastStep) {
      handleSubmit()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    // Serialize upload fields to remote URLs if present
    const serialized: Record<string, any> = {}
    for (const field of form.fields) {
      const v = formData[field.id]
      if (field.type === 'image_upload' || field.type === 'file_upload' || field.type === 'video_upload') {
        // Expect arrays of items/rows with remoteUrl
        const list = Array.isArray(v) ? v : []
        serialized[field.id] = list.map((it: any) => it?.remoteUrl).filter(Boolean)
      } else {
        serialized[field.id] = v
      }
    }

    try {
      const response = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId: form.id,
          userId: null,
          sessionId: null,
          ipAddress: null,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
          referrer: null,
          status: 'pending',
          isSpam: false,
          spamScore: null,
          data: serialized,
          metadata: { userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server' }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit form response')
      }
    } catch (e) {
      console.error('Failed to save response', e)
    }
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    
    // Clear draft after successful submission
    if (autoSaveRef.current?.clearDraft) {
      autoSaveRef.current.clearDraft()
    }
  }

  // Draft management methods
  const onDraftRestored = (draft: any) => {
    console.log('📄 Form filling draft found:', draft)
    setPendingDraft(draft)
    // Auto-restore draft without showing dialog
    if (draft && draft.data) {
      setFormData(draft.data)
    }
    // Don't show resume dialog - just use in-memory functionality
    // setShowResumeDialog(true)
  }

  const onDraftSaved = (draftId: string) => {
    console.log('✅ Form filling draft saved with ID:', draftId)
  }

  const resumeDraft = () => {
    if (!pendingDraft) return

    try {
      const draftData = pendingDraft.source === 'server' 
        ? pendingDraft.data.draftData 
        : pendingDraft.data

      setFormData(draftData)
      setShowResumeDialog(false)
      setPendingDraft(null)
      
      console.log('✅ Form filling draft resumed successfully')
    } catch (error) {
      console.error('❌ Failed to resume form filling draft:', error)
    }
  }

  const startOver = async () => {
    if (!pendingDraft) return

    try {
      // Delete the draft from server if it exists
      if (pendingDraft.source === 'server' && pendingDraft.data.id) {
        await fetch(`/api/drafts/${pendingDraft.data.id}`, {
          method: 'DELETE'
        })
      }

      // Clear localStorage draft
      localStorage.removeItem(`stripeform_filling_${form.id}`)

      setFormData({})
      setShowResumeDialog(false)
      setPendingDraft(null)
      
      console.log('✅ Form filling started over, draft cleared')
    } catch (error) {
      console.error('❌ Failed to clear form filling draft:', error)
      // Still close dialog even if cleanup fails
      setShowResumeDialog(false)
      setPendingDraft(null)
    }
  }

  if (isSubmitted) {
    // Find the end page field
    const endPageField = form.fields.find(f => f.type === 'end_page') as any
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl max-w-5xl w-full mx-4 max-h-[95vh] overflow-hidden" style={{
          backgroundColor: endPageField?.settings?.endPageBackgroundColor || undefined
        }}>
          {/* Header */}
          <div className="p-5 md:p-5 border-b border-gray-200" style={{
            backgroundColor: endPageField?.settings?.endPageBackgroundColor || undefined
          }}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{form.title}</h1>
                {form.description && (
                  <p className="text-gray-600 mt-1">{form.description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* End Page Content */}
          <div className="p-5 md:p-5 overflow-y-auto max-h-[85vh]" style={{
            backgroundColor: endPageField?.settings?.endPageBackgroundColor || 'transparent'
          }}>
            <div className="min-h-[400px] flex flex-col justify-center items-center text-center">
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckIcon className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {endPageField?.settings?.endPageTitle || 'Thank you!'}
                </h2>
                <p className="text-lg text-gray-600">
                  {endPageField?.settings?.endPageMessage || form.settings.success_message || 'Your response has been submitted successfully.'}
                </p>
                {endPageField?.settings?.endPageButtonText && (
                  <div className="mt-8">
                    <button
                      onClick={onClose}
                      className="px-8 py-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-lg"
                      style={{
                        backgroundColor: endPageField?.settings?.endPageButtonColor || '#2563eb'
                      }}
                    >
                      {endPageField.settings.endPageButtonText}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl max-w-5xl w-full mx-4 max-h-[95vh] overflow-hidden" style={{
        backgroundColor: (() => {
          const cover = form.fields.find(f => f.type === 'cover_slide') as any
          return cover?.settings?.coverBackgroundColor || undefined
        })()
      }}>
        {/* Header */}
        <div className="p-5 md:p-5 border-b border-gray-200" style={{
          backgroundColor: (() => {
            const cover = form.fields.find(f => f.type === 'cover_slide') as any
            return cover?.settings?.coverBackgroundColor || undefined
          })()
        }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{form.title}</h1>
              {form.description && (
                <p className="text-gray-600 mt-1">{form.description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          {/* Progress Bar */}
          {!shouldShowCover && form.settings.show_progress_bar && totalSteps > 1 && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Question {currentStep + 1} of {totalSteps}</span>
                <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Form Content */}
        <div className="p-5 md:p-5 overflow-y-auto max-h-[85vh]" style={{
          backgroundColor: (() => {
            const cover = form.fields.find(f => f.type === 'cover_slide') as any
            return cover?.settings?.coverBackgroundColor || 'transparent'
          })()
        }}>
          {shouldShowCover ? (
            // Show professional cover page
            <div className="min-h-[500px] flex flex-col justify-center items-center text-center relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%), 
                                   radial-gradient(circle at 75% 75%, #8b5cf6 0%, transparent 50%)`,
                }} />
              </div>
              
              {/* Content */}
              <div className="relative z-10 max-w-4xl mx-auto px-6 space-y-8">
                {/* Brand Logo Area */}
                <div className="flex justify-center mb-6">
                  {form.brandKit?.logo?.url && (
                    <div className="flex items-center justify-center">
                      <img
                        src={form.brandKit.logo.url}
                        alt={form.brandKit.logo.alt || 'Brand Logo'}
                        className="max-w-20 max-h-20 object-contain"
                        style={{
                          width: form.brandKit.logo.width ? `${form.brandKit.logo.width}px` : '80px',
                          height: form.brandKit.logo.height ? `${form.brandKit.logo.height}px` : '80px'
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Title */}
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent leading-tight">
                    {(() => {
                      const cover = form.fields.find(f => f.type === 'cover_slide') as any
                      return cover?.settings?.coverTitle || form.title || 'Welcome'
                    })()}
                  </h1>
                  
                  {(() => {
                    const cover = form.fields.find(f => f.type === 'cover_slide') as any
                    return cover?.settings?.coverSubtitle && (
                      <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        {cover.settings.coverSubtitle}
                      </p>
                    )
                  })()}
                </div>

                {/* Call to Action */}
                <div className="pt-8">
                  <button
                    onClick={() => setHasStarted(true)}
                    className="group relative inline-flex items-center justify-center px-12 py-4 text-lg font-semibold text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    style={{
                      background: (() => {
                        const cover = form.fields.find(f => f.type === 'cover_slide') as any
                        return cover?.settings?.coverButtonColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      })()
                    }}
                  >
                    <span className="relative z-10">
                      {(() => {
                        const cover = form.fields.find(f => f.type === 'cover_slide') as any
                        return cover?.settings?.coverCtaText || 'Get Started'
                      })()}
                    </span>
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>

                {/* Additional Info */}
                <div className="pt-6">
                  <p className="text-sm text-gray-500 flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Your information is secure and confidential</span>
                  </p>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-blue-100 opacity-20 animate-pulse"></div>
              <div className="absolute bottom-10 right-10 w-16 h-16 rounded-full bg-purple-100 opacity-20 animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-5 w-12 h-12 rounded-full bg-indigo-100 opacity-20 animate-pulse delay-500"></div>
            </div>
          ) : form.settings.display_mode === 'progressive' ? (
            // Progressive mode: show one field at a time
            <div className="space-y-4 md:space-y-5">
              <div className="animate-fade-in">
                <FieldComponent
                  field={currentField}
                  value={formData[currentField.id]}
                  onChange={(value) => handleFieldChange(currentField.id, value)}
                  error={errors[currentField.id]}
                  isPreview={true}
                  showLabel={true}
                />
              </div>
            </div>
          ) : isStitchPreset ? (
            // Stitch preset: customer feedback form design
            <div className="stitch-form">
              <div className="stitch-card">
                {/* Header */}
                <div className="stitch-header">
                  <h1 className="stitch-title">{form.title || 'Customer Feedback'}</h1>
                  <p className="stitch-progress">
                    Question {currentStep + 1} of {totalSteps}
                  </p>
                </div>
                
                {/* Content */}
                <div className="stitch-content">
                  {isStitchProgressive ? (
                    // Progressive mode: show one question at a time
                    <div className="stitch-field">
                      <div className="stitch-question">
                        {currentField.label}
                        {currentField.required && <span className="text-red-500 ml-1">*</span>}
                      </div>
                      
                      {currentField.description && (
                        <p className="stitch-description">
                          {currentField.description}
                        </p>
                      )}
                      
                      {/* Field Input */}
                      <div className="relative">
                        <FieldComponent
                          field={{ ...currentField, label: '' }}
                          value={formData[currentField.id]}
                          onChange={(value) => handleFieldChange(currentField.id, value)}
                          error={errors[currentField.id]}
                          isPreview={true}
                          showLabel={false}
                        />
                      </div>
                      
                      {/* Field Error */}
                      {errors[currentField.id] && (
                        <p className="mt-2 text-sm text-red-600">{errors[currentField.id]}</p>
                      )}
                    </div>
                  ) : (
                    // Single page mode: show all questions
                    <div className="space-y-6">
                      {visibleFields.map((field, index) => (
                        <div key={field.id} className="stitch-field">
                          <div className="stitch-question">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </div>
                          
                          {field.description && (
                            <p className="stitch-description">
                              {field.description}
                            </p>
                          )}
                          
                          {/* Field Input */}
                          <div className="relative">
                            <FieldComponent
                              field={{ ...field, label: '' }}
                              value={formData[field.id]}
                              onChange={(value) => handleFieldChange(field.id, value)}
                              error={errors[field.id]}
                              isPreview={true}
                              showLabel={false}
                            />
                          </div>
                          
                          {/* Field Error */}
                          {errors[field.id] && (
                            <p className="mt-2 text-sm text-red-600">{errors[field.id]}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Navigation */}
                {isStitchProgressive && (
                  <div className="stitch-navigation">
                    <button
                      onClick={handlePrevious}
                      disabled={isFirstStep}
                      className="stitch-back"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={isLastStep ? handleSubmit : handleNext}
                      disabled={isSubmitting}
                      className="stitch-next"
                    >
                      {isSubmitting ? 'Submitting...' : isLastStep ? 'Submit' : 'Next →'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {isTripePreset ? (
                // Tripe form - no question cards, direct on canvas
                <div className="space-y-8 px-6 py-8 relative">
                  {/* Floating Navigation for Single Mode */}
                  {form.settings.display_mode === 'single_page' && visibleFields.length > 3 && (
                    <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40">
                      <div className="bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-600 p-2">
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            title="Scroll to top"
                          >
                            <ChevronUpIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button
                            onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            title="Scroll to bottom"
                          >
                            <ChevronDownIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {visibleFields.map((field) => (
                    <div key={field.id} className="space-y-6">
                      {/* Question Title */}
                      <div className="text-center">
                        <h3 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-2">*</span>}
                        </h3>
                        {field.description && (
                          <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto">
                            {field.description}
                          </p>
                        )}
                      </div>
                      
                      {/* Field Input */}
                      <div className="flex justify-center">
                        <div className="w-full max-w-2xl">
                          <FieldComponent
                            field={{ ...field, label: '' }}
                            value={formData[field.id]}
                            onChange={(value) => handleFieldChange(field.id, value)}
                            error={errors[field.id]}
                            isPreview={true}
                            showLabel={false}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Other presets - keep existing question card structure
                <div className={`form-container ${containerLayoutClass}`} role="group" aria-label="Questions">
                  {visibleFields.map((field) => (
                    <div key={field.id} className="question-card">
                      <FieldComponent
                        field={{ ...field, label: '' }}
                        value={formData[field.id]}
                        onChange={(value) => handleFieldChange(field.id, value)}
                        error={errors[field.id]}
                        isPreview={true}
                        showLabel={false}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 md:p-4 border-t border-gray-200 bg-gray-50" style={{
          backgroundColor: (() => {
            const cover = form.fields.find(f => f.type === 'cover_slide') as any
            return cover?.settings?.coverBackgroundColor || undefined
          })()
        }}>
          {!shouldShowCover && form.settings.display_mode === 'progressive' ? (
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={isFirstStep}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isFirstStep
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={handleNext}
                disabled={isSubmitting}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : isLastStep ? (
                  <>
                    <PaperAirplaneIcon className="w-4 h-4" />
                    <span>Submit</span>
                  </>
                ) : (
                  <>
                    <span>Next</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          ) : !shouldShowCover && form.settings.display_mode === 'single_page' ? (
            // Single page mode: show submit button
            <div className="flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="w-4 h-4" />
                    <span>{form.settings.submit_button_text || 'Submit'}</span>
                  </>
                )}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Form Filling AutoSave Component */}
      <FormFillingAutoSave
        ref={autoSaveRef}
        formId={form.id}
        formData={formData}
        onDraftRestored={onDraftRestored}
        onDraftSaved={onDraftSaved}
      />

      {/* Resume Dialog */}
      {showResumeDialog && pendingDraft && (
        <ResumeDialog
          draft={pendingDraft.data}
          onResume={resumeDraft}
          onStartOver={startOver}
          onCancel={() => setShowResumeDialog(false)}
          isOpen={showResumeDialog}
        />
      )}
    </div>
  )
} 