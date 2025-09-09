import React, { useState, useEffect } from 'react'
import { Form, FormField } from '@/types'
import StitchDesignCover from './StitchDesignCover'
import StitchDesignThankYou from './StitchDesignThankYou'
import { FieldComponent } from './FieldComponents'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'

interface StitchDesignFormProps {
  form: Form
  onSubmit: (answers: Record<string, any>) => void
  onBack?: () => void
  startOnQuestions?: boolean
}

export default function StitchDesignForm({ 
  form, 
  onSubmit, 
  onBack,
  startOnQuestions = false
}: StitchDesignFormProps) {
  const [currentStep, setCurrentStep] = useState<'cover' | 'questions' | 'thankyou'>(startOnQuestions ? 'questions' : 'cover')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [hasStarted, setHasStarted] = useState(startOnQuestions)

  // Filter out non-question fields
  const questionFields = form.fields.filter(f => 
    f.type !== 'cover_slide' && 
    f.type !== 'end_page' &&
    f.type !== 'geo_restriction' && 
    f.type !== 'url_redirect' &&
    f.type !== 'payment'
  )

  // Get theme properties - ensure they're always available
  const theme = form.theme || {}
  const primaryColor = theme.primary_color || '#4265f0'
  const backgroundColor = theme.background_color || '#f8f9fc'
  const textColor = theme.text_color || '#0d101b'
  const fontFamily = theme.font_family

  const handleStart = () => {
    setHasStarted(true)
    setCurrentStep('questions')
  }

  const handleAnswer = (fieldId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < questionFields.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      // Last question, submit the form
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    } else {
      // Back to cover
      setCurrentStep('cover')
      setHasStarted(false)
    }
  }

  const handleSubmit = () => {
    onSubmit(answers)
    setCurrentStep('thankyou')
  }

  const handleRestart = () => {
    setCurrentStep('cover')
    setCurrentQuestionIndex(0)
    setAnswers({})
    setHasStarted(false)
  }

  const handleBackToCover = () => {
    setCurrentStep('cover')
    setHasStarted(false)
  }

  // Render function for cover screen
  const renderCover = () => (
    <StitchDesignCover
      formTitle={form.title || 'Untitled Form'}
      formDescription={form.description}
      primaryColor={primaryColor}
      backgroundColor={backgroundColor}
      textColor={textColor}
      fontFamily={fontFamily}
      onStart={handleStart}
      onBack={onBack}
    />
  )

  // Render function for thank you screen
  const renderThankYou = () => (
    <StitchDesignThankYou
      formTitle={form.title || 'Untitled Form'}
      thankYouTitle={form.settings?.thankyou_title}
      thankYouDescription={form.settings?.thankyou_description}
      primaryColor={primaryColor}
      backgroundColor={backgroundColor}
      textColor={textColor}
      fontFamily={fontFamily}
      onRestart={handleRestart}
      onBack={handleBackToCover}
    />
  )

  // Render function for single page mode
  const renderSinglePage = () => {
    const layoutSetting = form.settings?.layout || 'vertical'
    const containerLayoutClass = layoutSetting === 'grid' ? 'layout-grid' : layoutSetting === 'horizontal' ? 'layout-horizontal' : 'layout-vertical'
    const hasErrors = questionFields.some((f) => f.required && (answers[f.id] == null || answers[f.id] === '' || (Array.isArray(answers[f.id]) && (answers[f.id] as any[]).length === 0)))

    return (
      <div className="relative flex size-full min-h-screen flex-col justify-between group/design-root overflow-x-hidden" style={{ backgroundColor, fontFamily, color: textColor }}>
        <div>
          <div className="flex items-center p-4 pb-2 justify-between" style={{ backgroundColor }}>
            <div
              className="flex size-12 shrink-0 items-center cursor-pointer rounded-lg transition-colors"
              style={{ color: textColor }}
              onClick={onBack}
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12" style={{ color: textColor }}>
              {form.title || 'Form Preview'}
            </h2>
          </div>
          <div className="px-4 py-5">
            <div className={`form-container ${containerLayoutClass}`} role="group" aria-label="Questions">
              {questionFields.map((qf) => (
                <div key={qf.id} className="min-h-[120px] py-3 question-card-responsive">
                  {layoutSetting === 'horizontal' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                      <label className="text-sm font-medium" style={{ color: textColor }}>{qf.label}{qf.required && <span className="text-red-500 ml-1">*</span>}</label>
                      <div className="sm:col-span-2">
                        <FieldComponent
                          field={{ ...qf, label: '' }}
                          value={answers[qf.id]}
                          onChange={(v) => handleAnswer(qf.id, v)}
                          error={qf.required && (answers[qf.id] == null || answers[qf.id] === '' || (Array.isArray(answers[qf.id]) && (answers[qf.id] as any[]).length === 0)) ? 'This field is required' : undefined}
                          isPreview={false}
                          showLabel={false}
                        />
                      </div>
                    </div>
                  ) : (
                    <FieldComponent
                      field={qf}
                      value={answers[qf.id]}
                      onChange={(v) => handleAnswer(qf.id, v)}
                      error={qf.required && (answers[qf.id] == null || answers[qf.id] === '' || (Array.isArray(answers[qf.id]) && (answers[qf.id] as any[]).length === 0)) ? 'This field is required' : undefined}
                      isPreview={false}
                      showLabel={false}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="flex justify-center px-4 py-3">
            <button
              onClick={handleSubmit}
              disabled={hasErrors}
              className="inline-flex items-center justify-center overflow-hidden rounded-full h-[44px] px-5 text-sm font-semibold leading-normal tracking-[0.015em] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: primaryColor, color: '#f8f9fc' }}
            >
              Submit Form
            </button>
          </div>
          <div className="h-5" style={{ backgroundColor }}></div>
        </div>
      </div>
    )
  }

  // Render function for progressive mode
  const renderProgressive = () => {
    const field = questionFields[currentQuestionIndex]
    const value = answers[field.id]
    const progressPercentage = ((currentQuestionIndex + 1) / questionFields.length) * 100
    const isRequiredUnanswered = Boolean(field.required && (value == null || value === '' || (Array.isArray(value) && value.length === 0)))

    return (
      <div className="relative flex size-full min-h-screen flex-col justify-between group/design-root overflow-x-hidden" style={{ backgroundColor, fontFamily }}>
        <div>
          <div className="flex items-center p-4 pb-2 justify-between" style={{ backgroundColor }}>
            <div
              className="flex size-12 shrink-0 items-center cursor-pointer rounded-lg transition-colors"
              style={{ color: textColor }}
              onClick={handlePrevious}
              data-icon="ArrowLeft"
              data-size="24px"
              data-weight="regular"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12" style={{ color: textColor }}>
              {form.title || 'Form Preview'}
            </h2>
          </div>
          <div className="flex flex-col gap-3 p-4">
            <div className="flex gap-6 justify-between">
              <p className="text-base font-medium leading-normal" style={{ color: textColor }}>
                Question {currentQuestionIndex + 1} of {questionFields.length}
              </p>
            </div>
            <div className="rounded" style={{ backgroundColor: '#cfd4e7' }}>
              <div
                className="h-2 rounded"
                style={{ backgroundColor: primaryColor, width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
          <h3 className="tracking-light text-[clamp(16px,3.5vw,24px)] font-bold leading-tight px-4 text-left pb-2 pt-5" style={{ color: textColor }}>
            {field.label || 'Question'}
          </h3>
          <div className="flex max-w-[min(480px,92vw)] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-[min(140px,35vw)] flex-1">
              <FieldComponent
                field={field}
                value={value}
                onChange={(v) => handleAnswer(field.id, v)}
                error={isRequiredUnanswered ? 'This field is required' : undefined}
                isPreview={false}
                showLabel={false}
              />
            </label>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="inline-flex items-center justify-center overflow-hidden rounded-full h-[44px] px-5 text-sm font-semibold leading-normal tracking-[0.015em] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor, color: textColor, border: `1px solid ${primaryColor}` }}
            >
              <span className="truncate">Back</span>
            </button>
            <button
              onClick={handleNext}
              disabled={isRequiredUnanswered}
              className="inline-flex items-center justify-center overflow-hidden rounded-full h-[44px] px-5 text-sm font-semibold leading-normal tracking-[0.015em] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: primaryColor, color: '#f8f9fc' }}
            >
              <span className="truncate">
                {currentQuestionIndex === questionFields.length - 1 ? 'Submit' : 'Next'}
              </span>
            </button>
          </div>
          <div className="h-5" style={{ backgroundColor }}></div>
        </div>
      </div>
    )
  }

  // Main render logic - always call all hooks, then conditionally render
  if (currentStep === 'cover') {
    return renderCover()
  }

  if (currentStep === 'thankyou') {
    return renderThankYou()
  }

  if (currentStep === 'questions') {
    const isProgressive = (form.settings?.display_mode || 'progressive') === 'progressive'
    
    if (isProgressive) {
      return renderProgressive()
    } else {
      return renderSinglePage()
    }
  }

  // Fallback - should not reach here
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Something went wrong. Please refresh the page.</p>
    </div>
  )
}

