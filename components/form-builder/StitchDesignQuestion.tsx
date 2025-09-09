import React, { useState } from 'react'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import { FormField } from '@/types'

interface StitchDesignQuestionProps {
  field: FormField
  currentQuestionIndex: number
  totalQuestions: number
  onAnswer: (fieldId: string, value: any) => void
  onNext: () => void
  onBack?: () => void
  currentAnswer?: any
}

export default function StitchDesignQuestion({
  field,
  currentQuestionIndex,
  totalQuestions,
  onAnswer,
  onNext,
  onBack,
  currentAnswer
}: StitchDesignQuestionProps) {
  const [inputValue, setInputValue] = useState(currentAnswer || '')

  const handleInputChange = (value: any) => {
    setInputValue(value)
    onAnswer(field.id, value)
  }

  const handleNext = () => {
    if (field.required && !inputValue) {
      // Handle validation
      return
    }
    onNext()
  }

  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100

  const renderFieldInput = () => {
    switch (field.type) {
      case 'short_text':
      case 'email':
      case 'phone':
        return (
          <input
            type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
            placeholder={field.placeholder || `Enter your ${field.label?.toLowerCase()}`}
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d101b] focus:outline-0 focus:ring-0 border-none bg-[#e7eaf3] focus:border-none h-[clamp(48px,10vw,56px)] placeholder:text-[#4c5b9a] p-[clamp(12px,3vw,16px)] text-[clamp(14px,3vw,16px)] font-normal leading-normal"
          />
        )
      
      case 'long_text':
        return (
          <textarea
            placeholder={field.placeholder || `Enter your ${field.label?.toLowerCase()}`}
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            rows={4}
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d101b] focus:outline-0 focus:ring-0 border-none bg-[#e7eaf3] focus:border-none h-[clamp(48px,10vw,56px)] placeholder:text-[#4c5b9a] p-[clamp(12px,3vw,16px)] text-[clamp(14px,3vw,16px)] font-normal leading-normal"
          />
        )
      
      case 'dropdown':
        return (
          <select
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d101b] focus:outline-0 focus:ring-0 border-none bg-[#e7eaf3] focus:border-none h-[clamp(48px,10vw,56px)] placeholder:text-[#4c5b9a] p-[clamp(12px,3vw,16px)] text-[clamp(14px,3vw,16px)] font-normal leading-normal"
          >
            <option value="">Select an option</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        )
      
      case 'radio':
        return (
          <div className="space-y-3">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={inputValue === option}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="w-4 h-4 text-[#4265f0] bg-[#e7eaf3] border-[#4265f0] focus:ring-[#4265f0]"
                />
                <span className="text-[#0d101b] text-base font-normal">{option}</span>
              </label>
            ))}
          </div>
        )
      
      case 'checkbox':
        return (
          <div className="space-y-3">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(inputValue) && inputValue.includes(option)}
                  onChange={(e) => {
                    const newValue = Array.isArray(inputValue) ? [...inputValue] : []
                    if (e.target.checked) {
                      newValue.push(option)
                    } else {
                      const index = newValue.indexOf(option)
                      if (index > -1) newValue.splice(index, 1)
                    }
                    handleInputChange(newValue)
                  }}
                  className="w-4 h-4 text-[#4265f0] bg-[#e7eaf3] border-[#4265f0] focus:ring-[#4265f0]"
                />
                <span className="text-[#0d101b] text-base font-normal">{option}</span>
              </label>
            ))}
          </div>
        )
      
      default:
        return (
          <input
            type="text"
            placeholder={`Enter your ${field.label?.toLowerCase()}`}
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d101b] focus:outline-0 focus:ring-0 border-none bg-[#e7eaf3] focus:border-none h-[clamp(48px,10vw,56px)] placeholder:text-[#4c5b9a] p-[clamp(12px,3vw,16px)] text-[clamp(14px,3vw,16px)] font-normal leading-normal"
          />
        )
    }
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#f8f9fc] justify-between group/design-root overflow-x-hidden">
      <div>
        <div className="flex items-center bg-[#f8f9fc] p-4 pb-2 justify-between">
          <div 
            className="text-[#0d101b] flex size-12 shrink-0 items-center cursor-pointer hover:bg-[#e7eaf3] rounded-lg transition-colors"
            onClick={onBack}
            data-icon="ArrowLeft" 
            data-size="24px" 
            data-weight="regular"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </div>
          <h2 className="text-[#0d101b] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
            Form Preview
          </h2>
        </div>
        <div className="flex flex-col gap-3 p-4">
          <div className="flex gap-6 justify-between">
            <p className="text-[#0d101b] text-base font-medium leading-normal">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </p>
          </div>
          <div className="rounded bg-[#cfd4e7]">
            <div 
              className="h-2 rounded bg-[#4265f0] transition-all duration-300" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
        <h3 className="text-[#0d101b] tracking-light text-[clamp(16px,3.5vw,24px)] font-bold leading-tight px-4 text-left pb-2 pt-5">
          {field.label || 'Question'}
        </h3>
        <div className="flex max-w-[min(480px,92vw)] flex-wrap items-end gap-4 px-4 py-3">
          <label className="flex flex-col min-w-[min(140px,35vw)] flex-1">
            {renderFieldInput()}
          </label>
        </div>
      </div>
      <div>
        <div className="flex px-4 py-3">
          <button
            onClick={handleNext}
            disabled={field.required && !inputValue}
            className="flex min-w-[84px] max-w-[min(480px,85vw)] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-[clamp(44px,6vw,40px)] px-[clamp(16px,3vw,16px)] flex-1 bg-[#4265f0] text-[#f8f9fc] text-[clamp(13px,2.5vw,14px)] font-bold leading-normal tracking-[0.015em] hover:bg-[#3b5bdb] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="truncate">
              {currentQuestionIndex === totalQuestions - 1 ? 'Submit' : 'Next'}
            </span>
          </button>
        </div>
        <div className="h-5 bg-[#f8f9fc]"></div>
      </div>
    </div>
  )
}
