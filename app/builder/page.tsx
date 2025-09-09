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
import { Form } from '@/types'

function FormBuilderContent() {
  const { user, isAuthenticated, isAnonymous, getUserTrackingData } = useAuth()
  const { state, dispatch } = useFormBuilder()
  const { addNotification } = useNotifications()
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const templateId = searchParams ? searchParams.get('template') : null
  const formIdFromQuery = searchParams ? searchParams.get('form') : null

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

        // If a form id is explicitly provided in the URL, always load that form
        if (formIdFromQuery && state.current_form?.id !== formIdFromQuery) {
          try {
            const formResp = await fetch(`/api/forms/${formIdFromQuery}`)
            const formData = await formResp.json()
            if (formData.success && formData.data) {
              const found = formData.data
              const newForm: Form = {
                id: found.id,
                title: found.title,
                description: found.description || '',
                fields: (found.fields || []).map((fld: any) => ({
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
                settings: found.settings || {},
                theme: found.theme || {},
                created_at: found.createdAt,
                updated_at: found.updatedAt,
                user_id: found.userId,
                isPublished: found.status === 'published',
                publishedUrl: '',
                response_count: found.submissionCount || 0,
              }
              dispatch({ type: 'SET_CURRENT_FORM', payload: newForm })
              setIsLoading(false)
              return
            }
          } catch (e) {
            console.error('Error loading form by query param:', e)
            // fall through to default path
          }
        }

        // Create a new empty form if none exists
        if (!state.current_form || state.current_form.id === 'default-form') {
          let newForm: Form

          // If form id provided, fetch the created form + fields from dedicated API
          if (formIdFromQuery) {
            try {
              const formResp = await fetch(`/api/forms/${formIdFromQuery}`)
              const formData = await formResp.json()
              
              if (formData.success && formData.data) {
                const found = formData.data
                // Compose Form shape expected by builder from server form
                newForm = {
                  id: found.id,
                  title: found.title,
                  description: found.description || '',
                  fields: (found.fields || []).map((fld: any) => ({
                    id: fld.id,
                    type: fld.type,
                    label: fld.label,
                    placeholder: fld.placeholder || '',
                    required: !!fld.required,
                    validation: fld.validation || null,
                    options: fld.options || null,
                    order: fld.order,
                    settings: fld.settings || {},
                    conditional_logic: fld.conditionalLogic || null,
                  })),
                  settings: found.settings || {},
                  theme: found.theme || {},
                  created_at: found.createdAt,
                  updated_at: found.updatedAt,
                  user_id: found.userId,
                                  isPublished: found.status === 'published',
                publishedUrl: '',
                  response_count: found.submissionCount || 0,
                }
                

                
                addNotification({
                  type: 'success',
                  title: 'Form Loaded',
                  message: `Draft "${found.title}" loaded successfully`,
                  duration: 3000
                })
                
                dispatch({ type: 'SET_CURRENT_FORM', payload: newForm })
                setIsLoading(false)
                return
              }
            } catch (error) {
              console.error('Error loading form:', error)
              addNotification({
                type: 'error',
                title: 'Load Error',
                message: 'Failed to load form. Creating new form instead.',
                duration: 5000
              })
            }
          }

          // If templateId is provided, load the template
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
              } else {
                throw new Error('Template not found')
              }
            } catch (error) {
              console.error('Error loading template:', error)
              addNotification({
                type: 'error',
                title: 'Template Error',
                message: error instanceof Error && error.message.includes('Template not found') ? 'The selected template could not be loaded. Please try a different template or create a new empty form.' : 'Failed to load template. Creating empty form instead.',
                duration: 5000
              })
              
              // Fallback to empty form
              newForm = {
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
              }
            }
          } else {
            // Create an empty draft form on the server first so it appears on dashboard
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
                  theme: created.theme || {
                    primary_color: '#3b82f6',
                    secondary_color: '#64748b',
                    background_color: '#ffffff',
                    text_color: '#1f2937',
                    font_family: 'Inter',
                    border_radius: 8,
                    custom_css: '',
                  },
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
              // Fallback to local-only draft
              newForm = {
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
              }
            }
          }

          console.log('🎯 Form prepared for builder:', newForm)
          
          dispatch({ type: 'SET_CURRENT_FORM', payload: newForm })
          setIsLoading(false)
          
          console.log('✅ Form builder initialization complete')
        }
      } catch (error) {
        console.error('Error initializing form builder:', error)
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to initialize form builder. Please try again.',
        })
      } finally {
        setIsLoading(false)
      }
    }

    initializeBuilder()
  }, [user, isAuthenticated, isAnonymous, formIdFromQuery, templateId, dispatch, addNotification, getUserTrackingData])

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
    <BrandKitProvider>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <LoadingSpinner size="lg" />
        </div>
      }>
        <FormBuilderContent />
      </Suspense>
    </BrandKitProvider>
  )
}