"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Form as DashboardForm } from "@/types";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useNotifications } from "@/components/providers/NotificationProvider";
import { useUserType, userTypeHelpers } from "@/hooks/useUserType";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import InlineLoading from "@/components/ui/inline-loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArchiveBoxIcon,
  DocumentDuplicateIcon,
  ShareIcon,
  ClipboardDocumentListIcon,
  ArrowTrendingUpIcon,
  DocumentIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ViewColumnsIcon,
  ListBulletIcon,
  EyeSlashIcon,
  ClipboardIcon,
  CalendarIcon,
  UsersIcon,
  CloudArrowUpIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate } from "@/lib/utils";
import { getPublishedFormUrl } from "@/lib/utils/url";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { ThemeArtBackground } from "@/components/form-builder/ThemeArtBackground";

// Simple debounce function
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

const Dashboard = () => {
  const router = useRouter();
  const { getUserTrackingData } = useAuth();
  const { addNotification } = useNotifications();
  const { type: userType, firebaseUser, userId, isLoading } = useUserType();

  // Helper function to make authenticated API calls with cached user ID
  const makeAuthenticatedRequest = useCallback(
    async (url: string, options: RequestInit = {}) => {
      try {
        // Get user ID with proper fallback logic
        let requestUserId: string | null = userId;

        if (!requestUserId && firebaseUser) {
          requestUserId = firebaseUser.uid;
        }

        if (!requestUserId) {
          // For guest users, get tracking data unconditionally if userId is missing
          const userTrackingData = await getUserTrackingData();
          requestUserId = userTrackingData?.fingerprint || null;
        }

        if (!requestUserId) {
          throw new Error("No user ID available for authentication");
        }

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${requestUserId}`,
          "x-fingerprint": requestUserId,
          ...(options.headers as Record<string, string> | undefined),
        };

        return fetch(url, {
          ...options,
          headers,
          credentials: "include",
        });
      } catch (error) {
        console.error("Dashboard: Error in makeAuthenticatedRequest:", error);
        throw error;
      }
    },
    [firebaseUser, userId, getUserTrackingData],
  );
  const [deleteFormId, setDeleteFormId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [forms, setForms] = useState<DashboardForm[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [hasFetchedOnce, setHasFetchedOnce] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [expandedForms, setExpandedForms] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [copiedFormId, setCopiedFormId] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalForms: 0,
    publishedForms: 0,
    totalResponses: 0,
    conversionRate: 0,
  });

  // Debug user type state
  useEffect(() => {
    const storedToken =
      typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;
    const storedUser =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
  }, [userType, firebaseUser, userId, isLoading]);

  // Stable fetch function to prevent memory leaks
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsFetching(true);
      setFetchError(null);

      // Get user ID with proper fallback logic
      let requestUserId: string | null = null;

      if (firebaseUser) {
        requestUserId = firebaseUser.uid;
      } else {
        // For guest users, get tracking data
        const userTrackingData = await getUserTrackingData();
        requestUserId = userTrackingData?.fingerprint || null;
      }

      if (!requestUserId) {
        setFetchError("No user ID available for fetching data");
        return;
      }

      // Fetch forms using authenticated endpoint (summary for speed)
      const formsResponse = await makeAuthenticatedRequest(
        `/api/user/forms?summary=true`,
      );
      if (!formsResponse.ok) {
        throw new Error(`Forms API error! status: ${formsResponse.status}`);
      }
      const formsData = await formsResponse.json();

      // Update forms state with proper validation
      const fetchedForms = formsData.data || formsData.forms || [];

      // Validate and clean form data
      const validatedForms = fetchedForms.map((form: any) => ({
        id: form.id,
        title: form.title || "Untitled Form",
        description: form.description || "",
        slug: form.slug || "",
        status: form.status || "draft",
        isPublished: form.isPublished || false,
        publishedUrl: form.publishedUrl || "",
        publishedAt: form.publishedAt || null,
        createdAt: form.createdAt || new Date().toISOString(),
        updatedAt: form.updatedAt || new Date().toISOString(),
        userId: form.userId || userId,
        submissionCount: form.submissionCount || 0,
        viewCount: form.viewCount || 0,
        theme: form.theme || {},
        brandKit: form.brandKit || {},
      }));

      setForms(validatedForms);

      // Set basic stats immediately from forms data
      const totalResponses = validatedForms.reduce(
        (sum: number, f: any) =>
          sum + (f.submissionCount || f.submission_count || 0),
        0,
      );
      const totalViews = validatedForms.reduce(
        (sum: number, f: any) => sum + (f.viewCount || f.view_count || 0),
        0,
      );

      setDashboardStats({
        totalForms: validatedForms.length,
        publishedForms: validatedForms.filter(
          (f: any) => f.status === "published",
        ).length,
        totalResponses: totalResponses,
        conversionRate:
          totalViews > 0 ? Math.round((totalResponses / totalViews) * 100) : 0,
      });

      // Fetch detailed analytics/stats in background (non-blocking)
      setTimeout(async () => {
        try {
          const analyticsResponse = await makeAuthenticatedRequest(
            `/api/analytics?userId=${userId}&period=30d`,
          );

          if (analyticsResponse.ok) {
            const analyticsData = await analyticsResponse.json();
            if (analyticsData.success) {
              setDashboardStats({
                totalForms:
                  analyticsData.analytics.totalForms || validatedForms.length,
                publishedForms:
                  analyticsData.analytics.publishedForms ||
                  validatedForms.filter((f: any) => f.status === "published")
                    .length,
                totalResponses:
                  analyticsData.analytics.totalSubmissions || totalResponses,
                conversionRate:
                  analyticsData.analytics.conversionRate !== undefined
                    ? Math.round(
                        parseFloat(analyticsData.analytics.conversionRate),
                      )
                    : totalViews > 0
                      ? Math.round((totalResponses / totalViews) * 100)
                      : 0,
              });
            }
          }
        } catch (analyticsError) {}
      }, 100); // Small delay to let UI render first

      setHasFetchedOnce(true);
      setFetchError(null);
    } catch (error: any) {
      console.error("Dashboard: Error fetching data:", error);
      const errorMessage = error?.message?.includes("Forms API error!")
        ? "Failed to load forms data. Please check your network connection and try again."
        : "Failed to load dashboard data. Please try again later.";

      setFetchError(errorMessage);

      // Auto-retry for network errors (up to 3 times)
      if (
        retryCount < 3 &&
        (error?.message?.includes("network") ||
          error?.message?.includes("fetch"))
      ) {
        setRetryCount((prev) => prev + 1);
        setTimeout(
          () => {
            fetchDashboardData();
          },
          2000 * (retryCount + 1),
        ); // Exponential backoff
      } else {
        addNotification({
          type: "error",
          title: "Load Failed",
          message: errorMessage,
          duration: 5000,
        });
      }
    } finally {
      setIsFetching(false);
    }
  }, [
    firebaseUser,
    userType,
    getUserTrackingData,
    makeAuthenticatedRequest,
    addNotification,
    retryCount,
  ]);

  // Debounced fetch function to prevent excessive API calls
  const debouncedFetchForms = useMemo(
    () => debounce(fetchDashboardData, 1000),
    [fetchDashboardData],
  );

  // Manual retry function
  const retryFetch = useCallback(() => {
    setRetryCount(0);
    setFetchError(null);
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Fetch forms and dashboard data
  useEffect(() => {
    const fetchWhenReady = async () => {
      // Wait for user type to be determined
      if (isLoading) return;

      // For guest users, ensure we have tracking data before fetching
      if (userTypeHelpers.isGuest(userType)) {
        try {
          const trackingData = await getUserTrackingData();
          if (!trackingData?.fingerprint) {
            return;
          }
        } catch (error) {
          console.warn("Could not get user tracking data:", error);
          return;
        }
      }

      // Fetch forms when ready
      if (firebaseUser || userTypeHelpers.isGuest(userType)) {
        debouncedFetchForms();
      }
    };

    fetchWhenReady();
  }, [
    firebaseUser,
    userType,
    isLoading,
    getUserTrackingData,
    debouncedFetchForms,
  ]);

  // Listen for form updates and page visibility changes
  useEffect(() => {
    const handleStorageChange = () => {
      debouncedFetchForms();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Check if there are any pending form updates
        const formUpdated = localStorage.getItem("form-updated");
        const formPublished = localStorage.getItem("form-published");
        const formMigrated = localStorage.getItem("form-migrated");

        if (formUpdated || formPublished || formMigrated) {
          debouncedFetchForms();
          // Clear the flags
          localStorage.removeItem("form-updated");
          localStorage.removeItem("form-published");
          localStorage.removeItem("form-migrated");
        }
      }
    };

    // Consolidated handler for all visibility/focus events to reduce redundancy
    const handleVisibilityOrFocus = () => {
      // Check if there are any pending form updates
      const formUpdated = localStorage.getItem("form-updated");
      const formPublished = localStorage.getItem("form-published");
      const formMigrated = localStorage.getItem("form-migrated");

      if (formUpdated || formPublished || formMigrated) {
        debouncedFetchForms();
        // Clear the flags
        localStorage.removeItem("form-updated");
        localStorage.removeItem("form-published");
        localStorage.removeItem("form-migrated");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("formUpdated", handleStorageChange);
    window.addEventListener("formMigrated", handleStorageChange); // Listen for form migration events
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityOrFocus);

    // Mobile-specific event listeners (reduced frequency)
    window.addEventListener("pageshow", handleVisibilityOrFocus);
    // Removed pagehide listener as it was causing excessive reloads

    // Reduced frequency mobile support: Check for updates every 2 minutes on mobile
    const mobileRefreshInterval = setInterval(() => {
      const formUpdated = localStorage.getItem("form-updated");
      const formPublished = localStorage.getItem("form-published");
      const formMigrated = localStorage.getItem("form-migrated");

      if (formUpdated || formPublished || formMigrated) {
        debouncedFetchForms(); // Use debounced version
        localStorage.removeItem("form-updated");
        localStorage.removeItem("form-published");
        localStorage.removeItem("form-migrated");
      }
    }, 120000); // 2 minutes instead of 30 seconds

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("formUpdated", handleStorageChange);
      window.removeEventListener("formMigrated", handleStorageChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      window.removeEventListener("pageshow", handleVisibilityOrFocus);
      clearInterval(mobileRefreshInterval);
    };
  }, []);

  // Update dashboard stats when forms change
  useEffect(() => {
    const totalResponses = forms.reduce(
      (sum, f) => sum + (f.submissionCount || f.submission_count || 0),
      0,
    );
    const totalViews = forms.reduce(
      (sum, f) => sum + (f.viewCount || f.view_count || 0),
      0,
    );

    setDashboardStats({
      totalForms: forms.length,
      publishedForms: forms.filter((f) => f.status === "published").length,
      totalResponses,
      conversionRate:
        totalViews > 0 ? Math.round((totalResponses / totalViews) * 100) : 0,
    });
  }, [forms]);

  // Real-time updates for form submissions and changes
  useEffect(() => {
    let subscription: any;

    const setupRealtimeSubscription = async () => {
      try {
        const userTrackingData = await getUserTrackingData();
        const subscriptionUserId =
          firebaseUser?.uid || userTrackingData?.fingerprint;

        if (!subscriptionUserId) return;

        // Subscribe to form changes
        subscription = supabase
          .channel("dashboard-updates")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "forms",
              filter: `user_id=eq.${subscriptionUserId}`,
            },
            (payload) => {
              // Apply granular updates without full refetch
              const type = payload.eventType as string;
              const rowNew: any = (payload as any)?.new || {};
              const rowOld: any = (payload as any)?.old || {};
              if (type === "INSERT" && rowNew?.id) {
                setForms((prev: any[]) => {
                  // Avoid duplicates
                  if (prev.some((f: any) => f.id === rowNew.id)) return prev;
                  return [
                    {
                      ...rowNew,
                      view_count: rowNew.view_count ?? rowNew.viewCount,
                      submission_count:
                        rowNew.submission_count ?? rowNew.submissionCount,
                    } as any,
                    ...prev,
                  ];
                });
              } else if (type === "UPDATE" && rowNew?.id) {
                setForms((prev: any[]) =>
                  prev.map((f: any) =>
                    f.id === rowNew.id
                      ? {
                          ...f,
                          ...rowNew,
                          view_count:
                            rowNew.view_count ??
                            rowNew.viewCount ??
                            f.view_count,
                          submission_count:
                            rowNew.submission_count ??
                            rowNew.submissionCount ??
                            f.submission_count,
                        }
                      : f,
                  ),
                );
              } else if (type === "DELETE" && rowOld?.id) {
                setForms((prev: any[]) =>
                  prev.filter((f: any) => f.id !== rowOld.id),
                );
              }
            },
          )
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "form_submissions",
              filter: `form_id=in.(${forms.map((f) => f.id).join(",")})`,
            },
            (payload) => {
              // Update specific form submission count
              if (payload.eventType === "INSERT" && payload.new) {
                setForms(
                  (prev: DashboardForm[]) =>
                    prev.map((form) =>
                      (form as any).id === (payload as any).new.form_id
                        ? {
                            ...(form as any),
                            submissionCount:
                              ((form as any).submissionCount ||
                                (form as any).submission_count ||
                                0) + 1,
                            submission_count:
                              ((form as any).submission_count ||
                                (form as any).submissionCount ||
                                0) + 1,
                          }
                        : (form as any),
                    ) as any,
                );
              }
            },
          )
          .subscribe();
      } catch (error) {
        console.error("Error setting up real-time subscription:", error);
      }
    };

    if (firebaseUser || userTypeHelpers.isGuest(userType)) {
      setupRealtimeSubscription();
    }

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [firebaseUser, userType, getUserTrackingData, forms]);

  // Filter and sort forms
  const filteredAndSortedForms = forms
    .filter((form) => {
      const matchesSearch = form.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" || form.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.title.localeCompare(b.title);
        case "responses":
          return (
            (b.submission_count || b.submissionCount || 0) -
            (a.submission_count || a.submissionCount || 0)
          );
        case "views":
          return (
            (b.view_count || b.viewCount || 0) -
            (a.view_count || a.viewCount || 0)
          );
        case "recent":
        default:
          return (
            new Date(b.updated_at || b.created_at).getTime() -
            new Date(a.updated_at || a.created_at).getTime()
          );
      }
    });

  // Form action handlers
  const handleEditForm = (formId: string) => {
    router.push(`/builder?form=${formId}`);
    addNotification({
      type: "info",
      title: "Edit Form",
      message: "Opening form builder...",
      duration: 2000,
    });
  };

  const handleViewForm = (formId: string) => {
    const form = forms.find((f) => f.id === formId);
    if (form && form.status === "published") {
      window.open(`/forms/${formId}`, "_blank");
    } else {
      addNotification({
        type: "warning",
        title: "Form Not Published",
        message: "Please publish the form first to view it.",
        duration: 3000,
      });
    }
  };

  const handleCloneForm = async (formId: string) => {
    try {
      const response = await makeAuthenticatedRequest(
        `/api/user/forms/${formId}/clone`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to clone form: ${response.statusText}`);
      }

      const result = await response.json();
      addNotification({
        type: "success",
        title: "Form Cloned",
        message: "Form has been cloned successfully! You can now edit it.",
        duration: 3000,
      });

      // Refresh forms list
      const userTrackingData = await getUserTrackingData();
      const refreshUserId = firebaseUser?.uid || userTrackingData?.fingerprint;

      if (refreshUserId) {
        const formsResponse = await fetch(
          `/api/forms?userId=${refreshUserId}&limit=100`,
        );
        if (formsResponse.ok) {
          const data = await formsResponse.json();
          setForms(data.forms || []);
        }
      }
    } catch (error: any) {
      console.error("Clone error:", error);
      addNotification({
        type: "error",
        title: "Clone Failed",
        message: error?.message?.includes("limit reached")
          ? "You have reached your form limit. Please upgrade to create more forms."
          : "Failed to clone form. Please try again.",
        duration: 5000,
      });
    }
  };

  const handleArchiveForm = async (formId: string) => {
    try {
      const response = await makeAuthenticatedRequest(
        `/api/user/forms/${formId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: "archived" }),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to archive form: ${response.statusText}`);
      }

      addNotification({
        type: "success",
        title: "Form Archived",
        message:
          "Form has been archived successfully! You can find it in your archived forms.",
        duration: 3000,
      });

      // Update local state
      setForms((prev) =>
        prev.map((form) =>
          form.id === formId ? { ...form, status: "archived" } : form,
        ),
      );
    } catch (error: any) {
      console.error("Archive error:", error);
      addNotification({
        type: "error",
        title: "Archive Failed",
        message: "Failed to archive form. Please try again.",
        duration: 5000,
      });
    }
  };

  const confirmDelete = (formId: string) => {
    setDeleteFormId(formId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteForm = async () => {
    if (!deleteFormId) return;

    // Check if form still exists in local state
    const formExists = forms.find((f: any) => f.id === deleteFormId);
    if (!formExists) {
      console.log("⚠️ Dashboard: Form not found in local state:", deleteFormId);
      setDeleteDialogOpen(false);
      setDeleteFormId(null);
      return;
    }

    console.log("🗑️ Dashboard: Attempting to delete form:", {
      formId: deleteFormId,
      formTitle: formExists.title,
      formStatus: formExists.status,
      userId: firebaseUser?.uid || "anonymous",
    });

    try {
      const response = await makeAuthenticatedRequest(
        `/api/user/forms/${deleteFormId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        let errorMessage = response.statusText;
        let errorData = null;
        try {
          errorData = await response.json();
          if (errorData?.message) {
            errorMessage = errorData.message;
          }
        } catch (jsonError) {
          // Failed to parse error response as JSON, use status text
        }

        console.error("❌ Dashboard: Delete API error:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
          formId: deleteFormId,
          userId: firebaseUser?.uid || "anonymous",
        });

        throw new Error(`Failed to delete form: ${errorMessage}`);
      }

      // Success - parse result if available
      let result = null;
      try {
        result = await response.json();
      } catch (jsonError) {
        // Some delete endpoints may not return JSON, that's okay
      }

      addNotification({
        type: "success",
        title: "Form Deleted",
        message:
          "Form has been deleted successfully! It is permanently removed.",
        duration: 3000,
      });

      // Update local state
      setForms((prev: any[]) =>
        prev.filter((form: any) => form.id !== deleteFormId),
      );
    } catch (error: any) {
      console.error("❌ Delete error:", error);
      addNotification({
        type: "error",
        title: "Delete Failed",
        message:
          "Failed to delete form. Please ensure you have permission and try again.",
        duration: 5000,
      });
    } finally {
      setDeleteDialogOpen(false);
      setDeleteFormId(null);
    }
  };

  const handleShareForm = async (formId: string) => {
    const form = forms.find((f) => f.id === formId);
    if (!form || form.status !== "published") {
      addNotification({
        type: "warning",
        title: "Form Not Published",
        message: "Please publish the form first to share it.",
        duration: 3000,
      });
      return;
    }

    const formUrl = form.publishedUrl || getPublishedFormUrl(formId, form.slug);

    try {
      await navigator.clipboard.writeText(formUrl);
      setCopiedFormId(formId);
      addNotification({
        type: "success",
        title: "Link Copied",
        message: "Form link copied to clipboard!",
        duration: 2000,
      });

      // Reset copied state after 2 seconds
      setTimeout(() => setCopiedFormId(null), 2000);
    } catch (error: any) {
      console.error("❌ Copy error:", error);
      addNotification({
        type: "error",
        title: "Copy Failed",
        message:
          "Failed to copy link to clipboard. Please try again or copy manually.",
        duration: 3000,
      });
    }
  };

  const toggleFormExpansion = (formId: string) => {
    setExpandedForms((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(formId)) {
        newSet.delete(formId);
      } else {
        newSet.add(formId);
      }
      return newSet;
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { color: "bg-green-100 text-green-800", text: "Published" },
      draft: { color: "bg-yellow-100 text-yellow-800", text: "Draft" },
      archived: { color: "bg-gray-100 text-gray-800", text: "Archived" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  // Show loading spinner while checking authentication or fetching data
  if (isLoading || isFetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dashboard-scroll overflow-y-auto">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-sm border-b border-white/20 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-5">
              <div className="flex-1"></div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  Loading dashboard...
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content with inline loading */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <InlineLoading
              size="lg"
              text="Loading dashboard data..."
              variant="dots"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dashboard-scroll overflow-y-auto">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-sm border-b border-white/20 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-5">
              <div className="flex-1"></div>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => router.push("/builder")}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300 px-2.5 py-1 text-xs h-8"
                >
                  <PlusIcon className="h-3 w-3 mr-1" />
                  Create Form
                </Button>
                {/* export button removed per requirements */}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {forms.length > 0 ? (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="bg-gradient-to-br from-blue-50/80 to-blue-100/80 backdrop-blur-sm border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-700/80 text-xs font-semibold uppercase tracking-wider mb-2">
                          Total Forms
                        </p>
                        <p className="text-2xl font-bold text-blue-800">
                          {dashboardStats.totalForms}
                        </p>
                        <p className="text-blue-600/70 text-xs mt-1 font-medium">
                          All forms
                        </p>
                      </div>
                      <div className="bg-blue-500/20 p-2.5 rounded-xl">
                        <DocumentIcon className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50/80 to-green-100/80 backdrop-blur-sm border border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-700/80 text-xs font-semibold uppercase tracking-wider mb-2">
                          Published
                        </p>
                        <p className="text-3xl font-bold text-green-800">
                          {dashboardStats.publishedForms}
                        </p>
                        <p className="text-green-600/70 text-xs mt-1 font-medium">
                          Active forms
                        </p>
                      </div>
                      <div className="bg-green-500/20 p-3 rounded-xl">
                        <CloudArrowUpIcon className="h-8 w-8 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-700/80 text-xs font-semibold uppercase tracking-wider mb-2">
                          Responses
                        </p>
                        <p className="text-3xl font-bold text-purple-800">
                          {dashboardStats.totalResponses}
                        </p>
                        <p className="text-purple-600/70 text-xs mt-1 font-medium">
                          Total submissions
                        </p>
                      </div>
                      <div className="bg-purple-500/20 p-3 rounded-xl">
                        <ClipboardDocumentListIcon className="h-8 w-8 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50/80 to-orange-100/80 backdrop-blur-sm border border-orange-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-700/80 text-xs font-semibold uppercase tracking-wider mb-2">
                          Conversion
                        </p>
                        <p className="text-3xl font-bold text-orange-800">
                          {dashboardStats.conversionRate}%
                        </p>
                        <p className="text-orange-600/70 text-xs mt-1 font-medium">
                          Success rate
                        </p>
                      </div>
                      <div className="bg-orange-500/20 p-3 rounded-xl">
                        <ArrowTrendingUpIcon className="h-8 w-8 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Area: Filters & Forms */}
              <div className="flex flex-col gap-6 mb-8">
                {/* Horizontal Filter Bar - Compact Grid-like Array */}
                <div className="inline-flex flex-wrap items-center gap-4 bg-white/40 backdrop-blur-md p-3 rounded-2xl border border-white/40 shadow-sm w-fit max-w-full">
                  {/* Search */}
                  <div className="relative w-full sm:w-[240px]">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      type="text"
                      placeholder="Search forms..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 bg-white/80 backdrop-blur-sm border-white/50 focus:border-blue-500/50 focus:ring-blue-500/20 shadow-sm h-9 transition-all rounded-xl text-sm"
                    />
                  </div>

                  {/* Status Filter */}
                  <div className="w-[140px] shrink-0">
                    <Select
                      value={filterStatus}
                      onValueChange={setFilterStatus}
                    >
                      <SelectTrigger className="w-full bg-white/80 backdrop-blur-sm border-white/50 focus:border-blue-500/50 focus:ring-blue-500/20 shadow-sm h-9 rounded-xl text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort By */}
                  <div className="w-[160px] shrink-0">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full bg-white/80 backdrop-blur-sm border-white/50 focus:border-blue-500/50 focus:ring-blue-500/20 shadow-sm h-9 rounded-xl text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="recent">Most Recent</SelectItem>
                        <SelectItem value="name">Alphabetical</SelectItem>
                        <SelectItem value="responses">
                          Most Responses
                        </SelectItem>
                        <SelectItem value="views">Most Views</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex items-center space-x-1 bg-white/80 backdrop-blur-sm rounded-xl p-1 border border-white/50 shadow-sm shrink-0 h-9">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={viewMode === "grid" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setViewMode("grid")}
                          className="h-full px-2.5 rounded-lg"
                        >
                          <ViewColumnsIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Grid view</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={viewMode === "list" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setViewMode("list")}
                          className="h-full px-2.5 rounded-lg"
                        >
                          <ListBulletIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>List view</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* Right Area: Forms List */}
                <div className="w-full min-w-0">
                  {/* Forms List */}
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 -mt-2">
                      {filteredAndSortedForms.length === 0 ? (
                        <div className="col-span-full text-center py-10 -mt-4">
                          <div className="relative mb-8">
                            <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
                            <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-full p-8 w-24 h-24 mx-auto flex items-center justify-center">
                              <DocumentIcon className="h-12 w-12 text-gray-400 animate-bounce" />
                            </div>
                          </div>
                          <h3 className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
                            No forms found
                          </h3>
                          <p className="text-gray-600 text-xs mb-6 max-w-md mx-auto leading-relaxed">
                            Try adjusting your search or filters to find what
                            you're looking for
                          </p>
                          <div className="flex justify-center space-x-2 mt-8">
                            <div
                              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                              style={{ animationDelay: "150ms" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        filteredAndSortedForms.map((form) => (
                          <Card
                            key={form.id}
                            className="group relative overflow-hidden flex flex-col h-[280px] border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl cursor-default"
                          >
                            {/* Full Card Theme Background */}
                            <div
                              className="absolute inset-0 z-0 w-full h-full pointer-events-none"
                              style={{
                                backgroundColor:
                                  form.theme?.background_color || "#F9FAFB",
                              }}
                            >
                              <ThemeArtBackground
                                themeId={
                                  form.theme?.gallery_theme_id || "default"
                                }
                                backgroundColor={
                                  form.theme?.background_color || "transparent"
                                }
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
                              />
                              {/* Overlay to ensure text legibility while letting design pop */}
                              <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] transition-colors duration-300"></div>
                            </div>

                            {/* Content Wrapper */}
                            <CardContent className="relative z-10 p-4 flex-1 flex flex-col h-full h-full">
                              <div className="flex-1 flex flex-col justify-between w-full h-full bg-white/70 backdrop-blur-md rounded-xl p-4 border border-white/60 shadow-sm">
                                {/* Top Content Info */}
                                <div className="w-full overflow-hidden">
                                  <h3
                                    className="text-xl font-bold text-gray-900 mb-2 truncate max-w-full drop-shadow-sm"
                                    title={form.title}
                                  >
                                    {form.title}
                                  </h3>
                                  <div className="flex items-center space-x-2 mb-3">
                                    {getStatusBadge(form.status || "draft")}
                                    {form.status === "published" && (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-white/80 text-green-700 border border-green-200/50 shadow-sm">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                                        Live
                                      </span>
                                    )}
                                    <span className="text-xs text-gray-700 font-medium">
                                      {formatDate(
                                        String(
                                          form.updatedAt ||
                                            form.updated_at ||
                                            form.createdAt ||
                                            form.created_at ||
                                            new Date().toISOString(),
                                        ),
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-4 text-xs font-semibold text-gray-700">
                                    <span className="flex items-center bg-white/60 px-2.5 py-1 rounded-lg">
                                      <EyeIcon className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                                      {form.viewCount || form.view_count || 0}{" "}
                                      views
                                    </span>
                                    <span className="flex items-center bg-white/60 px-2.5 py-1 rounded-lg">
                                      <ClipboardDocumentListIcon className="h-3.5 w-3.5 mr-1.5 text-purple-600" />
                                      {form.submissionCount ||
                                        form.submission_count ||
                                        0}{" "}
                                      responses
                                    </span>
                                  </div>
                                </div>

                                {/* Form Actions (Card Footer) */}
                                <div className="pt-3 mt-4 border-t border-gray-300/30 flex items-center justify-between gap-1 overflow-x-auto hide-scrollbar">
                                  <div className="flex items-center space-x-2">
                                    {form.status !== "published" && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              handleEditForm(form.id)
                                            }
                                            className="h-8 w-8 p-0 hover:bg-blue-50"
                                          >
                                            <PencilIcon className="h-4 w-4 text-blue-600" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Edit form</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    )}

                                    {form.status !== "draft" && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              router.push(
                                                `/dashboard/responses/${form.id}`,
                                              )
                                            }
                                            className="h-8 w-8 p-0 hover:bg-indigo-50"
                                          >
                                            <ClipboardDocumentListIcon className="h-4 w-4 text-indigo-600" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>View responses</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    )}

                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleViewForm(form.id)
                                          }
                                          className="h-8 w-8 p-0 hover:bg-green-50"
                                        >
                                          <EyeIcon className="h-4 w-4 text-green-600" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>View form</p>
                                      </TooltipContent>
                                    </Tooltip>

                                    {form.status === "published" && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              handleShareForm(form.id)
                                            }
                                            className="h-8 w-8 p-0 hover:bg-purple-50"
                                          >
                                            {copiedFormId === form.id ? (
                                              <ClipboardIcon className="h-4 w-4 text-purple-600" />
                                            ) : (
                                              <ShareIcon className="h-4 w-4 text-purple-600" />
                                            )}
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>
                                            {copiedFormId === form.id
                                              ? "Link copied!"
                                              : "Share form URL"}
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    )}

                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleCloneForm(form.id)
                                          }
                                          className="h-8 w-8 p-0 hover:bg-orange-50"
                                        >
                                          <DocumentDuplicateIcon className="h-4 w-4 text-orange-600" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Clone form</p>
                                      </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleArchiveForm(form.id)
                                          }
                                          className="h-8 w-8 p-0 hover:bg-gray-50"
                                        >
                                          <ArchiveBoxIcon className="h-4 w-4 text-gray-600" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Archive form</p>
                                      </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => confirmDelete(form.id)}
                                          className="h-8 w-8 p-0 hover:bg-red-50"
                                        >
                                          <TrashIcon className="h-4 w-4 text-red-600" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Delete form</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredAndSortedForms.length === 0 ? (
                        <div className="text-center py-10 -mt-4">
                          <div className="relative mb-8">
                            <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
                            <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-full p-8 w-24 h-24 mx-auto flex items-center justify-center">
                              <DocumentIcon className="h-12 w-12 text-gray-400 animate-bounce" />
                            </div>
                          </div>
                          <h3 className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
                            No forms found
                          </h3>
                          <p className="text-gray-600 text-xs mb-6 max-w-md mx-auto leading-relaxed">
                            Try adjusting your search or filters to find what
                            you're looking for
                          </p>
                          <div className="flex justify-center space-x-2 mt-8">
                            <div
                              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                              style={{ animationDelay: "150ms" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        filteredAndSortedForms.map((form) => {
                          const isExpanded = expandedForms.has(form.id);
                          const responses = form.submissions || [];

                          return (
                            <div
                              key={form.id}
                              className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/30 shadow-sm hover:shadow-md transition-all duration-200 p-6"
                            >
                              {/* Form Header */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div
                                    className="cursor-pointer p-3 hover:bg-white/50 rounded-xl transition-all duration-200 group relative overflow-hidden"
                                    onClick={() => toggleFormExpansion(form.id)}
                                  >
                                    <div
                                      className="absolute left-0 top-0 bottom-0 w-1"
                                      style={{
                                        backgroundColor:
                                          form.brandKit?.colors?.primary ||
                                          form.theme?.primary_color ||
                                          "#2B65F8",
                                      }}
                                    />
                                    {isExpanded ? (
                                      <ChevronDownIcon className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                                    ) : (
                                      <ChevronRightIcon className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                                    )}
                                  </div>

                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                      {form.title}
                                    </h3>
                                    <div className="flex items-center space-x-4">
                                      {getStatusBadge(form.status || "draft")}
                                      <span className="text-xs text-gray-500 font-medium">
                                        {formatDate(
                                          String(
                                            form.updated_at ||
                                              form.created_at ||
                                              new Date().toISOString(),
                                          ),
                                        )}
                                      </span>
                                      <span className="text-xs text-gray-500 font-medium flex items-center">
                                        <EyeIcon className="h-3 w-3 mr-1" />
                                        {form.view_count || 0} views
                                      </span>
                                      <span className="text-xs text-gray-500 font-medium flex items-center">
                                        <ClipboardDocumentListIcon className="h-3 w-3 mr-1" />
                                        {form.submission_count || 0} responses
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-1">
                                  {form.status !== "published" && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleEditForm(form.id)
                                          }
                                          className="h-8 w-8 p-0 hover:bg-blue-50"
                                        >
                                          <PencilIcon className="h-4 w-4 text-blue-600" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Edit form</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}

                                  {form.status !== "draft" && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            router.push(
                                              `/dashboard/responses/${form.id}`,
                                            )
                                          }
                                          className="h-8 w-8 p-0 hover:bg-indigo-50"
                                        >
                                          <ClipboardDocumentListIcon className="h-4 w-4 text-indigo-600" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>View responses</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleViewForm(form.id)}
                                        className="h-8 w-8 p-0 hover:bg-green-50"
                                      >
                                        <EyeIcon className="h-4 w-4 text-green-600" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>View form</p>
                                    </TooltipContent>
                                  </Tooltip>

                                  {form.status === "published" && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleShareForm(form.id)
                                          }
                                          className="h-8 w-8 p-0 hover:bg-purple-50"
                                        >
                                          {copiedFormId === form.id ? (
                                            <ClipboardIcon className="h-4 w-4 text-purple-600" />
                                          ) : (
                                            <ShareIcon className="h-4 w-4 text-purple-600" />
                                          )}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>
                                          {copiedFormId === form.id
                                            ? "Link copied!"
                                            : "Share form URL"}
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleCloneForm(form.id)}
                                        className="h-8 w-8 p-0 hover:bg-orange-50"
                                      >
                                        <DocumentDuplicateIcon className="h-4 w-4 text-orange-600" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Clone form</p>
                                    </TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleArchiveForm(form.id)
                                        }
                                        className="h-8 w-8 p-0 hover:bg-gray-50"
                                      >
                                        <ArchiveBoxIcon className="h-4 w-4 text-gray-600" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Archive form</p>
                                    </TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => confirmDelete(form.id)}
                                        className="h-8 w-8 p-0 hover:bg-red-50"
                                      >
                                        <TrashIcon className="h-4 w-4 text-red-600" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Delete form</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </div>

                              {/* Expanded Responses Section */}
                              {isExpanded && (
                                <div className="mt-6 pl-10">
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-gray-900 mb-4">
                                      Recent Responses ({responses.length})
                                    </h4>
                                    {responses.length > 0 ? (
                                      <div className="space-y-3">
                                        {responses
                                          .slice(0, 5)
                                          .map(
                                            (response: any, index: number) => (
                                              <div
                                                key={index}
                                                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                                              >
                                                <div className="flex items-center space-x-3">
                                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <UsersIcon className="h-4 w-4 text-blue-600" />
                                                  </div>
                                                  <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                      Response #{index + 1}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                      {formatDate(
                                                        response.created_at ||
                                                          response.submitted_at,
                                                      )}
                                                    </p>
                                                  </div>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                  {response.fields?.length || 0}{" "}
                                                  fields
                                                </div>
                                              </div>
                                            ),
                                          )}
                                        {responses.length > 5 &&
                                          form.status !== "draft" && (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() =>
                                                router.push(
                                                  `/dashboard/responses/${form.id}`,
                                                )
                                              }
                                              className="w-full mt-3"
                                            >
                                              View All Responses (
                                              {responses.length})
                                            </Button>
                                          )}
                                      </div>
                                    ) : (
                                      <div className="text-center py-6">
                                        <ClipboardDocumentListIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">
                                          No responses yet
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div></div>
          )}
        </div>

        {/* No Forms - show only after first fetch completes */}
        {hasFetchedOnce && !isFetching && forms.length === 0 && (
          <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-[calc(100vh-200px)] overflow-hidden flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="text-center relative z-10">
                {/* Floating Background Elements */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-40 animate-pulse"></div>
                  <div
                    className="absolute top-1/3 right-1/4 w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full blur-2xl opacity-30 animate-pulse"
                    style={{ animationDelay: "1s" }}
                  ></div>
                  <div
                    className="absolute bottom-1/3 left-1/3 w-20 h-20 bg-blue-100 rounded-full blur-xl opacity-50 animate-pulse"
                    style={{ animationDelay: "2s" }}
                  ></div>
                </div>

                {/* Main Icon Container */}
                <div className="relative mb-4 mt-8">
                  {/* Outer Glow Ring */}
                  <div className="absolute inset-0 bg-blue-400 rounded-full blur-lg opacity-30 animate-pulse scale-110"></div>

                  {/* Middle Ring */}
                  <div className="absolute inset-2 bg-blue-300 rounded-full blur-md opacity-40 animate-pulse"></div>

                  {/* Clickable Icon */}
                  <button
                    onClick={() => router.push("/builder")}
                    className="relative bg-blue-600 hover:bg-blue-700 rounded-full p-6 w-20 h-20 mx-auto flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform cursor-pointer group border-2 border-white/20 backdrop-blur-sm"
                  >
                    <DocumentIcon className="h-8 w-8 text-white animate-bounce drop-shadow-md" />

                    {/* Sparkle Effects */}
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-300 rounded-full animate-ping opacity-75"></div>
                    <div
                      className="absolute -bottom-0.5 -left-0.5 w-1.5 h-1.5 bg-pink-300 rounded-full animate-ping opacity-60"
                      style={{ animationDelay: "0.5s" }}
                    ></div>
                  </button>
                </div>

                {/* Professional Title */}
                <div className="mb-4">
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    No Forms Found
                  </h1>
                  <p className="text-base text-gray-600 font-medium">
                    Get started by creating your first form
                  </p>
                </div>

                {/* CTA Button */}
                <div className="mb-4">
                  <Button
                    onClick={() => router.push("/builder")}
                    className="relative bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-6 py-2.5 text-sm font-semibold rounded-xl border border-white/20 backdrop-blur-sm group overflow-hidden"
                  >
                    <PlusIcon className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                    Create Your First Form
                    <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Button>
                </div>

                {/* Professional Description */}
                <div className="mb-6 max-w-xl mx-auto">
                  <p className="text-sm text-gray-600 leading-relaxed font-medium mb-4">
                    Create stunning, interactive forms that capture hearts and
                    data with our powerful form builder.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                      Professional templates
                    </div>
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
                      Real-time analytics
                    </div>
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></div>
                      Mobile-responsive design
                    </div>
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                      Secure data collection
                    </div>
                  </div>
                </div>

                {/* Animated Dots */}
                <div className="flex justify-center space-x-2 mb-6">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce shadow-md"></div>
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce shadow-md"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-600 rounded-full animate-bounce shadow-md"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>

                {/* Feature Highlights */}
                <div className="grid grid-cols-3 gap-4 text-center"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Form</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this form? This action cannot be
              undone and will permanently remove the form and all its responses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteForm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
};

export default Dashboard;
