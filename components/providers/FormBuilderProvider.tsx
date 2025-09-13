'use client'

import { createContext, useContext, useReducer, ReactNode, useEffect, useCallback, useState, useRef } from 'react'
import { Form, FormField, FormBuilderState } from '@/types'

type FormBuilderAction =
  | { type: 'SET_CURRENT_FORM'; payload: Form | null }
  | { type: 'LOAD_FORM'; payload: Form }
  | { type: 'SELECT_FIELD'; payload: FormField | null }
  | { type: 'ADD_FIELD'; payload: FormField }
  | { type: 'UPDATE_FIELD'; payload: { fieldId: string; updates: Partial<FormField> } }
  | { type: 'UPDATE_FORM'; payload: Partial<Form> }
  | { type: 'DELETE_FIELD'; payload: string }
  | { type: 'REORDER_FIELDS'; payload: { sourceIndex: number; destinationIndex: number } }
  | { type: 'SET_PREVIEW_MODE'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_UNSAVED_CHANGES'; payload: boolean }
  | { type: 'SAVE_TO_UNDO_STACK' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESET' }

const initialState: FormBuilderState = {
  current_form: {
    id: 'default-form',
    title: '',
    description: '',
    fields: [],
    settings: {
      allow_multiple_responses: true,
      require_login: false,
      show_progress_bar: true,
      submit_button_text: 'Submit',
      success_message: 'Thank you for your response!',
      email_notifications: false,
    },
    theme: {
      primary_color: '#3B82F6',
      secondary_color: '#1E40AF',
      background_color: '#FFFFFF',
      text_color: '#1F2937',
      border_radius: 8,
      font_family: 'Inter, sans-serif',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'anonymous',
    isPublished: false,
    response_count: 0,
  },
  selected_field: null,
  is_preview_mode: false,
  is_saving: false,
  has_unsaved_changes: false,
  undo_stack: [],
  redo_stack: [],
}

function formBuilderReducer(state: FormBuilderState, action: FormBuilderAction): FormBuilderState {
  switch (action.type) {
    case 'SET_CURRENT_FORM':
      // Only reset stacks and selection if it's truly a new form
      const isNewForm = !state.current_form || 
                       state.current_form.id !== action.payload?.id ||
                       state.current_form.id === 'default-form'
      
      return {
        ...state,
        current_form: action.payload,
        selected_field: isNewForm ? null : state.selected_field,
        has_unsaved_changes: false,
        undo_stack: isNewForm ? [] : state.undo_stack,
        redo_stack: isNewForm ? [] : state.redo_stack,
      }

    case 'LOAD_FORM':
      return {
        ...state,
        current_form: action.payload,
        selected_field: null,
        has_unsaved_changes: false,
        undo_stack: [],
        redo_stack: [],
      }

    case 'SELECT_FIELD':
      return {
        ...state,
        selected_field: action.payload,
      }

    case 'ADD_FIELD':
      if (!state.current_form) return state
      
      const newFormWithField = {
        ...state.current_form,
        fields: [...state.current_form.fields, action.payload],
      }
      
      return {
        ...state,
        current_form: newFormWithField,
        has_unsaved_changes: true,
      }

    case 'UPDATE_FIELD':
      if (!state.current_form) return state
      
      const updatedFields = state.current_form.fields.map(field =>
        field.id === action.payload.fieldId
          ? { ...field, ...action.payload.updates }
          : field
      )
      
      const updatedForm = {
        ...state.current_form,
        fields: updatedFields,
      }
      
      return {
        ...state,
        current_form: updatedForm,
        selected_field: state.selected_field?.id === action.payload.fieldId
          ? { ...state.selected_field, ...action.payload.updates }
          : state.selected_field,
        has_unsaved_changes: true,
      }

    case 'UPDATE_FORM':
      if (!state.current_form) return state
      
      console.log('🔄 UPDATE_FORM action:', action.payload)
      
      const updatedFormProperties = {
        ...state.current_form,
        ...action.payload,
      }
      
      return {
        ...state,
        current_form: updatedFormProperties,
        has_unsaved_changes: true,
      }

    case 'DELETE_FIELD':
      if (!state.current_form) return state
      
      const filteredFields = state.current_form.fields.filter(
        field => field.id !== action.payload
      )
      
      const formWithoutField = {
        ...state.current_form,
        fields: filteredFields,
      }
      
      return {
        ...state,
        current_form: formWithoutField,
        selected_field: state.selected_field?.id === action.payload
          ? null
          : state.selected_field,
        has_unsaved_changes: true,
      }

    case 'REORDER_FIELDS':
      if (!state.current_form) return state
      
      const { sourceIndex, destinationIndex } = action.payload
      const fields = [...state.current_form.fields]
      const [removed] = fields.splice(sourceIndex, 1)
      fields.splice(destinationIndex, 0, removed)
      
      const reorderedForm = {
        ...state.current_form,
        fields,
      }
      
      return {
        ...state,
        current_form: reorderedForm,
        has_unsaved_changes: true,
      }

    case 'SET_PREVIEW_MODE':
      return {
        ...state,
        is_preview_mode: action.payload,
      }

    case 'SET_SAVING':
      return {
        ...state,
        is_saving: action.payload,
      }

    case 'SET_UNSAVED_CHANGES':
      return {
        ...state,
        has_unsaved_changes: action.payload,
      }

    case 'SAVE_TO_UNDO_STACK':
      if (!state.current_form) return state
      
      return {
        ...state,
        undo_stack: [...state.undo_stack, state.current_form],
        redo_stack: [], // Clear redo stack when new action is performed
      }

    case 'UNDO':
      if (state.undo_stack.length === 0) return state
      
      const previousForm = state.undo_stack[state.undo_stack.length - 1]
      const newUndoStack = state.undo_stack.slice(0, -1)
      
      return {
        ...state,
        current_form: previousForm,
        undo_stack: newUndoStack,
        redo_stack: state.current_form ? [state.current_form, ...state.redo_stack] : state.redo_stack,
        has_unsaved_changes: true,
      }

    case 'REDO':
      if (state.redo_stack.length === 0) return state
      
      const nextForm = state.redo_stack[0]
      const newRedoStack = state.redo_stack.slice(1)
      
      return {
        ...state,
        current_form: nextForm,
        redo_stack: newRedoStack,
        undo_stack: state.current_form ? [...state.undo_stack, state.current_form] : state.undo_stack,
        has_unsaved_changes: true,
      }

    case 'RESET':
      return initialState

    default:
      return state
  }
}

interface FormBuilderContextType {
  state: FormBuilderState
  dispatch: React.Dispatch<FormBuilderAction>
  addField: (field: FormField) => void
  updateField: (fieldId: string, updates: Partial<FormField>) => void
  updateForm: (updates: Partial<Form>) => void
  deleteField: (fieldId: string) => void
  reorderFields: (sourceIndex: number, destinationIndex: number) => void
  selectField: (field: FormField | null) => void
  setPreviewMode: (isPreview: boolean) => void
  saveToUndoStack: () => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  saveForm: () => Promise<{ id: string } | undefined>
  // Enhanced autosave and resume functionality
  onDraftSaved: (draftId: string) => void
  onDraftRestored: (draft: any) => void
  showResumeDialog: boolean
  setShowResumeDialog: (show: boolean) => void
  resumeDraft: () => void
  startOver: () => void
  pendingDraft: any | null
}

const FormBuilderContext = createContext<FormBuilderContextType | undefined>(undefined)

export function FormBuilderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(formBuilderReducer, initialState)
  const [showResumeDialog, setShowResumeDialog] = useState(false)
  const [pendingDraft, setPendingDraft] = useState<any | null>(null)
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const AUTOSAVE_INTERVAL_MS = 1000

  // Auto-save functionality
  const saveForm = useCallback(async () => {
    console.log('💾 saveForm called:', { 
      hasForm: !!state.current_form, 
      isSaving: state.is_saving,
      formId: state.current_form?.id 
    })
    
    if (!state.current_form || state.is_saving) {
      console.log('❌ saveForm early return:', { 
        noForm: !state.current_form, 
        isSaving: state.is_saving 
      })
      return
    }
    
    console.log('✅ Starting form save...')
    dispatch({ type: 'SET_SAVING', payload: true })
    
    try {
      const form = state.current_form
      
      // Get brand kit from localStorage if available
      let brandKitToSave = form.brandKit
      try {
        if (typeof window !== 'undefined') {
          const savedBrandKit = localStorage.getItem('stripeform-brand-kit')
          if (savedBrandKit && !form.brandKit) {
            const parsedBrandKit = JSON.parse(savedBrandKit)
            // Convert complex brand kit to simple form-compatible structure
            brandKitToSave = {
              logo: parsedBrandKit.logo?.current?.type === 'image' && parsedBrandKit.logo?.main?.light ? {
                url: parsedBrandKit.logo.main.light.url,
                alt: parsedBrandKit.logo.main.light.name || parsedBrandKit.logo.main.light.alt,
                width: parsedBrandKit.logo.main.light.width,
                height: parsedBrandKit.logo.main.light.height
              } : parsedBrandKit.logo?.current?.type === 'image' && parsedBrandKit.logo?.current?.file ? {
                url: parsedBrandKit.logo.current.file,
                alt: 'Brand Logo',
                width: 100,
                height: 100
              } : parsedBrandKit.customTextLogo ? {
                url: '', // Text logos don't have URL
                alt: parsedBrandKit.customTextLogo.text
              } : undefined,
              textLogo: parsedBrandKit.customTextLogo ? {
                text: parsedBrandKit.customTextLogo.text,
                fontSize: parsedBrandKit.customTextLogo.fontSize,
                color: parsedBrandKit.customTextLogo.color,
                fontFamily: parsedBrandKit.customTextLogo.fontFamily,
                fontWeight: parsedBrandKit.customTextLogo.fontWeight
              } : undefined,
              colors: {
                primary: parsedBrandKit.colors?.buttonPrimary?.hex || '#3b82f6',
                secondary: parsedBrandKit.colors?.buttonSecondary?.hex || '#6b7280',
                accent: parsedBrandKit.colors?.focus?.hex || '#3b82f6'
              },
              fonts: {
                primary: parsedBrandKit.typography?.fontFamily?.primary || 'Inter',
                secondary: parsedBrandKit.typography?.fontFamily?.secondary || 'Inter'
              }
            }
          }
        }
      } catch (error) {
        console.log('Failed to apply brand kit from localStorage:', error)
      }

      // Prepare form data for API
      const formData = {
        title: form.title,
        description: form.description,
        fields: form.fields.map((field, index) => ({
          ...field,
          order: index // Ensure order is correct
        })),
        settings: form.settings,
        theme: form.theme,
        brandKit: brandKitToSave,
        userId: form.user_id
      }
      
      console.log('📤 Sending form data to API:', {
        formId: form.id,
        title: form.title,
        userId: form.user_id,
        fieldsCount: form.fields.length
      })
      
      let savedForm: { id: string; updatedAt?: string }
      
      if (form.id && form.id !== 'default-form' && form.id !== '') {
        // Update existing form
        const response = await fetch(`/api/user/forms/${form.id}`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${form.user_id || 'anonymous'}`
          },
          body: JSON.stringify(formData)
        })
        
        if (!response.ok) {
          const text = await response.text().catch(() => '')
          console.warn('Failed to update form:', response.status, text)
          return
        }
        const result = await response.json()
        savedForm = result.data
      } else {
        // Create new form
        const isMinimallyValid = (form.title && form.title.trim().length > 0) || (form.fields && form.fields.length > 0)
        if (!isMinimallyValid) {
          console.log('⏭️ Skipping server create: form not minimally valid (no title and no fields)')
          return
        }
        const response = await fetch('/api/user/forms', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${form.user_id || 'anonymous'}`
          },
          body: JSON.stringify(formData)
        })
        
        if (!response.ok) {
          const text = await response.text().catch(() => '')
          console.warn('Failed to create form:', response.status, text)
          return
        }
        const result = await response.json()
        savedForm = result.data
      }
      
      // Update the form with saved data - use UPDATE_FORM to preserve state
      const formUpdates = {
        id: savedForm.id,
        updated_at: savedForm.updatedAt || new Date().toISOString()
      }
      
      dispatch({ type: 'UPDATE_FORM', payload: formUpdates })
      dispatch({ type: 'SET_UNSAVED_CHANGES', payload: false })
      
      // Trigger dashboard refresh for form updates
      if (typeof window !== 'undefined') {
        localStorage.setItem('form-updated', 'true')
        window.dispatchEvent(new CustomEvent('formUpdated'))
      }
      
      console.log('✅ Form auto-saved successfully:', savedForm.id)
      return { id: savedForm.id }
    } catch (error) {
      console.error('❌ Failed to save form:', error)
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      // Don't mark as saved if there was an error
      return undefined
    } finally {
      console.log('🏁 Form save completed, setting is_saving to false')
      dispatch({ type: 'SET_SAVING', payload: false })
      // Prevent retry loops that spam the server
      dispatch({ type: 'SET_UNSAVED_CHANGES', payload: false })
    }
  }, [state.current_form?.id, state.is_saving]) // Only depend on form ID and saving state

  // Throttled autosave to localStorage for recovery
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!state.current_form) return

    const key = `stripeform-autosave-form-${state.current_form.id}`
    const write = () => {
      try {
        const payload = { form: state.current_form, savedAt: Date.now() }
        localStorage.setItem(key, JSON.stringify(payload))
      } catch {}
    }

    write()
    if (autosaveTimerRef.current) clearInterval(autosaveTimerRef.current as any)
    autosaveTimerRef.current = setInterval(write, AUTOSAVE_INTERVAL_MS) as any

    return () => {
      if (autosaveTimerRef.current) {
        clearInterval(autosaveTimerRef.current as any)
        autosaveTimerRef.current = null
      }
    }
  }, [state.current_form])

  // Restore autosaved draft on first load of a form if newer
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!state.current_form?.id) return
    try {
      const key = `stripeform-autosave-form-${state.current_form.id}`
      const raw = localStorage.getItem(key)
      if (!raw) return
      const saved = JSON.parse(raw)
      const savedForm = saved?.form
      const savedAt = Number(saved?.savedAt || 0)
      const currentUpdatedAt = (state.current_form as any)?.updated_at ? new Date((state.current_form as any).updated_at).getTime() : 0
      if (savedForm && savedAt > currentUpdatedAt) {
        dispatch({ type: 'LOAD_FORM', payload: savedForm })
      }
    } catch {}
    // Only once per form
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.current_form?.id])

  // Draft management methods
  const onDraftSaved = useCallback((draftId: string) => {
    console.log('✅ Draft saved with ID:', draftId)
  }, [])

  const onDraftRestored = useCallback((draft: any) => {
    console.log('📄 Draft found:', draft)
    setPendingDraft(draft)
    setShowResumeDialog(true)
  }, [])

  const resumeDraft = useCallback(() => {
    if (!pendingDraft) return

    try {
      const draftData = pendingDraft.source === 'server' 
        ? pendingDraft.data.draftData 
        : pendingDraft.data

      const restoredForm: Form = {
        id: state.current_form?.id || 'default-form',
        title: draftData.title || '',
        description: draftData.description || '',
        fields: draftData.fields || [],
        settings: draftData.settings || {},
        theme: draftData.theme || {},
        brandKit: draftData.brandKit || {},
        created_at: state.current_form?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: state.current_form?.user_id || 'anonymous',
        isPublished: false,
        response_count: 0,
      }

      dispatch({ type: 'SET_CURRENT_FORM', payload: restoredForm })
      setShowResumeDialog(false)
      setPendingDraft(null)
      
      console.log('✅ Draft resumed successfully')
    } catch (error) {
      console.error('❌ Failed to resume draft:', error)
    }
  }, [pendingDraft, state.current_form])

  const startOver = useCallback(async () => {
    if (!pendingDraft) return

    try {
      // Delete the draft from server if it exists
      if (pendingDraft.source === 'server' && pendingDraft.data.id) {
        await fetch(`/api/drafts/${pendingDraft.data.id}`, {
          method: 'DELETE'
        })
      }

      // Clear localStorage draft
      localStorage.removeItem('stripeform_unsaved_form')
      localStorage.removeItem('stripeform_unsaved_form_expiry')

      setShowResumeDialog(false)
      setPendingDraft(null)
      
      console.log('✅ Started over, draft cleared')
    } catch (error) {
      console.error('❌ Failed to clear draft:', error)
      // Still close dialog even if cleanup fails
      setShowResumeDialog(false)
      setPendingDraft(null)
    }
  }, [pendingDraft])

  // Auto-save effect - triggers when there are unsaved changes
  useEffect(() => {
    console.log('🔄 Autosave effect triggered:', { 
      hasUnsavedChanges: state.has_unsaved_changes, 
      isSaving: state.is_saving,
      formId: state.current_form?.id 
    })
    
    if (!state.has_unsaved_changes || state.is_saving) {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current)
        autosaveTimerRef.current = null
      }
      return
    }
    
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current)
    }
    autosaveTimerRef.current = setTimeout(() => {
      console.log('💾 Debounced autosave fired...')
      saveForm()
    }, 800)
    
    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current)
        autosaveTimerRef.current = null
      }
    }
  }, [state.has_unsaved_changes, state.is_saving]) // keep saveForm out to avoid re-creations

  const addField = (field: FormField) => {
    dispatch({ type: 'SAVE_TO_UNDO_STACK' })
    dispatch({ type: 'ADD_FIELD', payload: field })
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    dispatch({ type: 'SAVE_TO_UNDO_STACK' })
    dispatch({ type: 'UPDATE_FIELD', payload: { fieldId, updates } })
  }

  const updateForm = (updates: Partial<Form>) => {
    dispatch({ type: 'SAVE_TO_UNDO_STACK' })
    dispatch({ type: 'UPDATE_FORM', payload: updates })
  }

  const deleteField = (fieldId: string) => {
    dispatch({ type: 'SAVE_TO_UNDO_STACK' })
    dispatch({ type: 'DELETE_FIELD', payload: fieldId })
  }

  const reorderFields = (sourceIndex: number, destinationIndex: number) => {
    dispatch({ type: 'SAVE_TO_UNDO_STACK' })
    dispatch({ type: 'REORDER_FIELDS', payload: { sourceIndex, destinationIndex } })
  }

  const selectField = (field: FormField | null) => {
    dispatch({ type: 'SELECT_FIELD', payload: field })
  }

  const setPreviewMode = (isPreview: boolean) => {
    dispatch({ type: 'SET_PREVIEW_MODE', payload: isPreview })
  }

  const saveToUndoStack = () => {
    dispatch({ type: 'SAVE_TO_UNDO_STACK' })
  }

  const undo = () => {
    dispatch({ type: 'UNDO' })
  }

  const redo = () => {
    dispatch({ type: 'REDO' })
  }

  const canUndo = state.undo_stack.length > 0
  const canRedo = state.redo_stack.length > 0

  const value: FormBuilderContextType = {
    state,
    dispatch,
    addField,
    updateField,
    updateForm,
    deleteField,
    reorderFields,
    selectField,
    setPreviewMode,
    saveToUndoStack,
    undo,
    redo,
    canUndo,
    canRedo,
    saveForm,
    // Enhanced autosave and resume functionality
    onDraftSaved,
    onDraftRestored,
    showResumeDialog,
    setShowResumeDialog,
    resumeDraft,
    startOver,
    pendingDraft,
  }

  return (
    <FormBuilderContext.Provider value={value}>
      {children}
    </FormBuilderContext.Provider>
  )
}

export function useFormBuilder() {
  const context = useContext(FormBuilderContext)
  if (context === undefined) {
    throw new Error('useFormBuilder must be used within a FormBuilderProvider')
  }
  return context
} 