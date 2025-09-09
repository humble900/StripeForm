'use client'

import React, { useState, useRef, useEffect } from 'react'
import { FormField, FieldType } from '@/types'
import { useFormBuilder } from '@/components/providers/FormBuilderProvider'
import { 
  CheckIcon, 
  XMarkIcon, 
  StarIcon,
  HeartIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PhotoIcon,
  DocumentIcon,
  CurrencyDollarIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  LockClosedIcon,
  ChatBubbleLeftRightIcon,
  Bars3Icon,
  ListBulletIcon,
  Squares2X2Icon,
  HandRaisedIcon,
  PencilIcon,
  ShieldCheckIcon,
  LinkIcon
} from '@heroicons/react/24/outline'
import { getCountryRegionMeta } from '@/data/iso_regions'
import { ImageUploader } from '@/components/upload/ImageUploader'
import { FileUploader } from '@/components/upload/FileUploader'
import { VideoUploader } from '@/components/upload/VideoUploader'
import { uploadToSupabase, simulatedUpload } from '@/lib/uploadHandler'
import { loadAllCountries, loadRegionsForCountry, loadAllCountriesWithCodes, countryCodeToFlag } from '@/data/region_loader'

interface FieldComponentProps {
  field: FormField
  value?: any
  onChange?: (value: any) => void
  onBlur?: () => void
  error?: string
  isPreview?: boolean
  disabled?: boolean
  showLabel?: boolean
}

export function FieldComponent({ field, value, onChange, onBlur, error, isPreview = false, disabled = false, showLabel = true }: FieldComponentProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [localValue, setLocalValue] = useState(value || '')
  const inputRef = useRef<HTMLInputElement>(null)
  const { updateField, selectField } = useFormBuilder()
  const [activeMatrixRow, setActiveMatrixRow] = useState<number | null>(null)
  const [activeMatrixCol, setActiveMatrixCol] = useState<number | null>(null)

  // Unified input styling per design spec
  const baseInputClasses = 'w-full h-[50px] px-4 border rounded-[12px] transition-all duration-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/40 focus:border-indigo-500 dark:bg-[#1E1E1E] dark:text-gray-100 dark:placeholder:text-gray-500 dark:border-[#333]'
  const neutralBorderClass = 'border-gray-200 dark:border-[#333]'

  useEffect(() => {
    setLocalValue(value || '')
  }, [value])

  const handleChange = (newValue: any) => {
    setLocalValue(newValue)
    onChange?.(newValue)
  }

  const getFieldIcon = (type: FieldType) => {
    switch (type) {
      case 'email': return <EnvelopeIcon className="w-5 h-5" />
      case 'phone': return <PhoneIcon className="w-5 h-5" />
      case 'url': return <GlobeAltIcon className="w-5 h-5" />
      case 'date': return <CalendarIcon className="w-5 h-5" />
      case 'time': return <ClockIcon className="w-5 h-5" />
      case 'location': return <MapPinIcon className="w-5 h-5" />
      case 'name': return <UserIcon className="w-5 h-5" />
      case 'password': return <LockClosedIcon className="w-5 h-5" />
      case 'payment': return <CurrencyDollarIcon className="w-5 h-5" />
      case 'file_upload': return <DocumentIcon className="w-5 h-5" />
      case 'image_upload': return <PhotoIcon className="w-5 h-5" />
      case 'signature_upload': return <PencilIcon className="w-5 h-5" />
      case 'rating': return <StarIcon className="w-5 h-5" />
      case 'star_rating': return <StarIcon className="w-5 h-5" />
      case 'nps': return <ChatBubbleLeftRightIcon className="w-5 h-5" />
      case 'likert': return <Bars3Icon className="w-5 h-5" />
      case 'matrix_grid': return <Squares2X2Icon className="w-5 h-5" />
      case 'ranking': return <ListBulletIcon className="w-5 h-5" />
      case 'yes_no': return <HandRaisedIcon className="w-5 h-5" />
      case 'captcha': return <ShieldCheckIcon className="w-5 h-5" />
      default: return null
    }
  }

  function RegionAuto({ country, value, onChange, inputCls, required }: { country?: string; value: string; onChange: (v: string)=>void; inputCls: string; required: boolean }) {
    const [options, setOptions] = useState<{ name: string; shortCode?: string }[] | null>(null)
    useEffect(() => {
      if (!country) { setOptions(null); return }
      loadRegionsForCountry(country).then((regions) => setOptions(regions || []))
    }, [country])
    if (options && options.length > 0) {
      return (
        <select value={value} onChange={(e)=>onChange(e.target.value)} className={inputCls} required={required}>
          <option value="">Select region</option>
          {options.map((r) => (
            <option key={r.shortCode || r.name} value={r.name}>{r.name}</option>
          ))}
        </select>
      )
    }
    return (
      <input value={value} onChange={(e)=>onChange(e.target.value)} className={inputCls} placeholder="Region" required={required} />
    )
  }

  const renderField = () => {
    switch (field.type) {
      case 'geo_restriction': {
        // Show configuration hint only in on-card (builder) preview; hide elsewhere
        if (isPreview) {
          return (
            <div className="rounded-[12px] border border-gray-200 bg-gray-50 p-3 text-left">
              <div className="flex items-center gap-2 text-gray-700 mb-1">
                <GlobeAltIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Geo-Restriction</span>
              </div>
              <div className="text-xs text-gray-500">Restrict access by country or IP.</div>
            </div>
          )
        }
        return null
      }

      case 'cover_slide': {
        if (isPreview) {
          return (
            <div className="rounded-[12px] border border-gray-200 overflow-hidden">
              <div className="h-24 bg-gray-200" />
              <div className="p-3">
                <div className="text-sm font-semibold text-gray-800">Cover Slide</div>
                <div className="text-xs text-gray-500">Your catchy subtitle goes here</div>
              </div>
            </div>
          )
        }
        return (
          <div className="relative rounded-[12px] overflow-hidden border border-gray-200">
            <div className="h-32 bg-gray-100" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 text-white">
              <div className="text-lg font-semibold truncate">{(field.settings as any)?.coverTitle || 'Welcome'}</div>
              <div className="text-xs opacity-90">{(field.settings as any)?.coverSubtitle || 'Let’s get started'}</div>
              <div className="mt-2">
                <button disabled className="px-3 py-1.5 bg-white/90 text-gray-900 rounded-full text-xs">{(field.settings as any)?.coverCtaText || 'Start'}</button>
              </div>
            </div>
          </div>
        )
      }

      case 'end_page': {
        if (isPreview) {
          return (
            <div className="rounded-[12px] border border-gray-200 p-3 text-left">
              <div className="text-sm font-semibold text-gray-800">End Screen</div>
              <div className="text-xs text-gray-500">Thanks for completing the form.</div>
            </div>
          )
        }
        return (
          <div className="rounded-[12px] border border-gray-200 p-4 text-center">
            <div className="text-lg font-semibold text-gray-900">{(field.settings as any)?.endTitle || 'Thank you!'}</div>
            <div className="text-sm text-gray-600 mt-1">{(field.settings as any)?.endSubtitle || 'We appreciate your time.'}</div>
            {(field.settings as any)?.endButtonText && (
              <div className="mt-3">
                <button disabled className="px-3 py-1.5 bg-gray-900 text-white rounded-full text-xs">{(field.settings as any)?.endButtonText}</button>
              </div>
            )}
          </div>
        )
      }

      case 'url_redirect': {
        if (isPreview) {
          return (
            <div className="rounded-[12px] border border-gray-200 p-3 text-left">
              <div className="flex items-center gap-2 text-gray-700 mb-1">
                <LinkIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Redirect</span>
              </div>
              <div className="text-xs text-gray-500">Enter target URL</div>
            </div>
          )
        }
        return (
          <div className="space-y-1">
            <label className="text-[12px] text-gray-600">Target URL</label>
            <input type="url" disabled className={`${baseInputClasses} ${neutralBorderClass}`} placeholder={(field.settings as any)?.redirectUrl || 'https://example.com/thank-you'} />
            <div className="text-[11px] text-gray-500">User will be redirected after this step.</div>
          </div>
        )
      }
      case 'name': {
        const current = (typeof localValue === 'object' && localValue) ? localValue as any : { first: '', last: '' }
        const setPart = (key: 'first'|'last', v: string) => {
          const formatted = v.replace(/\s+/g, ' ').replace(/^\s+/, '')
          const updated = { ...current, [key]: formatted.charAt(0).toUpperCase() + formatted.slice(1) }
          handleChange(updated)
        }
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <input
                type="text"
                value={current.first || ''}
                onChange={(e) => setPart('first', e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => { setIsFocused(false); onBlur?.() }}
                placeholder={field.placeholder || 'First name'}
                disabled={disabled}
                className={`${baseInputClasses} ${neutralBorderClass}`}
                required={field.required}
                autoCapitalize="words"
              />
            </div>
            <div className="relative">
              <input
                type="text"
                value={current.last || ''}
                onChange={(e) => setPart('last', e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => { setIsFocused(false); onBlur?.() }}
                placeholder={'Last name'}
                disabled={disabled}
                className={`${baseInputClasses} ${neutralBorderClass}`}
                required={field.required}
                autoCapitalize="words"
              />
            </div>
          </div>
        )
      }

      case 'phone': {
        const [countries, setCountries] = useState<{ name: string; code?: string }[]>([])
        const [countryCode, setCountryCode] = useState<string>(() => (typeof localValue === 'object' && (localValue as any)?.country) ? (localValue as any).country : 'US')
        const rawNumber: string = (typeof localValue === 'object' && (localValue as any)?.number) ? String((localValue as any).number) : (typeof localValue === 'string' ? localValue : '')

        useEffect(() => {
          loadAllCountriesWithCodes().then(setCountries).catch(() => setCountries([]))
        }, [])

        const DIAL: Record<string, string> = { US: '+1', CA: '+1', GB: '+44', AU: '+61', IN: '+91', NG: '+234', ZA: '+27' }
        const dial = DIAL[countryCode] || '+'

        const onlyDigits = (s: string) => s.replace(/\D/g, '')
        const formatPhone = (digits: string) => {
          if (digits.length <= 3) return digits
          if (digits.length <= 6) return `${digits.slice(0,3)} ${digits.slice(3)}`
          return `${digits.slice(0,3)} ${digits.slice(3,6)} ${digits.slice(6,10)}`
        }

        const setNumber = (v: string) => {
          const digits = onlyDigits(v)
          const formatted = formatPhone(digits)
          handleChange({ country: countryCode, dial, number: digits, formatted: `${dial} ${formatted}` })
        }

        const flag = countryCodeToFlag(countryCode)

        return (
          <div className="flex items-stretch gap-2">
            <div className="relative w-[44%] max-w-[180px]">
              <select
                value={countryCode}
                onChange={(e) => { const cc = e.target.value; setCountryCode(cc); handleChange({ country: cc, dial: DIAL[cc] || '+', number: rawNumber, formatted: `${DIAL[cc] || '+'} ${formatPhone(onlyDigits(rawNumber))}` }) }}
                disabled={disabled}
                className={`${baseInputClasses} ${neutralBorderClass} pr-8`}
                aria-label="Country code"
              >
                {countries.map((c) => (
                  <option key={c.code || c.name} value={c.code || c.name}>
                    {countryCodeToFlag(c.code)} {c.code ? (DIAL[c.code] || '+') : '+'} {c.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <ChevronDownIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex-1 relative">
              <input
                type="tel"
                value={(typeof localValue === 'object' && (localValue as any)?.formatted) ? (localValue as any).formatted : `${dial} ${formatPhone(onlyDigits(rawNumber))}`}
                onChange={(e) => setNumber(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => { setIsFocused(false); onBlur?.() }}
                placeholder={`${flag} ${dial} 555 555 5555`}
                disabled={disabled}
                className={`${baseInputClasses} ${neutralBorderClass}`}
                required={field.required}
                inputMode="tel"
              />
            </div>
          </div>
        )
      }

      case 'password': {
        const [show, setShow] = useState(false)
        const pwd = String(localValue || '')
        const score = (() => {
          let s = 0
          if (pwd.length >= 8) s += 1
          if (/[A-Z]/.test(pwd)) s += 1
          if (/[a-z]/.test(pwd)) s += 1
          if (/[0-9]/.test(pwd)) s += 1
          if (/[^A-Za-z0-9]/.test(pwd)) s += 1
          return Math.min(s, 5)
        })()
        const pct = (score / 5) * 100
        const color = score <= 2 ? 'bg-red-500' : score === 3 ? 'bg-yellow-500' : 'bg-green-500'
        return (
          <div className="space-y-2">
            <div className="relative">
              <input
                ref={inputRef}
                type={show ? 'text' : 'password'}
                value={pwd}
                onChange={(e) => handleChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => { setIsFocused(false); onBlur?.() }}
                placeholder={field.placeholder || 'Enter password'}
                disabled={disabled}
                className={`${baseInputClasses} ${neutralBorderClass} pr-10`}
                required={field.required}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label={show ? 'Hide password' : 'Show password'}
              >
                <LockClosedIcon className={`w-5 h-5 ${show ? 'opacity-60' : ''}`} />
              </button>
            </div>
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-gray-500">Use at least 8 characters including numbers and symbols.</p>
          </div>
        )
      }
      case 'image_upload': {
        const accept = (field.settings as any)?.allowedMimeList || 'image/*'
        const maxFiles = (field.settings as any)?.maxFiles || 10
        return (
          <ImageUploader
            accept={accept}
            maxFiles={maxFiles}
            maxSizeMB={5}
            value={Array.isArray(value) ? value : []}
            uploadHandler={(file: File, onP: (p: number) => void) => uploadToSupabase(file, onP, { folder: 'images' }).catch(()=> simulatedUpload(file, onP))}
            onChange={(items) => onChange?.(items)}
          />
        )
      }
      case 'file_upload': {
        const accept = (field.settings as any)?.allowedMimeList || '.pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.zip,.rar,.7z,.txt'
        const maxFiles = (field.settings as any)?.maxFiles || 10
        return (
          <FileUploader
            accept={accept}
            maxSizeMB={10}
            multiple={maxFiles > 1}
            value={Array.isArray(value) ? (value as any[]) : []}
            uploadHandler={(file: File, onP: (p: number) => void) => uploadToSupabase(file, onP, { folder: 'files' }).catch(()=> simulatedUpload(file, onP))}
            onChange={(rows: any[]) => onChange?.(rows)}
          />
        )
      }
      case 'video_upload': {
        const accept = (field.settings as any)?.allowedMimeList || 'video/*'
        const maxFiles = (field.settings as any)?.maxFiles || 10
        return (
          <VideoUploader
            accept={accept}
            maxSizeMB={10}
            multiple={maxFiles > 1}
            value={Array.isArray(value) ? (value as any[]) : []}
            uploadHandler={(file: File, onP: (p: number) => void) => uploadToSupabase(file, onP, { folder: 'videos' }).catch(()=> simulatedUpload(file, onP))}
            onChange={(rows: any[]) => onChange?.(rows)}
          />
        )
      }
      case 'location': {
        const pos = (localValue && typeof localValue === 'object') ? localValue : {}
        const [text, setText] = useState('')
        const inputRef = useRef<HTMLInputElement>(null)
        useEffect(() => {
          // mirror the address autocomplete logic for a lightweight on-card demo
          const key = ((process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as unknown) as string) || (window as any).GOOGLE_MAPS_API_KEY || 'AIzaSyD-PLACEHOLDER'
          const init = () => {
            if (!(window as any).google?.maps?.places || !inputRef.current) return
            const ac = new (window as any).google.maps.places.Autocomplete(inputRef.current as HTMLInputElement, { types: ['geocode'] })
            ac.addListener('place_changed', () => {
              const place = ac.getPlace()
              const name = place?.formatted_address || text
              const loc = place?.geometry?.location
              const lat = loc?.lat ? loc.lat() : undefined
              const lng = loc?.lng ? loc.lng() : undefined
              handleChange({ name, lat, lng })
            })
          }
          if ((window as any).google?.maps?.places) { init(); return }
          let script = document.getElementById('google-places-script') as HTMLScriptElement | null
          if (!script) {
            script = document.createElement('script')
            script.id = 'google-places-script'
            script.async = true
            script.defer = true
            script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places`
            document.body.appendChild(script)
          }
          script.addEventListener('load', init, { once: true })
        }, [])
          return (
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-700 mb-1">Search location</label>
              <input ref={inputRef} value={text} onChange={(e)=>setText(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" placeholder="Start typing an address or place" />
                </div>
            {pos?.lat && pos?.lng && (
              <div className="text-xs text-gray-600">Lat: {pos.lat}, Lng: {pos.lng}</div>
            )}
          </div>
        )
      }
      case 'date': {
        // Modern calendar popover for single date
        const sel = typeof localValue === 'string' && localValue ? new Date(localValue + 'T00:00:00') : null
        const [open, setOpen] = useState(false)
        const [view, setView] = useState(() => {
          const d = sel || new Date()
          return { y: d.getFullYear(), m: d.getMonth() }
        })
        const daysShort = ['Su','Mo','Tu','We','Th','Fr','Sa']
        const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
        const start = new Date(view.y, view.m, 1)
        const firstWeekday = start.getDay()
        const daysInMonth = new Date(view.y, view.m + 1, 0).getDate()
        const grid: Array<Date | null> = []
        for (let i = 0; i < firstWeekday; i++) grid.push(null)
        for (let d = 1; d <= daysInMonth; d++) grid.push(new Date(view.y, view.m, d))
        const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
        const label = sel ? `${monthNames[sel.getMonth()]} ${sel.getDate()}, ${sel.getFullYear()}` : (field.placeholder || 'Select date')
        const nav = (delta: number) => {
          const m = view.m + delta
          const y = view.y + Math.floor(m / 12)
          const mm = ((m % 12) + 12) % 12
          setView({ y, m: mm })
        }
          return (
          <div className="relative">
            <button type="button" disabled={disabled} onClick={() => setOpen(o=>!o)}
              className={`w-full px-4 py-3 border rounded-lg text-left flex items-center justify-between ${open ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-300'} ${disabled ? 'bg-gray-50 text-gray-400' : 'bg-white'}`}>
              <span className={`flex items-center gap-2 ${!sel ? 'text-gray-400' : ''}`}>
                {getFieldIcon('date')}
                {label}
              </span>
              <ChevronDownIcon className="w-5 h-5 text-gray-400" />
            </button>
            {open && (
              <div className="absolute z-20 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <button type="button" className="p-1.5 rounded hover:bg-gray-100" onClick={() => nav(-1)}><ChevronLeftIcon className="w-4 h-4" /></button>
                  <div className="text-sm font-medium">{monthNames[view.m]} {view.y}</div>
                  <button type="button" className="p-1.5 rounded hover:bg-gray-100" onClick={() => nav(1)}><ChevronRightIcon className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-[11px] text-gray-500 mb-1">
                  {daysShort.map(d => <div key={d} className="text-center">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {grid.map((d, i) => {
                    const isSel = d && sel && fmt(d) === fmt(sel)
                    return (
                      <button key={i} type="button" disabled={!d}
                        onClick={() => { if (!d) return; handleChange(fmt(d)); setOpen(false) }}
                        className={`h-9 rounded text-sm ${!d ? 'opacity-0' : isSel ? 'bg-blue-600 text-white' : 'hover:bg-blue-50'} `}>
                        {d ? d.getDate() : ''}
                      </button>
                    )
                  })}
                </div>
                </div>
              )}
          </div>
        )
      }

      case 'multiple_dates': {
        // Modern calendar with multi-select
        const values: string[] = Array.isArray(localValue) ? localValue : []
        const [open, setOpen] = useState(false)
        const [view, setView] = useState(() => {
          if (values.length > 0) {
            const d = new Date(values[0] + 'T00:00:00')
            return { y: d.getFullYear(), m: d.getMonth() }
          }
          const d = new Date()
          return { y: d.getFullYear(), m: d.getMonth() }
        })
        const daysShort = ['Su','Mo','Tu','We','Th','Fr','Sa']
        const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
        const start = new Date(view.y, view.m, 1)
        const firstWeekday = start.getDay()
        const daysInMonth = new Date(view.y, view.m + 1, 0).getDate()
        const grid: Array<Date | null> = []
        for (let i = 0; i < firstWeekday; i++) grid.push(null)
        for (let d = 1; d <= daysInMonth; d++) grid.push(new Date(view.y, view.m, d))
        const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
        const nav = (delta: number) => {
          const m = view.m + delta
          const y = view.y + Math.floor(m / 12)
          const mm = ((m % 12) + 12) % 12
          setView({ y, m: mm })
        }
        const toggle = (d: Date) => {
          const s = fmt(d)
          if (values.includes(s)) handleChange(values.filter(v => v !== s))
          else handleChange([...values, s])
        }
        return (
          <div className="relative">
            <div className="flex flex-wrap gap-2 mb-2">
              {values.length === 0 && <span className="text-xs text-gray-400">No dates selected</span>}
              {values.map((d, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                  {d}
                  <button type="button" className="ml-1 text-blue-700/70 hover:text-blue-900" onClick={() => handleChange(values.filter(v => v !== d))}>
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <button type="button" disabled={disabled} onClick={() => setOpen(o=>!o)}
              className={`w-full px-4 py-2 border rounded-lg text-left flex items-center justify-between ${open ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-300'} ${disabled ? 'bg-gray-50 text-gray-400' : 'bg-white'}`}>
              <span className="text-sm">Pick dates</span>
              <ChevronDownIcon className="w-5 h-5 text-gray-400" />
            </button>
            {open && (
              <div className="absolute z-20 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <button type="button" className="p-1.5 rounded hover:bg-gray-100" onClick={() => nav(-1)}><ChevronLeftIcon className="w-4 h-4" /></button>
                  <div className="text-sm font-medium">{monthNames[view.m]} {view.y}</div>
                  <button type="button" className="p-1.5 rounded hover:bg-gray-100" onClick={() => nav(1)}><ChevronRightIcon className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-[11px] text-gray-500 mb-1">
                  {daysShort.map(d => <div key={d} className="text-center">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {grid.map((d, i) => {
                    const isSel = d && values.includes(fmt(d))
                    return (
                      <button key={i} type="button" disabled={!d}
                        onClick={() => { if (!d) return; toggle(d) }}
                        className={`h-9 rounded text-sm ${!d ? 'opacity-0' : isSel ? 'bg-blue-600 text-white' : 'hover:bg-blue-50'}`}>
                        {d ? d.getDate() : ''}
                      </button>
                    )
                  })}
                </div>
                <div className="mt-2 text-right">
                  <button type="button" className="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50" onClick={() => setOpen(false)}>Done</button>
                </div>
              </div>
            )}
          </div>
        )
      }

      case 'time': {
        // Modern time popover (HH:MM 24h, 15-min steps)
        const sel = typeof localValue === 'string' ? localValue : ''
        const [open, setOpen] = useState(false)
        const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
        const minutes = ['00','15','30','45']
        const [h, setH] = useState(sel.split(':')[0] || '09')
        const [m, setM] = useState(sel.split(':')[1] || '00')
        const label = sel || (field.placeholder || 'Select time')
        return (
          <div className="relative">
            <button type="button" disabled={disabled} onClick={() => setOpen(o=>!o)}
              className={`w-full px-4 py-3 border rounded-lg text-left flex items-center justify-between ${open ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-300'} ${disabled ? 'bg-gray-50 text-gray-400' : 'bg-white'}`}>
              <span className={`flex items-center gap-2 ${!sel ? 'text-gray-400' : ''}`}>
                {getFieldIcon('time')}
                {label}
              </span>
              <ChevronDownIcon className="w-5 h-5 text-gray-400" />
            </button>
            {open && (
              <div className="absolute z-20 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Hour</div>
                    <div className="max-h-40 overflow-auto border rounded">
                      {hours.map((hh) => (
                        <button key={hh} type="button" onClick={() => setH(hh)} className={`w-full text-left px-3 py-2 text-sm ${h===hh ? 'bg-blue-600 text-white' : 'hover:bg-blue-50'}`}>{hh}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Minute</div>
                    <div className="max-h-40 overflow-auto border rounded">
                      {minutes.map((mm) => (
                        <button key={mm} type="button" onClick={() => setM(mm)} className={`w-full text-left px-3 py-2 text-sm ${m===mm ? 'bg-blue-600 text-white' : 'hover:bg-blue-50'}`}>{mm}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <button type="button" className="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50" onClick={() => setOpen(false)}>Cancel</button>
                  <button type="button" className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700" onClick={() => { handleChange(`${h}:${m}`); setOpen(false) }}>Apply</button>
                </div>
              </div>
            )}
          </div>
        )
      }

      case 'time_range': {
        // Modern combined time range popover
        const raw: string = typeof localValue === 'string' ? localValue : ''
        const [s0, e0] = raw.split('|')
        const [open, setOpen] = useState(false)
        const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
        const minutes = ['00','15','30','45']
        const [sh, setSh] = useState((s0 || '09:00').split(':')[0])
        const [sm, setSm] = useState((s0 || '09:00').split(':')[1])
        const [eh, setEh] = useState((e0 || '17:00').split(':')[0])
        const [em, setEm] = useState((e0 || '17:00').split(':')[1])
        const label = (s0 && e0) ? `${s0} — ${e0}` : (field.placeholder || 'Select time range')
        return (
          <div className="relative">
            <button type="button" disabled={disabled} onClick={() => setOpen(o=>!o)}
              className={`w-full px-4 py-3 border rounded-lg text-left flex items-center justify-between ${open ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-300'} ${disabled ? 'bg-gray-50 text-gray-400' : 'bg-white'}`}>
              <span className={`flex items-center gap-2 ${!(s0&&e0) ? 'text-gray-400' : ''}`}>
                {getFieldIcon('time')}
                {label}
              </span>
              <ChevronDownIcon className="w-5 h-5 text-gray-400" />
            </button>
            {open && (
              <div className="absolute z-20 mt-2 w-[28rem] bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-medium text-gray-700 mb-1">Start</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Hour</div>
                        <div className="max-h-40 overflow-auto border rounded">
                          {hours.map((hh) => (
                            <button key={hh} type="button" onClick={() => setSh(hh)} className={`w-full text-left px-3 py-2 text-sm ${sh===hh ? 'bg-blue-600 text-white' : 'hover:bg-blue-50'}`}>{hh}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Minute</div>
                        <div className="max-h-40 overflow-auto border rounded">
                          {minutes.map((mm) => (
                            <button key={mm} type="button" onClick={() => setSm(mm)} className={`w-full text-left px-3 py-2 text-sm ${sm===mm ? 'bg-blue-600 text-white' : 'hover:bg-blue-50'}`}>{mm}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-700 mb-1">End</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Hour</div>
                        <div className="max-h-40 overflow-auto border rounded">
                          {hours.map((hh) => (
                            <button key={hh} type="button" onClick={() => setEh(hh)} className={`w-full text-left px-3 py-2 text-sm ${eh===hh ? 'bg-blue-600 text-white' : 'hover:bg-blue-50'}`}>{hh}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Minute</div>
                        <div className="max-h-40 overflow-auto border rounded">
                          {minutes.map((mm) => (
                            <button key={mm} type="button" onClick={() => setEm(mm)} className={`w-full text-left px-3 py-2 text-sm ${em===mm ? 'bg-blue-600 text-white' : 'hover:bg-blue-50'}`}>{mm}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <button type="button" className="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50" onClick={() => setOpen(false)}>Cancel</button>
                  <button type="button" className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700" onClick={() => { handleChange(`${sh}:${sm}|${eh}:${em}`); setOpen(false) }}>Apply</button>
                </div>
              </div>
            )}
          </div>
        )
      }
      case 'short_text': {
        const label = 'Short Text'
        const maxLength = field.settings?.maxLength
        const count = typeof localValue === 'string' ? localValue.length : 0
        if (isPreview) {
          return (
            <div className="space-y-1">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><PencilIcon className="w-4 h-4" /></div>
                <div className="h-[44px] w-full rounded-[12px] bg-gray-100 border border-gray-200 pl-9 flex items-center text-gray-400">
                  {field.placeholder || 'Short answer...'}
                </div>
              </div>
            </div>
          )
        }
        return (
          <div className="space-y-1">
            {showLabel && <label className="text-[12px] text-gray-600">{label}</label>}
            <div className="relative">
              <div className={`absolute left-0 top-1/2 -translate-y-1/2 ${isFocused ? 'text-indigo-600' : 'text-gray-400'} transition-colors`}><PencilIcon className="w-4 h-4" /></div>
              <input
                ref={inputRef}
                type="text"
                aria-label={label}
                value={localValue}
                onChange={(e) => handleChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => { setIsFocused(false); onBlur?.() }}
                placeholder={field.placeholder || 'Type your answer...'}
                disabled={disabled}
                className={`w-full bg-transparent pl-6 pr-2 py-2 border-b transition-all duration-200 outline-none ${
                  isFocused ? 'border-indigo-500 shadow-[0_2px_0_0_rgba(99,102,241,0.5)]' : error ? 'border-red-400' : 'border-gray-300'
                }`}
                required={field.required}
              />
              {maxLength ? (
                <div className="mt-1 text-[11px] text-gray-500">{count}/{maxLength}</div>
              ) : null}
              {error && (
                <div className="mt-1 text-[12px] text-red-600">{error}</div>
              )}
            </div>
          </div>
        )
      }
      case 'email': {
        const label = 'Email'
        if (isPreview) {
          return (
            <div className="space-y-1">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><EnvelopeIcon className="w-4 h-4" /></div>
                <div className="h-[44px] w-full rounded-[12px] bg-gray-100 border border-gray-200 pl-9 flex items-center text-gray-400">
                  example@email.com
                </div>
              </div>
            </div>
          )
        }
        const valid = typeof localValue === 'string' && /[^\s@]+@[^\s@]+\.[^\s@]+/.test(localValue)
        return (
          <div className="space-y-1">
            {showLabel && <label className="text-[12px] text-gray-600">{label}</label>}
            <div className="relative">
              <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${isFocused ? 'text-indigo-600' : 'text-gray-400'} transition-colors`}><EnvelopeIcon className="w-5 h-5" /></div>
              <input
                ref={inputRef}
                type="email"
                value={localValue}
                onChange={(e) => handleChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => { setIsFocused(false); onBlur?.() }}
                placeholder={field.placeholder || 'Enter your email address'}
                disabled={disabled}
                aria-invalid={!!error}
                className={`${baseInputClasses} ${neutralBorderClass} pl-10 ${valid ? 'pr-10' : ''}`}
                required={field.required}
              />
              {valid && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600">✓</span>}
              <div className="mt-1 text-[11px] text-gray-500">We’ll never share your email.</div>
              {error && (
                <div className="mt-1 text-[12px] text-red-600">{error}</div>
              )}
            </div>
          </div>
        )
      }

      case 'long_text': {
        const label = 'Long Text'
        const maxLength = field.settings?.maxLength
        const count = typeof localValue === 'string' ? localValue.length : 0
        const textAreaRef = useRef<HTMLTextAreaElement>(null)
        const autoResize = () => {
          const el = textAreaRef.current
          if (!el) return
          el.style.height = 'auto'
          el.style.height = Math.min(el.scrollHeight, 400) + 'px'
        }
        useEffect(() => { autoResize() }, [localValue])
        if (isPreview) {
          return (
            <div className="space-y-1">
              <div className="rounded-[12px] bg-gray-100 border border-gray-200 p-3 text-gray-400 min-h-[88px]">{field.placeholder || 'Type your full response...'}</div>
            </div>
          )
        }
        return (
          <div className="space-y-1">
            {showLabel && <label className="text-[12px] text-gray-600">{label}</label>}
            <div className="relative">
              <textarea
                ref={textAreaRef}
                value={localValue}
                onChange={(e) => { handleChange(e.target.value); autoResize() }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => { setIsFocused(false); onBlur?.() }}
                placeholder={field.placeholder || 'Type your answer here...'}
                rows={Math.max(3, field.settings?.rows || 4)}
                disabled={disabled}
                className={`w-full bg-white dark:bg-[#1E1E1E] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-[12px] px-3 py-2 border transition-all duration-200 ${
                  isFocused ? 'border-indigo-500 ring-4 ring-indigo-500/20' : error ? 'border-red-300' : 'border-gray-300'
                }`}
                aria-label={label}
                required={field.required}
                style={{ overflow: 'hidden', resize: 'none' }}
              />
              <div className="mt-1 flex items-center justify-between text-[11px] text-gray-500">
                <span className="opacity-90">{maxLength ? `${count}/${maxLength}` : `${String(localValue || '').split(/\s+/).filter(Boolean).length} words`}</span>
                {!!localValue && (
                  <button type="button" onClick={() => handleChange('')} className="text-gray-500 hover:text-gray-700">Clear</button>
                )}
              </div>
              {error && (
                <div className="mt-1 text-[12px] text-red-600">{error}</div>
              )}
            </div>
          </div>
        )
      }

      case 'number': {
        const label = 'Number'
        if (isPreview) {
          return (
            <div className="space-y-1">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">#</div>
                <div className="h-[44px] w-full rounded-[12px] bg-gray-100 border border-gray-200 pl-8 flex items-center text-gray-400">
                  12345
                </div>
                <div className="mt-1 text-[11px] text-gray-500">Enter a numeric value</div>
              </div>
            </div>
          )
        }
        return (
          <div className="space-y-1">
            {showLabel && <label className="text-[12px] text-gray-600">{label}</label>}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">#</div>
              <input
                type="number"
                inputMode="numeric"
                aria-label={label}
                value={localValue}
                onChange={(e) => handleChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => { setIsFocused(false); onBlur?.() }}
                placeholder={field.placeholder || 'Enter your number'}
                min={field.settings?.min}
                max={field.settings?.max}
                step={field.settings?.step || 1}
                disabled={disabled}
                className={`w-full h-[50px] rounded-[12px] border pl-8 pr-3 bg-white dark:bg-[#1E1E1E] transition-all duration-200 ${
                  isFocused ? 'border-indigo-500 ring-4 ring-indigo-500/20' : error ? 'border-red-300' : 'border-gray-300'
                } ${error ? 'bg-red-50' : ''}`}
                required={field.required}
              />
              {error && (
                <div className="mt-1 text-[12px] text-red-600">{error}</div>
              )}
            </div>
          </div>
        )
      }

      case 'dropdown': {
        const dropdownType = (field.settings as any)?.dropdownType || 'single'
        const numberingStyle = (field.settings as any)?.numberingStyle || 'none'
        const dropdownStyle = (field.settings as any)?.dropdownStyle || 'default'
        const [open, setOpen] = useState(false)
        const [query, setQuery] = useState('')

        const getNumberPrefix = (idx: number) => {
          if (numberingStyle === 'numeric') return `${idx + 1}. `
          if (numberingStyle === 'alphabetic') {
            const base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
            return `${base[idx % 26]}. `
          }
          return ''
        }

        const filteredOptions = (field.options || []).filter(opt =>
          opt.toLowerCase().includes(query.toLowerCase())
        )

        const renderNumberBox = (idx: number) => (
          <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-semibold rounded border bg-white text-blue-700 border-blue-300">
            {numberingStyle === 'numeric' ? (idx + 1) : String.fromCharCode(65 + (idx % 26))}
          </span>
        )

        const renderStyledItem = (opt: string, idx: number, selected?: boolean) => {
          if (dropdownStyle === 'cards') {
            return (
              <div className={`w-full text-left p-3 text-sm rounded-md border transition-colors flex items-center gap-3 ${selected ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-blue-300/60 bg-blue-50/50 text-blue-800 hover:border-blue-400 hover:bg-blue-50'}`}>
                {numberingStyle === 'none' ? null : renderNumberBox(idx)}
                <span className="font-medium">{opt}</span>
              </div>
            )
          }
          if (dropdownStyle === 'pills') {
            return (
              <div className={`inline-flex items-center px-3 py-1.5 m-1 rounded-full text-sm border flex-nowrap gap-2 ${selected ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-blue-300/60 bg-blue-50/50 text-blue-800 hover:border-blue-400 hover:bg-blue-50'}`}>
                {numberingStyle === 'none' ? null : renderNumberBox(idx)}
                <span className="font-medium">{opt}</span>
              </div>
            )
          }
          // minimal/default list row
          return (
            <div className={`w-full text-left px-3 py-2 text-sm flex items-center gap-3 rounded ${selected ? 'bg-blue-50 text-blue-700' : 'hover:bg-blue-50 text-gray-800'}`}>
              {numberingStyle === 'none' ? null : renderNumberBox(idx)}
              <span className="font-medium">{opt}</span>
            </div>
          )
        }

        // Non-interactive preview: render static styled list like the screenshot
        if (isPreview) {
          return (
            <div className="space-y-2">
              {(field.options || []).map((opt, idx) => (
                <div key={idx} className="rounded-lg border border-blue-300/60 bg-blue-50/60 text-blue-800 px-3 py-2 flex items-center gap-3">
                  {numberingStyle === 'none' ? null : renderNumberBox(idx)}
                  <span className="font-medium">{opt}</span>
                </div>
              ))}
            </div>
          )
        }

        // SINGLE SELECT (standard)
        if (dropdownType === 'single') {
          if (dropdownStyle === 'default') {
        return (
          <div className="relative">
            <select
              value={localValue}
              onChange={(e) => handleChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                setIsFocused(false)
                onBlur?.()
              }}
                  disabled={disabled}
              className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 appearance-none ${
                isFocused 
                  ? 'border-blue-500 ring-2 ring-blue-500/20' 
                  : error 
                    ? 'border-red-300' 
                    : 'border-gray-300'
                  } ${error ? 'bg-red-50' : 'bg-white'}`}
              required={field.required}
            >
              <option value="">{field.placeholder || 'Select an option...'}</option>
              {field.options?.map((option, index) => (
                <option key={index} value={option}>
                      {getNumberPrefix(index)}{option}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <ChevronDownIcon className="w-5 h-5 text-gray-400" />
            </div>
            {error && (
              <div className="absolute -bottom-6 left-0 text-sm text-red-600 flex items-center space-x-1">
                <XMarkIcon className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )
          }
          // custom-styled single select (cards/pills/minimal)
          const displayLabel = field.options?.find(o => o === localValue) || ''
          return (
            <div className="relative">
              <button
                type="button"
                onClick={() => !disabled && setOpen(v => !v)}
                className={`w-full px-4 py-3 border rounded-lg text-left flex items-center justify-between ${
                  open ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-300'
                } ${disabled ? 'bg-gray-50 text-gray-400' : 'bg-white'}`}
              >
                <span className={`truncate ${!displayLabel ? 'text-gray-400' : ''}`}>
                  {displayLabel || field.placeholder || 'Select an option...'}
                </span>
                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
              </button>
              {open && (
                <div className={`absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg ${dropdownStyle === 'minimal' ? 'p-1' : ''}`}>
                  <ul className={`max-h-48 overflow-auto py-1 ${dropdownStyle === 'cards' ? 'grid grid-cols-1 gap-2 p-2' : ''}`}>
                    {(field.options || []).map((opt, idx) => (
                      <li key={idx}>
                        <button
                          type="button"
                          onClick={() => { handleChange(opt); setOpen(false) }}
                          className="w-full text-left"
                        >
                          {renderStyledItem(opt, idx, opt === localValue)}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )
        }

        // SEARCHABLE (single select with search)
        if (dropdownType === 'searchable') {
          const displayLabel = field.options?.find(o => o === localValue) || ''
          return (
            <div className="relative">
              <button
                type="button"
                onClick={() => !isPreview && !disabled && setOpen(v => !v)}
                className={`w-full px-4 py-3 border rounded-lg text-left flex items-center justify-between ${
                  open ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-300'
                } ${disabled || isPreview ? 'bg-gray-50 text-gray-400' : 'bg-white'}`}
              >
                <span className={`truncate ${!displayLabel ? 'text-gray-400' : ''}`}>
                  {displayLabel || field.placeholder || 'Select an option...'}
                </span>
                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
              </button>
              {open && (
                <div className={`absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg ${dropdownStyle === 'minimal' ? 'p-1' : ''}`}>
                  <div className="p-2 border-b border-gray-100">
                    <input
                      autoFocus
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search..."
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <ul className={`max-h-48 overflow-auto py-1 ${dropdownStyle === 'cards' ? 'grid grid-cols-1 gap-2 p-2' : ''}`}>
                    {filteredOptions.map((opt, idx) => (
                      <li key={idx}>
                        <button
                          type="button"
                          onClick={() => {
                            handleChange(opt)
                            setOpen(false)
                            setQuery('')
                          }}
                          className={
                            dropdownStyle === 'cards'
                              ? `w-full text-left p-3 text-sm rounded-md border transition-colors ${
                                  opt === localValue ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                }`
                              : dropdownStyle === 'pills'
                                ? `inline-flex items-center px-3 py-1.5 m-1 rounded-full text-sm border ${
                                    opt === localValue ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                  }`
                                : `w-full text-left px-3 py-2 text-sm hover:bg-blue-50 ${
                                    opt === localValue ? 'bg-blue-50 text-blue-700' : 'text-gray-800'
                                  }`
                          }
                        >
                          <span className="flex items-center gap-3">
                            {numberingStyle === 'none' ? null : renderNumberBox(idx)}
                            <span className="font-medium">{opt}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                    {filteredOptions.length === 0 && (
                      <li className="px-3 py-2 text-sm text-gray-400">No results</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )
        }

        // MULTIPLE / TAGS
        const arrayValue: string[] = Array.isArray(localValue) ? localValue : []
        const toggleItem = (opt: string) => {
          if (arrayValue.includes(opt)) {
            handleChange(arrayValue.filter(v => v !== opt))
          } else {
            handleChange([...arrayValue, opt])
          }
        }
        const showChips = dropdownType === 'tags'
        return (
          <div className="relative">
            <div
              className={`w-full min-h-[44px] px-3 py-2 border rounded-lg flex items-center flex-wrap gap-2 ${
                isFocused ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-300'
              } ${disabled || isPreview ? 'bg-gray-50' : 'bg-white'}`}
              onClick={() => !isPreview && !disabled && setOpen(true)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            >
              {showChips && arrayValue.length > 0 && (
                arrayValue.map((val, i) => (
                  <span key={i} className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                    {val}
                    {!disabled && !isPreview && (
                      <button type="button" className="ml-1 text-blue-700/70 hover:text-blue-900" onClick={(e) => { e.stopPropagation(); toggleItem(val) }}>
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))
              )}
              {!showChips && (
                <span className={`text-sm ${arrayValue.length === 0 ? 'text-gray-400' : 'text-gray-800'}`}>
                  {arrayValue.length === 0 ? (field.placeholder || 'Select...') : `${arrayValue.length} selected`}
                </span>
              )}
            </div>
            {open && (
              <div className={`absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg ${dropdownStyle === 'minimal' ? 'p-1' : ''}`}>
                <div className="p-2 border-b border-gray-100">
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <ul className={`max-h-48 overflow-auto py-1 ${dropdownStyle === 'cards' ? 'grid grid-cols-1 gap-2 p-2' : ''}`}>
                  {filteredOptions.map((opt, idx) => {
                    const selected = arrayValue.includes(opt)
                    return (
                      <li key={idx}>
                        <button
                          type="button"
                          onClick={() => toggleItem(opt)}
                          className={
                            dropdownStyle === 'cards'
                              ? `w-full text-left p-3 text-sm rounded-md border flex items-center justify-between transition-colors ${
                                  selected ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                }`
                              : dropdownStyle === 'pills'
                                ? `inline-flex items-center px-3 py-1.5 m-1 rounded-full text-sm border ${
                                    selected ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                  }`
                                : `w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-blue-50 ${
                                    selected ? 'bg-blue-50 text-blue-700' : 'text-gray-800'
                                  }`
                          }
                        >
                          <span className="flex items-center gap-3">
                            {numberingStyle === 'none' ? null : renderNumberBox(idx)}
                            <span className="font-medium">{opt}</span>
                          </span>
                          {selected && <CheckIcon className="w-4 h-4" />}
                        </button>
                      </li>
                    )
                  })}
                  {filteredOptions.length === 0 && (
                    <li className="px-3 py-2 text-sm text-gray-400">No results</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )
      }

      case 'address': {
        type AddressValue = {
          street1?: string
          street2?: string
          city?: string
          region?: string
          postalCode?: string
          country?: string
          lat?: number
          lng?: number
        }
        const v: AddressValue = (localValue && typeof localValue === 'object') ? localValue : {}
        const set = (key: keyof AddressValue, val: any) => {
          const next = { ...v, [key]: val }
          handleChange(next)
        }
        const req = (k: string, fallback = false) => Boolean((field.settings as any)?.[k] ?? fallback)
        const usePlaces = Boolean((field.settings as any)?.googlePlacesEnabled)
        // minimal Google Places integration via browser script if present
        const inputRef = useRef<HTMLInputElement>(null)
        useEffect(() => {
          if (!usePlaces || !inputRef.current) return
          const initAutocomplete = () => {
            if (!(window as any).google?.maps?.places) return
            const autocomplete = new (window as any).google.maps.places.Autocomplete(inputRef.current as HTMLInputElement, { types: ['geocode'] })
            autocomplete.addListener('place_changed', () => {
              const place = autocomplete.getPlace()
              if (!place) return
              const comps = (place.address_components || []) as Array<{ long_name: string; short_name: string; types: string[] }>
              const get = (type: string) => comps.find(c => c.types.includes(type))?.long_name || ''
              const streetNumber = get('street_number')
              const route = get('route')
              const city = get('locality') || get('sublocality') || get('postal_town')
              const region = get('administrative_area_level_1')
              const postal = get('postal_code')
              const country = get('country')
              const street1 = [streetNumber, route].filter(Boolean).join(' ')
              const loc = place.geometry?.location
              const lat = loc?.lat ? loc.lat() : undefined
              const lng = loc?.lng ? loc.lng() : undefined
              handleChange({ ...v, street1, city, region, postalCode: postal, country, lat, lng })
            })
          }
          // If API already loaded, init; else add script
          if ((window as any).google?.maps?.places) {
            initAutocomplete()
            return
          }
          const existing = document.getElementById('google-places-script') as HTMLScriptElement | null
          if (existing) {
            existing.addEventListener('load', initAutocomplete, { once: true })
            return
          }
          const key = ((process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as unknown) as string) || (window as any).GOOGLE_MAPS_API_KEY || 'AIzaSyD-PLACEHOLDER'
          const script = document.createElement('script')
          script.id = 'google-places-script'
          script.async = true
          script.defer = true
          script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places`
          script.onload = initAutocomplete
          document.body.appendChild(script)
        }, [usePlaces])
        const inputCls = 'w-full px-3 py-2 border rounded-md text-sm'
        const [COUNTRIES, setCOUNTRIES] = useState<{ name: string; code?: string }[]>([])
        useEffect(() => {
          loadAllCountriesWithCodes().then(list => setCOUNTRIES([...list, { name: 'Other' }]))
        }, [])
        const regionMeta = getCountryRegionMeta(v.country)
        return (
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-700 mb-1">Address</label>
              <input ref={usePlaces ? inputRef : undefined} value={v.street1 || ''} onChange={(e) => set('street1', e.target.value)} className={inputCls} placeholder="65 Hansen Way" required={req('addressRequireStreet1', true)} />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1">Address line 2</label>
              <input value={v.street2 || ''} onChange={(e) => set('street2', e.target.value)} className={inputCls} placeholder="Apartment 4" required={req('addressRequireStreet2')} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-700 mb-1">City/Town</label>
                <input value={v.city || ''} onChange={(e) => set('city', e.target.value)} className={inputCls} placeholder="Palo Alto" required={req('addressRequireCity', true)} />
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">{regionMeta?.label || 'State/Region/Province'}</label>
                {regionMeta?.options?.length ? (
                  <select value={v.region || ''} onChange={(e) => set('region', e.target.value)} className={inputCls} required={req('addressRequireRegion', true)}>
                    <option value="">Select {regionMeta.label.toLowerCase()}</option>
                    {regionMeta.options.map(opt => (
                      <option key={opt.code} value={opt.name}>{opt.name}</option>
                    ))}
                  </select>
                ) : (
                  <RegionAuto country={v.country} value={v.region || ''} onChange={(val)=>set('region', val)} inputCls={inputCls} required={req('addressRequireRegion', true)} />
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-700 mb-1">Zip/Post code</label>
                <input value={v.postalCode || ''} onChange={(e) => set('postalCode', e.target.value)} className={inputCls} placeholder="94025" required={req('addressRequirePostalCode', true)} />
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">Country</label>
                <select value={v.country || ''} onChange={(e) => set('country', e.target.value)} className={inputCls} required={req('addressRequireCountry', true)}>
                  <option value="">Select country</option>
                  {COUNTRIES.map(c => (
                    <option key={c.code || c.name} value={c.name}>{countryCodeToFlag(c.code)} {c.name}</option>
                  ))}
                </select>
                {v.country === 'Other' && (
                  <input className={`${inputCls} mt-2`} placeholder="Enter country" onChange={(e) => set('country', e.target.value)} />
                )}
              </div>
            </div>
          </div>
        )
      }

      case 'radio':
        if (isPreview) {
          return (
            <div className="space-y-2">
              {field.options?.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2 text-gray-700">
                  <span className="inline-block w-3 h-3 rounded-full border border-gray-400" />
                  <span className="text-sm">{opt}</span>
                </div>
              ))}
            </div>
          )
        }
        return (
          <div className="space-y-3">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer group">
                 <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={localValue === option}
                  onChange={(e) => handleChange(e.target.value)}
                   disabled={disabled}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  required={field.required}
                />
                <span className="text-gray-900 group-hover:text-blue-600 transition-colors">
                  {option}
                </span>
              </label>
            ))}
            {error && (
              <div className="text-sm text-red-600 flex items-center space-x-1">
                <XMarkIcon className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )

      case 'checkbox': {
        const shape = (field.settings as any)?.checkboxShape || 'square'
        const selectionStyle = (field.settings as any)?.selectionStyle || 'checkmark'

        const roundedClass = 'rounded-lg'
        const shapeClass = shape === 'circle' ? 'rounded-full' : shape === 'rounded' ? roundedClass : shape === 'triangle' ? 'rounded-none' : 'rounded-sm'
        const borderClr = (field.settings as any)?.borderColor || '#2563eb'
        const checkedClr = (field.settings as any)?.checkedColor || '#2563eb'

        const renderTriangle = (selected: boolean, clsExtra = '') => (
          <svg className={clsExtra} width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <polygon points="10,3 3,17 17,17" fill={selected && selectionStyle === 'fill' ? checkedClr : 'white'} stroke={selected ? checkedClr : borderClr} strokeWidth="2" />
            {selected && selectionStyle === 'checkmark' && (
              <path d="M6 11 l3 3 l5 -6" fill="none" stroke={checkedClr} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            )}
            {selected && selectionStyle === 'cross' && (
              <g stroke={checkedClr} strokeWidth="2" strokeLinecap="round">
                <line x1="7" y1="8" x2="13" y2="14" />
                <line x1="13" y1="8" x2="7" y2="14" />
              </g>
            )}
          </svg>
        )

        if (isPreview) {
          return (
            <div className="space-y-2">
              {field.options?.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2 text-gray-700">
                  {shape === 'triangle'
                    ? renderTriangle(false)
                    : <span className={`inline-block w-4 h-4 border border-gray-300 bg-white shadow-sm ${shapeClass}`} />}
                  <span className="text-sm">{opt}</span>
                </div>
              ))}
            </div>
          )
        }

        const isSelected = (opt: string) => Array.isArray(localValue) && localValue.includes(opt)
        const toggle = (opt: string) => {
          const current = Array.isArray(localValue) ? localValue : []
          handleChange(isSelected(opt) ? current.filter(v => v !== opt) : [...current, opt])
        }

        return (
          <div className="space-y-3">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer group">
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); toggle(option) }}
                  className={`relative inline-flex items-center justify-center w-5 h-5 mr-1 transition-all duration-200 bg-white ${
                    isSelected(option) ? 'ring-2 ring-blue-200' : 'hover:ring-1 hover:ring-blue-100'
                  }`}
                >
                  {shape === 'triangle'
                    ? renderTriangle(isSelected(option))
                    : (
                      <span className={`absolute inset-0 border ${shapeClass}`} style={{ borderColor: isSelected(option) ? checkedClr : borderClr }} />
                    )}
                  {!isSelected(option) ? null : (
                    selectionStyle === 'fill' && shape !== 'triangle' ? (
                      <span className={`absolute inset-0 ${shapeClass}`} style={{ background: `linear-gradient(135deg, ${checkedClr} 0%, ${checkedClr} 100%)` }} />
                    ) : selectionStyle === 'cross' && shape !== 'triangle' ? (
                      <span className="text-xs font-bold leading-none" style={{ color: checkedClr }}>×</span>
                    ) : shape !== 'triangle' ? (
                      <CheckIcon className="w-4 h-4" style={{ color: checkedClr }} />
                    ) : null
                  )}
                </button>
                <span className="text-gray-900 group-hover:text-blue-600 transition-colors">
                  {option}
                </span>
              </label>
            ))}
            {error && (
              <div className="text-sm text-red-600 flex items-center space-x-1">
                <XMarkIcon className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )
      }

      case 'multiple_choice': {
        const allowMultiple = !!field.settings?.allowMultiple
        const showOther = !!field.settings?.showOther
        const numberingStyle = ((field.settings as any)?.numberingStyle || 'alphabetic') as 'none' | 'numeric' | 'alphabetic'
        const getBadge = (idx: number) => {
          const content = numberingStyle === 'numeric' ? String(idx + 1) : String.fromCharCode(65 + (idx % 26))
          return (
            <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-semibold rounded border bg-white text-blue-700 border-blue-300">
              {content}
            </span>
          )
        }
        // Preview mode — non-interactive cards with badges
        if (isPreview) {
          const items = [...(field.options || [])]
          if (showOther) items.push('Other')
          return (
            <div className="space-y-2">
              {items.map((opt, idx) => (
                <div key={idx} className="rounded-lg border border-blue-300/60 bg-blue-50/60 text-blue-800 px-3 py-2 flex items-center gap-3">
                  {numberingStyle === 'none' ? null : getBadge(idx)}
                  <span className="font-medium">{opt}</span>
                </div>
              ))}
            </div>
          )
        }
        // Live mode — radios or checkboxes depending on allowMultiple
        if (allowMultiple) {
          const valueArray: string[] = Array.isArray(localValue) ? localValue : []
          const toggle = (opt: string) => {
            if (valueArray.includes(opt)) handleChange(valueArray.filter(v => v !== opt))
            else handleChange([...valueArray, opt])
          }
          return (
            <div className="space-y-2">
              {(field.options || []).map((opt, idx) => {
                const selected = valueArray.includes(opt)
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggle(opt)}
                    disabled={disabled}
                    className={`w-full text-left rounded-lg px-3 py-2 border flex items-center gap-3 transition-colors ${selected ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'}`}
                  >
                    {numberingStyle === 'none' ? null : getBadge(idx)}
                    <span className="font-medium">{opt}</span>
                  </button>
                )
              })}
              {showOther && (
                <button
                  type="button"
                  disabled
                  className="w-full text-left rounded-lg px-3 py-2 border flex items-center gap-3 border-gray-300 bg-blue-50/60 text-blue-800"
                >
                  {numberingStyle === 'none' ? null : getBadge((field.options || []).length)}
                  <span className="font-medium">Other</span>
                </button>
              )}
            </div>
          )
        }
        // Single-select behavior (radio-like)
        return (
          <div className="space-y-2">
            {(field.options || []).map((opt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleChange(opt)}
                disabled={disabled}
                className={`w-full text-left rounded-lg px-3 py-2 border flex items-center gap-3 transition-colors ${localValue === opt ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'}`}
              >
                {numberingStyle === 'none' ? null : getBadge(idx)}
                <span className="font-medium">{opt}</span>
              </button>
            ))}
            {showOther && (
              <button
                type="button"
                disabled
                className="w-full text-left rounded-lg px-3 py-2 border flex items-center gap-3 border-gray-300 bg-blue-50/60 text-blue-800"
              >
                {numberingStyle === 'none' ? null : getBadge((field.options || []).length)}
                <span className="font-medium">Other</span>
              </button>
            )}
          </div>
        )
      }

      case 'star_rating':
        {
          const max = (field.settings as any)?.maxRating || 5
          const type = (field.settings as any)?.ratingType || 'stars'
          const ActiveIcon = type === 'hearts' ? HeartIcon : type === 'thumbs' ? HandThumbUpIcon : StarIcon
          const InactiveIcon = ActiveIcon
          if (isPreview) {
            return (
              <div className="flex items-center gap-1 text-yellow-400">
                {Array.from({ length: max }).map((_, i) => (
                  <ActiveIcon key={i} className="w-6 h-6" />
                ))}
              </div>
            )
          }
        return (
          <div className="space-y-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: max }).map((_, i) => {
                  const idx = i + 1
                  const active = idx <= (localValue || 0)
                  return (
                 <button
                      key={i}
                  type="button"
                      onClick={() => handleChange(idx)}
                      disabled={disabled}
                      className={`p-1 transition-all duration-200 ${active ? 'scale-110' : ''} ${active ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`}
                    >
                      {active ? <ActiveIcon className="w-8 h-8" /> : <InactiveIcon className="w-8 h-8" />}
                </button>
                  )
                })}
            </div>
            {localValue && (
                <p className="text-sm text-gray-600">You rated this {localValue} / {max}</p>
            )}
            {error && (
              <div className="text-sm text-red-600 flex items-center space-x-1">
                <XMarkIcon className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )
        }

      case 'nps':
      case 'nps_score': {
        const style = (field.settings as any)?.npsStyle || 'buttons'
        const accent = (field.settings as any)?.checkedColor || '#2563eb'
        const cardView = !!(field.settings as any)?.npsCardView
        const scores = [0,1,2,3,4,5,6,7,8,9,10]
        const gapCls = cardView ? 'gap-2' : 'gap-1.5'
        const renderItem = (score: number, selected: boolean) => {
          if (style === 'chips') {
        return (
              <button type="button" onClick={() => handleChange(score)} disabled={disabled}
                className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-sm rounded-full border ${selected ? 'text-white' : 'text-gray-700'}`}
                style={{ background: selected ? accent : 'white', borderColor: selected ? accent : '#E5E7EB' }}>{score}</button>
            )
          }
          if (style === 'cards') {
            return (
              <button type="button" onClick={() => handleChange(score)} disabled={disabled}
                className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center ${cardView ? 'text-base rounded-lg' : 'text-sm rounded-md'} border ${selected ? 'text-white' : 'text-gray-700'}`}
                style={{ background: selected ? accent : '#F3F4F6', borderColor: selected ? accent : '#E5E7EB' }}>{score}</button>
            )
          }
          if (style === 'scale') {
            return (
              <button type="button" onClick={() => handleChange(score)} disabled={disabled}
                className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center ${cardView ? 'text-base rounded-md' : 'text-sm rounded'} ${selected ? 'text-white' : 'text-gray-700'}`}
                style={{ background: selected ? accent : '#E5E7EB' }}>{score}</button>
            )
          }
          if (style === 'typeform') {
            return (
              <button type="button" onClick={() => handleChange(score)} disabled={disabled}
                className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center ${cardView ? 'text-base rounded-lg' : 'text-sm rounded-md'} font-medium transition-colors ${selected ? 'text-white' : 'text-gray-700'}`}
                style={{ background: selected ? accent : 'white', border: `1px solid ${selected ? accent : '#E5E7EB'}` }}>
                  {score}
                </button>
            )
          }
          // buttons default
          return (
            <button type="button" onClick={() => handleChange(score)} disabled={disabled}
              className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center ${cardView ? 'text-base rounded-md' : 'text-sm rounded'} border ${selected ? 'text-white' : 'text-gray-700'}`}
              style={{ background: selected ? accent : 'white', borderColor: selected ? accent : '#E5E7EB' }}>{score}</button>
          )
        }
        // Precompute preview tile classes to avoid nested template strings
        const previewTypeformTileCls = `${cardView ? 'text-base md:text-lg py-3 rounded-lg' : 'text-sm py-2 rounded-md'} text-center border`
        const previewScaleTileCls = `${cardView ? 'text-base py-3 rounded-md' : 'text-[11px] sm:text-xs py-1.5 sm:py-2 rounded'} text-center`
        const previewDefaultTileCls = `${cardView ? 'text-base py-3 rounded-md' : 'text-[11px] sm:text-xs py-1.5 sm:py-2 rounded'} text-center border`
        if (isPreview) {
          return (
            <div className="space-y-2">
              <div className="inline-block">
                <div className={`grid grid-cols-11 ${gapCls} place-items-center`}>
                  {scores.map(score => {
                    if (style === 'typeform') {
                      return (
                        <div
                  key={score}
                          className={previewTypeformTileCls}
                          style={{ borderColor: accent, color: accent }}
                >
                  {score}
                        </div>
                      )
                    }
                    if (style === 'scale') {
                      return (
                        <div key={score} className={`${previewScaleTileCls} bg-gray-200`}>{score}</div>
                      )
                    }
                    return (
                      <div key={score} className={`${previewDefaultTileCls} bg-gray-100`}>{score}</div>
                    )
                  })}
                </div>
                <div className="grid grid-cols-11 mt-2 px-0.5">
                  <span className={`col-start-1 justify-self-start text-[11px] sm:text-xs`} style={{ color: style==='typeform' ? accent : undefined }}>{style==='typeform' ? 'Not at all likely' : 'Not likely at all'}</span>
                  <span className={`col-start-11 justify-self-end text-[11px] sm:text-xs`} style={{ color: style==='typeform' ? accent : undefined }}>Extremely likely</span>
                </div>
              </div>
            </div>
          )
        }
        return (
          <div className="space-y-2">
            <div className="inline-block w-full">
              <div className={`grid grid-cols-11 ${gapCls} place-items-center`}>
                {scores.map(score => (
                  <div key={score}>
                    {renderItem(score, localValue === score)}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-11 mt-2 px-0.5">
                <span className={`col-start-1 justify-self-start text-[11px] sm:text-xs`} style={{ color: style==='typeform' ? accent : undefined }}>{style==='typeform' ? 'Not at all likely' : 'Not likely at all'}</span>
                <span className={`col-start-11 justify-self-end text-[11px] sm:text-xs`} style={{ color: style==='typeform' ? accent : undefined }}>Extremely likely</span>
              </div>
            </div>
            {localValue !== undefined && localValue !== '' && (
              <div className="text-center">
                <p className="text-xs text-gray-600">{localValue <= 6 ? 'Detractor' : localValue <= 8 ? 'Passive' : 'Promoter'}</p>
              </div>
            )}
            {error && (
              <div className="text-sm text-red-600 flex items-center space-x-1">
                <XMarkIcon className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )
      }

      case 'yes_no':
        { // styles: buttons, cards, chips, toggle, thumbs
          const style = (field.settings as any)?.yesNoStyle || 'buttons'
          const accent = (field.settings as any)?.checkedColor || '#2563eb'

          if (isPreview) {
            if (style === 'toggle') {
        return (
                <div className="inline-flex items-center gap-2 text-gray-500">
                  <span>No</span>
                  <span className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                  </span>
                  <span>Yes</span>
                </div>
              )
            }
            if (style === 'chips') {
              return (
                <div className="flex gap-2">
                  <span className="px-3 py-1.5 text-sm border rounded-full bg-gray-100 text-gray-600">Yes</span>
                  <span className="px-3 py-1.5 text-sm border rounded-full bg-gray-100 text-gray-600">No</span>
                </div>
              )
            }
            if (style === 'thumbs') {
              return (
                <div className="flex gap-3 text-gray-500">
                  <HandThumbUpIcon className="w-6 h-6" />
                  <HandThumbDownIcon className="w-6 h-6" />
                </div>
              )
            }
            if (style === 'cards') {
              return (
                <div className="flex gap-3">
                  <div className="flex-1 px-4 py-3 rounded-lg border bg-gray-50 text-gray-600">Yes</div>
                  <div className="flex-1 px-4 py-3 rounded-lg border bg-gray-50 text-gray-600">No</div>
                </div>
              )
            }
            return (
              <div className="flex gap-3">
                <div className="flex-1 px-4 py-3 rounded-lg border bg-gray-50 text-gray-600 text-center">Yes</div>
                <div className="flex-1 px-4 py-3 rounded-lg border bg-gray-50 text-gray-600 text-center">No</div>
              </div>
            )
          }

          const btnCls = (active: boolean, positive: boolean) => `flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
            active ? '' : 'hover:opacity-90'
          }` + (active
            ? ` border-[${accent}]`
            : ' border-gray-300')

          if (style === 'toggle') {
            const on = localValue === 'yes'
            return (
              <button
                type="button"
                onClick={() => handleChange(on ? 'no' : 'yes')}
                disabled={disabled}
                className="relative inline-flex h-8 w-16 items-center rounded-full"
                style={{ background: on ? accent : '#E5E7EB' }}
              >
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200 ${on ? 'translate-x-8' : 'translate-x-1'}`} />
              </button>
            )
          }

          if (style === 'chips') {
            return (
              <div className="flex gap-2">
                {['yes','no'].map(v => (
                  <button key={v} type="button" onClick={() => handleChange(v)} disabled={disabled}
                    className={`px-3 py-1.5 text-sm border rounded-full ${localValue === v ? 'text-white' : 'text-gray-600'}`}
                    style={{ background: localValue === v ? accent : 'white', borderColor: localValue === v ? accent : '#D1D5DB' }}
                  >{v === 'yes' ? 'Yes' : 'No'}</button>
                ))}
                 </div>
            )
          }

          if (style === 'thumbs') {
            return (
              <div className="flex gap-3">
                <button type="button" onClick={() => handleChange('yes')} disabled={disabled}
                  className={`p-2 rounded-lg border ${localValue === 'yes' ? 'text-white' : 'text-gray-600'}`}
                  style={{ background: localValue === 'yes' ? accent : 'white', borderColor: localValue === 'yes' ? accent : '#D1D5DB' }}
                >
                  <HandThumbUpIcon className="w-5 h-5" />
              </button>
                <button type="button" onClick={() => handleChange('no')} disabled={disabled}
                  className={`p-2 rounded-lg border ${localValue === 'no' ? 'text-white' : 'text-gray-600'}`}
                  style={{ background: localValue === 'no' ? accent : 'white', borderColor: localValue === 'no' ? accent : '#D1D5DB' }}
                >
                  <HandThumbDownIcon className="w-5 h-5" />
                </button>
              </div>
            )
          }

          if (style === 'cards') {
            return (
              <div className="flex gap-3">
                {['yes','no'].map(v => (
                  <button key={v} type="button" onClick={() => handleChange(v)} disabled={disabled}
                    className="flex-1 px-4 py-3 rounded-lg border text-center"
                    style={{ background: localValue === v ? `${accent}1A` : '#F9FAFB', color: localValue === v ? accent : '#374151', borderColor: localValue === v ? accent : '#E5E7EB' }}
                  >{v === 'yes' ? 'Yes' : 'No'}</button>
                ))}
              </div>
            )
          }

          // default buttons
          return (
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => handleChange('yes')}
                disabled={disabled}
                className="flex-1 py-3 px-4 rounded-lg border-2"
                style={{ background: localValue === 'yes' ? `${accent}1A` : 'white', color: localValue === 'yes' ? accent : '#374151', borderColor: localValue === 'yes' ? accent : '#E5E7EB' }}
              >Yes</button>
              <button
                type="button"
                onClick={() => handleChange('no')}
                disabled={disabled}
                className="flex-1 py-3 px-4 rounded-lg border-2"
                style={{ background: localValue === 'no' ? `${accent}1A` : 'white', color: localValue === 'no' ? accent : '#374151', borderColor: localValue === 'no' ? accent : '#E5E7EB' }}
              >No</button>
            </div>
          )
        }

      case 'matrix_grid': {
        const rows = ((field.settings as any)?.matrixRows || ['Row 1','Row 2','Row 3','Row 4']) as string[]
        const cols = ((field.settings as any)?.matrixColumns || ['Col 1']) as string[]
        const selection = ((field.settings as any)?.matrixSelection || 'single') as 'single' | 'multiple'
        const shape = ((field.settings as any)?.matrixBoxShape || 'square') as 'square' | 'rounded' | 'circle'
        const shapeCls = shape === 'circle' ? 'rounded-full' : 'rounded-sm'
        const inBuilderCard = isPreview // question card uses isPreview=true in canvas
        const headerScrollRef = useRef<HTMLDivElement>(null)
        const rowsScrollRef = useRef<HTMLDivElement>(null)
        const colWidth = 72
        const rowHeight = 36

        return (
          <div className="w-full">
            <div className="flex items-center justify-between mb-2 text-sm">
              <span />
              {inBuilderCard && (
                <button
                  type="button"
                  className="text-blue-700 underline"
                  onClick={() => {
                    const next = [...cols, `Col ${cols.length + 1}`]
                    updateField(field.id, { settings: { ...field.settings, matrixColumns: next } as any })
                    selectField({ ...field })
                  }}
                >
                  Add column
                </button>
              )}
                 </div>
            {/* header with editable column titles in builder card */}
            <div className="relative">
              {cols.length > 4 && (
                <div className="absolute -top-7 right-0 flex gap-1">
                  <button type="button" className="h-6 w-6 rounded-full border border-blue-300 bg-white text-blue-700 text-xs flex items-center justify-center shadow-sm" title="Scroll left" onClick={() => headerScrollRef.current?.scrollBy({ left: -colWidth * 2, behavior: 'smooth' })}>◄</button>
                  <button type="button" className="h-6 w-6 rounded-full border border-blue-300 bg-white text-blue-700 text-xs flex items-center justify-center shadow-sm" title="Scroll right" onClick={() => headerScrollRef.current?.scrollBy({ left: colWidth * 2, behavior: 'smooth' })}>►</button>
                </div>
              )}
              <div className="flex items-center text-blue-700 italic text-xs mb-1 overflow-x-auto" ref={headerScrollRef} style={{ scrollbarWidth: 'thin' }}>
                <div className="flex-1" />
                {cols.map((c, i) => (
                  <div key={i} className="text-center shrink-0" style={{ width: colWidth }}>
                    {inBuilderCard ? (
                      <div className="group inline-block w-full" onClick={() => setActiveMatrixCol(i)}>
                        <input value={c} onChange={(e) => { const next = [...cols]; next[i] = e.target.value; updateField(field.id, { settings: { ...field.settings, matrixColumns: next } as any }) }} className="w-full text-center bg-transparent italic text-blue-700 focus:outline-none border-b border-transparent focus:border-blue-400 text-xs" />
                        {activeMatrixCol === i && (
                          <button type="button" title="Remove column" onClick={(e) => { e.stopPropagation(); const next = cols.filter((_, idx) => idx !== i); updateField(field.id, { settings: { ...field.settings, matrixColumns: next } as any }); setActiveMatrixCol(null) }} className="absolute -top-2 -right-2 h-6 w-6 rounded-full border border-blue-300 bg-white text-blue-700 flex items-center justify-center shadow-sm hover:bg-blue-50">×</button>
                        )}
                      </div>
                    ) : c}
                  </div>
                ))}
              </div>
            </div>
            {/* rows */}
            <div className="space-y-1 max-h-56 overflow-y-auto pr-1" ref={rowsScrollRef} style={{ scrollbarWidth: 'thin' }}>
              {rows.map((r, ri) => (
                <div key={ri} className="flex items-center bg-blue-50/60 border border-blue-200 rounded px-3">
                  <div className="flex-1 py-2 text-blue-800 italic relative text-xs" onClick={() => setActiveMatrixRow(ri)}>
                    {inBuilderCard ? (
                      <input value={r} onChange={(e) => { const next = [...rows]; next[ri] = e.target.value; updateField(field.id, { settings: { ...field.settings, matrixRows: next } as any }) }} className="w-full bg-transparent italic text-blue-800 focus:outline-none border-b border-transparent focus:border-blue-400 text-xs" />
                    ) : r}
                    {inBuilderCard && activeMatrixRow === ri && (
                      <button type="button" title="Remove row" onClick={(e) => { e.stopPropagation(); const next = rows.filter((_, idx) => idx !== ri); updateField(field.id, { settings: { ...field.settings, matrixRows: next } as any }); setActiveMatrixRow(null) }} className="absolute top-1/2 -translate-y-1/2 -left-3 h-6 w-6 rounded-full border border-blue-300 bg-white text-blue-700 flex items-center justify-center shadow-sm hover:bg-blue-50">×</button>
                    )}
                  </div>
                  {cols.map((_, ci) => (
                    <button
                      key={ci}
                      type="button"
                      className="flex items-center justify-center border-l border-blue-200 py-1 hover:bg-blue-100/60 shrink-0"
                      style={{ width: colWidth - 12 }}
                      onClick={() => {
                        if (disabled) return
                        // store selection in local value as map: { [rowIndex]: columnIndex[] }
                        const current = (localValue && typeof localValue === 'object') ? localValue : {}
                        const rowSel: number[] = Array.isArray(current[ri]) ? current[ri] : []
                        let nextRow: number[]
                        if (selection === 'single') {
                          nextRow = [ci]
                        } else {
                          nextRow = rowSel.includes(ci) ? rowSel.filter(x => x !== ci) : [...rowSel, ci]
                        }
                        const next = { ...current, [ri]: nextRow }
                        handleChange(next)
                      }}
                    >
                      {(() => {
                        const current = (localValue && typeof localValue === 'object') ? localValue : {}
                        const selected = Array.isArray(current[ri]) && (current[ri] as number[]).includes(ci)
                        if (selection === 'single') {
                          return (
                            <span
                              className={`inline-block w-2.5 h-2.5 border rounded-full ${selected ? 'bg-blue-500' : ''}`}
                              style={{ borderColor: '#93C5FD' }}
                            />
                          )
                        }
                        return (
                          <span
                            className={`inline-block w-2.5 h-2.5 border ${shapeCls} ${selected ? 'bg-blue-500' : ''}`}
                            style={{ borderColor: '#93C5FD' }}
                          />
                        )
                      })()}
              </button>
                  ))}
            </div>
              ))}
            </div>
            {inBuilderCard && rows.length > 6 && (
              <div className="flex gap-1 mt-1">
                <button type="button" className="h-6 w-6 rounded-full border border-blue-300 bg-white text-blue-700 text-xs flex items-center justify-center shadow-sm" title="Scroll up" onClick={() => rowsScrollRef.current?.scrollBy({ top: -rowHeight * 3, behavior: 'smooth' })}>▲</button>
                <button type="button" className="h-6 w-6 rounded-full border border-blue-300 bg-white text-blue-700 text-xs flex items-center justify-center shadow-sm" title="Scroll down" onClick={() => rowsScrollRef.current?.scrollBy({ top: rowHeight * 3, behavior: 'smooth' })}>▼</button>
              </div>
            )}
            {inBuilderCard && (
              <button
                type="button"
                className="mt-3 text-blue-700 underline text-sm"
                onClick={() => {
                  const next = [...rows, `Row ${rows.length + 1}`]
                  updateField(field.id, { settings: { ...field.settings, matrixRows: next } as any })
                  selectField({ ...field })
                }}
              >
                Add row
              </button>
            )}
          </div>
        )
      }

      case 'linear_scale': {
        const min = (field.settings as any)?.minRating ?? 1
        const max = (field.settings as any)?.maxRating ?? 5
        const left = (field.settings as any)?.leftLabel || 'Low'
        const right = (field.settings as any)?.rightLabel || 'High'
        const values = Array.from({ length: max - min + 1 }, (_, i) => i + min)
        if (isPreview) {
        return (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{left}</span>
                <span>{right}</span>
              </div>
              <div className="flex gap-1.5">
                {values.map(v => (
                  <span key={v} className="flex-1 text-center py-2 rounded bg-gray-100 border text-xs">{v}</span>
                ))}
            </div>
          </div>
        )
        }
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>{left}</span>
              <span>{right}</span>
            </div>
            <div className="flex gap-1.5">
              {values.map(v => (
                <button key={v} type="button" onClick={() => handleChange(v)} disabled={disabled}
                  className={`flex-1 text-center py-2 rounded border text-xs ${localValue===v ? 'bg-blue-600 text-white' : 'bg-white hover:bg-blue-50'}`}>{v}</button>
              ))}
            </div>
          </div>
        )
      }

      case 'likert_scale': {
        const rows = ((field.settings as any)?.likertRows || ['Statement 1','Statement 2']) as string[]
        const cols = ((field.settings as any)?.likertCols || ['Strongly Disagree','Disagree','Neutral','Agree','Strongly Agree']) as string[]
        const selType = ((field.settings as any)?.likertSelection || 'single') as 'single' | 'multiple'
        // value stored as { [rowIndex]: number[] } of selected column indices
        const current = (localValue && typeof localValue === 'object') ? localValue : {}
        const toggle = (ri: number, ci: number) => {
          const rowSel: number[] = Array.isArray(current[ri]) ? current[ri] : []
          const nextRow = selType==='single' ? [ci] : (rowSel.includes(ci) ? rowSel.filter(x=>x!==ci) : [...rowSel, ci])
          handleChange({ ...current, [ri]: nextRow })
        }
        const isSel = (ri: number, ci: number) => Array.isArray(current[ri]) && (current[ri] as number[]).includes(ci)
        return (
          <div className="space-y-2">
            <div className="overflow-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr>
                    <th className="text-left pr-3"></th>
                    {cols.map((c,i)=>(<th key={i} className="px-2 py-1 text-gray-600 font-medium text-center">{c}</th>))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r,ri)=> (
                    <tr key={ri} className="border-t">
                      <td className="py-2 pr-3 text-gray-800">{r}</td>
                      {cols.map((_,ci)=> (
                        <td key={ci} className="px-2 py-1 text-center">
                          {isPreview ? (
                            <span className={`inline-block w-3 h-3 rounded-full border ${isSel(ri,ci)?'bg-blue-500 border-blue-500':'border-gray-300'}`} />
                          ) : (
                            <button type="button" onClick={() => toggle(ri,ci)} disabled={disabled}
                              className={`inline-block w-4 h-4 rounded-full border ${isSel(ri,ci)?'bg-blue-600 border-blue-600':'border-gray-300 hover:border-blue-300'}`} />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      }

      case 'ranking': {
        // Simple dragless rank with up/down toggles for builder simplicity
        const items = (field.options || ['Item 1','Item 2','Item 3']) as string[]
        const arr: string[] = Array.isArray(localValue) ? localValue : items
        const move = (from: number, to: number) => {
          if (to < 0 || to >= arr.length) return
          const next = [...arr]
          const [it] = next.splice(from,1)
          next.splice(to,0,it)
          handleChange(next)
        }
        return (
          <div className="space-y-2">
            {(arr.length ? arr : items).map((it, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded border bg-white">
                <span className="text-sm text-gray-800">{it}</span>
                {!isPreview && (
                  <div className="flex items-center gap-1">
                    <button type="button" className="px-2 py-1 text-xs rounded border hover:bg-gray-50" disabled={disabled} onClick={() => move(i, i-1)}>Up</button>
                    <button type="button" className="px-2 py-1 text-xs rounded border hover:bg-gray-50" disabled={disabled} onClick={() => move(i, i+1)}>Down</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      }

      case 'captcha': {
        const cfg = (field.settings as any) || {}
        const type = (cfg.captchaType || 'text') as string
        const caseSensitive = !!cfg.captchaCaseSensitive
        const difficulty = (cfg.captchaDifficulty || 'easy') as 'easy'|'medium'|'hard'
        const [challenge, setChallenge] = useState<string>('')
        const [mathOps, setMathOps] = useState<{ a: number; b: number; op: '+'|'-'|'×' } | null>(null)
        const [slider, setSlider] = useState<number>(0)
        const [checked, setChecked] = useState<boolean>(false)
        const [inputVal, setInputVal] = useState<string>('')

        const regen = () => {
          if (type === 'math') {
            const max = difficulty === 'hard' ? 50 : difficulty === 'medium' ? 20 : 10
            const a = Math.floor(Math.random() * max) + 1
            const b = Math.floor(Math.random() * max) + 1
            const ops: Array<'+'|'-'|'×'> = ['+','-','×']
            const op = ops[Math.floor(Math.random() * (difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3))]
            setMathOps({ a, b, op })
            setInputVal('')
          } else if (type === 'text') {
            const len = difficulty === 'hard' ? 6 : difficulty === 'medium' ? 5 : 4
            const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
            let s = ''
            for (let i = 0; i < len; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)]
            setChallenge(s)
            setInputVal('')
          } else if (type === 'slider') {
            setSlider(0)
          } else if (type === 'checkbox') {
            setChecked(false)
          } else if (type === 'recaptcha') {
            setChecked(false)
          } else {
            // default to simple text
            const len = 5
            const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
            let s = ''
            for (let i = 0; i < len; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)]
            setChallenge(s)
            setInputVal('')
          }
        }

        useEffect(() => { regen() }, [type, difficulty])

        const verify = () => {
          if (type === 'math' && mathOps) {
            const expected = mathOps.op === '+' ? mathOps.a + mathOps.b : mathOps.op === '-' ? mathOps.a - mathOps.b : mathOps.a * mathOps.b
            return String(expected) === inputVal.trim()
          }
          if (type === 'text') {
            return caseSensitive ? inputVal.trim() === challenge : inputVal.trim().toUpperCase() === challenge.toUpperCase()
          }
          if (type === 'slider') {
            return slider >= 95
          }
          if (type === 'checkbox') {
            return checked
          }
          if (type === 'recaptcha') {
            return checked
          }
          return false
        }

        useEffect(() => {
          // push a boolean solved status into value
          onChange?.({ solved: verify(), input: inputVal, slider, checked, type, difficulty })
        }, [inputVal, slider, checked, type, difficulty])

        const sectionCls = 'p-3 border border-dashed border-gray-300 rounded-lg bg-gray-50'
        const labelCls = 'text-xs text-gray-600'
        return (
          <div className={sectionCls}>
            {type === 'math' && mathOps && (
              <div className="text-center space-y-2">
                <div className="font-mono text-base">{mathOps.a} {mathOps.op} {mathOps.b} = ?</div>
                <input value={inputVal} onChange={(e)=>setInputVal(e.target.value)} className="w-24 h-8 mx-auto border rounded bg-white text-center" placeholder="Answer" />
                <div className={labelCls}>{verify() ? 'Verified' : 'Enter the result'}</div>
              </div>
            )}
            {type === 'text' && (
              <div className="text-center space-y-2">
                <div className="font-mono bg-gray-100 inline-block px-2 py-1 rounded tracking-widest select-none">{challenge}</div>
                <input value={inputVal} onChange={(e)=>setInputVal(e.target.value)} className="w-32 h-8 mx-auto border rounded bg-white text-center" placeholder="Type here" />
                <div className={labelCls}>{verify() ? 'Verified' : caseSensitive ? 'Case sensitive' : 'Not case sensitive'}</div>
              </div>
            )}
            {type === 'slider' && (
              <div className="space-y-1">
                <div className={labelCls}>Slide to verify</div>
                <input type="range" min={0} max={100} value={slider} onChange={(e)=>setSlider(parseInt(e.target.value))} className="w-full" />
                <div className={labelCls}>{verify() ? 'Verified' : 'Slide to 100%'}</div>
              </div>
            )}
            {type === 'checkbox' && (
              <label className="flex items-center justify-center gap-2">
                <input type="checkbox" checked={checked} onChange={(e)=>setChecked(e.target.checked)} className="w-4 h-4" />
                <span className="text-sm">I'm not a robot</span>
              </label>
            )}
            {type === 'recaptcha' && (
              <button type="button" onClick={()=>setChecked(v=>!v)} className={`w-full md:w-72 mx-auto flex items-center justify-between px-3 py-2 rounded border ${checked ? 'bg-emerald-50 border-emerald-400' : 'bg-white border-gray-300'} shadow-sm`}>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex h-4 w-4 items-center justify-center rounded border ${checked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-400'}`}>{checked && <CheckIcon className="w-3 h-3 text-white" />}</span>
                  <span className="text-sm">I'm not a robot</span>
                </div>
                <span className="text-[10px] text-gray-500">reCAPTCHA</span>
              </button>
            )}
            <div className="mt-2 text-center">
              <button type="button" onClick={regen} className="px-2 py-1 text-xs border rounded hover:bg-gray-100">Refresh</button>
            </div>
          </div>
        )
      }

      case 'signature_upload': {
        const mode = (field.settings as any)?.signatureMode || 'draw'
        const penSize = (field.settings as any)?.penSize || 3
        const [typed, setTyped] = useState(typeof value === 'string' && !(value as string).startsWith('data:') ? (value as string) : '')

        // Canvas refs/state
        const canvasRef = useRef<HTMLCanvasElement>(null)
        const drawingRef = useRef(false)
        const lastRef = useRef<{x:number;y:number}|null>(null)

        useEffect(() => {
          if (mode !== 'draw') return
          const canvas = canvasRef.current
          if (!canvas) return
          const ctx = canvas.getContext('2d')
          if (!ctx) return
          // scale for DPR
          const dpr = window.devicePixelRatio || 1
          const rect = canvas.getBoundingClientRect()
          canvas.width = rect.width * dpr
          canvas.height = rect.height * dpr
          ctx.scale(dpr, dpr)
          ctx.lineJoin = 'round'
          ctx.lineCap = 'round'
          ctx.strokeStyle = '#111827'
          ctx.lineWidth = penSize
          // If existing image value
          if (typeof value === 'string' && (value as string).startsWith('data:')) {
            const img = new Image()
            img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height)
            img.src = value as string
          }
        }, [mode, penSize, value])

        const getPos = (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
          const rect = canvas.getBoundingClientRect()
          if ('touches' in e && e.touches[0]) {
            return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
          } else if ('clientX' in e) {
            const me = e as MouseEvent
            return { x: me.clientX - rect.left, y: me.clientY - rect.top }
          }
          return { x: 0, y: 0 }
        }

        const startDraw = (e: any) => {
          if (mode !== 'draw') return
          const canvas = canvasRef.current
          const ctx = canvas?.getContext('2d')
          if (!canvas || !ctx) return
          drawingRef.current = true
          lastRef.current = getPos(e.nativeEvent, canvas)
        }
        const moveDraw = (e: any) => {
          if (mode !== 'draw') return
          const canvas = canvasRef.current
          const ctx = canvas?.getContext('2d')
          if (!canvas || !ctx || !drawingRef.current || !lastRef.current) return
          const now = getPos(e.nativeEvent, canvas)
          ctx.beginPath()
          ctx.moveTo(lastRef.current.x, lastRef.current.y)
          ctx.lineTo(now.x, now.y)
          ctx.stroke()
          lastRef.current = now
        }
        const endDraw = () => {
          if (mode !== 'draw') return
          const canvas = canvasRef.current
          if (!canvas) return
          drawingRef.current = false
          lastRef.current = null
          try {
            const data = canvas.toDataURL('image/png')
            onChange?.(data)
          } catch {}
        }

        const clearCanvas = () => {
          const canvas = canvasRef.current
          const ctx = canvas?.getContext('2d')
          if (!canvas || !ctx) return
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          onChange?.('')
        }

        const fileInputRef = useRef<HTMLInputElement>(null)
        const handleFile = (file: File) => {
          if (!file) return
          if (!['image/png','image/jpeg'].includes(file.type)) return
          if (file.size > 50 * 1024) return
          const reader = new FileReader()
          reader.onload = () => {
            onChange?.(reader.result as string)
          }
          reader.readAsDataURL(file)
        }

        return (
          <div className="w-full">
            <div className="flex items-center justify-between mb-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Mode:</span>
                <span className="text-gray-800 capitalize">{mode}</span>
              </div>
              {mode === 'draw' && (
                <div className="flex items-center gap-3">
                  <span className="text-gray-600">Pen: {penSize}px</span>
                  <button type="button" className="text-blue-700 underline" onClick={clearCanvas}>Clear</button>
                </div>
              )}
            </div>
            <div className="relative border border-gray-300 rounded-lg bg-white p-2">
              {mode === 'draw' && (
                <canvas
                  ref={canvasRef}
                  className="h-32 w-full rounded bg-white touch-none"
                  onMouseDown={startDraw}
                  onMouseMove={moveDraw}
                  onMouseUp={endDraw}
                  onMouseLeave={endDraw}
                  onTouchStart={startDraw}
                  onTouchMove={moveDraw}
                  onTouchEnd={endDraw}
                />
              )}
              {mode === 'type' && (
                <input
                  value={typed}
                  onChange={(e) => { setTyped(e.target.value); onChange?.(e.target.value) }}
                  placeholder="Type your signature"
                  className="w-full h-10 text-xl italic tracking-wider border-none focus:outline-none"
                />
              )}
              {mode === 'upload' && (
                <div className="flex flex-col items-center justify-center gap-2">
                  <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={(e) => e.target.files && handleFile(e.target.files[0])} />
                  <button type="button" className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50" onClick={() => fileInputRef.current?.click()}>
                    Upload (PNG/JPG, &lt; 50KB)
                  </button>
                  {typeof localValue === 'string' && localValue.startsWith('data:') && (
                    <img src={localValue} alt="Signature" className="max-h-20 object-contain" />
                  )}
                </div>
              )}
              {mode === 'draw' && (
                <div className="absolute inset-x-0 bottom-1 text-center text-[10px] text-gray-400 select-none">Sign here</div>
              )}
            </div>
          </div>
        )
      }

      case 'payment': {
        // In published mode, we'll mount Stripe Elements here.
        // In builder preview, render a neutral placeholder.
        if (isPreview) {
          return (
            <div className="space-y-2">
              <div className="h-[50px] px-3 flex items-center rounded-[12px] border border-gray-200 bg-white text-gray-400">
                Card number
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-[50px] px-3 flex items-center rounded-[12px] border border-gray-200 bg-white text-gray-400">
                  MM/YY
                </div>
                <div className="h-[50px] px-3 flex items-center rounded-[12px] border border-gray-200 bg-white text-gray-400">
                  CVC
                </div>
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <ShieldCheckIcon className="w-4 h-4 text-green-600" />
                256-bit SSL Encrypted
              </div>
            </div>
          )
        }

        // Published/live mode: Stripe Elements will be mounted externally; just provide a container hook via onChange
        return (
          <div className="space-y-2">
            <div id={`stripe-payment-container-${field.id}`} className="space-y-2">
              {/* The published page will mount Elements into a dedicated container for this field id. */}
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {(field.settings as any)?.amount && (field.settings as any)?.currency ? `${new Intl.NumberFormat('en-US', { style: 'currency', currency: String((field.settings as any)?.currency || 'usd').toUpperCase() }).format(Number((field.settings as any)?.amount) / 100)}` : ''}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <ShieldCheckIcon className="w-4 h-4 text-green-600" />
              <span>256-bit SSL encrypted</span>
            </div>
          </div>
        )
      }

      default:
        return (
          <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
            <p className="text-gray-500 text-sm">
              Field type "{field.type}" not implemented yet.
            </p>
          </div>
        )
    }
  }

  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="flex items-start space-x-2">
          <label className="block text-sm font-medium text-gray-900 flex-1">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>
      )}
      {field.show_description && field.description && (
        <p className="text-xs text-gray-500 -mt-1">{field.description}</p>
      )}
      {renderField()}
    </div>
  )
} 
