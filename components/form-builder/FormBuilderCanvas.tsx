'use client'

import React, { useState } from 'react'
import { useFormBuilder } from '@/components/providers/FormBuilderProvider'
import { FormField } from '@/types'
import { 
  PlusIcon, 
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  Bars3Icon
} from '@heroicons/react/24/outline'
import { FieldComponent } from './FieldComponents'

export function FormBuilderCanvas() {
  const { state, selectField, updateForm, deleteField, reorderFields, addField, setPreviewMode } = useFormBuilder()
  const [draggedField, setDraggedField] = useState<string | null>(null)
  const [dragOverField, setDragOverField] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editingLabel, setEditingLabel] = useState('')
  const [editingDescription, setEditingDescription] = useState('')
  const [inlineEditingField, setInlineEditingField] = useState<string | null>(null)
  const [inlineEditingValue, setInlineEditingValue] = useState('')



  const defaultLabels: Record<string, string> = {
    short_text: 'Short Text',
    long_text: 'Long Text',
    email: 'Email',
    number: 'Number',
    phone: 'Phone',
    url: 'URL',
    dropdown: 'Dropdown',
    multiple_choice: 'Multiple Choice',
    checkbox: 'Checkbox',
    radio: 'Radio',
    rating: 'Rating',
    nps: 'NPS',
    file_upload: 'File Upload',
    payment: 'Payment',
    section: 'Section',
    page_break: 'Page Break',
    image_upload: 'Image Upload',
    location: 'Location',
    name: 'Name',
    password: 'Password',
    likert: 'Likert',
    star_rating: 'Star Rating',
    linear_scale: 'Linear Scale',
    nps_score: 'NPS Score',
    likert_scale: 'Likert Scale',
    ranking: 'Ranking',
    yes_no: 'Yes / No',
    multiple_dates: 'Multiple Dates',
    time_range: 'Time Range',
    captcha: 'CAPTCHA',
    matrix_grid: 'Matrix Grid',
    signature_upload: 'Signature Upload',
    hidden_question: 'Hidden Question'
  }

  const shouldShowTitlePlaceholder = (field: any) => {
    const label = (field.label || '').trim()
    const defaultLabel = defaultLabels[field.type]
    return label.length === 0 || (defaultLabel && label === defaultLabel)
  }

  const handleStartEditing = (field: any) => {
    setEditingField(field.id)
    setEditingLabel(field.label || '')
    setEditingDescription(field.description || '')
  }

  const handleSaveEditing = (fieldId: string) => {
    const field = state.current_form?.fields.find(f => f.id === fieldId)
    if (field) {
      updateForm({
        ...state.current_form!,
        fields: state.current_form!.fields.map(f => 
          f.id === fieldId 
            ? { ...f, label: editingLabel, description: editingDescription }
            : f
        )
      })
    }
    setEditingField(null)
    setEditingLabel('')
    setEditingDescription('')
  }

  const handleCancelEditing = () => {
    setEditingField(null)
    setEditingLabel('')
    setEditingDescription('')
  }

  const handleInlineEditStart = (field: any) => {
    setInlineEditingField(field.id)
    setInlineEditingValue(field.label || '')
  }

  const handleInlineEditSave = (fieldId: string) => {
    const field = state.current_form?.fields.find(f => f.id === fieldId)
    if (field) {
      updateForm({
        ...state.current_form!,
        fields: state.current_form!.fields.map(f => 
          f.id === fieldId 
            ? { ...f, label: inlineEditingValue }
            : f
        )
      })
    }
    setInlineEditingField(null)
    setInlineEditingValue('')
  }

  const handleInlineEditCancel = () => {
    setInlineEditingField(null)
    setInlineEditingValue('')
  }

  const handleFieldDelete = (fieldId: string) => {
    deleteField(fieldId)
  }

  const handleFieldDuplicate = (field: any) => {
    const duplicatedField: FormField = {
      ...field,
      id: `field_${Date.now()}`,
      label: `${field.label} (Copy)`,
    }
    addField(duplicatedField)
  }

  const handleCardClick = (field: any) => {
    selectField(field)
  }

  const handleDragStart = (e: React.DragEvent, fieldId: string) => {
    setDraggedField(fieldId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, fieldId: string) => {
    e.preventDefault()
    if (draggedField && draggedField !== fieldId) {
      setDragOverField(fieldId)
    }
  }

  const handleDragLeave = () => {
    setDragOverField(null)
  }

  const handleDrop = (e: React.DragEvent, targetFieldId: string) => {
    e.preventDefault()
    if (draggedField && draggedField !== targetFieldId) {
      const draggedIndex = state.current_form?.fields.findIndex(f => f.id === draggedField)
      const targetIndex = state.current_form?.fields.findIndex(f => f.id === targetFieldId)
      
      if (draggedIndex !== undefined && targetIndex !== undefined) {
        reorderFields(draggedIndex, targetIndex)
      }
    }
    setDraggedField(null)
    setDragOverField(null)
  }

  if (!state.current_form) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <PlusIcon className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Start Building Your Form</h3>
          <p className="text-gray-600 mb-6">Add fields from the sidebar to create your perfect form</p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <span>Drag & drop fields</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span>Customize properties</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              <span>Preview & publish</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto sidebar-scroll" style={{
      backgroundColor: (state.current_form?.theme?.background_color as any) || (() => {
        const cover = state.current_form?.fields.find(f => (f as any).type === 'cover_slide') as any
        return cover?.settings?.coverBackgroundColor || '#f8fafc'
      })(),
      backgroundImage: ((state.current_form as any)?.brandKit?.backgroundImageUrl) ? `url(${(state.current_form as any).brandKit.backgroundImageUrl})` : undefined,
      backgroundSize: ((state.current_form as any)?.brandKit?.backgroundImageUrl) ? 'cover' : undefined,
      backgroundPosition: ((state.current_form as any)?.brandKit?.backgroundImageUrl) ? 'center' : undefined
    }}>
      <div className="mx-auto p-6 flex justify-center" style={{
        maxWidth: (() => {
          switch (state.current_form?.settings?.width as any) {
            case 'compact': return '24rem'
            case 'narrow': return '28rem'
            case 'comfortable': return '32rem'
            case 'medium': return '36rem'
            case 'wide': return '64rem'
            case 'full': return '95vw'
            case 'typeform': return '100vw'
            case 'stitch': return '100vw'
            case 'tripe': return '100vw'
            default: return '36rem'
          }
        })(),
        maxHeight: state.current_form?.settings?.width === 'full' ? '95vh' : undefined
      }}>
        <div className="w-full">
        {/* Form Fields - Enhanced with Drag & Drop */}
        <div className="space-y-2">
          {state.current_form?.fields
            ?.sort((a, b) => {
              const pri = (t: string) => t === 'cover_slide' ? -2 : (t === 'end_page' || t === 'url_redirect' ? 2 : 0)
              const pa = pri((a as any).type)
              const pb = pri((b as any).type)
              if (pa !== pb) return pa - pb
              return 0
            })
            ?.map((field, index) => (
            <div
              key={field.id}
              draggable={state.selected_field?.id === field.id}
              onDragStart={(e) => {
                if (state.selected_field?.id !== field.id) {
                  e.preventDefault()
                  return
                }
                handleDragStart(e, field.id)
              }}
              onDragOver={(e) => handleDragOver(e, field.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, field.id)}
              onClick={() => handleCardClick(field)}
              className={`group/row relative cursor-pointer ${draggedField === field.id ? 'opacity-50' : ''} rounded-md transition-colors`}
            >
              <div
                className={`pointer-events-none absolute inset-0 rounded-md transition-all ${state.selected_field?.id === field.id ? 'ring-[0.5px] ring-[#6C5CE7] opacity-100' : 'ring-[0.5px] ring-[#6C5CE7] opacity-0 group-hover/row:opacity-100'}`}
              />
              {(() => { /* helper to ease TS */ return null })()}
              {/**/}
                <div className="p-2 md:p-3">
                  <div className="flex items-center justify-between mb-1.5 md:mb-2">
                    <div className="flex items-center space-x-1.5 md:space-x-2 w-full">
                      <div className="flex-1">
                        {(() => {
                          const isCover = (field as any).type === 'cover_slide'
                          if (isCover) {
                            return (
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <div className="text-[9px] md:text-[10px] font-medium text-gray-900">Cover screen</div>
                                </div>
                              </div>
                            )
                          }
                          if (editingField === field.id) {
                            return (
                              <div className="space-y-1.5 md:space-y-2">
                                <input
                                  type="text"
                                  value={editingLabel}
                                  onChange={(e) => setEditingLabel(e.target.value)}
                                  className="w-full text-xs md:text-sm font-medium text-gray-900 border-b border-gray-300 focus:border-blue-500 outline-none bg-transparent"
                                  placeholder="Type your question here"
                                  autoFocus
                                />
                                <div className="flex items-center justify-between">
                                  <input
                                    type="text"
                                    value={editingDescription}
                                    onChange={(e) => setEditingDescription(e.target.value)}
                                    className="flex-1 text-xs text-gray-500 border-b border-gray-200 focus:border-blue-500 outline-none bg-transparent mr-1 md:mr-2"
                                    placeholder="Description (optional)"
                                  />
                                  <div className="flex items-center space-x-1 md:space-x-2">
                                    <span className="text-[9px] md:text-[10px] text-gray-500">Show description</span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        const updatedField = { ...field, show_description: !field.show_description }
                                        updateForm({
                                          ...state.current_form!,
                                          fields: state.current_form!.fields.map((f) => (f.id === field.id ? updatedField : f))
                                        })
                                      }}
                                      className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                                        field.show_description ? 'bg-blue-600' : 'bg-gray-200'
                                      }`}
                                    >
                                      <span className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${
                                        field.show_description ? 'translate-x-3.5' : 'translate-x-0.5'
                                      }`} />
                                    </button>
                                  </div>
                                </div>
                                <div className="flex space-x-2 mt-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleSaveEditing(field.id)
                                    }}
                                    className="px-1.5 md:px-2 py-0.5 md:py-1 text-[9px] md:text-[10px] bg-blue-500 text-white rounded hover:bg-blue-600"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleCancelEditing()
                                    }}
                                    className="px-1.5 md:px-2 py-0.5 md:py-1 text-[9px] md:text-[10px] bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                                  >
                                    Cancel
                                  </button>
                                </div>
                    </div>
                            )
                          }
                          const showPlaceholder = shouldShowTitlePlaceholder(field)
                          const titleText = showPlaceholder ? 'add question' : (field.label || '')
                          const t = (field as any).type
                          if (t === 'end_page' || t === 'url_redirect' || t === 'geo_restriction') {
                            return null
                          }
                          return (
                            <button
                              type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                handleStartEditing(field)
                              }}
                              className={`w-full text-left rounded-md bg-transparent px-0 py-1 transition-colors ${showPlaceholder ? 'border-b border-gray-300' : ''} hover:bg-transparent`}
                              title={showPlaceholder ? 'Click to add a question' : 'Click to edit question'}
                            >
                              <span className={`${showPlaceholder ? 'text-gray-400 italic' : 'text-gray-900'} text-[10px] md:text-[11px] font-medium`}>
                                {titleText}
                          </span>
                            </button>
                          )
                        })()}
                    </div>
                  </div>

                  {/* Field Actions */}
                  <div className="flex items-center space-x-1">
                    {(() => {
                      const t = (field as any).type
                      const restricted = t === 'cover_slide' || t === 'end_page' || t === 'url_redirect' || t === 'geo_restriction'
                      if (!restricted) {
                        return (
                          <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                            handleStartEditing(field)
                      }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Edit field"
                    >
                      <PencilIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleFieldDuplicate(field)
                      }}
                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                      title="Duplicate field"
                    >
                      <DocumentDuplicateIcon className="h-3.5 w-3.5" />
                    </button>
                          </>
                        )
                      }
                      return null
                    })()}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleFieldDelete(field.id)
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete field"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                  {/* Field Preview - minimal wrapper */}
                  {((field as any).type === 'cover_slide') ? (
                    <div className="text-center">
                      {(() => {
                        const title = field.settings?.coverTitle || state.current_form?.settings?.cover_title || state.current_form?.title || 'Cover'
                        const subtitle = field.settings?.coverSubtitle || state.current_form?.settings?.cover_description
                        const cta = field.settings?.coverCtaText || state.current_form?.settings?.cover_button_text || 'Start'
                        const coverBg = (field.settings as any)?.coverBackgroundColor || '#f8fafc'
                        const ctaBg = (field.settings as any)?.coverButtonColor || '#111827'
                        return (
                          <div className="w-full rounded-2xl p-8 md:p-12 min-h-[220px] md:min-h-[280px] border flex flex-col items-center justify-center" style={{ backgroundColor: coverBg, borderColor: '#dbeafe' }}>
                            <h3 className="text-lg md:text-xl font-semibold text-gray-900">{title}</h3>
                            {subtitle && <p className="mt-2 text-xs md:text-sm text-gray-600">{subtitle}</p>}
                            <div className="mt-4">
                              <button type="button" className="px-4 py-2 rounded-full text-white text-sm md:text-base" style={{ background: ctaBg }}>{cta}</button>
                </div>
                          </div>
                        )
                      })()}
                    </div>
                  ) : (
                      <FieldComponent field={field} isPreview={true} disabled={true} showLabel={false} />
                  )}
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Empty State */}
        {state.current_form?.fields?.length === 0 && (
          <div className="text-center py-16" style={{
            backgroundColor: (() => {
              const cover = state.current_form?.fields.find(f => f.type === 'cover_slide') as any
              return cover?.settings?.coverBackgroundColor || undefined
            })()
          }}>
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <PlusIcon className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No Fields Added Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start building your form by adding fields from the sidebar. You can drag and drop fields to reorder them.
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span>Click to add fields</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span>Drag to reorder</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                <span>Customize properties</span>
              </div>
            </div>
          </div>
        )}


        </div>
      </div>
    </div>
  )
} 