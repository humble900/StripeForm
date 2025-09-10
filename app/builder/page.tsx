'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { useFormBuilder } from '@/components/providers/FormBuilderProvider'
import { BrandKitProvider } from '@/components/providers/BrandKitProvider'
import { FormBuilderLayout } from '@/components/form-builder/FormBuilderLayout'
import LoadingSpinner from '@/components/ui/loading-spinner'
import { useNotifications } from '@/components/providers/NotificationProvider'
import { StripeProvider } from '@/components/providers/StripeProvider'
import ErrorBoundary from '@/components/ErrorBoundary'
import { initializeErrorHandling } from '@/lib/error-handler'
import { Form } from '@/types'

function FormBuilderContent() {
  const { user, isAuthenticated, isAnonymous, getUserTrackingData } = useAuth()
  const { state, dispatch } = useFormBuilder()
  const { addNotification } = useNotifications()
  const [isLoading, setIsLoading] = useState(true)
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
        let userId = 'anonymous'
        
        if (isAuthenticated && user) {
          userId = user.id
        } else if (isAnonymous) {
          // For anonymous users, use their device fingerprint as identifier
          const trackingData = await getUserTrackingData()
          userId = trackingData.fingerprint
          console.log('🔍 Anonymous user using fingerprint as ID:', userId)
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
          user_id: userId,
          isPublished: false,
          publishedUrl: '',
          response_count: 0,
        })

        let newForm: Form

        // Priority 1: Load specific form if formIdFromQuery is provided
        if (formIdFromQuery && state.current_form?.id !== formIdFromQuery) {
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
              setIsLoading(false)
              return
            }
          } catch (e) {
            console.error('Error loading form by query param:', e)
            // Continue to next priority
          }
        }

        // Priority 2: Load template if templateId is provided
          if (templateId) {
            try {
              const templateResponse = await fetch(`/api/templates/${templateId}`)
              const templateData = await templateResponse.json()
              
              if (templateData.success) {
                const template = templateData.data
                newForm = {
                  ...template.templateData,
                  id: '',
                  title: `${template.templateData.title} (Copy)`,
                  user_id: userId,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  isPublished: false,
                  published_url: '',
                  response_count: 0,
                }
                
                addNotification({
                  type: 'success',
                  title: 'Template Loaded',
                  message: `Template "${template.name}" has been loaded`,
                  duration: 3000
                })
              
              dispatch({ type: 'SET_CURRENT_FORM', payload: newForm })
              setIsLoading(false)
              return
              }
            } catch (error) {
              console.error('Error loading template:', error)
              addNotification({
                type: 'error',
                title: 'Template Error',
              message: 'Failed to load template. Creating empty form instead.',
                duration: 5000
              })
            // Continue to default form creation
          }
        }

        // Priority 3: Only create new form if current form is default or doesn't exist
        if (!state.current_form || state.current_form.id === 'default-form') {
          // Try to create server-side draft first for authenticated users
          if (isAuthenticated) {
            try {
              const resp = await fetch('/api/user/forms', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${userId}`
                },
                body: JSON.stringify({
                  title: 'Untitled Form',
                  description: '',
                  fields: [],
                  settings: {},
                })
              })
              if (resp.ok) {
                const data = await resp.json()
                const created = data.data
                newForm = {
                  id: created.id,
                  title: created.title || 'Untitled Form',
                  description: created.description || '',
                  fields: [],
                  settings: created.settings || {},
                  theme: created.theme || createDefaultForm().theme,
                  created_at: created.createdAt || new Date().toISOString(),
                  updated_at: created.updatedAt || new Date().toISOString(),
                  user_id: created.userId || userId,
                  isPublished: created.status === 'published',
                  publishedUrl: created.publishedUrl || '',
                  response_count: created.submissionCount || 0,
                }
              } else {
                throw new Error('Failed to create server draft')
              }
            } catch (e) {
              console.log('Failed to create server draft, using local form')
              newForm = createDefaultForm()
            }
          } else {
            // For anonymous users, just create local form
            newForm = createDefaultForm()
          }

          console.log('🎯 Form prepared for builder:', newForm)
          dispatch({ type: 'SET_CURRENT_FORM', payload: newForm })
          setIsLoading(false)
          console.log('✅ Form builder initialization complete')
        } else {
          // Form already exists and is not default, no need to reinitialize
          console.log('✅ Form already loaded, skipping initialization')
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Error initializing form builder:', error)
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to initialize form builder. Please try again.',
        })
        setIsLoading(false)
      }
    }

    initializeBuilder()
  }, [user, isAuthenticated, isAnonymous, formIdFromQuery, templateId, dispatch, addNotification, getUserTrackingData, state.current_form?.id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <LoadingSpinner size="lg" />
        </div>
      }>
        <FormBuilderContent />
      </Suspense>
    </BrandKitProvider>
    </ErrorBoundary>
  )
}