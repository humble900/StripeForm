"use client";

import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { Form, FormField, FormBuilderState } from "@/types";
import { useNotifications } from "@/components/providers/NotificationProvider";
import { memoryStorage } from "@/lib/memory-storage";

type FormBuilderAction =
  | { type: "SET_CURRENT_FORM"; payload: Form | null }
  | { type: "LOAD_FORM"; payload: Form }
  | { type: "SELECT_FIELD"; payload: FormField | null }
  | { type: "ADD_FIELD"; payload: FormField }
  | {
      type: "UPDATE_FIELD";
      payload: { fieldId: string; updates: Partial<FormField> };
    }
  | { type: "UPDATE_FORM"; payload: Partial<Form> }
  | { type: "UPDATE_USER_ID"; payload: string }
  | { type: "DELETE_FIELD"; payload: string }
  | {
      type: "REORDER_FIELDS";
      payload: { sourceIndex: number; destinationIndex: number };
    }
  | { type: "SET_PREVIEW_MODE"; payload: boolean }
  | { type: "SET_SAVING"; payload: boolean }
  | { type: "SET_UNSAVED_CHANGES"; payload: boolean }
  | { type: "SAVE_TO_UNDO_STACK" }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "RESET" };

const initialState: FormBuilderState = {
  current_form: {
    id: "default-form",
    title: "",
    description: "",
    fields: [],
    settings: {
      allow_multiple_responses: true,
      require_login: false,
      show_progress_bar: true,
      submit_button_text: "Submit",
      success_message: "Thank you for your response!",
      email_notifications: false,
    },
    theme: {
      primary_color: "#3B82F6",
      secondary_color: "#1E40AF",
      background_color: "#FFFFFF",
      text_color: "#1F2937",
      border_radius: 8,
      font_family: "Inter, sans-serif",
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "anonymous",
    isPublished: false,
    response_count: 0,
  },
  selected_field: null,
  is_preview_mode: false,
  is_saving: false,
  has_unsaved_changes: false,
  undo_stack: [],
  redo_stack: [],
};

function formBuilderReducer(
  state: FormBuilderState,
  action: FormBuilderAction,
): FormBuilderState {
  switch (action.type) {
    case "SET_CURRENT_FORM":
    case "LOAD_FORM":
      return {
        ...state,
        current_form: action.payload,
        selected_field: null,
        has_unsaved_changes: false,
        undo_stack: [],
        redo_stack: [],
      };

    case "SELECT_FIELD":
      return {
        ...state,
        selected_field: action.payload,
      };

    case "ADD_FIELD":
      if (!state.current_form) return state;

      const newFormWithField = {
        ...state.current_form,
        fields: [...state.current_form.fields, action.payload],
      };

      return {
        ...state,
        current_form: newFormWithField,
        has_unsaved_changes: true,
      };

    case "UPDATE_FIELD":
      if (!state.current_form) return state;

      const updatedFields = state.current_form.fields.map((field) =>
        field.id === action.payload.fieldId
          ? { ...field, ...action.payload.updates }
          : field,
      );

      const updatedForm = {
        ...state.current_form,
        fields: updatedFields,
      };

      return {
        ...state,
        current_form: updatedForm,
        selected_field:
          state.selected_field?.id === action.payload.fieldId
            ? { ...state.selected_field, ...action.payload.updates }
            : state.selected_field,
        has_unsaved_changes: true,
      };

    case "UPDATE_FORM":
      if (!state.current_form) return state;

      const updatedFormProperties = {
        ...state.current_form,
        ...action.payload,
      };

      return {
        ...state,
        current_form: updatedFormProperties,
        has_unsaved_changes: true,
      };

    case "UPDATE_USER_ID":
      if (!state.current_form) return state;

      return {
        ...state,
        current_form: {
          ...state.current_form,
          user_id: action.payload,
        },
        has_unsaved_changes: true,
      };

    case "DELETE_FIELD":
      if (!state.current_form) return state;

      const filteredFields = state.current_form.fields.filter(
        (field) => field.id !== action.payload,
      );

      const formWithoutField = {
        ...state.current_form,
        fields: filteredFields,
      };

      return {
        ...state,
        current_form: formWithoutField,
        selected_field:
          state.selected_field?.id === action.payload
            ? null
            : state.selected_field,
        has_unsaved_changes: true,
      };

    case "REORDER_FIELDS":
      if (!state.current_form) return state;

      const { sourceIndex, destinationIndex } = action.payload;
      const fields = [...state.current_form.fields];
      const [removed] = fields.splice(sourceIndex, 1);
      fields.splice(destinationIndex, 0, removed);

      const reorderedForm = {
        ...state.current_form,
        fields,
      };

      return {
        ...state,
        current_form: reorderedForm,
        has_unsaved_changes: true,
      };

    case "SET_PREVIEW_MODE":
      return {
        ...state,
        is_preview_mode: action.payload,
      };

    case "SET_SAVING":
      return {
        ...state,
        is_saving: action.payload,
      };

    case "SET_UNSAVED_CHANGES":
      return {
        ...state,
        has_unsaved_changes: action.payload,
      };

    case "SAVE_TO_UNDO_STACK":
      if (!state.current_form) return state;

      return {
        ...state,
        undo_stack: [...state.undo_stack, state.current_form],
        redo_stack: [], // Clear redo stack when new action is performed
      };

    case "UNDO":
      if (state.undo_stack.length === 0) return state;

      const previousForm = state.undo_stack[state.undo_stack.length - 1];
      const newUndoStack = state.undo_stack.slice(0, -1);

      return {
        ...state,
        current_form: previousForm,
        undo_stack: newUndoStack,
        redo_stack: state.current_form
          ? [state.current_form, ...state.redo_stack]
          : state.redo_stack,
        has_unsaved_changes: true,
      };

    case "REDO":
      if (state.redo_stack.length === 0) return state;

      const nextForm = state.redo_stack[0];
      const newRedoStack = state.redo_stack.slice(1);

      return {
        ...state,
        current_form: nextForm,
        redo_stack: newRedoStack,
        undo_stack: state.current_form
          ? [...state.undo_stack, state.current_form]
          : state.undo_stack,
        has_unsaved_changes: true,
      };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

interface FormBuilderContextType {
  state: FormBuilderState;
  dispatch: React.Dispatch<FormBuilderAction>;
  addField: (field: FormField) => void;
  updateField: (fieldId: string, updates: Partial<FormField>) => void;
  updateForm: (updates: Partial<Form>) => void;
  updateUserId: (userId: string) => void;
  deleteField: (fieldId: string) => void;
  reorderFields: (sourceIndex: number, destinationIndex: number) => void;
  selectField: (field: FormField | null) => void;
  setPreviewMode: (isPreview: boolean) => void;
  saveToUndoStack: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  saveForm: () => Promise<{ id: string } | undefined>;
  // Enhanced autosave functionality
  onDraftSaved: (draftId: string) => void;
  onDraftRestored: (draft: any) => void;
  // Local storage backup
  restoreFromLocalStorage: (formId: string) => boolean;
  // Memory storage functions
  saveToMemory: () => void;
  loadFromMemory: (formId: string) => boolean;
  publishForm: () => Promise<{ id: string } | undefined>;
}

const FormBuilderContext = createContext<FormBuilderContextType | undefined>(
  undefined,
);

export function FormBuilderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(formBuilderReducer, initialState);
  const { addNotification } = useNotifications();
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Memory storage functions
  const saveToMemory = useCallback(() => {
    if (!state.current_form) return;

    const form = state.current_form;

    // Skip default form state
    if (form.id === "default-form" || form.id === "") {
      return;
    }

    // Auto-assign title if form has fields but no title
    let title = form.title;
    if (form.fields.length > 0 && (!title || title.trim() === "")) {
      title = "Untitled Form";
      dispatch({ type: "UPDATE_FORM", payload: { title } });
    }

    // Store in memory
    memoryStorage.setForm(form.id, {
      ...form,
      title,
    });
  }, [state.current_form]);

  const loadFromMemory = useCallback((formId: string): boolean => {
    const memoryForm = memoryStorage.getForm(formId);
    if (memoryForm) {
      const form: Form = {
        id: memoryForm.id,
        title: memoryForm.title,
        description: memoryForm.description,
        fields: memoryForm.fields,
        settings: memoryForm.settings,
        theme: memoryForm.theme,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: memoryForm.userId,
        isPublished: false,
        response_count: 0,
        slug: memoryForm.slug,
      };

      dispatch({ type: "SET_CURRENT_FORM", payload: form });

      return true;
    }
    return false;
  }, []);

  // Fast autosave to memory and draft (no database queries for form itself)
  const saveForm = useCallback(async () => {
    if (!state.current_form || state.is_saving) {
      return;
    }

    // Save to memory immediately
    saveToMemory();

    // Handle database saving/creation for drafts
    let formId = state.current_form.id;
    if (formId && formId.startsWith("form_")) {
      // It's a new form, we need to create it in the database via POST /api/user/forms
      try {
        const formData = {
          title: state.current_form.title || "Untitled Form",
          description: state.current_form.description || "", // Ensure empty strings
          fields: (state.current_form.fields || []).map((field, index) => ({
            ...field,
            order: index,
          })),
          settings: state.current_form.settings || {},
          theme: state.current_form.theme || {},
          brandKit: state.current_form.brandKit || {},
          userId: state.current_form.user_id,
          status: "draft",
        };

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (state.current_form.user_id) {
          headers["Authorization"] = `Bearer ${state.current_form.user_id}`;
          headers["x-fingerprint"] = state.current_form.user_id;
        }

        const createResponse = await fetch("/api/user/forms", {
          method: "POST",
          headers,
          body: JSON.stringify(formData),
        });

        if (createResponse.ok) {
          const result = await createResponse.json();
          const savedDbForm = result.data;

          if (savedDbForm && savedDbForm.id) {
            formId = savedDbForm.id;

            // Swap out the temporary memory ID with the real database ID
            const updatedForm = { ...state.current_form, id: formId };
            dispatch({ type: "SET_CURRENT_FORM", payload: updatedForm });

            // Update memory storage to map to the new real ID
            memoryStorage.setForm(formId, updatedForm);
          }
        } else {
          console.warn(
            "Failed to create new draft form in DB:",
            createResponse.status,
          );
        }
      } catch (err) {
        console.error("Error creating new form:", err);
      }
    }

    // Now if we have a real form ID, we can sync the draft content to /api/drafts
    if (formId && !formId.startsWith("form_")) {
      try {
        const form = state.current_form;
        const currentFields = form.fields || [];

        const draftData = {
          formId: formId,
          userId: form.user_id,
          draftData: {
            title: form.title || "Untitled Form",
            description: form.description || "",
            fields: currentFields.map((field, index) => ({
              id: field.id,
              type: field.type,
              label: field.label,
              placeholder: field.placeholder || "",
              required: field.required || false,
              validation: field.validation || {},
              options: field.options || [],
              order: index,
              settings: field.settings || {},
              conditionalLogic:
                (field as any).conditional_logic ||
                (field as any).conditionalLogic ||
                null,
            })),
            settings: form.settings || {},
            theme: form.theme || {},
            brandKit: form.brandKit || {},
          },
          progressData: {
            currentStep: 0,
            completedSteps: ["form_created"],
          },
        };

        // Update draft via API
        const response = await fetch("/api/drafts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(draftData),
        });

        if (!response.ok) {
          console.warn("Draft update failed:", response.status);
        }
      } catch (draftError) {
        // Don't fail the entire save operation if draft update fails
      }
    }

    // Mark as saved
    dispatch({ type: "SET_UNSAVED_CHANGES", payload: false });
    return { id: state.current_form.id };
  }, [state.current_form, state.is_saving, saveToMemory]);

  // Publish form to database
  const publishForm = useCallback(async () => {
    if (!state.current_form) {
      return;
    }

    dispatch({ type: "SET_SAVING", payload: true });

    try {
      const form = state.current_form;
      const currentFields = form.fields || [];

      // Prepare form data for API
      const formData = {
        title: form.title || "Untitled Form",
        description: form.description,
        fields: currentFields.map((field, index) => ({
          ...field,
          order: index,
        })),
        settings: form.settings,
        theme: form.theme,
        brandKit: form.brandKit,
        userId: form.user_id,
      };

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (form.user_id) {
        headers["Authorization"] = `Bearer ${form.user_id}`;
        headers["x-fingerprint"] = form.user_id;
      }

      let savedForm: any;

      // Try to update existing form first
      if (form.id && form.id !== "default-form" && form.id !== "") {
        const response = await fetch(`/api/user/forms/${form.id}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({
            ...formData,
            status: "published",
          }),
        });

        if (response.ok) {
          const result = await response.json();
          savedForm = result.data;
        } else if (response.status === 404) {
          // Form doesn't exist, create new one
        } else {
          throw new Error(`Failed to update form: ${response.status}`);
        }
      }

      // Create new form if update failed or form doesn't exist
      if (!savedForm) {
        const response = await fetch("/api/user/forms", {
          method: "POST",
          headers,
          body: JSON.stringify({
            ...formData,
            status: "published",
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to create form: ${response.status}`);
        }

        const result = await response.json();
        savedForm = result.data;
      }

      // Update form state with database response
      const updatedForm: Form = {
        ...savedForm,
        id: savedForm.id,
        title: savedForm.title || formData.title,
        updated_at: savedForm.updatedAt || new Date().toISOString(),
        fields: (savedForm as any).fields || currentFields,
        isPublished: true,
      };

      // Update memory storage with published form
      memoryStorage.setForm(savedForm.id, updatedForm);

      // Update state
      dispatch({ type: "SET_CURRENT_FORM", payload: updatedForm });
      dispatch({ type: "SET_UNSAVED_CHANGES", payload: false });

      addNotification({
        type: "success",
        title: "Form Published",
        message: "Your form has been published and is now live!",
        duration: 5000,
      });

      return { id: savedForm.id };
    } catch (error) {
      console.error("Failed to publish form:", error);

      addNotification({
        type: "error",
        title: "Publish Failed",
        message: "Failed to publish form. Please try again.",
        duration: 5000,
      });

      return undefined;
    } finally {
      dispatch({ type: "SET_SAVING", payload: false });
    }
  }, [state.current_form, addNotification]);

  // Draft management methods
  const onDraftSaved = useCallback((_draftId: string) => {
    // Draft saved successfully
  }, []);

  const onDraftRestored = useCallback((_draft: any) => {
    // Resume dialog is disabled — users can manually restore if needed
  }, []);

  // Local storage backup for form state
  const saveToLocalStorage = useCallback((form: Form) => {
    try {
      // Check if we're in a browser environment
      if (
        typeof window === "undefined" ||
        typeof localStorage === "undefined"
      ) {
        return;
      }

      const key = `form_builder_${form.id || "draft"}`;
      localStorage.setItem(
        key,
        JSON.stringify({
          ...form,
          lastSaved: Date.now(),
        }),
      );
    } catch (error) {}
  }, []);

  const loadFromLocalStorage = useCallback((formId: string) => {
    try {
      // Check if we're in a browser environment
      if (
        typeof window === "undefined" ||
        typeof localStorage === "undefined"
      ) {
        return null;
      }

      const key = `form_builder_${formId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed;
      }
    } catch (error) {}
    return null;
  }, []);

  // Auto-save effect - triggers when there are unsaved changes
  useEffect(() => {
    if (!state.has_unsaved_changes || state.is_saving) {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
      return;
    }

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    // Force an immediate database save if it's a completely new unsynced form ('form_...' prefixed ID)
    if (state.current_form?.id?.startsWith("form_")) {
      saveForm(); // Bypasses the fast-memory throttle and goes straight to POST
      return;
    }

    // Fast autosave to memory (no database queries)
    autosaveTimerRef.current = setTimeout(() => {
      saveToMemory();
      // Now actually trigger a save so the dashboard realtime picks it up
      saveForm();
      dispatch({ type: "SET_UNSAVED_CHANGES", payload: false });
    }, 500);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
    };
  }, [
    state.has_unsaved_changes,
    state.is_saving,
    state.current_form?.fields?.length,
    saveToMemory,
  ]); // Add saveToMemory to dependencies

  // Backup form state to localStorage whenever it changes
  useEffect(() => {
    if (state.current_form && state.current_form.id) {
      saveToLocalStorage(state.current_form);
    }
  }, [state.current_form, saveToLocalStorage]);

  const addField = (field: FormField) => {
    dispatch({ type: "SAVE_TO_UNDO_STACK" });
    dispatch({ type: "ADD_FIELD", payload: field });
  };

  const restoreFromLocalStorage = (formId: string) => {
    const saved = loadFromLocalStorage(formId);
    if (saved) {
      dispatch({ type: "SET_CURRENT_FORM", payload: saved });
      return true;
    }
    return false;
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    dispatch({ type: "SAVE_TO_UNDO_STACK" });
    dispatch({ type: "UPDATE_FIELD", payload: { fieldId, updates } });
  };

  const updateForm = (updates: Partial<Form>) => {
    dispatch({ type: "SAVE_TO_UNDO_STACK" });
    dispatch({ type: "UPDATE_FORM", payload: updates });
  };

  const updateUserId = (userId: string) => {
    dispatch({ type: "UPDATE_USER_ID", payload: userId });
  };

  const deleteField = (fieldId: string) => {
    dispatch({ type: "SAVE_TO_UNDO_STACK" });
    dispatch({ type: "DELETE_FIELD", payload: fieldId });
  };

  const reorderFields = (sourceIndex: number, destinationIndex: number) => {
    dispatch({ type: "SAVE_TO_UNDO_STACK" });
    dispatch({
      type: "REORDER_FIELDS",
      payload: { sourceIndex, destinationIndex },
    });
  };

  const selectField = (field: FormField | null) => {
    dispatch({ type: "SELECT_FIELD", payload: field });
  };

  const setPreviewMode = (isPreview: boolean) => {
    dispatch({ type: "SET_PREVIEW_MODE", payload: isPreview });
  };

  const saveToUndoStack = () => {
    dispatch({ type: "SAVE_TO_UNDO_STACK" });
  };

  const undo = () => {
    dispatch({ type: "UNDO" });
  };

  const redo = () => {
    dispatch({ type: "REDO" });
  };

  const canUndo = state.undo_stack.length > 0;
  const canRedo = state.redo_stack.length > 0;

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
    // Local storage backup
    restoreFromLocalStorage,
    // Memory storage functions
    saveToMemory,
    loadFromMemory,
    publishForm,
  };

  // Listen for authentication changes and update form user ID
  useEffect(() => {
    const handleAuthChange = () => {
      const authToken = localStorage.getItem("auth-token");
      if (authToken) {
        try {
          const userData = JSON.parse(authToken);
          const userId = userData.userId || userData.id;
          if (userId && userId !== "anonymous") {
            updateUserId(userId);
          }
        } catch (error) {
          // Failed to parse auth token
        }
      }
    };

    const handleLogout = () => {
      updateUserId("anonymous");
    };

    // Check immediately
    handleAuthChange();

    // Listen for storage changes (when user logs in/out)
    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("userAuthenticated", handleAuthChange);
    window.addEventListener("userLoggedOut", handleLogout);

    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("userAuthenticated", handleAuthChange);
      window.removeEventListener("userLoggedOut", handleLogout);
    };
  }, [updateUserId]);

  return (
    <FormBuilderContext.Provider value={value}>
      {children}
    </FormBuilderContext.Provider>
  );
}

export function useFormBuilder() {
  const context = useContext(FormBuilderContext);
  if (context === undefined) {
    throw new Error("useFormBuilder must be used within a FormBuilderProvider");
  }
  return context;
}
