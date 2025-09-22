'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
  GlobeAltIcon, 
  DocumentDuplicateIcon, 
  ArrowPathIcon,
  ShareIcon,
  CheckIcon,
  ChevronDownIcon,
  LinkIcon,
  QrCodeIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline'
import { useFormBuilder } from '@/components/providers/FormBuilderProvider'
import { useNotifications } from '@/components/providers/NotificationProvider'
import { useAuth } from '@/components/providers/AuthProvider'
import { getPublishedFormUrl } from '@/lib/utils/url'

interface EnhancedPublishButtonProps {
  onPublish: () => Promise<void>
  isPublished: boolean
  publishedUrl?: string
}

interface ShareOption {
  id: string
  name: string
  shortName: string
  description: string
  icon: React.ComponentType<any>
  action: () => void
}

export function EnhancedPublishButton({ 
  onPublish, 
  isPublished, 
  publishedUrl 
}: EnhancedPublishButtonProps) {
  const [isPublishing, setIsPublishing] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [copiedToClipboard, setCopiedToClipboard] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { addNotification } = useNotifications()
  const { user, isAuthenticated, isAnonymous, getUserTrackingData, checkAnonymousFormLimit, checkUserFormLimit } = useAuth()
  const { state, updateForm } = useFormBuilder()

  // Build a robust share URL even before server returns publishedUrl
  const getEffectiveShareUrl = () => {
    if (publishedUrl && publishedUrl.trim().length > 0) return publishedUrl
    const slugOrId = state.current_form?.slug || state.current_form?.id || ''
    return getPublishedFormUrl(slugOrId, state.current_form?.slug)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handlePublish = async () => {
    // Enforce 5-form limit for non-pro or anonymous users
    try {
      // Allow Pro users without checks
      if (!(isAuthenticated && user?.subscription_tier === 'pro')) {
        let canProceed = true
        if (isAuthenticated) {
          const { canCreate } = await checkUserFormLimit()
          canProceed = canCreate
        } else if (isAnonymous) {
          const { canCreate } = await checkAnonymousFormLimit()
          canProceed = canCreate
        }
        
        if (!canProceed) {
          // The FormBuilderToolbar will catch the API error and show the modal
        }
      }

      setIsPublishing(true)
      await onPublish()
      
      // Add success animation
      const button = document.querySelector('[data-publish-button]') as HTMLElement
      if (button) {
        button.classList.add('animate-pulse', 'bg-green-500')
        setTimeout(() => {
          button.classList.remove('animate-pulse', 'bg-green-500')
        }, 1000)
      }

      // Increment anonymous publish count after successful publish (server also enforces limit)
      if (isAnonymous && typeof window !== 'undefined' && getUserTrackingData) {
        try {
          const tracking = await getUserTrackingData()
          if (tracking?.fingerprint) {
            await fetch('/api/user/form-limits', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fingerprint: tracking.fingerprint, action: 'increment' })
            })
          }
        } catch (e) {
          // Non-fatal; ignore increment failure
        }
      }
    } catch (error) {
      console.error('Publish failed:', error)
    } finally {
      setIsPublishing(false)
    }
  }

  const handleRepublish = async () => {
    // Enforce limit as well for republish creating a new published entry if applicable
    try {
      // Allow Pro users without checks
      if (!(isAuthenticated && user?.subscription_tier === 'pro')) {
        if (isAuthenticated) {
          const { canCreate } = await checkUserFormLimit()
          if (!canCreate) {
            // Let the toolbar handle the modal
            setShowDropdown(false)
            await onPublish() // This will trigger the modal via API error
            return
          }
        } else if (isAnonymous) {
          const { canCreate } = await checkAnonymousFormLimit()
          if (!canCreate) {
            // Let the toolbar handle the modal
            setShowDropdown(false)
            await onPublish() // This will trigger the modal via API error
            return
          }
        }
      }

      setIsPublishing(true)
      await onPublish()
      addNotification({
        type: 'success',
        title: 'Form Updated',
        message: 'Your published form has been updated with the latest changes!',
        duration: 5000
      })
    } catch (error) {
      console.error('Republish failed:', error)
    } finally {
      setIsPublishing(false)
      setShowDropdown(false)
    }
  }

  const handleClone = async () => {
    try {
      // Create a new form with the same data but as draft
      const clonedForm = {
        ...state.current_form,
        id: 'default-form', // Will be assigned new ID when saved
        title: `${state.current_form?.title || 'Untitled Form'} (Copy)`,
        isPublished: false,
        status: 'draft' as const,
        publishedUrl: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Update the current form to the cloned version
      updateForm(clonedForm)
      
      addNotification({
        type: 'success',
        title: 'Form Cloned',
        message: 'Your form has been cloned and is ready for editing!',
        duration: 5000
      })
    } catch (error: any) {
      console.error('Clone failed:', error)
      addNotification({
        type: 'error',
        title: 'Clone Failed',
        message: error.message.includes('limit reached') ? 'You have reached your form limit. Please upgrade to create more forms.' : 'Failed to clone form. Please try again.',
        duration: 5000
      })
    }
    setShowDropdown(false)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedToClipboard(true)
      setTimeout(() => setCopiedToClipboard(false), 2000)
      addNotification({
        type: 'success',
        title: 'Copied!',
        message: 'Link copied to clipboard',
        duration: 2000
      })
    } catch (error) {
      console.error('Failed to copy:', error)
      addNotification({
        type: 'error',
        title: 'Copy Failed',
        message: 'Failed to copy link to clipboard. Your browser might be blocking it or you need to grant permission.',
        duration: 3000
      })
    }
  }

  const shareOptions: ShareOption[] = [
    {
      id: 'copy-link',
      name: 'Copy Link',
      shortName: 'Copy',
      description: 'Copy the direct link to your form',
      icon: LinkIcon,
      action: () => copyToClipboard(getEffectiveShareUrl())
    },
    {
      id: 'qr-code',
      name: 'QR Code',
      shortName: 'QR',
      description: 'Generate a QR code for easy mobile sharing',
      icon: QrCodeIcon,
      action: () => {
        addNotification({ type: 'info', title: 'QR Code', message: 'QR code generation coming soon!', duration: 3000 })
      }
    },
    {
      id: 'email',
      name: 'Email',
      shortName: 'Email',
      description: 'Share via email with a custom message',
      icon: EnvelopeIcon,
      action: () => {
        const subject = encodeURIComponent(`Check out my form: ${state.current_form?.title}`)
        const body = encodeURIComponent(`Hi! I'd like to share my form with you: ${getEffectiveShareUrl()}`)
        window.open(`mailto:?subject=${subject}&body=${body}`)
      }
    },
    {
      id: 'twitter',
      name: 'Twitter (X)',
      shortName: 'Twitter',
      description: 'Share on Twitter (X)',
      icon: ChatBubbleLeftRightIcon,
      action: () => {
        const text = encodeURIComponent(state.current_form?.title || 'Check out this form')
        const url = encodeURIComponent(getEffectiveShareUrl())
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
      }
    },
    {
      id: 'facebook',
      name: 'Facebook',
      shortName: 'Facebook',
      description: 'Share on Facebook',
      icon: ChatBubbleLeftRightIcon,
      action: () => {
        const url = encodeURIComponent(getEffectiveShareUrl())
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
      }
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      shortName: 'LinkedIn',
      description: 'Share on LinkedIn',
      icon: ChatBubbleLeftRightIcon,
      action: () => {
        const url = encodeURIComponent(getEffectiveShareUrl())
        const title = encodeURIComponent(state.current_form?.title || 'Form')
        const summary = encodeURIComponent('Fill out this form')
        window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}&summary=${summary}`, '_blank')
      }
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      shortName: 'WhatsApp',
      description: 'Share via WhatsApp',
      icon: ChatBubbleLeftRightIcon,
      action: () => {
        const text = encodeURIComponent(`${state.current_form?.title || 'Form'} - ${getEffectiveShareUrl()}`)
        window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank')
      }
    },
    {
      id: 'embed',
      name: 'Embed Code',
      shortName: 'Embed',
      description: 'Get embed code for your website',
      icon: CodeBracketIcon,
      action: () => {
        const embedCode = `<iframe src="${getEffectiveShareUrl()}" width="100%" height="600" frameborder="0"></iframe>`
        copyToClipboard(embedCode)
      }
    }
  ]

  const dropdownOptions = [
    {
      id: 'republish',
      name: 'Update',
      shortName: 'Update',
      description: 'Update your published form with latest changes',
      icon: ArrowPathIcon,
      action: handleRepublish,
      disabled: isPublishing
    },
    {
      id: 'clone',
      name: 'Clone',
      shortName: 'Clone',
      description: 'Create a copy of this form to edit and publish separately',
      icon: DocumentDuplicateIcon,
      action: handleClone
    },
    {
      id: 'share',
      name: 'Share',
      shortName: 'Share',
      description: 'Share your form with others via various methods',
      icon: ShareIcon,
      action: () => setShowShareModal(true)
    }
  ]

  if (!isPublished) {
    return (
      <button
        onClick={handlePublish}
        disabled={isPublishing}
        data-publish-button
        className="flex items-center space-x-1.5 px-3 py-1.5 text-white bg-[#6C5CE7] hover:bg-opacity-90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium h-8"
      >
        {isPublishing ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Publishing...</span>
          </>
        ) : (
          <>
            <GlobeAltIcon className="w-4 h-4" />
            <span>Publish</span>
          </>
        )}
      </button>
    )
  }

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-white bg-[#6C5CE7] hover:bg-opacity-90 rounded-lg transition-colors text-xs font-medium h-8"
        >
          <CheckIcon className="w-4 h-4" />
          <span>Published</span>
          <ChevronDownIcon className="w-3 h-3" />
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            {dropdownOptions.map((option) => (
              <button
                key={option.id}
                onClick={option.action}
                disabled={option.disabled}
                className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option.icon className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-900 text-sm">{option.shortName}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShareIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Share Form</h3>
                  <p className="text-xs text-gray-500">Choose how to share your form</p>
                </div>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Form Link */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-900 mb-1">Form Link</p>
                    <p className="text-xs text-gray-600 break-all">{getEffectiveShareUrl()}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(getEffectiveShareUrl())}
                    className="ml-2 p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
                  >
                    {copiedToClipboard ? (
                      <CheckIcon className="w-3 h-3 text-green-600" />
                    ) : (
                      <DocumentDuplicateIcon className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>

              {/* Share Options */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900">Share via</h4>
                <div className="grid grid-cols-2 gap-2">
                  {shareOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={option.action}
                      className="flex items-center space-x-2 p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <option.icon className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-gray-900 text-sm">{option.shortName}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-2 p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
