'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import EnhancedFormPreview from '@/components/form-builder/EnhancedFormPreview'

import { Form, FormField, FormTheme, FormSettings, BrandKit } from '@/types'

export default function PublishedFormPage() {
  const params = useParams()
  const formId = params?.id as string

  // All hooks must be declared at the top, before any conditional returns
  const [form, setForm] = useState<Form | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [geoBlocked, setGeoBlocked] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [submissionId, setSubmissionId] = useState<string | null>(null)
  const AUTOSAVE_RESP_KEY = formId ? `stripeform-autosave-response-${formId}` : ''

  // Payment API ref - must be declared before any early returns
  const paymentApiRef = useRef<{
    confirm: () => Promise<{ ok: boolean; id?: string; error?: string }>;
    getStatus: () => { isBlocked: boolean };
  } | null>(null)

  // Ensure component is mounted before rendering
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Fetch form data
  useEffect(() => {
    const fetchForm = async () => {
      if (!formId) {
        return
      }

      try {
        setIsLoading(true)

        // Use the API route instead of direct Supabase access
        const response = await fetch(`/api/forms/${formId}`)

        const result = await response.json().catch(() => null)

        if (!response.ok) {
          if (response.status === 404) {
            setError('Form not found. It may have been deleted or the URL is incorrect.')
            return
          }
          throw new Error(result?.error || `HTTP ${response.status}: ${response.statusText}`)
        }

        if (!result || !result.success) {
          throw new Error(result?.error || 'Failed to fetch form')
        }

        const formData = result.data

        // Check if form is published
        if (!formData.isPublished || formData.status !== 'published') {
          setError('Form not found or not published')
          return
        }

        setForm(formData)

        // Track form view for analytics (non-blocking)
        fetch(`/api/forms/${formId}/view`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }).catch(viewError => {
          console.warn('Failed to track form view:', viewError)
          // Don't fail the form loading if view tracking fails
        })

        // Set initial state based on form settings
        const hasCover = formData.fields?.some((f: any) => f.type === 'cover_slide')
        setHasStarted(hasCover ? false : (formData.settings?.use_cover ? false : true))

      } catch (error) {
        console.error('Error fetching form:', error)
        setError('Failed to load form. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchForm()
  }, [formId])

  // Autosave respondent progress to localStorage and restore on mount
  useEffect(() => {
    if (!formId) return
    // Restore saved answers
    try {
      const raw = localStorage.getItem(AUTOSAVE_RESP_KEY)
      if (raw) {
        const saved = JSON.parse(raw)
        if (saved?.data && typeof saved.data === 'object') {
          setFormData(saved.data)
        }
        if (typeof saved?.currentStep === 'number') {
          setCurrentStep(saved.currentStep)
        }
        if (typeof saved?.submissionId === 'string') {
          setSubmissionId(saved.submissionId)
        }
      }
    } catch { }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId])

  useEffect(() => {
    if (!formId) return
    try {
      const payload = { data: formData, currentStep, savedAt: Date.now(), submissionId }
      localStorage.setItem(AUTOSAVE_RESP_KEY, JSON.stringify(payload))
    } catch { }
  }, [formId, formData, currentStep, submissionId])

  // Server-side auto-save (debounce 2s) for Partial Responses
  useEffect(() => {
    // Only auto-save if they've started, have data, and aren't actively submitting/finished
    if (!formId || !hasStarted || Object.keys(formData).length === 0 || isSubmitting || isSubmitted) return

    const timeout = setTimeout(async () => {
      try {
        const payload: any = {
          formId,
          data: formData,
          status: 'partial'
        }
        if (submissionId) payload.id = submissionId

        const resp = await fetch('/api/forms/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (resp.ok) {
          const json = await resp.json()
          // Save the newly minted ID so future debounces UPDATE it instead of creating duplicates
          if (json.success && json.data?.id && !submissionId) {
            setSubmissionId(json.data.id)
          }
        }
      } catch (err) {
        console.warn('Silent auto-save failed:', err)
      }
    }, 2000)

    return () => clearTimeout(timeout)
  }, [formData, formId, hasStarted, isSubmitting, isSubmitted, submissionId])

  // Geo restriction effect - moved to top with other hooks
  useEffect(() => {
    if (!form) return

    // Run geo restriction before start
    const applyGeo = async () => {
      const geoField = form.fields?.find((f: any) => f.type === 'geo_restriction') as any
      if (!geoField) return

      try {
        const ipResp = await fetch('/api/geo-location')
        const geo = await ipResp.json()
        const country = String(geo?.country || '').toUpperCase()
        const ip = String(geo?.ip || '')
        const mode = (geoField.settings?.geoBlockMode as any) || 'allow'
        const countryList: string[] = (geoField.settings?.geoAllowedCountries as any) || []
        const ipList: string[] = (geoField.settings?.geoIpList as any) || []
        const countryAllowed = countryList.includes(country)
        const ipAllowed = ip && ipMatchesList(ip, ipList)
        let blocked = false
        if (mode === 'allow') {
          blocked = !(countryAllowed || ipAllowed)
        } else {
          const countryIsBlocked = countryAllowed
          const ipIsBlocked = ip && ipMatchesList(ip, ipList)
          blocked = Boolean(countryIsBlocked || ipIsBlocked)
        }
        setGeoBlocked(blocked)
      } catch {
        setGeoBlocked(false)
      }
    }
    applyGeo()
  }, [form])

  // Helper functions
  const ipMatchesList = (ip: string, list: string[]): boolean => {
    const cleaned = list.map(s => s.trim()).filter(Boolean)
    for (const entry of cleaned) {
      if (entry.includes('/')) {
        if (ipInCidr(ip, entry)) return true
      } else {
        if (ip === entry) return true
      }
    }
    return false
  }

  const ipInCidr = (ip: string, cidr: string): boolean => {
    const [base, bitsStr] = cidr.split('/')
    const bits = Number(bitsStr)
    const ipNum = parseIPv4(ip)
    const baseNum = parseIPv4(base || '')
    if (ipNum == null || baseNum == null || isNaN(bits) || bits < 0 || bits > 32) return false
    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0
    return (ipNum & mask) === (baseNum & mask)
  }

  const parseIPv4 = (ip: string): number | null => {
    const m = ip.trim().match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
    if (!m) return null
    const parts = m.slice(1).map(n => Number(n))
    if (parts.some(n => n < 0 || n > 255)) return null
    return ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3]
  }

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
    if (errors[fieldId]) setErrors(prev => ({ ...prev, [fieldId]: '' }))
  }

  const getProgress = () => {
    const playableFields = form?.fields?.filter((f: any) => f.type !== 'cover_slide' && f.type !== 'geo_restriction' && f.type !== 'url_redirect') || []
    const totalSteps = playableFields.length
    return totalSteps === 0 ? 0 : ((currentStep + 1) / totalSteps) * 100
  }

  const handleNext = () => {
    const playableFields = form?.fields?.filter((f: any) => f.type !== 'cover_slide' && f.type !== 'geo_restriction' && f.type !== 'url_redirect') || []
    const totalSteps = playableFields.length
    if (currentStep < totalSteps - 1) setCurrentStep(s => s + 1)
  }

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Handle payment if present
      const paymentField = form?.fields?.find((f: any) => f.type === 'payment') as any
      if (paymentField) {
        const result = await paymentApiRef.current?.confirm()
        if (!result?.ok) {
          throw new Error(result?.error || 'Payment failed')
        }
      }

      // Submit form data
      const response = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: submissionId || undefined,
          formId: form?.id,
          data: formData,
          status: 'pending', // Converts internal 'partial' to actual submission
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit form')
      }

      setIsSubmitted(true)
      // Clear autosave on success
      try { localStorage.removeItem(AUTOSAVE_RESP_KEY) } catch { }
    } catch (error) {
      console.error('Error submitting form:', error)
      setErrors(prev => ({ ...prev, submit: 'Failed to submit form. Please try again.' }))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Generate dynamic styles based on theme
  const getThemeStyles = () => {
    if (!form?.theme) return {}

    const theme = form.theme
    return {
      '--primary-color': theme.primary_color || '#FFFFFF',      // Form body color (white default)
      '--secondary-color': theme.secondary_color || '#FFFFFF',  // Form boxes color (white default)
      '--background-color': theme.background_color || '#F9FAFB', // Page background
      '--text-color': theme.text_color || '#1F2937',
      '--border-radius': `${theme.border_radius || 8}px`,
      '--font-family': theme.font_family || 'Inter, sans-serif',
    } as React.CSSProperties
  }

  // Get container width based on settings
  const getContainerWidth = () => {
    if (!form?.settings) return 'max-w-2xl'

    const settings = form.settings
    if (settings.widthMode === 'px' && settings.widthPx) {
      return { maxWidth: `${settings.widthPx}px` }
    } else if (settings.widthMode === 'ratio' && settings.widthRatio) {
      return { maxWidth: `${settings.widthRatio * 100}vw` }
    }

    // Default width presets
    if (settings.width === 'typeform') return 'max-w-2xl'
    if (settings.width === 'stitch') return 'max-w-4xl'
    if (settings.width === 'tripe') return 'max-w-6xl'

    return 'max-w-2xl'
  }

  // Brand kit color helpers - using new specific colors
  const getPageBackground = (): string => {
    const brand = (form as any)?.brandKit?.colors || {}
    return brand.pageBackground?.hex || form?.theme?.background_color || '#F9FAFB'
  }

  const getFormBackground = (): string => {
    const brand = (form as any)?.brandKit?.colors || {}
    return brand.formBackground?.hex || form?.theme?.primary_color || '#FFFFFF'
  }

  const getFieldBackground = (field?: any): string => {
    const fieldBg = field?.settings?.backgroundColor
    const brand = (form as any)?.brandKit?.colors || {}
    return fieldBg || brand.fieldBackground?.hex || form?.theme?.secondary_color || '#FFFFFF'
  }

  const getButtonColor = (field?: any, isPrimary: boolean = true): string => {
    const fieldBg = field?.settings?.buttonColor
    const brand = (form as any)?.brandKit?.colors || {}
    if (fieldBg) return fieldBg
    return isPrimary
      ? (brand.buttonPrimary?.hex || '#3B82F6')
      : (brand.buttonSecondary?.hex || '#6B7280')
  }

  const getFocusColor = (): string => {
    const brand = (form as any)?.brandKit?.colors || {}
    return brand.focus?.hex || '#3B82F6'
  }

  const getHoverColor = (): string => {
    const brand = (form as any)?.brandKit?.colors || {}
    return brand.hover?.hex || '#2563EB'
  }

  const getFieldRadius = (field?: any): number => {
    const fieldRadius = field?.settings?.borderRadius
    const themeRadius = form?.theme?.border_radius
    return (typeof fieldRadius === 'number' ? fieldRadius : (typeof themeRadius === 'number' ? themeRadius : 12))
  }

  const getLabelColor = (field?: any): string => {
    const fieldColor = field?.settings?.labelColor
    const brand = (form as any)?.brandKit?.colors || {}
    return fieldColor || brand.text?.primary?.hex || form?.theme?.text_color || '#374151'
  }

  // Prevent hydration mismatches by not rendering until mounted
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={getThemeStyles()}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: form?.theme?.primary_color || '#3B82F6' }}></div>
          <p className="mt-2" style={{ color: form?.theme?.text_color || '#6B7280' }}>Loading form...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={getThemeStyles()}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: form?.theme?.text_color || '#1F2937' }}>Form Not Found</h1>
          <p style={{ color: form?.theme?.text_color || '#6B7280' }}>{error || 'The form you are looking for does not exist or is not published.'}</p>
        </div>
      </div>
    )
  }

  // Geo blocked state
  if (geoBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={getThemeStyles()}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: form?.theme?.text_color || '#1F2937' }}>Access Restricted</h1>
          <p style={{ color: form?.theme?.text_color || '#6B7280' }}>This form is not available in your region.</p>
        </div>
      </div>
    )
  }

  // Minimal renderer: rely fully on EnhancedFormPreview (no extra page/background wrappers)
  return (
    <EnhancedFormPreview form={form as any} isPreview={false} submitMode="api" />
  )
}
