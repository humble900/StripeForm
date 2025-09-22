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
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useFormBuilder } from '@/components/providers/FormBuilderProvider'
import { useNotifications } from '@/components/providers/NotificationProvider'
import { useAuth } from '@/components/providers/AuthProvider'
import { getPublishedFormUrl } from '@/lib/utils/url'

import { UpgradeModal } from '@/components/modals/UpgradeModal'
import { FormLimitMessage } from '@/components/ui/FormLimitMessage'
import { EnhancedPublishButton } from './EnhancedPublishButton'

interface FormBuilderToolbarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  inspectorOpen: boolean
  setInspectorOpen: (open: boolean) => void
}

export function FormBuilderToolbar({ 
  sidebarOpen, 
  setSidebarOpen, 
  inspectorOpen, 
  setInspectorOpen 
}: FormBuilderToolbarProps) {
  const { state, dispatch, undo, redo, canUndo, canRedo, setPreviewMode, updateForm, saveForm } = useFormBuilder()
  const { addNotification } = useNotifications()
  const { user, isAuthenticated, isAnonymous, getUserTrackingData, checkAnonymousFormLimit, checkUserFormLimit } = useAuth()
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
        if (!limitInfo.canCreate) {
          setShowUpgradeModal(true)
          return
        }
      }

      // Save the form first to ensure we have a definitive ID
      const saved = await saveForm()
      
      // Update form status to published
      if (state.current_form) {
        const formIdForUrl = saved?.id || state.current_form.id
        updateForm({
          ...state.current_form,
          status: 'published',
          isPublished: true,
          publishedUrl: getPublishedFormUrl(formIdForUrl, state.current_form?.slug),
          updated_at: new Date().toISOString()
        })
        
        // Save the form again with the updated status
        try {
          const updateData = {
            ...state.current_form,
            status: 'published',
            isPublished: true,
            publishedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          
          console.log('📤 Sending form update with status:', updateData.status)
          
          const response = await fetch(`/api/forms/${formIdForUrl}`, {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${state.current_form?.user_id || 'anonymous'}`
            },
            body: JSON.stringify(updateData)
          })
          
          if (!response.ok) {
            const errorText = await response.text()
            console.error('❌ Form update failed:', response.status, errorText)
            
            // Handle specific error cases
            if (response.status === 404) {
              throw new Error('Form not found. Please try saving the form first.')
            } else if (response.status === 403) {
              throw new Error('You do not have permission to update this form.')
            } else if (response.status === 405) {
              throw new Error('Invalid update method. Please try again.')
            } else {
              throw new Error(`Failed to update form status: ${errorText || 'Unknown error'}`)
            }
          }
          
          const result = await response.json()
          console.log('✅ Form status updated in database:', result)
          
          // Check if the server returned a published URL
          if (result.data?.publishedUrl) {
            // Update form with the server-generated URL
            updateForm({
              ...state.current_form,
              publishedUrl: result.data.publishedUrl
            })
            console.log('✅ Published URL updated:', result.data.publishedUrl)
          } else {
            // Fallback: use the URL we generated locally
            const fallbackUrl = getPublishedFormUrl(formIdForUrl, state.current_form?.slug)
            updateForm({
              ...state.current_form,
              publishedUrl: fallbackUrl
            })
            console.log('✅ Using fallback published URL:', fallbackUrl)
          }
        } catch (error) {
          console.error('❌ Failed to update form status:', error)
          throw error
        }
      }

      // Increment form count for anonymous users
      if (isAnonymous) {
        try {
          const trackingData = await getUserTrackingData()
          await fetch('/api/user/form-limits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              fingerprint: trackingData.fingerprint,
              action: 'increment'
            })
          })
        } catch (error) {
          console.warn('Failed to increment anonymous form count:', error)
        }
      }

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
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - form details (removed duplicate sidebar toggle) */}
        <div className="flex items-center space-x-6">

          {/* Form Title and Description */}
          <div className="flex-1 max-w-md">
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

          {/* Inspector toggle removed; handled via sidebar controls */}
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
                  onClick={() => setShowThemeEditor(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {/* Theme editor content */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <input
                    type="color"
                    value={state.current_form?.theme?.primary_color || '#3B82F6'}
                    onChange={(e) => {
                      if (state.current_form) {
                        updateForm({
                          theme: {
                            ...state.current_form.theme,
                            primary_color: e.target.value
                          }
                        })
                      }
                    }}
                    className="w-full h-10 rounded-lg border border-gray-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Border Radius
                  </label>
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
                    className="w-full"
                  />
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