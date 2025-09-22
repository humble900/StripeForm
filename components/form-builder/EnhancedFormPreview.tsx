'use client'

import React, { useState, useEffect } from 'react'
import { 
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { FieldComponent } from './FieldComponents'
import CoverCard from './CoverCard'
import StitchDesignThankYou from './StitchDesignThankYou'
import { Form } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface EnhancedFormPreviewProps {
  form: Form
  isPreview?: boolean
  onClose?: () => void
  submitMode?: 'simulate' | 'api'
}

interface FormData {
  [key: string]: any
}

export default function EnhancedFormPreview({ 
  form, 
  isPreview = true, 
  onClose,
  submitMode = 'simulate'
}: EnhancedFormPreviewProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FormData>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showThankYou, setShowThankYou] = useState(false)
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({})
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Form settings
  const isTypeformPreset = form.theme?.custom_css?.includes('typeform') || false
  const isTripePreset = form.theme?.custom_css?.includes('tripe') || false
  const isStitchPreset = form.theme?.custom_css?.includes('stitch') || false
  const isProgressive = form.settings?.display_mode === 'progressive'
  
  // Layout settings
  const layoutSetting = form.settings.layout || 'vertical'
  const containerLayoutClass = layoutSetting === 'grid'
    ? 'layout-grid'
    : layoutSetting === 'horizontal'
      ? 'layout-horizontal'
      : 'layout-vertical'
  
  // Filter out cover_slide, end_page, geo_restriction, and url_redirect fields
  const visibleFields = form.fields?.filter(field => 
    field.type !== 'cover_slide' && 
    field.type !== 'end_page' && 
    field.type !== 'geo_restriction' && 
    field.type !== 'url_redirect'
  ) || []
  
  const totalSteps = isProgressive ? visibleFields.length : 1
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === totalSteps - 1

  // Get current field for progressive mode or all fields for single page mode
  const getCurrentFields = () => {
    if (!isProgressive) return visibleFields
    
    // Progressive mode: show one field at a time
    return visibleFields[currentStep] ? [visibleFields[currentStep]] : []
  }

  const currentFields = getCurrentFields()

  // Handle field value changes
  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }))
    
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldId]
        return newErrors
      })
    }
  }

  // Toggle password visibility
  const togglePasswordVisibility = (fieldId: string) => {
    setShowPassword(prev => ({
      ...prev,
      [fieldId]: !prev[fieldId]
    }))
  }

  // Validation
  const validateField = (field: any, value: any): string | null => {
    if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return `${field.label || 'This field'} is required`
    }

    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address'
      }
    }

    if (field.type === 'url' && value) {
      try {
        new URL(value)
      } catch {
        return 'Please enter a valid URL'
      }
    }

    if (field.validation) {
      for (const rule of field.validation) {
        if (rule.type === 'min_length' && value && value.length < rule.value) {
          return rule.message || `Minimum length is ${rule.value} characters`
        }
        if (rule.type === 'max_length' && value && value.length > rule.value) {
          return rule.message || `Maximum length is ${rule.value} characters`
        }
        if (rule.type === 'pattern' && rule.pattern && value) {
          const regex = new RegExp(rule.pattern)
          if (!regex.test(value)) {
            return rule.message || 'Invalid format'
          }
        }
      }
    }

    return null
  }

  // Validate current step
  const validateCurrentStep = (): boolean => {
    const newErrors: { [key: string]: string } = {}
    let isValid = true

    currentFields.forEach(field => {
      const value = formData[field.id]
      const error = validateField(field, value)
      
      if (error) {
        newErrors[field.id] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  // Navigation
  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateCurrentStep()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      if (submitMode === 'api') {
        // Handle payment if present and payment API available
        const paymentField = form?.fields?.find((f: any) => f.type === 'payment') as any
        if (paymentField && paymentField.settings?.paymentApiRef && typeof paymentField.settings.paymentApiRef.confirm === 'function') {
          const result = await paymentField.settings.paymentApiRef.confirm()
          if (!result?.ok) {
            throw new Error(result?.error || 'Payment failed')
          }
        }

        const response = await fetch('/api/forms/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ formId: form.id, data: formData })
        })
        if (!response.ok) {
          throw new Error('Failed to submit form')
        }
        setShowThankYou(true)
      } else {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1500))
      setShowThankYou(true)
      }
      
      // Reset form data
      setFormData({})
      setCurrentStep(0)
      setErrors({})
      
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
    setIsSubmitting(false)
    }
  }

  // Reset form
  const handleReset = () => {
    setFormData({})
    setCurrentStep(0)
    setErrors({})
    setShowThankYou(false)
  }

  // If showing thank you page
  if (showThankYou) {
    const endPageField = form.fields?.find(f => f.type === 'end_page') as any
    
    if (endPageField) {
      // Use custom end page
      return (
        <div className="min-h-screen flex items-center justify-center" style={{
          backgroundColor: endPageField.settings?.endPageBackgroundColor || form.theme?.background_color || '#f8f9fc'
        }}>
          <div className="max-w-2xl mx-auto text-center px-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4" style={{
              color: form.theme?.text_color || '#0d101b',
              fontFamily: form.theme?.font_family || 'Inter'
            }}>
              {endPageField.settings?.endPageTitle || 'Thank you!'}
            </h1>
            <p className="text-lg text-gray-600 mb-8" style={{
              color: form.theme?.text_color || '#0d101b',
              fontFamily: form.theme?.font_family || 'Inter'
            }}>
              {endPageField.settings?.endPageMessage || form.settings?.success_message || 'Your response has been submitted successfully.'}
            </p>
            {endPageField.settings?.endPageButtonText && (
              <button
                onClick={onClose}
                className="px-8 py-4 rounded-lg font-medium text-white transition-colors"
                style={{
                  backgroundColor: endPageField.settings?.endPageButtonColor || form.theme?.primary_color || '#4265f0',
                  fontFamily: form.theme?.font_family || 'Inter'
                }}
              >
                {endPageField.settings.endPageButtonText}
              </button>
            )}
          </div>
        </div>
      )
    } else {
      // Use default thank you page
      return (
        <StitchDesignThankYou 
          formTitle={form.title || 'Form'}
          thankYouTitle={form.settings?.success_message || 'Thank you for your submission!'}
          thankYouDescription="We appreciate you taking the time to complete this form. Your information has been successfully received."
          onRestart={handleReset}
          onBack={onClose}
          primaryColor={form.theme?.primary_color || '#4265f0'}
          backgroundColor={form.theme?.background_color || '#f8f9fc'}
          textColor={form.theme?.text_color || '#0d101b'}
          fontFamily={form.theme?.font_family || 'Inter'}
        />
      )
    }
  }

  // If showing cover page
  const coverField = form.fields?.find(f => f.type === 'cover_slide') as any
  if (coverField && currentStep === 0) {
    return (
      <div className="h-screen flex flex-col justify-center items-center text-center relative overflow-hidden" style={{
        backgroundColor: coverField.settings?.coverBackgroundColor || form.theme?.background_color || '#f8fafc'
      }}>
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
              {coverField.settings?.coverTitle || form.title || 'Welcome'}
            </h1>
            
            {coverField.settings?.coverSubtitle && (
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                {coverField.settings.coverSubtitle}
              </p>
            )}
          </div>

          {/* Call to Action */}
          <div className="pt-8">
            <button
              onClick={() => setCurrentStep(1)}
              className="group relative inline-flex items-center justify-center px-12 py-4 text-lg font-semibold text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              style={{
                background: coverField.settings?.coverButtonColor || form.theme?.primary_color || '#6C5CE7'
              }}
            >
              <span className="relative z-10">
                {coverField.settings?.coverCtaText || 'Get Started'}
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
    )
  }

  // Main form preview
  return (
    <div 
      className={isPreview ? `min-h-screen` : ''} 
      style={{
        backgroundColor: 'transparent',
        backgroundImage: undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        fontFamily: (form as any)?.brandKit?.typography?.fontFamily?.primary || form.theme?.font_family || 'Inter, sans-serif'
      }}
    >
      {/* Inject custom CSS from theme if provided and in preview mode */}
      {isPreview && form.theme?.custom_css && (
        <style 
          dangerouslySetInnerHTML={{ __html: String(form.theme.custom_css) }} 
        />
          )}

      {/* Progress Bar */}
      {isProgressive && totalSteps > 1 && (
        <div className="bg-transparent border-b px-4 py-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Step {currentStep + 1} of {totalSteps}</span>
            <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
              </div>
            </div>
          )}
          
      {/* Form Content */}
      <div 
        className={`mx-auto px-3 py-4 ${
          (form as any)?.brandKit?.formStyling?.layout?.width === 'small' ? 'max-w-sm' :
          (form as any)?.brandKit?.formStyling?.layout?.width === 'medium' ? 'max-w-xl' :
          (form as any)?.brandKit?.formStyling?.layout?.width === 'large' ? 'max-w-4xl' :
          (form as any)?.brandKit?.formStyling?.layout?.width === 'full' ? 'w-full max-w-none' :
          (form as any)?.brandKit?.formStyling?.layout?.width === 'custom' ? '' : 'max-w-xl'
        }`}
        style={(form as any)?.brandKit?.formStyling?.layout?.width === 'custom' ? {
          maxWidth: (form as any)?.brandKit?.formStyling?.layout?.maxWidth || '768px'
        } : {}}
      >
        <div
          className="overflow-visible"
          style={{
            backgroundColor: 'transparent',
            borderRadius: `${form.theme?.border_radius || 12}px`
          }}
        >
          {isPreview && (
            <div className="flex items-center justify-between px-4 py-2 bg-blue-50 text-blue-700">
              <Badge variant="secondary">Preview Mode</Badge>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="h-7 px-3 text-xs" onClick={handleReset}>
                  Reset
                </Button>
                {onClose && (
                  <Button variant="outline" className="h-7 px-3 text-xs" onClick={onClose}>
                    Close
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Main form container (header + body together) */}
          <div
            className="relative border border-gray-200 rounded-lg shadow"
            style={{
              backgroundColor: (
                ((form as any)?.brandKit?.colors?.formBackground?.hex) 
                || form.theme?.background_color 
                || '#FFFFFF'
              ) as string
            }}
          >
          <form onSubmit={handleSubmit} className="px-0 pt-0 pb-3 space-y-3">
            {/* Header Section (shared preview + published) */}
            {(form.brandKit?.logo?.url || (form.theme as any)?.logo?.url || (form.theme as any)?.textLogo?.text || form.title || form.description || form.theme?.header_image_url) && (
              <div 
                className="relative w-full py-8 px-4"
                style={{
                  backgroundColor: ((form as any)?.brandKit?.colors?.headerBackground?.hex || form.theme?.header_color || 'transparent') as string,
                  backgroundImage: form.theme?.header_image_url ? `url(${form.theme.header_image_url})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                {/* Overlay for better text readability when header image is present */}
                {form.theme?.header_image_url && (
                  <div 
                    className="absolute inset-0 bg-black bg-opacity-40"
                    style={{
                      backgroundColor: form.theme?.header_color ? `${form.theme.header_color}CC` : 'rgba(0,0,0,0.4)'
                    }}
                  />
                )}
                
                {/* Header Content Container */}
                <div className="relative z-10 max-w-4xl mx-auto">
                  {/* Centered logo at top when present */}
                  {(form.brandKit?.logo?.url || (form.theme as any)?.logo?.url || (form.theme as any)?.textLogo?.text) && (
                    <div className="w-full flex items-center justify-center mb-4">
                      { (form.brandKit?.logo?.url || (form.theme as any)?.logo?.url) ? (
                        <img
                          src={(form.brandKit?.logo?.url || (form.theme as any)?.logo?.url) as string}
                          alt={(form.brandKit?.logo?.alt || (form.theme as any)?.logo?.alt || 'Brand Logo') as string}
                          className="object-contain"
                          style={{
                            maxHeight: '64px',
                            maxWidth: '220px',
                            width: (form.brandKit?.logo?.width || (form.theme as any)?.logo?.width) ? `${(form.brandKit?.logo?.width || (form.theme as any)?.logo?.width) as number}px` : 'auto',
                            height: (form.brandKit?.logo?.height || (form.theme as any)?.logo?.height) ? `${(form.brandKit?.logo?.height || (form.theme as any)?.logo?.height) as number}px` : 'auto'
                          }}
                        />
                      ) : (
                        <h1
                          className="font-bold"
                          style={{
                            color: form.theme?.header_image_url ? '#FFFFFF' : ((form.brandKit as any)?.textLogo?.color || (form.theme as any)?.textLogo?.color || '#111827'),
                            fontFamily: ((form.brandKit as any)?.textLogo?.fontFamily || (form.theme as any)?.textLogo?.fontFamily || 'inherit'),
                            fontWeight: ((form.brandKit as any)?.textLogo?.fontWeight || (form.theme as any)?.textLogo?.fontWeight || 700) as any,
                            fontSize: ((form.brandKit as any)?.textLogo?.fontSize || (form.theme as any)?.textLogo?.fontSize) === 'sm' ? '0.875rem' :
                                      ((form.brandKit as any)?.textLogo?.fontSize || (form.theme as any)?.textLogo?.fontSize) === 'base' ? '1rem' :
                                      ((form.brandKit as any)?.textLogo?.fontSize || (form.theme as any)?.textLogo?.fontSize) === 'lg' ? '1.125rem' :
                                      ((form.brandKit as any)?.textLogo?.fontSize || (form.theme as any)?.textLogo?.fontSize) === 'xl' ? '1.25rem' :
                                      ((form.brandKit as any)?.textLogo?.fontSize || (form.theme as any)?.textLogo?.fontSize) === '2xl' ? '1.5rem' :
                                      ((form.brandKit as any)?.textLogo?.fontSize || (form.theme as any)?.textLogo?.fontSize) === '3xl' ? '1.875rem' :
                                      ((form.brandKit as any)?.textLogo?.fontSize || (form.theme as any)?.textLogo?.fontSize) === '4xl' ? '2.25rem' : '1.25rem',
                            textShadow: form.theme?.header_image_url ? '0 2px 4px rgba(0,0,0,0.5)' : 'none'
                          }}
                        >
                          {(form.brandKit as any)?.textLogo?.text || (form.theme as any)?.textLogo?.text}
                        </h1>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col items-center text-center space-y-6">
                    {/* Title and Description Section */}
                    <div className="space-y-4 max-w-2xl">
                      {form.title && (
                        <h1 
                          className="text-3xl md:text-4xl font-bold"
                          style={{ 
                            color: form.theme?.header_image_url ? '#FFFFFF' : (form.theme?.text_color || '#1F2937'),
                            fontFamily: form.theme?.font_family || 'Inter, sans-serif',
                            textShadow: form.theme?.header_image_url ? '0 2px 4px rgba(0,0,0,0.5)' : 'none'
                          }}
                        >
                          {form.title}
                        </h1>
                      )}
                      
                      {form.description && (
                        <p 
                          className="text-lg md:text-xl"
                          style={{ 
                            color: form.theme?.header_image_url ? '#F3F4F6' : (form.theme?.text_color || '#6B7280'),
                            fontFamily: form.theme?.font_family || 'Inter, sans-serif',
                            textShadow: form.theme?.header_image_url ? '0 2px 4px rgba(0,0,0,0.5)' : 'none'
                          }}
                        >
                          {form.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* Form Fields */}
          <div className="relative px-4">
          {isProgressive ? (
              <div className="space-y-3">
              {currentFields.map((field) => (
                <div 
                  key={field.id} 
                  className="space-y-2 p-4 rounded-lg border"
                  style={{
                    backgroundColor: ((form as any)?.brandKit?.colors?.fieldBackground?.hex || '#FFFFFF') as string,
                    borderColor: '#e5e7eb'
                  }}
                >
                    <div 
                      className="text-xs font-medium"
                      style={{
                        color: form.theme?.text_color || '#374151',
                        fontFamily: (form as any)?.brandKit?.typography?.fontFamily?.primary || form.theme?.font_family || 'Inter, sans-serif'
                      }}
                    >
                      {field.label || 'Untitled question'}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                  </div>
                  <div className="relative">
                    <FieldComponent
                      field={field}
                      value={formData[field.id]}
                      onChange={(value) => handleFieldChange(field.id, value)}
                      error={errors[field.id]}
                      isPreview={isPreview}
                      disabled={false}
                        showLabel={false}
                    />
                  </div>
                    {errors[field.id] && <p className="text-xs text-red-600">{errors[field.id]}</p>}
                </div>
              ))}
            </div>
          ) : isStitchPreset ? (
              <div className="space-y-3">
                {currentFields.map((field) => (
                  <div key={field.id} className="space-y-2 p-4 rounded-lg border" style={{ backgroundColor: ((form as any)?.brandKit?.colors?.fieldBackground?.hex || '#FFFFFF') as string, borderColor: '#e5e7eb' }}>
                    <div 
                      className="text-xs font-medium text-gray-700"
                      style={{ fontFamily: (form as any)?.brandKit?.typography?.fontFamily?.primary || form.theme?.font_family || 'Inter, sans-serif' }}
                    >
                      {field.label || 'Untitled question'}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </div>
                          <div className="relative">
                            <FieldComponent
                              field={{ ...field, label: '' }}
                              value={formData[field.id]}
                              onChange={(value) => handleFieldChange(field.id, value)}
                              error={errors[field.id]}
                              isPreview={isPreview}
                              disabled={false}
                              showLabel={false}
                            />
                          </div>
                    {errors[field.id] && <p className="text-xs text-red-600">{errors[field.id]}</p>}
                  </div>
                ))}
            </div>
          ) : (
              <div className="space-y-3">
              {currentFields.map((field) => (
                  <div key={field.id} className="space-y-2 p-4 rounded-lg border" style={{ backgroundColor: ((form as any)?.brandKit?.colors?.fieldBackground?.hex || '#FFFFFF') as string, borderColor: '#e5e7eb' }}>
                    <div 
                      className="text-xs font-medium"
                      style={{
                        color: form.theme?.text_color || '#374151',
                        fontFamily: (form as any)?.brandKit?.typography?.fontFamily?.primary || form.theme?.font_family || 'Inter, sans-serif'
                      }}
                    >
                      {field.label || 'Untitled question'}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                  </div>
                  <div className="relative">
                    <FieldComponent
                        field={{ ...field, label: '' }}
                      value={formData[field.id]}
                      onChange={(value) => handleFieldChange(field.id, value)}
                      error={errors[field.id]}
                      isPreview={isPreview}
                      disabled={false}
                      showLabel={false}
                    />
                  </div>
                    {errors[field.id] && <p className="text-xs text-red-600">{errors[field.id]}</p>}
                </div>
              ))}
            </div>
          )}
            </div>

            {/* Submit Button */}
            <div className="mt-3 px-4 flex justify-center">
              <Button
                className="h-9 px-4 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm"
                type="submit"
                style={{
                  padding: (form as any)?.brandKit?.formStyling?.button?.primary?.padding || undefined,
                  borderRadius: (form as any)?.brandKit?.formStyling?.button?.primary?.borderRadius || undefined,
                  fontFamily: (form as any)?.brandKit?.typography?.fontFamily?.primary || form.theme?.font_family || 'Inter, sans-serif'
                }}
              >
                {(form as any)?.settings?.submit_button_text || 'Submit'}
              </Button>
            </div>
        </form>
          </div>
        </div>
      </div>
      
    </div>
  )
}

// Payment Field Preview Component
function PreviewStripePaymentSection({ field }: { field: any }) {
  const amountCents = Number(field?.settings?.amount || 0)
  const currency = String(field?.settings?.currency || 'usd')
  const allowCustom = Boolean(field?.settings?.allowCustomAmount)

  return (
    <div className="space-y-4 p-6 border rounded-lg bg-gray-50">
      <div className="text-center">
        <div className="text-blue-600 mb-3 text-4xl">💳</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Field Preview</h3>
        <p className="text-sm text-gray-600 mb-4">
          This is a preview of the payment field. Configure Stripe settings in the form builder.
        </p>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm font-medium text-gray-700 mb-2">Amount:</div>
          <div className="text-2xl font-bold text-gray-900">
        {allowCustom ? (
              <span className="text-blue-600">Custom Amount</span>
            ) : (
              new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: currency.toUpperCase() 
              }).format(amountCents / 100)
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1">Currency: {currency.toUpperCase()}</div>
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          💡 Enable Stripe integration in form settings to collect real payments
        </div>
      </div>
    </div>
  )
}
