'use client'

import { useState, useEffect, useRef } from 'react'
import { FormBuilderSidebar } from './FormBuilderSidebar'
import { FormBuilderCanvas } from './FormBuilderCanvas'
import { FormBuilderInspector } from './FormBuilderInspector'
import { FormBuilderToolbar } from './FormBuilderToolbar'
import { useFormBuilder } from '@/components/providers/FormBuilderProvider'
import EnhancedFormPreview from './EnhancedFormPreview'
import { EnhancedAutoSave } from './EnhancedAutoSave'
import { FormField } from '@/types'
import {
  EllipsisVerticalIcon,
  Bars3Icon,
  Cog6ToothIcon,
  XMarkIcon,
  DocumentTextIcon,
  ListBulletIcon,
  PhotoIcon,
  CurrencyDollarIcon,
  CogIcon,
  SparklesIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  LockClosedIcon,
  LinkIcon,
  PencilIcon,
  HomeIcon,
  ChartBarIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline'

const getFieldIcon = (type: string) => {
  switch (type) {
    case 'short_text':
    case 'long_text':
    case 'email':
    case 'number':
    case 'phone':
    case 'name':
      return <DocumentTextIcon className="w-3.5 h-3.5" />
    case 'dropdown':
    case 'multiple_choice':
    case 'checkboxes':
    case 'yes_no':
      return <ListBulletIcon className="w-3.5 h-3.5" />
    case 'date':
    case 'multiple_dates':
      return <CalendarIcon className="w-3.5 h-3.5" />
    case 'time':
    case 'time_range':
      return <ClockIcon className="w-3.5 h-3.5" />
    case 'location':
    case 'address':
      return <MapPinIcon className="w-3.5 h-3.5" />
    case 'captcha':
      return <LockClosedIcon className="w-3.5 h-3.5" />
    case 'url_redirect':
      return <LinkIcon className="w-3.5 h-3.5" />
    case 'cover_slide':
    case 'image_upload':
    case 'video_upload':
    case 'file_upload':
      return <PhotoIcon className="w-3.5 h-3.5" />
    case 'signature_upload':
      return <PencilIcon className="w-3.5 h-3.5" />
    case 'payment':
      return <CurrencyDollarIcon className="w-3.5 h-3.5" />
    case 'end_page':
    default:
      return <SparklesIcon className="w-3.5 h-3.5" />
  }
}

// Navigation items for the glassmorphic sidebar
const NAV_ITEMS = [
  { id: 'dashboard', icon: HomeIcon, label: 'Dashboard', emoji: '◈' },
  { id: 'analytics', icon: ChartBarIcon, label: 'Analytics', emoji: '◎' },
  { id: 'forms', icon: DocumentDuplicateIcon, label: 'Forms', emoji: '❖' },
]

export function FormBuilderLayout() {
  const {
    state,
    addField,
    selectField,
    setPreviewMode,
    onDraftSaved,
    onDraftRestored,
    updateForm
  } = useFormBuilder()

  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [inspectorOpen, setInspectorOpen] = useState(true)
  const [dockOpen, setDockOpen] = useState(false)

  // Auto-open inspector when a field is selected (from canvas or sidebar)
  useEffect(() => {
    if (state.selected_field) {
      setInspectorOpen(true)
    }
  }, [state.selected_field])

  // Drag and Drop State for Question List
  const [draggedFieldId, setDraggedFieldId] = useState<string | null>(null)
  const [dragOverFieldId, setDragOverFieldId] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedFieldId(id)
    e.dataTransfer.effectAllowed = 'move'
    // Hack to hide default drag image
    const dragGhost = e.currentTarget.cloneNode(true) as HTMLElement
    dragGhost.style.position = 'absolute'
    dragGhost.style.top = '-1000px'
    document.body.appendChild(dragGhost)
    e.dataTransfer.setDragImage(dragGhost, 0, 0)
    setTimeout(() => { document.body.removeChild(dragGhost) }, 0)
  }

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    if (draggedFieldId === id) return
    setDragOverFieldId(id)
  }

  const handleDragEnd = () => {
    setDraggedFieldId(null)
    setDragOverFieldId(null)
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedFieldId || draggedFieldId === targetId) {
      handleDragEnd()
      return
    }

    const fields = [...(state.current_form?.fields || [])]
    const draggedIndex = fields.findIndex((f) => f.id === draggedFieldId)
    const targetIndex = fields.findIndex((f) => f.id === targetId)

    if (draggedIndex === -1 || targetIndex === -1) {
      handleDragEnd()
      return
    }

    const [draggedField] = fields.splice(draggedIndex, 1)
    fields.splice(targetIndex, 0, draggedField)

    // Re-assign order properties sequentially
    let qNum = 0
    const reorderedFields = fields.map((f) => {
      if (f.type === 'cover_slide') return { ...f, order: -1 }
      if (f.type === 'end_page' || f.type === 'url_redirect') return { ...f, order: 999 }
      qNum++
      return { ...f, order: qNum }
    })

    if (state.current_form) {
      updateForm({
        ...state.current_form,
        fields: reorderedFields
      })
    }
    handleDragEnd()
  }

  // Auto-close dock when a field is added
  const prevFieldCount = useRef(state.current_form?.fields?.length ?? 0)
  useEffect(() => {
    const currentCount = state.current_form?.fields?.length ?? 0
    if (currentCount > prevFieldCount.current && dockOpen) {
      setDockOpen(false)
    }
    prevFieldCount.current = currentCount
  }, [state.current_form?.fields?.length, dockOpen])

  const handleCategoryClick = (categoryId: string) => {
    if (activeCategory === categoryId) {
      setActiveCategory(null)
    } else {
      setActiveCategory(categoryId)
    }
  }

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: '#F4F3FA' }}>
      {/* ====== GLASSMORPHISM TOOLBAR ====== */}
      <FormBuilderToolbar
        sidebarOpen={activeCategory !== null}
        setSidebarOpen={(open) => {
          if (!open) setActiveCategory(null)
          else if (!activeCategory) setActiveCategory('text')
        }}
        inspectorOpen={inspectorOpen}
        setInspectorOpen={setInspectorOpen}
      />

      {/* ====== MAIN CONTENT ====== */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* ---- GLASSMORPHIC NAV SIDEBAR ---- */}
        <div className="hidden md:flex flex-col items-center py-4 px-2 gap-2 z-20 flex-shrink-0" style={{ background: 'linear-gradient(180deg, rgba(248,247,255,0.9) 0%, rgba(241,240,251,0.9) 100%)', backdropFilter: 'blur(12px)' }}>
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href="/dashboard"
              className="group flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl transition-all duration-200 hover:bg-white/70 hover:shadow-md hover:shadow-[#6C5CE7]/5 hover:scale-105 active:scale-95 no-underline"
              title={item.label}
            >
              <div className="w-8 h-8 rounded-lg bg-white/60 backdrop-blur border border-white/80 shadow-sm flex items-center justify-center group-hover:bg-white/90 group-hover:border-[#6C5CE7]/20 group-hover:shadow-[#6C5CE7]/10 transition-all">
                <item.icon className="w-4 h-4 text-gray-500 group-hover:text-[#6C5CE7] transition-colors" />
              </div>
              <span className="text-[9px] font-medium text-gray-500 group-hover:text-[#6C5CE7] transition-colors">{item.label}</span>
            </a>
          ))}
          <div className="flex-1" />
        </div>

        {/* ---- CANVAS (full bleed with dot grid) ---- */}
        <div className="flex-1 flex flex-col relative builder-canvas-bg overflow-hidden">
          {/* Mobile/tablet controls — visible below lg (1024px) */}
          <div className="lg:hidden flex items-center justify-between px-3 py-2 border-b border-gray-200/60 bg-white/60">
            <button
              className="builder-pill builder-pill-ghost"
              onClick={() => setActiveCategory(activeCategory ? null : 'text')}
            >
              <PlusIcon className="w-4 h-4" />
              Add Fields
            </button>
            <button
              className="builder-pill builder-pill-ghost"
              onClick={() => setInspectorOpen(!inspectorOpen)}
            >
              <Cog6ToothIcon className="w-4 h-4" />
              Settings
            </button>
          </div>

          <div className="flex-1 flex flex-row overflow-hidden relative">
            {/* ---- VERTICAL QUESTION LIST (Typeform Classic Style) ---- */}
            {state.current_form?.fields && state.current_form.fields.length > 0 && (
              <div className="hidden md:flex flex-col w-56 z-10 flex-shrink-0 h-full overflow-hidden pb-0 bg-white/40 border-r border-[#6C5CE7]/10 shadow-[4px_0_24px_-12px_rgba(108,92,231,0.15)] backdrop-blur-md">
                {/* ── Draggable Question List ── */}
                <div className="px-2 space-y-1 flex-1 overflow-y-auto sidebar-scroll pb-4 pt-1">
                  {(() => {
                    const sortedFieldsOnly = [...(state.current_form?.fields || [])]
                      .filter(f => f.type !== 'cover_slide' && f.type !== 'end_page')
                    const sorted = sortedFieldsOnly.sort((a, b) => {
                      return (a.order ?? 0) - (b.order ?? 0)
                    })

                    let qNum = 0
                    return sorted.map((field: any) => {
                      qNum++
                      const labelPrefix = `${qNum}`
                      const isSelected = state.selected_field?.id === field.id
                      const isDraggable = true
                      const isDragOver = dragOverFieldId === field.id
                      const isDragging = draggedFieldId === field.id

                      return (
                        <div
                          key={field.id}
                          draggable={isDraggable}
                          onDragStart={(e) => isDraggable && handleDragStart(e, field.id)}
                          onDragOver={(e) => isDraggable && handleDragOver(e, field.id)}
                          onDragLeave={handleDragEnd}
                          onDrop={(e) => isDraggable && handleDrop(e, field.id)}
                          onClick={() => selectField(field)}
                          className={`group flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-xs cursor-pointer transition-all duration-200 border ${isSelected
                            ? 'bg-white/80 border-[#6C5CE7]/20 shadow-md shadow-[#6C5CE7]/10 ring-1 ring-[#6C5CE7]/15'
                            : isDragging
                              ? 'opacity-50 blur-[1px] border-transparent'
                              : isDragOver
                                ? 'border-t-2 border-[#6C5CE7] bg-white/40'
                                : 'border-transparent hover:bg-white/60 hover:border-white/80 hover:shadow-sm'
                            }`}
                        >
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold transition-all ${isSelected
                              ? 'bg-[#6C5CE7] text-white shadow-sm shadow-[#6C5CE7]/30'
                              : 'bg-white/70 text-gray-500 border border-gray-200/40'
                              }`}>
                              {labelPrefix}
                            </div>
                            <span className={`truncate flex-1 font-medium transition-colors ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>{field.label || '___'}</span>
                          </div>
                          {isDraggable && (
                            <EllipsisVerticalIcon className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-[#6C5CE7]/40' : 'text-gray-300 opacity-0 group-hover:opacity-100'
                              } cursor-grab active:cursor-grabbing transition-opacity`} />
                          )}
                        </div>
                      )
                    })
                  })()}
                </div>
                {/* ── Pinned Screens at bottom ── */}
                <div className="px-2 pt-2 pb-2 sticky bottom-0 mt-auto flex flex-col gap-1" style={{ background: 'linear-gradient(0deg, rgba(245,243,255,0.98) 70%, transparent 100%)' }}>
                  <button
                    onClick={() => {
                      const existing = state.current_form?.fields?.find((f: any) => f.type === 'cover_slide')
                      if (existing) { selectField(existing) } else {
                        addField({ id: `field_${Date.now()}`, type: 'cover_slide' as any, label: 'Welcome', required: false, order: -1 } as FormField)
                      }
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 border ${state.selected_field?.type === 'cover_slide'
                      ? 'bg-white/80 border-[#6C5CE7]/20 shadow-md shadow-[#6C5CE7]/10 ring-1 ring-[#6C5CE7]/15'
                      : 'border-transparent hover:bg-white/60 hover:border-white/80 hover:shadow-sm'
                      } ${state.current_form?.fields?.some((f: any) => f.type === 'cover_slide') ? 'text-gray-900' : 'text-gray-500'}`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all font-bold ${state.current_form?.fields?.some((f: any) => f.type === 'cover_slide') ? 'bg-[#6C5CE7]/10 text-[#6C5CE7] shadow-sm shadow-[#6C5CE7]/10' : 'bg-white/70 text-gray-500 border border-gray-200/40 group-hover:border-[#6C5CE7]/20'}`}>
                      W
                    </div>
                    <span className="truncate flex-1 text-left">{state.current_form?.fields?.some((f: any) => f.type === 'cover_slide') ? 'Welcome Screen' : '+ Welcome Screen'}</span>
                  </button>
                  <button
                    onClick={() => {
                      const existing = state.current_form?.fields?.find((f: any) => f.type === 'end_page')
                      if (existing) { selectField(existing) } else {
                        addField({ id: `field_${Date.now()}`, type: 'end_page' as any, label: 'Thank You', required: false, order: 999 } as FormField)
                      }
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 border group ${state.selected_field?.type === 'end_page'
                      ? 'bg-white/80 border-[#00B894]/20 shadow-md shadow-[#00B894]/10 ring-1 ring-[#00B894]/15'
                      : 'border-transparent hover:bg-white/60 hover:border-white/80 hover:shadow-sm'
                      } ${state.current_form?.fields?.some((f: any) => f.type === 'end_page') ? 'text-gray-900' : 'text-gray-500'}`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all font-bold ${state.current_form?.fields?.some((f: any) => f.type === 'end_page') ? 'bg-[#00B894]/10 text-[#00B894] shadow-sm shadow-[#00B894]/10' : 'bg-white/70 text-gray-500 border border-gray-200/40 group-hover:border-[#00B894]/20'}`}>
                      E
                    </div>
                    <span className="truncate flex-1 text-left">{state.current_form?.fields?.some((f: any) => f.type === 'end_page') ? 'Ending Screen' : '+ Ending Screen'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Canvas content — Typeform-style responsive spacing */}
            <div className="flex-1 overflow-y-auto hide-scrollbar px-3 py-4 sm:px-6 sm:py-6 md:px-8 md:py-6 lg:px-12 lg:py-8">
              <FormBuilderCanvas isThemeMode={false} />
            </div>
          </div>


        </div>

        {/* ---- FLOATING INSPECTOR (right) ---- */}
        {/* Inline at lg (≥1024px), overlay below that */}
        {inspectorOpen && state.selected_field ? (
          <>
            {/* Mobile/tablet overlay backdrop */}
            <div
              className="lg:hidden fixed inset-0 bg-black/30 z-20"
              onClick={() => setInspectorOpen(false)}
            />

            <div className={`
              fixed lg:relative right-0 top-0 bottom-0
              w-[320px] lg:w-56
              z-30 lg:z-10
              flex flex-col
              builder-panel
              border-l border-gray-100
              lg:border-l-0 lg:shadow-none
              flex-shrink-0
            `}>
              {/* Inspector header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700">Properties</h3>
                <button
                  onClick={() => setInspectorOpen(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <FormBuilderInspector isThemeMode={false} />
              </div>
            </div>
          </>
        ) : (
          /* When inspector is closed, simulate its width on desktop so the canvas doesn't jump/stretch */
          <div className="hidden lg:block w-56 flex-shrink-0" />
        )}
      </div>

      {/* ====== BOTTOM COMPONENT DOCK ====== */}
      {dockOpen && (
        <div className="builder-dock px-6 py-4 hidden md:block">
          <div className="max-w-4xl mx-auto">
            <FormBuilderSidebar activeCategory="all" />
          </div>
        </div>
      )}

      {/* ====== PREVIEW OVERLAY ====== */}
      {state.is_preview_mode && state.current_form && (
        <EnhancedFormPreview
          form={state.current_form}
          onClose={() => setPreviewMode(false)}
        />
      )}

      {/* ====== AUTO-SAVE ====== */}
      {state.current_form && (
        <EnhancedAutoSave
          form={state.current_form}
          onSave={async (form) => { }}
          onDraftSaved={onDraftSaved}
          onDraftRestored={onDraftRestored}
        />
      )}
    </div>
  )
}