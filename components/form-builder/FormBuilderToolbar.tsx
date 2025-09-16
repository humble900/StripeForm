'use client'

import React, { useState } from 'react'
import { 
  Bars3Icon, 
  EyeIcon, 
  DocumentArrowDownIcon, 
  PlayIcon, 
  Cog6ToothIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  SwatchIcon,
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { useFormBuilder } from '@/components/providers/FormBuilderProvider'
import { useNotifications } from '@/components/providers/NotificationProvider'
import { useAuth } from '@/components/providers/AuthProvider'
import { useBrandKit } from '@/components/providers/BrandKitProvider'
import { ImageUploader } from '@/components/upload/ImageUploader'

import { UpgradeModal } from '@/components/modals/UpgradeModal'
import { FormLimitMessage } from '@/components/ui/FormLimitMessage'
import { EnhancedPublishButton } from './EnhancedPublishButton'

interface FormBuilderToolbarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  inspectorOpen: boolean
  setInspectorOpen: (open: boolean) => void
  onThemeModeChange?: (isThemeMode: boolean) => void
}

export function FormBuilderToolbar({ 
  sidebarOpen, 
  setSidebarOpen, 
  inspectorOpen, 
  setInspectorOpen,
  onThemeModeChange
}: FormBuilderToolbarProps) {
  const { state, dispatch, undo, redo, canUndo, canRedo, setPreviewMode, updateForm, saveForm } = useFormBuilder()
  const { addNotification } = useNotifications()
  const { user, isAuthenticated, isAnonymous, getUserTrackingData, checkAnonymousFormLimit, checkUserFormLimit } = useAuth()
  const { applyToForm } = useBrandKit()
  const [showThemeEditor, setShowThemeEditor] = useState(false)

  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [formLimitInfo, setFormLimitInfo] = useState<{ canCreate: boolean; currentCount: number; limit: number } | null>(null)
  const [showLimitMessage, setShowLimitMessage] = useState(false)

  // Load form limit info for both authenticated and anonymous users (unless Pro)
  React.useEffect(() => {
    const loadFormLimitInfo = async () => {
      // Check limits for both anonymous users AND authenticated non-Pro users
      const shouldCheckLimits = isAnonymous || (isAuthenticated && user?.subscription_tier !== 'pro')
      
      if (shouldCheckLimits) {
        try {
          let limitInfo
          if (isAnonymous) {
            limitInfo = await checkAnonymousFormLimit()
          } else {
            limitInfo = await checkUserFormLimit()
          }
          
          setFormLimitInfo(limitInfo)
          // Show message only if they've published 5 forms (reached the limit)
          setShowLimitMessage(limitInfo.currentCount >= limitInfo.limit)
        } catch (error) {
          console.error('Error loading form limit info:', error)
        }
      } else {
        // Clear form limit info for Pro users
        setFormLimitInfo(null)
        setShowLimitMessage(false)
      }
    }
    
    loadFormLimitInfo()
  }, [isAnonymous, isAuthenticated, user?.subscription_tier, checkAnonymousFormLimit, checkUserFormLimit])



  const handleSave = async () => {
    try {
      await saveForm()
      addNotification({
        type: 'success',
        title: 'Form Saved',
        message: 'Your form has been saved successfully!',
        duration: 3000
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save form. Please try again.',
        duration: 5000
      })
    }
  }

  const handlePreview = () => {
    setPreviewMode(true)
  }

  const handleThemeEditor = () => {
    setShowThemeEditor(true)
    onThemeModeChange?.(true)
  }

  const handleApplyBrandKit = async () => {
    if (!state.current_form?.id || state.current_form.id === 'default-form') {
      addNotification?.({
        type: 'error',
        title: 'Brand Kit',
        message: 'Please save your form first before applying brand kit'
      })
      return
    }

    try {
      await applyToForm(state.current_form.id)
      addNotification?.({
        type: 'success',
        title: 'Brand Kit',
        message: 'Brand kit applied successfully!'
      })
    } catch (error) {
      addNotification?.({
        type: 'error',
        title: 'Brand Kit',
        message: 'Failed to apply brand kit'
      })
    }
  }

  const handlePublish = async () => {
    try {
      // Check if user is authenticated with Pro subscription
      if (isAuthenticated && user && user.subscription_tier === 'pro') {
        // Pro users can publish unlimited forms
        await publishForm()
        return
      }

      // For anonymous users OR authenticated free users, check form limits
      const shouldCheckLimits = isAnonymous || (isAuthenticated && user?.subscription_tier === 'free')
      
      if (shouldCheckLimits) {
        const trackingData = await getUserTrackingData()
        let limitInfo
        if (isAnonymous) {
          limitInfo = await checkAnonymousFormLimit()
        } else {
          limitInfo = await checkUserFormLimit()
        }
        
        setFormLimitInfo(limitInfo)

        if (!limitInfo.canCreate) {
          // Show upgrade modal for users who have reached the limit
          setShowUpgradeModal(true)
          return
        }

        // User can still create forms, proceed with publish
        await publishForm()
      }
    } catch (error) {
      console.error('Error checking form limits:', error)
      addNotification({
        type: 'error',
        title: 'Publish Failed',
        message: 'Failed to check form limits. Please try again.',
        duration: 5000
      })
    }
  }

  const publishForm = async () => {
    try {
      // Check form limits before publishing
      const shouldCheckLimits = isAnonymous || (isAuthenticated && user?.subscription_tier !== 'pro')
      
      if (shouldCheckLimits) {
        let limitInfo
        if (isAnonymous) {
          limitInfo = await checkAnonymousFormLimit()
        } else {
          limitInfo = await checkUserFormLimit()
        }
        
        // If user has reached the limit, show upgrade modal
        if (!limitInfo?.canCreate) {
          setShowUpgradeModal(true)
          return
        }
      }

      // Save the form first to ensure we have a definitive ID
      const saved = await saveForm()
      
      // Update form status to published (only after server confirms)
      if (state.current_form) {
        const formIdForUrl = saved?.id || state.current_form.id
        
        // Ask server to publish
        try {
          // Prepare update data
          const updateData = {
            ...state.current_form,
            status: 'published',
            isPublished: true,
            updatedAt: new Date().toISOString()
          }
          
          console.log('📤 Sending form update with status:', updateData.status)
          
          // Always try authenticated route first if user is authenticated
          // This ensures proper form ownership and migration handling
          const useAuthenticatedRoute = isAuthenticated && !!user?.id
          const targetUrl = useAuthenticatedRoute
            ? `/api/user/forms/${formIdForUrl}`
            : `/api/forms/${formIdForUrl}`

          // Include fingerprint so the server can migrate anonymous-owned forms to the authenticated user
          let fingerprintHeader: Record<string, string> = {}
          try {
            const tracking = await getUserTrackingData()
            if (tracking?.fingerprint) {
              fingerprintHeader['X-Fingerprint'] = tracking.fingerprint
            }
          } catch {}

          // Enhanced headers for mobile compatibility
          const headers: Record<string, string> = { 
            'Content-Type': 'application/json',
            ...fingerprintHeader,
          }
          
          // Add authentication header if user is authenticated
          if (isAuthenticated && user?.id) {
            headers['Authorization'] = `Bearer ${user.id}`
          }

          let response = await fetch(targetUrl, {
            method: useAuthenticatedRoute ? 'PATCH' : 'PUT',
            headers,
            credentials: 'include',
            body: JSON.stringify(updateData)
          })
          
          if (!response.ok) {
            let errorBody: any = null
            const contentType = response.headers.get('content-type') || ''
            if (contentType.includes('application/json')) {
              try { errorBody = await response.json() } catch {}
            } else {
              try { errorBody = { message: await response.text() } } catch {}
            }

            // Publish limit reached -> show upgrade flow
            if (response.status === 403 && (errorBody?.code === 'PUBLISH_LIMIT_REACHED')) {
              setShowUpgradeModal(true)
              return
            }

            // If user is not Pro and we get a 401/403/404 during publish, show upgrade modal instead of surfacing errors
            if (isAuthenticated && user?.subscription_tier !== 'pro' && (response.status === 401 || response.status === 403 || response.status === 404)) {
              setShowUpgradeModal(true)
              return
            }

            console.error('❌ Form update failed:', response.status, errorBody)

            // If authenticated route failed with 403/401 (e.g., missing token), retry via public route as fallback
            if (useAuthenticatedRoute && (response.status === 401 || response.status === 403 || response.status === 404)) {
              try {
                console.log('🔄 Retrying with public route as fallback...')
                response = await fetch(`/api/forms/${formIdForUrl}`, {
                  method: 'PUT',
                  headers: { 
                    'Content-Type': 'application/json',
                    ...fingerprintHeader, // Include fingerprint for migration
                  },
                  credentials: 'include',
                  body: JSON.stringify(updateData)
                })
                if (!response.ok) {
                  let fallbackBody: any = null
                  const ct = response.headers.get('content-type') || ''
                  if (ct.includes('application/json')) {
                    try { fallbackBody = await response.json() } catch {}
                  } else {
                    try { fallbackBody = { message: await response.text() } } catch {}
                  }

                  // On fallback failure, if user is not Pro, show upgrade modal
                  if (isAuthenticated && user?.subscription_tier !== 'pro' && (response.status === 401 || response.status === 403 || response.status === 404)) {
                    setShowUpgradeModal(true)
                    return
                  }

                  console.error('❌ Fallback form update failed:', response.status, fallbackBody)
                } else {
                  const result = await response.json()
                  console.log('✅ Fallback form status updated in database:', result)
                  if (!result.data?.publishedUrl) {
                    throw new Error('No published URL returned from the server')
                  }
                  updateForm({
                    ...state.current_form,
                    status: 'published',
                    isPublished: true,
                    publishedUrl: result.data.publishedUrl,
                    updated_at: new Date().toISOString()
                  })
                  return
                }
              } catch (e) {
                console.error('❌ Fallback publish attempt failed:', e)
              }
            }

            // Handle specific error cases
            if (response.status === 404) {
              throw new Error('Form not found. Please try saving the form first.')
            } else if (response.status === 403) {
              throw new Error(errorBody?.message || 'You do not have permission to update this form.')
            } else if (response.status === 405) {
              throw new Error('Invalid update method. Please try again.')
            } else {
              throw new Error(`Failed to update form status: ${errorBody?.message || 'Unknown error'}`)
            }
          }
          
          const result = await response.json()
          console.log('✅ Form status updated in database:', result)
          
          if (!result.data?.publishedUrl) {
            throw new Error('No published URL returned from the server')
          }
          
          // Server success: mark as published now
          updateForm({
            ...state.current_form,
            status: 'published',
            isPublished: true,
            publishedUrl: result.data.publishedUrl,
            updated_at: new Date().toISOString()
          })
        } catch (error) {
          console.error('❌ Failed to update form status:', error)
          // Ensure UI remains in draft when publish fails
          updateForm({
            ...(state.current_form || {}),
            status: 'draft',
            isPublished: false,
            publishedUrl: undefined,
          })
          throw error
        }
      }

      // Note: Form count is now automatically tracked by querying the forms table
      // No need to manually increment anonymous user form count

      // Trigger dashboard refresh
      localStorage.setItem('form-published', 'true');
      
      addNotification({
        type: 'success',
        title: 'Form Published',
        message: 'Your form is now live and ready to collect responses!',
        duration: 5000
      })
    } catch (error) {
      console.error('Error publishing form:', error)
      addNotification({
        type: 'error',
        title: 'Publish Failed',
        message: 'Failed to publish form. Please try again.',
        duration: 5000
      })
    }
  }

  const handleUpgrade = () => {
    if (isAuthenticated) {
      // Authenticated users go directly to pricing
      window.location.href = '/pricing'
    } else {
      // Guest users go to sign up first, then pricing
      window.location.href = '/register?redirect=/pricing'
    }
  }

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      {/* Mobile Layout - Stacked */}
      <div className="sm:hidden px-3 py-4 space-y-3">
        {/* Form Title and Description - Full width on mobile */}
        <div className="space-y-2">
          {/* Form Title */}
          <input
            type="text"
            value={state.current_form?.title || ''}
            onChange={(e) => {
              updateForm({ title: e.target.value })
            }}
            className="text-lg font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 w-full placeholder:text-gray-400 placeholder:font-normal"
            placeholder="Enter your form title..."
          />
          
          {/* Form Description */}
          <textarea
            value={state.current_form?.description || ''}
            onChange={(e) => {
              updateForm({ description: e.target.value })
            }}
            className="text-sm text-gray-600 bg-transparent border-none focus:outline-none focus:ring-0 w-full resize-none placeholder:text-gray-400"
            placeholder="Describe your form..."
            rows={1}
          />
        </div>
        
        {/* Mobile Actions Row */}
        <div className="space-y-3">
          {/* Primary Actions Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Undo/Redo */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={undo}
                  disabled={!canUndo}
                  className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Undo"
                >
                  <ArrowUturnLeftIcon className="h-3.5 w-3.5" />
                </button>
                
                <button
                  onClick={redo}
                  disabled={!canRedo}
                  className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Redo"
                >
                  <ArrowUturnRightIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            
            {/* Enhanced Publish Button - Prominent on mobile */}
            <EnhancedPublishButton
              onPublish={handlePublish}
              isPublished={state.current_form?.isPublished || false}
              publishedUrl={state.current_form?.publishedUrl}
            />
          </div>
          
          {/* Secondary Actions Row */}
          <div className="flex items-center justify-center space-x-2">
            {/* Brand Kit */}
            <button
              onClick={handleApplyBrandKit}
              className="flex items-center space-x-1 px-2 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-xs"
              title="Apply Brand Kit"
            >
              <SparklesIcon className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Brand</span>
            </button>

            {/* Theme Editor */}
            <button
              onClick={handleThemeEditor}
              className="flex items-center space-x-1 px-2 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-xs"
              title="Theme Editor"
            >
              <SwatchIcon className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Theme</span>
            </button>

            {/* Preview */}
            <button
              onClick={handlePreview}
              className="flex items-center space-x-1 px-2 py-1.5 text-white bg-[#6C5CE7] hover:bg-opacity-90 rounded-lg transition-colors text-xs"
              title="Preview Form"
            >
              <EyeIcon className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Preview</span>
            </button>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={state.is_saving}
              className="flex items-center space-x-1 px-2 py-1.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
              title="Save Form"
            >
              <DocumentArrowDownIcon className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Save</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Horizontal */}
      <div className="hidden sm:flex items-center justify-between px-6 py-4">
        {/* Left side - form details */}
        <div className="flex items-center space-x-6">
          {/* Form Title and Description */}
          <div className="flex-1 max-w-md min-w-0">
            <div className="space-y-2">
              {/* Form Title */}
              <input
                type="text"
                value={state.current_form?.title || ''}
                onChange={(e) => {
                  updateForm({ title: e.target.value })
                }}
                className="text-xl font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 w-full placeholder:text-gray-400 placeholder:font-normal"
                placeholder="Enter your form title..."
              />

              {/* Form Description */}
              <textarea
                value={state.current_form?.description || ''}
                onChange={(e) => {
                  updateForm({ description: e.target.value })
                }}
                className="text-sm text-gray-600 bg-transparent border-none focus:outline-none focus:ring-0 w-full resize-none placeholder:text-gray-400"
                placeholder="Describe your form or provide instructions for respondents..."
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Center - Status and actions */}
        <div className="flex items-center space-x-3">
          {/* Undo/Redo */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Undo"
            >
              <ArrowUturnLeftIcon className="h-3.5 w-3.5" />
            </button>
            
            <button
              onClick={redo}
              disabled={!canRedo}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Redo"
            >
              <ArrowUturnRightIcon className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Auto-save indicator */}
          {state.has_unsaved_changes && (
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></div>
              <span>{state.is_saving ? 'Saving...' : 'Unsaved changes'}</span>
            </div>
          )}
          
          {/* Saved indicator */}
          {!state.has_unsaved_changes && state.current_form?.updated_at && (
            <div className="flex items-center space-x-2 text-xs text-green-600">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>All changes saved</span>
            </div>
          )}
        </div>

        {/* Middle-right - Render settings removed: now in Cover Slide properties */}

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2">
          {/* Brand Kit */}
          <button
            onClick={handleApplyBrandKit}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Apply Brand Kit"
          >
            <SparklesIcon className="h-4 w-4" />
          </button>

          {/* Theme Editor */}
          <button
            onClick={handleThemeEditor}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Theme Editor"
          >
            <SwatchIcon className="h-4 w-4" />
          </button>

          {/* Preview */}
          <button
            onClick={handlePreview}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-white bg-[#6C5CE7] hover:bg-opacity-90 rounded-lg transition-colors text-xs"
            title="Preview Form"
          >
            <EyeIcon className="h-3.5 w-3.5" />
            <span className="font-medium">Preview</span>
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={state.is_saving}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
            title="Save Form"
          >
            <DocumentArrowDownIcon className="h-3.5 w-3.5" />
            <span className="font-medium">Save</span>
          </button>

          {/* Enhanced Publish Button */}
          <EnhancedPublishButton
            onPublish={handlePublish}
            isPublished={state.current_form?.isPublished || false}
            publishedUrl={state.current_form?.publishedUrl}
          />
        </div>
      </div>

      {/* Form Limit Message for Anonymous Users and Non-Pro Authenticated Users */}
      {((isAnonymous || (isAuthenticated && user?.subscription_tier !== 'pro')) && showLimitMessage && formLimitInfo) && (
        <div className="px-6 pb-4">
          <FormLimitMessage
            currentFormCount={formLimitInfo.currentCount}
            formLimit={formLimitInfo.limit}
            onUpgrade={handleUpgrade}
            onDismiss={() => setShowLimitMessage(false)}
            isAuthenticated={isAuthenticated}
          />
        </div>
      )}

      {/* Theme Editor Modal */}
      {showThemeEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Theme Editor</h3>
                  <p className="text-sm text-gray-600">Customize your form's appearance</p>
                </div>
                <button
                  onClick={() => {
                    setShowThemeEditor(false)
                    onThemeModeChange?.(false)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {/* Theme editor content */}
              <div className="space-y-8">
                
                {/* Colors Section */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Colors & Styling</h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start">
                      <SwatchIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h5 className="text-sm font-medium text-blue-900 mb-1">
                          Use Brand Kit for Form Colors
                        </h5>
                        <p className="text-sm text-blue-700 mb-3">
                          Manage all form colors (backgrounds, buttons, fields) through the Brand Kit for better organization and consistency.
                        </p>
                        <button
                          onClick={() => window.open('/brand-kit', '_blank')}
                          className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <SwatchIcon className="h-4 w-4 mr-1.5" />
                          Open Brand Kit
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Text Color
                      </label>
                      <input
                        type="color"
                        value={state.current_form?.theme?.text_color || '#1F2937'}
                        onChange={(e) => {
                          if (state.current_form) {
                            updateForm({
                              theme: {
                                ...state.current_form.theme,
                                text_color: e.target.value
                              }
                            })
                          }
                        }}
                        className="w-full h-10 rounded-lg border border-gray-300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Font Family
                      </label>
                      <select
                        value={state.current_form?.theme?.font_family || 'Inter, sans-serif'}
                        onChange={(e) => {
                          if (state.current_form) {
                            updateForm({
                              theme: {
                                ...state.current_form.theme,
                                font_family: e.target.value
                              }
                            })
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="Inter, sans-serif">Inter</option>
                        <option value="system-ui, sans-serif">System UI</option>
                        <option value="Roboto, sans-serif">Roboto</option>
                        <option value="Open Sans, sans-serif">Open Sans</option>
                        <option value="Lato, sans-serif">Lato</option>
                        <option value="Poppins, sans-serif">Poppins</option>
                        <option value="Montserrat, sans-serif">Montserrat</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Page Background Color</label>
                      <input
                        type="color"
                        value={state.current_form?.theme?.background_color || '#FFFFFF'}
                        onChange={(e) => {
                          if (state.current_form) {
                            updateForm({
                              theme: {
                                ...state.current_form.theme,
                                background_color: e.target.value
                              }
                            })
                          }
                        }}
                        className="w-full h-10 rounded-lg border border-gray-300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Header Color</label>
                      <input
                        type="color"
                        value={state.current_form?.theme?.header_color || '#FFFFFF'}
                        onChange={(e) => {
                          if (state.current_form) {
                            updateForm({
                              theme: {
                                ...state.current_form.theme,
                                header_color: e.target.value
                              }
                            })
                          }
                        }}
                        className="w-full h-10 rounded-lg border border-gray-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Background Images Section */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Background Images</h4>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Page Background Image
                      </label>
                      <p className="text-xs text-gray-500 mb-3">
                        Recommended: 1920x1080px or larger • JPEG/PNG • Max 5MB
                      </p>
                      <ImageUploader
                        layout="inline"
                        maxFiles={1}
                        maxSizeMB={5}
                        accept="image/*"
                        value={((state.current_form as any)?.theme?.background_image_url) ? [{
                          id: 'bg-image',
                          file: new File([new Blob()], 'background'),
                          previewUrl: (state.current_form as any).theme.background_image_url,
                          progress: 100,
                          status: 'done' as const,
                          remoteUrl: (state.current_form as any).theme.background_image_url
                        }] : []}
                        onChange={(items) => {
                          if (state.current_form) {
                            const imageUrl = items[0]?.remoteUrl || items[0]?.previewUrl || ''
                            console.log('🖼️ Updating background image URL:', imageUrl)
                            updateForm({
                              theme: {
                                ...state.current_form.theme,
                                background_image_url: imageUrl
                              }
                            })
                          }
                        }}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Header Background Image
                      </label>
                      <p className="text-xs text-gray-500 mb-3">
                        Recommended: 1200x400px • JPEG/PNG • Max 5MB • Will resize to fit header
                      </p>
                      <ImageUploader
                        layout="inline"
                        maxFiles={1}
                        maxSizeMB={5}
                        accept="image/*"
                        value={((state.current_form as any)?.theme?.header_image_url) ? [{
                          id: 'header-image',
                          file: new File([new Blob()], 'header'),
                          previewUrl: (state.current_form as any).theme.header_image_url,
                          progress: 100,
                          status: 'done' as const,
                          remoteUrl: (state.current_form as any).theme.header_image_url
                        }] : []}
                        onChange={(items) => {
                          if (state.current_form) {
                            const imageUrl = items[0]?.remoteUrl || items[0]?.previewUrl || ''
                            console.log('🏠 Updating header image URL:', imageUrl)
                            updateForm({
                              theme: {
                                ...state.current_form.theme,
                                header_image_url: imageUrl
                              }
                            })
                          }
                        }}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Header & Branding Section */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Header & Branding</h4>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Header/Theme Logo</label>
                      <ImageUploader
                        layout="inline"
                        maxFiles={1}
                        maxSizeMB={5}
                        accept="image/*"
                        value={((state.current_form as any)?.theme?.logo?.url) ? [{
                          id: 'theme-logo',
                          file: new File([new Blob()], 'logo'),
                          previewUrl: (state.current_form as any).theme.logo.url,
                          progress: 100,
                          status: 'done' as const,
                          remoteUrl: (state.current_form as any).theme.logo.url
                        }] : []}
                        onChange={(items) => {
                          if (state.current_form) {
                            const url = items[0]?.remoteUrl || items[0]?.previewUrl || ''
                            updateForm({
                              theme: {
                                ...state.current_form.theme,
                                logo: url ? { ...(state.current_form as any)?.theme?.logo, url } : undefined
                              }
                            })
                          }
                        }}
                        className="w-full"
                      />
                      {(state.current_form as any)?.theme?.logo?.url && (
                        <div className="mt-2 grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Alt text</label>
                            <input
                              type="text"
                              value={String((state.current_form as any)?.theme?.logo?.alt || '')}
                              onChange={(e) => updateForm({ theme: { ...(state.current_form?.theme || {} as any), logo: { ...((state.current_form as any)?.theme?.logo || {}), alt: e.target.value } } })}
                              className="form-input text-xs w-full"
                            />
                          </div>
                          <div className="flex items-end">
                            <button
                              className="text-xs px-3 py-2 rounded border hover:bg-gray-50"
                              onClick={() => updateForm({ theme: { ...(state.current_form?.theme || {} as any), logo: undefined } })}
                            >Remove Logo</button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Text Logo</label>
                      <input
                        type="text"
                        value={String((state.current_form as any)?.theme?.textLogo?.text || '')}
                        onChange={(e) => updateForm({ theme: { ...(state.current_form?.theme || {} as any), textLogo: { ...((state.current_form as any)?.theme?.textLogo || {}), text: e.target.value } } })}
                        className="form-input text-sm w-full mb-2"
                        placeholder="Your brand name"
                      />
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
                          <input
                            type="color"
                            value={String((state.current_form as any)?.theme?.textLogo?.color || '#111827')}
                            onChange={(e) => updateForm({ theme: { ...(state.current_form?.theme || {} as any), textLogo: { ...((state.current_form as any)?.theme?.textLogo || {}), color: e.target.value } } })}
                            className="w-full h-10 rounded-lg border border-gray-300"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Font Size</label>
                          <select
                            value={String((state.current_form as any)?.theme?.textLogo?.fontSize || '2xl')}
                            onChange={(e) => updateForm({ theme: { ...(state.current_form?.theme || {} as any), textLogo: { ...((state.current_form as any)?.theme?.textLogo || {}), fontSize: e.target.value } } })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="sm">sm</option>
                            <option value="base">base</option>
                            <option value="lg">lg</option>
                            <option value="xl">xl</option>
                            <option value="2xl">2xl</option>
                            <option value="3xl">3xl</option>
                            <option value="4xl">4xl</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Font Family</label>
                          <select
                            value={String((state.current_form as any)?.theme?.textLogo?.fontFamily || 'Inter, sans-serif')}
                            onChange={(e) => updateForm({ theme: { ...(state.current_form?.theme || {} as any), textLogo: { ...((state.current_form as any)?.theme?.textLogo || {}), fontFamily: e.target.value } } })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="Inter, sans-serif">Inter</option>
                            <option value="system-ui, sans-serif">System UI</option>
                            <option value="Roboto, sans-serif">Roboto</option>
                            <option value="Open Sans, sans-serif">Open Sans</option>
                            <option value="Lato, sans-serif">Lato</option>
                            <option value="Poppins, sans-serif">Poppins</option>
                            <option value="Montserrat, sans-serif">Montserrat</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Font Weight</label>
                          <select
                            value={String((state.current_form as any)?.theme?.textLogo?.fontWeight || '700')}
                            onChange={(e) => updateForm({ theme: { ...(state.current_form?.theme || {} as any), textLogo: { ...((state.current_form as any)?.theme?.textLogo || {}), fontWeight: e.target.value } } })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="400">Regular (400)</option>
                            <option value="500">Medium (500)</option>
                            <option value="600">Semi-bold (600)</option>
                            <option value="700">Bold (700)</option>
                            <option value="800">Extra-bold (800)</option>
                            <option value="900">Black (900)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Layout & Behavior Section */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Form Layout & Behavior</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Form Mode
                      </label>
                      <select
                        value={state.current_form?.settings?.display_mode || 'single_page'}
                        onChange={(e) => {
                          if (state.current_form) {
                            updateForm({
                              settings: {
                                ...state.current_form.settings,
                                display_mode: e.target.value as any
                              }
                            })
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="single_page">Single Page</option>
                        <option value="progressive">Progressive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Layout
                      </label>
                      <select
                        value={state.current_form?.settings?.layout || 'vertical'}
                        onChange={(e) => {
                          if (state.current_form) {
                            updateForm({
                              settings: {
                                ...state.current_form.settings,
                                layout: e.target.value as any
                              }
                            })
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="vertical">Vertical</option>
                        <option value="horizontal">Horizontal</option>
                        <option value="grid">Grid</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Form Width
                      </label>
                      <select
                        value={state.current_form?.settings?.width || 'medium'}
                        onChange={(e) => {
                          if (state.current_form) {
                            updateForm({
                              settings: {
                                ...state.current_form.settings,
                                width: e.target.value as any
                              }
                            })
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="narrow">Narrow</option>
                        <option value="medium">Medium</option>
                        <option value="wide">Wide</option>
                        <option value="typeform">Typeform Style</option>
                        <option value="stitch">Stitch Design</option>
                        <option value="tripe">Tripe Preview</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Border Radius
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="range"
                          min="0"
                          max="20"
                          value={state.current_form?.theme?.border_radius || 8}
                          onChange={(e) => {
                            if (state.current_form) {
                              updateForm({
                                theme: {
                                  ...state.current_form.theme,
                                  border_radius: parseInt(e.target.value)
                                }
                              })
                            }
                          }}
                          className="flex-1"
                        />
                        <span className="text-sm text-gray-500 min-w-[2rem]">
                          {state.current_form?.theme?.border_radius || 8}px
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowThemeEditor(false)}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Presentation modal removed */}



      {/* Upgrade Modal */}
      {formLimitInfo && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={handleUpgrade}
          currentFormCount={formLimitInfo.currentCount}
          formLimit={formLimitInfo.limit}
          isAuthenticated={isAuthenticated}
        />
      )}
    </div>
  )
} 