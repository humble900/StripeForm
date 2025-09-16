'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'

interface FormFillingAutoSaveProps {
  formId: string
  formData: Record<string, any>
  onDraftRestored?: (draft: any) => void
  onDraftSaved?: (draftId: string) => void
  config?: {
    saveInterval?: number // Default: 10 seconds
    debounceDelay?: number // Default: 3 seconds
    enableServerBackup?: boolean // Default: true
  }
}

const STORAGE_KEY_PREFIX = 'stripeform_filling_'

export const FormFillingAutoSave = React.forwardRef<any, FormFillingAutoSaveProps>(({ 
  formId, 
  formData, 
  onDraftRestored,
  onDraftSaved,
  config = {}
}, ref) => {
  const { user, isAuthenticated, isAnonymous, getUserTrackingData } = useAuth()
  
  const defaultConfig = {
    saveInterval: 10000, // 10 seconds
    debounceDelay: 3000, // 3 seconds
    enableServerBackup: true,
    ...config
  }

  const [state, setState] = useState({
    lastSaved: null as Date | null,
    isSaving: false,
    saveStatus: 'idle' as 'idle' | 'saving' | 'saved' | 'error' | 'offline',
    hasUnsavedChanges: false,
    isOnline: true // Default to true, will be updated on client-side mount
  })
  const [isClient, setIsClient] = useState(false)

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastFormDataRef = useRef<string>('')
  const storageKey = `${STORAGE_KEY_PREFIX}${formId}`

  // Ensure we're on the client side before accessing browser APIs
  useEffect(() => {
    setIsClient(true)
    // Update online status on client-side mount
    if (typeof navigator !== 'undefined') {
      setState(prev => ({ ...prev, isOnline: navigator.onLine }))
    }
  }, [])

  // Check if form data has changed
  const hasFormDataChanged = useCallback(() => {
    const currentFormDataString = JSON.stringify(formData)
    const hasChanged = currentFormDataString !== lastFormDataRef.current
    lastFormDataRef.current = currentFormDataString
    return hasChanged
  }, [formData])

  // Save to localStorage
  const saveToLocalStorage = useCallback((data: Record<string, any>) => {
    try {
      const saveData = {
        formData: data,
        timestamp: Date.now(),
        formId
      }
      localStorage.setItem(storageKey, JSON.stringify(saveData))
    } catch (error) {
      console.error('Failed to save form data to localStorage:', error)
    }
  }, [storageKey, formId])

  // Load from localStorage
  const loadFromLocalStorage = useCallback(() => {
    try {
      const savedData = localStorage.getItem(storageKey)
      if (!savedData) return null

      const parsed = JSON.parse(savedData)
      
      // Check if data is not too old (24 hours)
      const maxAge = 24 * 60 * 60 * 1000 // 24 hours
      if (Date.now() - parsed.timestamp > maxAge) {
        localStorage.removeItem(storageKey)
        return null
      }

      return parsed.formData
    } catch (error) {
      console.error('Failed to load form data from localStorage:', error)
      return null
    }
  }, [storageKey])

  // Save draft to server
  const saveDraftToServer = useCallback(async (data: Record<string, any>) => {
    if (!defaultConfig.enableServerBackup) return null

    try {
      let userId: string | undefined
      let sessionId: string | undefined
      let fingerprint: string | undefined

      if (isAuthenticated && user) {
        userId = user.id
      } else if (isAnonymous) {
        const trackingData = await getUserTrackingData()
        fingerprint = trackingData.fingerprint
        // sessionId is not available in tracking data, use fingerprint as session identifier
        sessionId = trackingData.fingerprint
      }

      const response = await fetch('/api/drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userId && { 'Authorization': `Bearer ${userId}` }),
          ...(sessionId && { 'X-Session-Id': sessionId }),
          ...(fingerprint && { 'X-Fingerprint': fingerprint }),
        },
        body: JSON.stringify({
          formId,
          userId,
          sessionId,
          fingerprint,
          draftData: data,
          progressData: {
            lastSaved: new Date().toISOString(),
            fieldCount: Object.keys(data).length,
            completedFields: Object.values(data).filter(value => 
              value !== null && value !== undefined && value !== ''
            ).length,
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Server save failed: ${response.statusText}`)
      }

      const result = await response.json()
      if (result.success && onDraftSaved) {
        onDraftSaved(result.data.id)
      }

      return result.data
    } catch (error) {
      console.error('Failed to save draft to server:', error)
      throw error
    }
  }, [defaultConfig.enableServerBackup, formId, isAuthenticated, user, isAnonymous, getUserTrackingData, onDraftSaved])

  // Main save function
  const performSave = useCallback(async () => {
    if (state.isSaving) return

    setState(prev => ({ ...prev, isSaving: true, saveStatus: 'saving' }))

    try {
      // Save to localStorage first (always works)
      saveToLocalStorage(formData)

      // Try to save to server if online
      if (state.isOnline) {
        await saveDraftToServer(formData)
      }

      setState(prev => ({
        ...prev,
        lastSaved: new Date(),
        saveStatus: 'saved',
        hasUnsavedChanges: false
      }))

      // Clear saved status after 3 seconds
      setTimeout(() => {
        setState(prev => ({ ...prev, saveStatus: 'idle' }))
      }, 3000)

    } catch (error) {
      console.error('Form filling auto-save failed:', error)
      
      setState(prev => ({
        ...prev,
        saveStatus: state.isOnline ? 'error' : 'offline'
      }))

      // Clear error status after 5 seconds
      setTimeout(() => {
        setState(prev => ({ ...prev, saveStatus: 'idle' }))
      }, 5000)
    } finally {
      setState(prev => ({ ...prev, isSaving: false }))
    }
  }, [formData, state.isSaving, state.isOnline, saveToLocalStorage, saveDraftToServer])

  // Debounced save function
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (hasFormDataChanged()) {
        setState(prev => ({ ...prev, hasUnsavedChanges: true }))
        performSave()
      }
    }, defaultConfig.debounceDelay)
  }, [hasFormDataChanged, performSave, defaultConfig.debounceDelay])

  // Check for existing draft on mount
  useEffect(() => {
    const checkForExistingDraft = async () => {
      // First check localStorage
      const localDraft = loadFromLocalStorage()
      if (localDraft && Object.keys(localDraft).length > 0 && onDraftRestored) {
        onDraftRestored({ source: 'localStorage', data: localDraft })
        return
      }

      // Then check server if online
      if (state.isOnline && defaultConfig.enableServerBackup) {
        try {
          let userId: string | undefined
          let sessionId: string | undefined
          let fingerprint: string | undefined

          if (isAuthenticated && user) {
            userId = user.id
          } else if (isAnonymous) {
            const trackingData = await getUserTrackingData()
            fingerprint = trackingData.fingerprint
            // sessionId is not available in tracking data, use fingerprint as session identifier
            sessionId = trackingData.fingerprint
          }

          if (userId || sessionId || fingerprint) {
            const response = await fetch(`/api/drafts?formId=${formId}`, {
              headers: {
                ...(userId && { 'Authorization': `Bearer ${userId}` }),
                ...(sessionId && { 'X-Session-Id': sessionId }),
                ...(fingerprint && { 'X-Fingerprint': fingerprint }),
              }
            })

            if (response.ok) {
              const result = await response.json()
              if (result.success && result.data && onDraftRestored) {
                onDraftRestored({ source: 'server', data: result.data.draftData })
              }
            }
          }
        } catch (error) {
          console.error('Failed to check for server draft:', error)
        }
      }
    }

    checkForExistingDraft()
  }, [formId, state.isOnline, defaultConfig.enableServerBackup, isAuthenticated, user, isAnonymous, getUserTrackingData, loadFromLocalStorage, onDraftRestored])

  // Auto-save on form data changes
  useEffect(() => {
    if (hasFormDataChanged()) {
      debouncedSave()
    }
  }, [formData, debouncedSave, hasFormDataChanged])

  // Periodic save (as backup)
  useEffect(() => {
    const interval = setInterval(() => {
      if (hasFormDataChanged()) {
        performSave()
      }
    }, defaultConfig.saveInterval)

    return () => {
      clearInterval(interval)
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [hasFormDataChanged, performSave, defaultConfig.saveInterval])

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasFormDataChanged()) {
        saveToLocalStorage(formData)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [formData, hasFormDataChanged, saveToLocalStorage])

  // Online/offline status tracking
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true, saveStatus: 'idle' }))
      // Try to save any pending changes when coming back online
      if (state.hasUnsavedChanges) {
        performSave()
      }
    }

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false, saveStatus: 'offline' }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [state.hasUnsavedChanges, performSave])

  // Clean up localStorage on successful form submission
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey)
    } catch (error) {
      console.error('Failed to clear draft from localStorage:', error)
    }
  }, [storageKey])

  // Expose clearDraft function for parent components
  React.useImperativeHandle(ref, () => ({
    clearDraft
  }))

  return null // This component doesn't render anything visible
})
