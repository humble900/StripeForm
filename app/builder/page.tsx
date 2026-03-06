'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { useFormBuilder } from '@/components/providers/FormBuilderProvider'
import { BrandKitProvider } from '@/components/providers/BrandKitProvider'
import { FormBuilderLayout } from '@/components/form-builder/FormBuilderLayout'
import LoadingSpinner from '@/components/ui/loading-spinner'
import InlineLoading from '@/components/ui/inline-loading'
import { useNotifications } from '@/components/providers/NotificationProvider'
import { StripeProvider } from '@/components/providers/StripeProvider'
import ErrorBoundary from '@/components/ErrorBoundary'
import { initializeErrorHandling } from '@/lib/error-handler'
import { Form } from '@/types'
import { useUserType } from '@/hooks/useUserType'
import { memoryStorage } from '@/lib/memory-storage'

function FormBuilderContent() {
  const { getUserTrackingData } = useAuth()
  const { state, dispatch, restoreFromLocalStorage, loadFromMemory } = useFormBuilder()
  const { addNotification } = useNotifications()
  const { type: userType, firebaseUser, userId, isLoading } = useUserType()
  const searchParams = useSearchParams()
  const templateId = searchParams ? searchParams.get('template') : null
  const formIdFromQuery = searchParams ? searchParams.get('form') : null

  // Initialize error handling
  useEffect(() => {
    initializeErrorHandling()
  }, [])

  useEffect(() => {
    const initializeBuilder = async () => {
      try {
        // Wait for user type to be determined
        if (isLoading) {
          console.log('⏳ FormBuilder: Waiting for user type determination...')
          return
        }

        let formUserId = 'anonymous'

        if (firebaseUser) {
          // Use Firebase UID directly
          formUserId = firebaseUser.uid
          console.log('🔐 Firebase user:', formUserId, 'Type:', userType)
        } else {
          // Guest user - get fingerprint
          const trackingData = await getUserTrackingData()
          if (!trackingData?.fingerprint) {
            console.log('⏳ FormBuilder: Waiting for guest tracking data...')
            return
          }
          formUserId = trackingData.fingerprint
          console.log('🔍 Guest user:', formUserId)
        }

        // Create default form structure
        const createDefaultForm = (): Form => ({
          id: '',
          title: '',
          description: '',
          fields: [],
          settings: {
            allow_multiple_responses: false,
            require_login: false,
            show_progress_bar: true,
            submit_button_text: 'Submit',
            success_message: 'Thank you for your response!',
            redirect_url: '',
            email_notifications: false,
            notification_email: '',
          },
          theme: {
            primary_color: '#3b82f6',
            secondary_color: '#64748b',
            background_color: '#ffffff',
            text_color: '#1f2937',
            font_family: 'Inter',
            border_radius: 8,
            custom_css: '',
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: formUserId || 'anonymous',
          isPublished: false,
          publishedUrl: '',
          response_count: 0,
        })

        let newForm: Form

        // Priority 1: Load specific form if formIdFromQuery is provided
        if (formIdFromQuery && state.current_form?.id !== formIdFromQuery) {
          // First try to restore from memory storage for immediate UI response
          const memoryRestored = loadFromMemory(formIdFromQuery)
          if (memoryRestored) {
            console.log('✅ Form restored from memory storage')
            return
          }

          // Fallback to localStorage
          const restored = restoreFromLocalStorage(formIdFromQuery)
          if (restored) {
            console.log('✅ Form restored from localStorage, will sync with server')
            return
          }

          try {
            const formResp = await fetch(`/api/forms/${formIdFromQuery}`)
            const formData = await formResp.json()
            if (formData.success && formData.data) {
              newForm = {
                id: formData.data.id,
                title: formData.data.title,
                description: formData.data.description || '',
                fields: (formData.data.fields || []).map((fld: any) => ({
                  id: fld.id,
                  type: fld.type,
                  label: fld.label,
                  placeholder: fld.placeholder || '',
                  required: !!fld.required,
                  validation: fld.validation || null,
                  options: fld.options || null,
                  order: fld.order,
                  settings: fld.settings || {},
                  conditional_logic: fld.conditionalLogic || fld.conditional_logic || null,
                })),
                settings: formData.data.settings || {},
                theme: formData.data.theme || {},
                created_at: formData.data.createdAt,
                updated_at: formData.data.updatedAt,
                user_id: formData.data.userId,
                isPublished: formData.data.status === 'published',
                publishedUrl: '',
                response_count: formData.data.submissionCount || 0,
              }
              dispatch({ type: 'SET_CURRENT_FORM', payload: newForm })
              return
            }
          } catch (e) {
            console.error('Error loading form by query param:', e)
            // Continue to next priority
          }
        }

        // Priority 2: Load template if templateId is provided (should not happen anymore)
        // Templates should now be copied first, then loaded via formId
        if (templateId) {
          console.warn('⚠️ Direct template loading detected - this should not happen anymore')
          addNotification({
            type: 'warning',
            title: 'Template Loading',
            message: 'Please use the "Use Template" button to copy templates properly.',
            duration: 5000
          })
          // Continue to default form creation
        }

        // Priority 3: Check for existing forms in memory storage first
        if (!state.current_form || state.current_form.id === 'default-form') {
          // Try to load the most recent form from memory storage
          const memoryForms = memoryStorage.getUserForms(formUserId)

          if (memoryForms.length > 0) {
            // Load the most recent form
            const mostRecentForm = memoryForms[0]
            const restored = loadFromMemory(mostRecentForm.id)
            if (restored) {
              console.log('✅ Most recent form restored from memory:', mostRecentForm.id)
              return
            }
          }

          // If no forms in memory, create a new one
          newForm = createDefaultForm()

          // Generate a unique ID for the form
          const formId = `form_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
          newForm.id = formId

          console.log('🎯 New form created for builder (memory only):', newForm)
          dispatch({ type: 'SET_CURRENT_FORM', payload: newForm })
          console.log('✅ Form builder initialization complete (memory storage)')
        } else {
          // Form already exists and is not default, no need to reinitialize
          console.log('✅ Form already loaded, skipping initialization')
        }
      } catch (error) {
        console.error('Error initializing form builder:', error)
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to initialize form builder. Please try again.',
        })
      }
    }

    initializeBuilder()
  }, [firebaseUser, userType, formIdFromQuery, templateId, dispatch, addNotification, getUserTrackingData, state.current_form?.id, isLoading, loadFromMemory])

  // Authentication redirect logic for returning users
  useEffect(() => {
    const checkForReturningUser = async () => {
      // Only check if we're not loading and not authenticated
      if (isLoading || firebaseUser) return

      try {
        // Check if user has any published forms (indicating they're a returning user)
        const userTrackingData = await getUserTrackingData()
        const fingerprint = userTrackingData?.fingerprint

        if (fingerprint) {
          // Try to fetch forms for this fingerprint
          const response = await fetch(`/api/user/forms`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${fingerprint}`,
              'x-fingerprint': fingerprint
            },
            credentials: 'include'
          })

          if (response.ok) {
            const data = await response.json()
            const forms = data.data || []
            const publishedForms = forms.filter((form: any) => form.status === 'published')

            // If user has published forms but is not authenticated, redirect to login
            if (publishedForms.length > 0) {
              console.log('🔄 FormBuilder: Returning user with published forms detected, redirecting to login')
              addNotification({
                type: 'info',
                title: 'Welcome Back!',
                message: 'Please sign in to access your published forms.',
                duration: 5000
              })

              // Redirect to login with return URL
              const returnUrl = encodeURIComponent(window.location.pathname + window.location.search)
              window.location.href = `/login?redirect=${returnUrl}`
            }
          }
        }
      } catch (error) {
        console.warn('Could not check for returning user:', error)
      }
    }

    // Only check after a short delay to avoid interfering with initial load
    const timeoutId = setTimeout(checkForReturningUser, 1000)

    return () => clearTimeout(timeoutId)
  }, [isLoading, firebaseUser, getUserTrackingData, addNotification])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <InlineLoading size="lg" text="Initializing form builder..." variant="dots" />
        </div>
      </div>
    )
  }

  return (
    <StripeProvider>
      <FormBuilderLayout />
    </StripeProvider>
  )
}

export default function FormBuilderPage() {
  return (
    <ErrorBoundary>
      <BrandKitProvider>
        <Suspense fallback={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <InlineLoading size="lg" text="Loading form builder..." variant="dots" />
          </div>
        }>
          <FormBuilderContent />
        </Suspense>
      </BrandKitProvider>
    </ErrorBoundary>
  )
}