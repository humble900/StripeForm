"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Form } from "@/types";
import { useAuth } from "@/components/providers/AuthProvider";

interface AutoSaveConfig {
  saveInterval: number; // Default: 15 seconds
  debounceDelay: number; // Default: 2 seconds
  localStorageExpiry: number; // Default: 15 days in milliseconds
  maxRetries: number; // Default: 3
  enableServerBackup: boolean; // Default: true
}

interface AutoSaveState {
  lastSaved: Date | null;
  isSaving: boolean;
  saveStatus: "idle" | "saving" | "saved" | "error" | "offline";
  retryCount: number;
  hasUnsavedChanges: boolean;
  isOnline: boolean;
}

interface AutoSaveProps {
  form: Form;
  onSave: (form: Form) => Promise<void>;
  config?: Partial<AutoSaveConfig>;
  onDraftSaved?: (draftId: string) => void;
  onDraftRestored?: (draft: any) => void;
}

const STORAGE_KEY = "stripeform_unsaved_form";
const STORAGE_EXPIRY_KEY = "stripeform_unsaved_form_expiry";

export function EnhancedAutoSave({
  form,
  onSave,
  config = {},
  onDraftSaved,
  onDraftRestored,
}: AutoSaveProps) {
  const { user, isAuthenticated, isAnonymous, getUserTrackingData } = useAuth();

  const defaultConfig: AutoSaveConfig = {
    saveInterval: 15000, // 15 seconds
    debounceDelay: 2000, // 2 seconds
    localStorageExpiry: 15 * 24 * 60 * 60 * 1000, // 15 days
    maxRetries: 3,
    enableServerBackup: true,
    ...config,
  };

  const [state, setState] = useState<AutoSaveState>({
    lastSaved: null,
    isSaving: false,
    saveStatus: "idle",
    retryCount: 0,
    hasUnsavedChanges: false,
    isOnline: true, // Default to true, will be updated on client-side mount
  });
  const [isClient, setIsClient] = useState(false);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFormRef = useRef<string>("");
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ensure we're on the client side before accessing browser APIs
  useEffect(() => {
    setIsClient(true);
    // Update online status on client-side mount
    if (typeof navigator !== "undefined") {
      setState((prev) => ({ ...prev, isOnline: navigator.onLine }));
    }
  }, []);

  // Check if form has changed
  const hasFormChanged = useCallback(() => {
    const currentFormString = JSON.stringify(form);
    const hasChanged = currentFormString !== lastFormRef.current;
    lastFormRef.current = currentFormString;
    return hasChanged;
  }, [form]);

  // Save to localStorage with expiry
  const saveToLocalStorage = useCallback(
    (formData: Form) => {
      try {
        const expiry = Date.now() + defaultConfig.localStorageExpiry;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
        localStorage.setItem(STORAGE_EXPIRY_KEY, expiry.toString());
      } catch (error) {
        console.error("Failed to save to localStorage:", error);
      }
    },
    [defaultConfig.localStorageExpiry],
  );

  // Load from localStorage with expiry check
  const loadFromLocalStorage = useCallback(() => {
    try {
      const expiryStr = localStorage.getItem(STORAGE_EXPIRY_KEY);
      if (!expiryStr) return null;

      const expiry = parseInt(expiryStr);
      if (Date.now() > expiry) {
        // Expired, clean up
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_EXPIRY_KEY);
        return null;
      }

      const formData = localStorage.getItem(STORAGE_KEY);
      return formData ? JSON.parse(formData) : null;
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
      return null;
    }
  }, []);

  // Save draft to server
  const saveDraftToServer = useCallback(
    async (formData: Form) => {
      if (!defaultConfig.enableServerBackup) return null;

      try {
        let userId: string | undefined;
        let sessionId: string | undefined;
        let fingerprint: string | undefined;

        if (isAuthenticated && user) {
          userId = user.id;
        } else if (isAnonymous) {
          const trackingData = await getUserTrackingData();
          fingerprint = trackingData.fingerprint;
          // sessionId is not available in tracking data, use fingerprint as session identifier
          sessionId = trackingData.fingerprint;
        }

        const response = await fetch("/api/drafts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(userId && { Authorization: `Bearer ${userId}` }),
            ...(sessionId && { "X-Session-Id": sessionId }),
            ...(fingerprint && { "X-Fingerprint": fingerprint }),
          },
          body: JSON.stringify({
            formId: formData.id,
            userId,
            sessionId,
            fingerprint,
            draftData: {
              title: formData.title,
              description: formData.description,
              fields: formData.fields,
              settings: formData.settings,
              theme: formData.theme,
              brandKit: formData.brandKit,
            },
            progressData: {
              lastSaved: new Date().toISOString(),
              fieldCount: formData.fields.length,
              hasCover: formData.fields.some((f) => f.type === "cover_slide"),
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`Server save failed: ${response.statusText}`);
        }

        const result = await response.json();
        if (result.success && onDraftSaved) {
          onDraftSaved(result.data.id);
        }

        return result.data;
      } catch (error) {
        console.error("Failed to save draft to server:", error);
        throw error;
      }
    },
    [
      defaultConfig.enableServerBackup,
      isAuthenticated,
      user,
      isAnonymous,
      getUserTrackingData,
      onDraftSaved,
    ],
  );

  // Main save function
  const performSave = useCallback(async () => {
    if (state.isSaving) return;

    setState((prev) => ({ ...prev, isSaving: true, saveStatus: "saving" }));

    try {
      // Save to localStorage first (always works)
      saveToLocalStorage(form);

      // Try to save to server if online
      if (state.isOnline) {
        await saveDraftToServer(form);
      }

      setState((prev) => ({
        ...prev,
        lastSaved: new Date(),
        saveStatus: "saved",
        retryCount: 0,
        hasUnsavedChanges: false,
      }));

      // Clear saved status after 3 seconds
      setTimeout(() => {
        setState((prev) => ({ ...prev, saveStatus: "idle" }));
      }, 3000);
    } catch (error) {
      console.error("Auto-save failed:", error);

      const newRetryCount = state.retryCount + 1;
      setState((prev) => ({
        ...prev,
        saveStatus: state.isOnline ? "error" : "offline",
        retryCount: newRetryCount,
      }));

      // Retry if under max retries and online
      if (newRetryCount < defaultConfig.maxRetries && state.isOnline) {
        retryTimeoutRef.current = setTimeout(
          () => {
            performSave();
          },
          Math.pow(2, newRetryCount) * 1000,
        ); // Exponential backoff
      }

      // Clear error status after 5 seconds
      setTimeout(() => {
        setState((prev) => ({ ...prev, saveStatus: "idle" }));
      }, 5000);
    } finally {
      setState((prev) => ({ ...prev, isSaving: false }));
    }
  }, [
    form,
    state.isSaving,
    state.isOnline,
    state.retryCount,
    saveToLocalStorage,
    saveDraftToServer,
    defaultConfig.maxRetries,
  ]);

  // Debounced save function
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (hasFormChanged()) {
        setState((prev) => ({ ...prev, hasUnsavedChanges: true }));
        performSave();
      }
    }, defaultConfig.debounceDelay);
  }, [hasFormChanged, performSave, defaultConfig.debounceDelay]);

  // Check for existing draft on mount
  useEffect(() => {
    const checkForExistingDraft = async () => {
      // First check localStorage
      const localDraft = loadFromLocalStorage();
      if (localDraft && onDraftRestored) {
        onDraftRestored({ source: "localStorage", data: localDraft });
        return;
      }

      // Then check server if online
      if (state.isOnline && defaultConfig.enableServerBackup) {
        try {
          let userId: string | undefined;
          let sessionId: string | undefined;
          let fingerprint: string | undefined;

          if (isAuthenticated && user) {
            userId = user.id;
          } else if (isAnonymous) {
            const trackingData = await getUserTrackingData();
            fingerprint = trackingData.fingerprint;
            // sessionId is not available in tracking data, use fingerprint as session identifier
            sessionId = trackingData.fingerprint;
          }

          if (userId || sessionId || fingerprint) {
            const controller = new AbortController();
            const to = setTimeout(() => controller.abort(), 8000);
            try {
              const response = await fetch(`/api/drafts?formId=${form.id}`, {
                headers: {
                  ...(userId && { Authorization: `Bearer ${userId}` }),
                  ...(sessionId && { "X-Session-Id": sessionId }),
                  ...(fingerprint && { "X-Fingerprint": fingerprint }),
                },
                signal: controller.signal,
              });

              if (response.ok) {
                const result = await response.json();
                if (result.success && result.data && onDraftRestored) {
                  onDraftRestored({ source: "server", data: result.data });
                }
              }
            } catch (e) {
              // Non-blocking if offline or server unreachable
            } finally {
              clearTimeout(to);
            }
          }
        } catch (error) {
          console.error("Failed to check for server draft:", error);
        }
      }
    };

    checkForExistingDraft();
  }, [
    form.id,
    state.isOnline,
    defaultConfig.enableServerBackup,
    isAuthenticated,
    user,
    isAnonymous,
    getUserTrackingData,
    loadFromLocalStorage,
    onDraftRestored,
  ]);

  // Auto-save on form changes
  useEffect(() => {
    if (hasFormChanged()) {
      debouncedSave();
    }
  }, [form, debouncedSave, hasFormChanged]);

  // Periodic save (as backup)
  useEffect(() => {
    const interval = setInterval(() => {
      if (hasFormChanged()) {
        performSave();
      }
    }, defaultConfig.saveInterval);

    return () => {
      clearInterval(interval);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [hasFormChanged, performSave, defaultConfig.saveInterval]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasFormChanged()) {
        saveToLocalStorage(form);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [form, hasFormChanged, saveToLocalStorage]);

  // Online/offline status tracking
  useEffect(() => {
    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOnline: true, saveStatus: "idle" }));
      // Try to save any pending changes when coming back online
      if (state.hasUnsavedChanges) {
        performSave();
      }
    };

    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOnline: false, saveStatus: "offline" }));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [state.hasUnsavedChanges, performSave]);

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const getStatusText = () => {
    switch (state.saveStatus) {
      case "saving":
        return "Saving...";
      case "saved":
        return "Saved";
      case "error":
        return "Save failed";
      case "offline":
        return "Offline - saved locally";
      default:
        return state.lastSaved
          ? `Last saved ${formatTimeAgo(state.lastSaved)}`
          : "Not saved yet";
    }
  };

  const getStatusColor = () => {
    switch (state.saveStatus) {
      case "saving":
        return "text-blue-600";
      case "saved":
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "offline":
        return "text-yellow-600";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className={`flex items-center space-x-1 ${getStatusColor()}`}>
        {state.saveStatus === "saving" && (
          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
        )}
        {state.saveStatus === "saved" && (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {state.saveStatus === "error" && (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {state.saveStatus === "offline" && (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        )}
        <span>{getStatusText()}</span>
      </div>

      {state.retryCount > 0 && state.saveStatus === "error" && (
        <span className="text-xs text-gray-400">
          (Retry {state.retryCount}/{defaultConfig.maxRetries})
        </span>
      )}
    </div>
  );
}
