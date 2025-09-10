'use client'

import React from 'react'
import { 
  DocumentTextIcon, 
  ClockIcon, 
  ArrowPathIcon,
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface FormDraft {
  id: string
  formId: string
  draftData: {
    title: string
    description?: string
    fields: any[]
    settings: any
    theme: any
    brandKit?: any
  }
  progressData: {
    lastSaved: string
    fieldCount: number
    hasCover: boolean
    completedFields?: number
  }
  lastAccessedAt: string
  createdAt: string
  updatedAt: string
}

interface ResumeDialogProps {
  draft: FormDraft
  onResume: () => void
  onStartOver: () => void
  onCancel: () => void
  isOpen: boolean
}

export function ResumeDialog({ 
  draft, 
  onResume, 
  onStartOver, 
  onCancel, 
  isOpen 
}: ResumeDialogProps) {
  if (!isOpen) return null

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const getProgressPercentage = () => {
    if (!draft.progressData || !draft.progressData.completedFields) return 0
    return Math.round((draft.progressData.completedFields / draft.progressData.fieldCount) * 100)
  }

  const progressPercentage = getProgressPercentage()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <DocumentTextIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Resume Form</h3>
              <p className="text-sm text-gray-500">Continue where you left off</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Form Info */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">{draft.draftData?.title || 'Untitled Form'}</h4>
            {draft.draftData?.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {draft.draftData.description}
              </p>
            )}
          </div>

          {/* Progress Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium text-gray-900">
                {draft.progressData?.completedFields || 0} of {draft.progressData?.fieldCount || 0} questions
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{progressPercentage}% complete</span>
              <div className="flex items-center space-x-1">
                <ClockIcon className="w-3 h-3" />
                <span>Last saved {formatTimeAgo(draft.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Form Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
              <span className="text-gray-600">
                {draft.progressData?.fieldCount || 0} questions
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {draft.progressData?.hasCover ? (
                <DocumentTextIcon className="w-4 h-4 text-blue-500" />
              ) : (
                <CheckCircleIcon className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-gray-600">
                {draft.progressData?.hasCover ? 'With cover page' : 'No cover page'}
              </span>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <svg className="w-4 h-4 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="text-sm">
                <p className="text-yellow-800 font-medium">Starting over will delete your current progress</p>
                <p className="text-yellow-700">Your draft will be permanently lost.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onStartOver}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Start Over
          </button>
          <button
            onClick={onResume}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center space-x-2"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>Resume</span>
          </button>
        </div>
      </div>
    </div>
  )
}
