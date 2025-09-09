'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Form } from '@/types'

interface AutoSaveProps {
  form: Form
  onSave: (form: Form) => Promise<void>
  saveInterval?: number // in milliseconds
}

export function AutoSave({ form, onSave, saveInterval = 30000 }: AutoSaveProps) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastFormRef = useRef<string>('')

  // Debounced save function
  const debouncedSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(async () => {
      await performSave()
    }, 2000) // 2 second delay
  }

  const performSave = async () => {
    if (isSaving) return

    setIsSaving(true)
    setSaveStatus('saving')

    try {
      await onSave(form)
      setLastSaved(new Date())
      setSaveStatus('saved')
      
      // Clear saved status after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle')
      }, 3000)
    } catch (error) {
      console.error('Auto-save failed:', error)
      setSaveStatus('error')
      
      // Clear error status after 5 seconds
      setTimeout(() => {
        setSaveStatus('idle')
      }, 5000)
    } finally {
      setIsSaving(false)
    }
  }

  // Check if form has changed
  const hasFormChanged = () => {
    const currentFormString = JSON.stringify(form)
    const hasChanged = currentFormString !== lastFormRef.current
    lastFormRef.current = currentFormString
    return hasChanged
  }

  // Auto-save on form changes
  useEffect(() => {
    if (hasFormChanged()) {
      debouncedSave()
    }
  }, [form])

  // Periodic save (as backup)
  useEffect(() => {
    const interval = setInterval(() => {
      if (hasFormChanged()) {
        performSave()
      }
    }, saveInterval)

    return () => {
      clearInterval(interval)
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [saveInterval])

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasFormChanged()) {
        // Try to save synchronously
        try {
          localStorage.setItem('stripeform_unsaved_form', JSON.stringify(form))
        } catch (error) {
          console.error('Failed to save form before unload:', error)
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [form])

  // Restore unsaved form on page load
  useEffect(() => {
    const unsavedForm = localStorage.getItem('stripeform_unsaved_form')
    if (unsavedForm) {
      try {
        const parsedForm = JSON.parse(unsavedForm)
        // You could show a dialog asking if user wants to restore
        console.log('Found unsaved form:', parsedForm)
        localStorage.removeItem('stripeform_unsaved_form')
      } catch (error) {
        console.error('Failed to parse unsaved form:', error)
        localStorage.removeItem('stripeform_unsaved_form')
      }
    }
  }, [])

  const getStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...'
      case 'saved':
        return 'Saved'
      case 'error':
        return 'Save failed'
      default:
        return lastSaved ? `Last saved ${formatTimeAgo(lastSaved)}` : 'Not saved yet'
    }
  }

  const getStatusColor = () => {
    switch (saveStatus) {
      case 'saving':
        return 'text-blue-600'
      case 'saved':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-500'
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return 'just now'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    } else {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    }
  }

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className="flex items-center space-x-1">
        {saveStatus === 'saving' && (
          <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin" />
        )}
        {saveStatus === 'saved' && (
          <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {saveStatus === 'error' && (
          <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        <span className={getStatusColor()}>{getStatusText()}</span>
      </div>
      
      <button
        onClick={performSave}
        disabled={isSaving}
        className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Save now
      </button>
    </div>
  )
} 