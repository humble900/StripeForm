'use client'

import { createContext, useContext, useReducer, ReactNode, useEffect, useCallback, useRef } from 'react'
import { Form, FormField, FormBuilderState } from '@/types'
import { useNotifications } from '@/components/providers/NotificationProvider'

type FormBuilderAction =
  | { type: 'SET_CURRENT_FORM'; payload: Form | null }
  | { type: 'LOAD_FORM'; payload: Form }
  | { type: 'SELECT_FIELD'; payload: FormField | null }
  | { type: 'ADD_FIELD'; payload: FormField }
  | { type: 'UPDATE_FIELD'; payload: { fieldId: string; updates: Partial<FormField> } }
  | { type: 'UPDATE_FORM'; payload: Partial<Form> }
  | { type: 'UPDATE_USER_ID'; payload: string }
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

      return {
        ...state,
        current_form: action.payload,
        selected_field: null,
        has_unsaved_changes: false,
        undo_stack: [],
        redo_stack: [],
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

    case 'UPDATE_USER_ID':
      if (!state.current_form) return state
      
      console.log('🔄 UPDATE_USER_ID action:', action.payload)
      
      return {
        ...state,
        current_form: {
          ...state.current_form,
          user_id: action.payload,
        },
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
  updateUserId: (userId: string) => void
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
  // Enhanced autosave functionality
  onDraftSaved: (draftId: string) => void
  onDraftRestored: (draft: any) => void
}

const FormBuilderContext = createContext<FormBuilderContextType | undefined>(undefined)

export function FormBuilderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(formBuilderReducer, initialState)
  const { addNotification } = useNotifications()
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null)

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
        const isMinimallyValid = (form.title && form.title.trim().length > 0) && (form.fields && form.fields.length > 0)
        if (!isMinimallyValid) {
          console.log('⏭️ Skipping server create: form not minimally valid (needs title and at least one field)')
          addNotification({
            type: 'warning',
            title: 'Cannot Save Form',
            message: 'Please add a title and at least one field to your form before saving.',
            duration: 5000
          })
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
      
      // Update the form with saved data
      const updatedForm = {
        ...form,
        id: savedForm.id,
        updated_at: savedForm.updatedAt || new Date().toISOString()
      }
      
      dispatch({ type: 'SET_CURRENT_FORM', payload: updatedForm })
      dispatch({ type: 'SET_UNSAVED_CHANGES', payload: false })
      
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

  // Draft management methods
  const onDraftSaved = useCallback((draftId: string) => {
    console.log('✅ Draft saved with ID:', draftId)
  }, [])

  const onDraftRestored = useCallback((draft: any) => {
    console.log('📄 Draft found but resume dialog disabled:', draft)
    // Resume dialog is disabled - just log that a draft was found
    // Users can still manually restore if needed through other means
  }, [])

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

  const updateUserId = (userId: string) => {
    dispatch({ type: 'UPDATE_USER_ID', payload: userId })
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
    updateUserId,
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
    // Enhanced autosave functionality
    onDraftSaved,
    onDraftRestored,
  }

  // Listen for authentication changes and update form user ID
  useEffect(() => {
    const handleAuthChange = () => {
      const authToken = localStorage.getItem('auth-token')
      if (authToken) {
        try {
          const userData = JSON.parse(authToken)
          const userId = userData.userId || userData.id
          if (userId && userId !== 'anonymous') {
            console.log('🔄 FormBuilder: Updating user ID to:', userId)
            updateUserId(userId)
          }
        } catch (error) {
          console.warn('Failed to parse auth token:', error)
        }
      }
    }

    // Check immediately
    handleAuthChange()

    // Listen for storage changes (when user logs in/out)
    window.addEventListener('storage', handleAuthChange)
    
    // Listen for custom auth events
    window.addEventListener('userAuthenticated', handleAuthChange)
    window.addEventListener('userLoggedOut', () => {
      console.log('🔄 FormBuilder: User logged out, resetting to anonymous')
      updateUserId('anonymous')
    })

    return () => {
      window.removeEventListener('storage', handleAuthChange)
      window.removeEventListener('userAuthenticated', handleAuthChange)
      window.removeEventListener('userLoggedOut', handleAuthChange)
    }
  }, [updateUserId])

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