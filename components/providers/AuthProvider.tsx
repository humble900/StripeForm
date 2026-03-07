"use client";

/**
 * Hybrid Authentication Architecture with Advanced User Tracking:
 *
 * 🔥 Firebase: Handles authentication (sign in, sign up, password reset, etc.)
 * 🗄️ Supabase: Stores user data, tracks guest users, manages forms and submissions
 * 🔑 UID Strategy: Firebase UID is used as the primary key in Supabase
 * 🕵️ User Tracking: IP tracking, device fingerprinting, cookie management
 * 🛡️ Anti-Abuse: Prevents VPN abuse, cookie clearing, and form limit bypassing
 *
 * Flow:
 * 1. User visits website → IP recorded, device fingerprinted, cookies set
 * 2. Anonymous user tracking with persistent identification
 * 3. User signs in with Firebase → gets Firebase UID
 * 4. Check if user exists in Supabase using Firebase UID
 * 5. If not exists → create user in Supabase with Firebase UID
 * 6. If exists → load user data from Supabase
 * 7. Anonymous users are tracked in Supabase for analytics and abuse prevention
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
  useCallback,
} from "react";
import {
  User as FirebaseUser,
  UserCredential,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  GithubAuthProvider,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { supabase, clearSupabaseSession } from "@/lib/supabase";
import {
  getDeviceFingerprint,
  createAnonymousUserData,
} from "@/lib/fingerprint";
import {
  userTracking as userTrackingManager,
  UserTrackingData,
} from "@/lib/user-tracking";
import { User, AnonymousUser, AuthState } from "@/types";
import { useNotifications } from "@/components/providers/NotificationProvider";

// API helper functions
const apiCall = async (url: string, options: RequestInit = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // Increased to 30s timeout
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      signal: controller.signal,
      credentials: "include",
      ...options,
    });

    if (!response.ok) {
      // Try to read response text for better diagnostics, but don't throw parse errors
      let errText = response.statusText;
      try {
        errText = await response.text();
      } catch {}
      throw new Error(`API call failed (${response.status}): ${errText}`);
    }

    return response.json();
  } catch (err: any) {
    if (err?.name === "AbortError") {
      throw new Error("NETWORK_TIMEOUT");
    }
    // Normalize fetch network failures
    if (err instanceof TypeError && err.message.includes("Failed to fetch")) {
      throw new Error("NETWORK_UNREACHABLE");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
};

const getUser = async (userId: string) => {
  try {
    const result = await apiCall(`/api/user?userId=${userId}`, {
      headers: {
        Authorization: `Bearer ${userId}`,
        "x-fingerprint": userId,
      },
    });
    return result.data;
  } catch (error: any) {
    // If user not found (404), return null instead of throwing
    const errorMsg = error?.message || String(error);
    if (
      errorMsg.includes("Not Found") ||
      errorMsg.includes("404") ||
      errorMsg.includes("User not found")
    ) {
      return null;
    }
    throw error;
  }
};

const createUser = async (userData: any) => {
  const result = await apiCall("/api/user", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userData.id || "anonymous"}`,
      "x-fingerprint": userData.id,
    },
    body: JSON.stringify(userData),
  });
  return result.data;
};

const updateUser = async (userId: string, updates: any) => {
  const result = await apiCall("/api/user", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${userId}`,
      "x-fingerprint": userId,
    },
    body: JSON.stringify({ userId, updates }),
  });
  return result.data;
};

// ... keeping intermediate functions unchanged up to the hook ...
const fetchAnonymousUser = async (fingerprint: string) => {
  try {
    const result = await apiCall(
      `/api/anonymous-user?fingerprint=${fingerprint}`,
    );
    return result.data;
  } catch (error) {
    // Swallow network errors and treat as no anonymous user found
    return null;
  }
};

const createAnonymousUserAPI = async (userData: any) => {
  try {
    const result = await apiCall("/api/anonymous-user", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    return result.data;
  } catch (error) {
    // If it's a duplicate key error, try to fetch the existing user instead
    if (
      error instanceof Error &&
      (error.message.includes("duplicate key") ||
        error.message.includes("already exists"))
    ) {
      console.log("Anonymous user already exists, fetching existing user...");
      return await fetchAnonymousUser(userData.fingerprint);
    }
    // Fail soft on server errors or network issues
    return null;
  }
};

const updateAnonymousUser = async (fingerprint: string, updates: any) => {
  try {
    const result = await apiCall("/api/anonymous-user", {
      method: "PUT",
      body: JSON.stringify({ fingerprint, updates }),
    });
    return result.data;
  } catch (error) {
    // Non-critical; ignore network issues
    return null;
  }
};

const migrateAnonymousToAuthenticated = async (
  fingerprint: string,
  userId: string,
) => {
  await apiCall("/api/anonymous-user/migrate", {
    method: "POST",
    body: JSON.stringify({ fingerprint, userId }),
  });
};

const canUserCreateForm = async (userId: string) => {
  try {
    const result = await apiCall(`/api/user/form-limits?userId=${userId}`);
    return {
      canCreate: result.data.canCreateForm,
      currentCount: result.data.formCount,
      limit: 5,
    };
  } catch (error) {
    console.warn("Form limit check failed for user; defaulting:", error);
    return { canCreate: false, currentCount: 0, limit: 5 };
  }
};

const getAnonymousUserFormCount = async (fingerprint: string) => {
  try {
    const result = await apiCall(
      `/api/user/form-limits?fingerprint=${fingerprint}`,
    );
    return {
      currentCount: result.data.formCount,
      limit: 5,
    };
  } catch (error) {
    console.warn("Anonymous form count fetch failed; defaulting:", error);
    return { currentCount: 0, limit: 5 };
  }
};

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (
    email: string,
    password: string,
    name?: string,
    phoneNumber?: string,
    countryCode?: string,
  ) => Promise<UserCredential>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<any>;
  signInWithGithub: () => Promise<any>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  getAnonymousUser: () => Promise<AnonymousUser | null>;
  createAnonymousUser: () => Promise<AnonymousUser>;

  resetPassword: (email: string) => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<void>;
  debugAuthState: () => void;
  refreshAuthState: () => Promise<void>;
  ensureUserState: () => Promise<void>;
  getAuthToken: () => Promise<string | null>;
  checkAnonymousFormLimit: () => Promise<{
    canCreate: boolean;
    currentCount: number;
    limit: number;
  }>;
  checkUserFormLimit: () => Promise<{
    canCreate: boolean;
    currentCount: number;
    limit: number;
  }>;
  trackUserVisit: () => Promise<void>;
  getUserTrackingData: () => Promise<{
    ip: string;
    fingerprint: string;
    cookies: string[];
  }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true); // Start as anonymous by default

  const [isEnsuringUserState, setIsEnsuringUserState] = useState(false);
  const [userTracking, setUserTracking] = useState<{
    ip: string;
    fingerprint: string;
    lastVisit: Date;
    cookies?: string[];
  } | null>(null);
  const { addNotification } = useNotifications();

  // Track user visit immediately when component mounts and set anonymous state
  useEffect(() => {
    const initializeAnonymousState = async () => {
      try {
        // Check if we're on an admin page - skip anonymous user tracking for admin pages
        const isAdminPage = window.location.pathname.startsWith("/admin");

        if (!isAdminPage) {
          await trackUserVisit();
        }

        // If no Firebase user is authenticated, set anonymous state
        if (!auth.currentUser) {
          setIsAnonymous(true);
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      } catch (error) {
        console.warn("⚠️ Could not initialize anonymous state:", error);
        setIsAnonymous(true);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    initializeAnonymousState();
  }, []);

  // Initialize authentication state
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;

      if (!isLoading) {
        setIsLoading(true);
      }

      try {
        if (firebaseUser) {
          console.log(
            "🔥 Firebase user authenticated:",
            firebaseUser.uid,
            firebaseUser.email,
          );

          // Create preliminary user object for immediate UI update
          const preliminaryUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firebaseUser.displayName || undefined,
            avatar_url: firebaseUser.photoURL || undefined,
            is_anonymous: false,
            subscription_tier: "free",
            subscription_status: "inactive",
            form_limit: 5,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          setUser((u) => u ?? preliminaryUser);
          setIsAuthenticated(true);
          setIsAnonymous(false);

          // Check if this user was previously anonymous and convert them
          if (userTracking) {
            const anonymousUser = await fetchAnonymousUser(
              userTracking.fingerprint,
            );

            if (anonymousUser) {
              console.log("🔄 Converting anonymous user to authenticated...");
              if (userTracking) {
                const migrationResult = await migrateAnonymousToAuthenticated(
                  userTracking.fingerprint,
                  firebaseUser.uid,
                );
                console.log("✅ Migration completed:", migrationResult);

                // Trigger dashboard refresh to show migrated forms
                if (typeof window !== "undefined") {
                  localStorage.setItem("form-migrated", "true");
                  window.dispatchEvent(new CustomEvent("formMigrated"));
                }
              }
            }
          }

          try {
            // Check if user exists in our database using Firebase UID
            console.log("🗄️ Fetching user from Supabase using Firebase UID...");
            const userData = await getUser(firebaseUser.uid);

            if (userData) {
              console.log("✅ User found in database");
              // Convert database user to frontend User type
              const frontendUser: User = {
                id: userData.id,
                email: userData.email,
                name:
                  userData.firstName && userData.lastName
                    ? `${userData.firstName} ${userData.lastName}`
                    : userData.firstName || userData.lastName || undefined,
                avatar_url: userData.profile?.avatar || undefined,
                bio: userData.profile?.bio || undefined,
                company: userData.profile?.company || undefined,
                website: userData.profile?.website || undefined,
                phone:
                  userData.phoneNumber || userData.profile?.phone || undefined,
                countryCode: userData.countryCode || undefined,
                timezone: userData.profile?.timezone || undefined,
                language: userData.profile?.language || "en",
                is_anonymous: false,
                subscription_tier: userData.subscriptionTier as "free" | "pro",
                subscription_status: userData.subscriptionStatus as
                  | "active"
                  | "inactive"
                  | "cancelled",
                stripe_customer_id: userData.stripeCustomerId || undefined,
                stripe_subscription_id: undefined, // Not in schema yet
                form_limit: 5, // Default limit
                created_at:
                  userData.createdAt instanceof Date
                    ? userData.createdAt.toISOString()
                    : new Date(userData.createdAt).toISOString(),
                updated_at:
                  userData.updatedAt instanceof Date
                    ? userData.updatedAt.toISOString()
                    : new Date(userData.updatedAt).toISOString(),
              };
              setUser(frontendUser);
            } else {
              console.log("❌ User not found in database, creating...");
              const newUser = {
                id: firebaseUser.uid,
                email: firebaseUser.email || "",
                firstName: firebaseUser.displayName?.split(" ")[0] || null,
                lastName:
                  firebaseUser.displayName?.split(" ").slice(1).join(" ") ||
                  null,
              };
              const createdUser = await createUser(newUser);
              const userObject: User = {
                id: createdUser.id,
                email: createdUser.email,
                name:
                  createdUser.firstName && createdUser.lastName
                    ? `${createdUser.firstName} ${createdUser.lastName}`
                    : createdUser.firstName ||
                      createdUser.lastName ||
                      undefined,
                phone: createdUser.phoneNumber || undefined,
                countryCode: createdUser.countryCode || undefined,
                avatar_url: undefined, // Will be set later
                is_anonymous: false,
                subscription_tier: "free",
                subscription_status: "inactive",
                form_limit: 5,
                created_at:
                  createdUser.createdAt instanceof Date
                    ? createdUser.createdAt.toISOString()
                    : new Date(createdUser.createdAt).toISOString(),
                updated_at:
                  createdUser.updatedAt instanceof Date
                    ? createdUser.updatedAt.toISOString()
                    : new Date(createdUser.updatedAt).toISOString(),
              };
              setUser(userObject);
            }
          } catch (error) {
            console.error("❌ Error fetching/creating user:", error);
          }
        } else {
          console.log("🔥 Firebase user signed out - setting anonymous state");
          setUser(null);
          setIsAuthenticated(false);
          setIsAnonymous(true); // Set anonymous when signed out
        }
      } catch (error) {
        console.error("❌ Error in auth state change:", {
          error,
          message: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
          details: JSON.stringify(error, Object.getOwnPropertyNames(error)),
        });

        setUser(null);
        setIsAuthenticated(false);
        setIsAnonymous(true); // Set anonymous on error
      }

      if (isMounted) {
        setIsLoading(false);

        console.log("🔍 Final auth state:", {
          user: !!user,
          isAuthenticated,
          isAnonymous,
          isLoading: false,
        });

        // Ensure user state is properly set after loading (with guard to prevent loops)
        if (firebaseUser && !user && !isEnsuringUserState) {
          console.log("🔍 Ensuring user state after auth state change...");
          setTimeout(() => ensureUserState(), 100);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Track user visit with IP, device fingerprint, and cookies
  const trackUserVisit = async () => {
    try {
      // Use the user tracking manager
      const trackingData = await userTrackingManager.trackUserVisit();

      // Store tracking data locally
      setUserTracking({
        ip: trackingData.ip,
        fingerprint: trackingData.fingerprint,
        lastVisit: trackingData.timestamp,
      });

      // Create or update anonymous user tracking
      try {
        const existingAnonymous = await fetchAnonymousUser(
          trackingData.fingerprint,
        );

        if (existingAnonymous) {
          console.log("🔄 Updating existing anonymous user visit");
          // Update last visit and IP
          await updateAnonymousUser(trackingData.fingerprint, {
            last_ip: trackingData.ip,
            last_visit: new Date().toISOString(),
            formCount: (existingAnonymous.form_count || 0) + 1,
          });
        } else {
          console.log("🆕 Creating new anonymous user tracking");
          await createAnonymousUser();
        }
      } catch (error) {
        console.warn(
          "⚠️ Could not track anonymous user (non-critical):",
          error,
        );
      }
    } catch (error) {
      console.warn("⚠️ Could not track user visit (non-critical):", error);
    }
  };

  // Get user tracking data with caching to prevent repeated API calls
  const getUserTrackingData = async (): Promise<{
    ip: string;
    fingerprint: string;
    cookies: string[];
  }> => {
    try {
      // Return cached data if available and not expired (5 minutes)
      if (userTracking && userTracking.fingerprint !== "unknown") {
        const now = new Date().getTime();
        const lastVisit = userTracking.lastVisit
          ? new Date(userTracking.lastVisit).getTime()
          : 0;
        const fiveMinutes = 5 * 60 * 1000;

        if (now - lastVisit < fiveMinutes) {
          console.log("📊 Using cached user tracking data");
          return {
            ip: userTracking.ip,
            fingerprint: userTracking.fingerprint,
            cookies: userTracking.cookies || [],
          };
        }
      }

      // Only call trackUserVisit if we don't have recent data
      console.log("📊 Fetching fresh user tracking data");
      const trackingData = await userTrackingManager.trackUserVisit();

      // Update cached data
      setUserTracking({
        ip: trackingData.ip,
        fingerprint: trackingData.fingerprint,
        cookies: trackingData.cookies,
        lastVisit: trackingData.timestamp,
      });

      return {
        ip: trackingData.ip,
        fingerprint: trackingData.fingerprint,
        cookies: trackingData.cookies,
      };
    } catch (error) {
      console.warn("⚠️ Could not get user tracking data:", error);

      // Return cached data even if there's an error
      if (userTracking) {
        return {
          ip: userTracking.ip,
          fingerprint: userTracking.fingerprint,
          cookies: userTracking.cookies || [],
        };
      }

      return {
        ip: "unknown",
        fingerprint: "unknown",
        cookies: [],
      };
    }
  };

  // Ensure user state is properly set (with retry prevention)
  const ensureUserState = useCallback(async () => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser && !user && !isEnsuringUserState) {
      setIsEnsuringUserState(true);
      console.log("🔍 Ensuring user state is properly set...");

      try {
        const userData = await getUser(firebaseUser.uid);
        if (userData) {
          console.log("✅ User state restored from database");
          // Convert database user to frontend User type
          const frontendUser: User = {
            id: userData.id,
            email: userData.email,
            name:
              userData.firstName && userData.lastName
                ? `${userData.firstName} ${userData.lastName}`
                : userData.firstName || userData.lastName || undefined,
            avatar_url: userData.profile?.avatar || undefined,
            bio: userData.profile?.bio || undefined,
            company: userData.profile?.company || undefined,
            website: userData.profile?.website || undefined,
            phone: userData.phoneNumber || userData.profile?.phone || undefined,
            countryCode: userData.countryCode || undefined,
            timezone: userData.profile?.timezone || undefined,
            language: userData.profile?.language || "en",
            is_anonymous: false,
            subscription_tier: userData.subscriptionTier as "free" | "pro",
            subscription_status: userData.subscriptionStatus as
              | "active"
              | "inactive"
              | "cancelled",
            stripe_customer_id: userData.stripeCustomerId || undefined,
            stripe_subscription_id: undefined,
            form_limit: 5,
            created_at:
              userData.createdAt instanceof Date
                ? userData.createdAt.toISOString()
                : new Date(userData.createdAt).toISOString(),
            updated_at:
              userData.updatedAt instanceof Date
                ? userData.updatedAt.toISOString()
                : new Date(userData.updatedAt).toISOString(),
          };
          setUser(frontendUser);
          setIsAuthenticated(true);
          setIsAnonymous(false);
        } else {
          console.log("❌ User not found in database, creating...");
          const newUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            firstName: firebaseUser.displayName?.split(" ")[0] || null,
            lastName:
              firebaseUser.displayName?.split(" ").slice(1).join(" ") || null,
          };
          const createdUser = await createUser(newUser);
          const userObject: User = {
            id: createdUser.id,
            email: createdUser.email,
            name:
              createdUser.firstName && createdUser.lastName
                ? `${createdUser.firstName} ${createdUser.lastName}`
                : createdUser.firstName || createdUser.lastName || undefined,
            phone: createdUser.phoneNumber || undefined,
            countryCode: createdUser.countryCode || undefined,
            avatar_url: undefined,
            is_anonymous: false,
            subscription_tier: "free",
            subscription_status: "inactive",
            form_limit: 5,
            created_at:
              createdUser.createdAt instanceof Date
                ? createdUser.createdAt.toISOString()
                : new Date(createdUser.createdAt).toISOString(),
            updated_at:
              createdUser.updatedAt instanceof Date
                ? createdUser.updatedAt.toISOString()
                : new Date(createdUser.updatedAt).toISOString(),
          };
          setUser(userObject);
          setIsAuthenticated(true);
          setIsAnonymous(false);
        }
      } catch (error) {
        console.warn("⚠️ Failed to ensure user state (non-critical):", {
          error: error instanceof Error ? error.message : "Unknown error",
          firebaseUserId: firebaseUser?.uid,
          isNetworkError:
            error instanceof Error &&
            (error.message.includes("NETWORK_TIMEOUT") ||
              error.message.includes("NETWORK_UNREACHABLE") ||
              error.message.includes("Failed to fetch")),
        });

        if (
          error instanceof Error &&
          (error.message.includes("NETWORK_TIMEOUT") ||
            error.message.includes("NETWORK_UNREACHABLE") ||
            error.message.includes("Failed to fetch"))
        ) {
          console.log(
            "🔄 Network error detected. Preventing fake authenticated state to avoid data tearing.",
          );
          // Explicitly clear state or maintain anonymous to prevent broken downstream calls.
          setUser(null);
          setIsAuthenticated(false);
          setIsAnonymous(true);
        } else {
          // For other non-network errors (e.g., 500 internal from API but reachable), try to set basic user state from Firebase
          console.log(
            "🔄 Setting basic user state from Firebase data due to non-network error",
          );
          const basicUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firebaseUser.displayName || undefined,
            avatar_url: firebaseUser.photoURL || undefined,
            is_anonymous: false,
            subscription_tier: "free",
            subscription_status: "inactive",
            form_limit: 5,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setUser(basicUser);
          setIsAuthenticated(true);
          setIsAnonymous(false);
        }
      }

      setIsEnsuringUserState(false);
    }
  }, [
    user,
    isEnsuringUserState,
    setIsEnsuringUserState,
    setUser,
    setIsAuthenticated,
    setIsAnonymous,
  ]);

  // Rest of the functions
  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      return userCredential;
    } catch (error: any) {
      console.error("❌ Sign in error:", error);
      let message = "Failed to sign in. Please check your credentials.";
      if (error.code === "auth/user-not-found") {
        message = "No user found with this email.";
      } else if (error.code === "auth/wrong-password") {
        message = "Incorrect password. Please try again.";
      } else if (error.code === "auth/invalid-email") {
        message = "Invalid email address. Please enter a valid email.";
      } else if (error.code === "auth/too-many-requests") {
        message = "Too many failed login attempts. Please try again later.";
      }
      addNotification({
        type: "error",
        title: "Sign In Failed",
        message,
        duration: 5000,
      });
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name?: string,
    phoneNumber?: string,
    countryCode?: string,
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      if (name) {
        await updateFirebaseProfile(userCredential.user, { displayName: name });
      }

      // Create user in database with phone number
      const newUser = {
        id: userCredential.user.uid,
        email: userCredential.user.email || "",
        firstName: name?.split(" ")[0] || null,
        lastName: name?.split(" ").slice(1).join(" ") || null,
        phoneNumber: phoneNumber || null,
        countryCode: countryCode || null,
      };

      const createdUser = await createUser(newUser);
      console.log("✅ User created in database:", createdUser.id);

      addNotification({
        type: "success",
        title: "Sign Up Successful",
        message: "Your account has been created successfully!",
        duration: 3000,
      });

      return userCredential;
    } catch (error: any) {
      console.error("❌ Sign up error:", error);
      let message = "Failed to create account. Please try again.";
      if (error.code === "auth/email-already-in-use") {
        message =
          "This email is already in use. Please sign in or use a different email.";
      } else if (error.code === "auth/invalid-email") {
        message = "Invalid email address. Please enter a valid email.";
      } else if (error.code === "auth/weak-password") {
        message = "Password is too weak. Please choose a stronger password.";
      }
      addNotification({
        type: "error",
        title: "Sign Up Failed",
        message,
        duration: 5000,
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await clearSupabaseSession();
      await auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      setIsAnonymous(false);
      console.log("✅ User signed out successfully");
      addNotification({
        type: "info",
        title: "Signed Out",
        message: "You have been successfully signed out.",
        duration: 3000,
      });
    } catch (error) {
      console.error("❌ Sign out error:", error);
      addNotification({
        type: "error",
        title: "Sign Out Failed",
        message: "Failed to sign out. Please try again.",
        duration: 5000,
      });
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Use signInWithPopup instead of signInWithRedirect
      // signInWithRedirect fails in production when the app domain differs from
      // Firebase's authDomain due to cross-origin storage restrictions
      const result = await signInWithPopup(auth, provider);
      console.log("✅ Google sign in successful:", result.user.email);
      return result;
    } catch (error: any) {
      console.error("❌ Google sign in error:", error);
      // Don't show notification for user-cancelled popups
      if (
        error.code !== "auth/popup-closed-by-user" &&
        error.code !== "auth/cancelled-popup-request"
      ) {
        addNotification({
          type: "error",
          title: "Google Sign In Failed",
          message: "Failed to sign in with Google. Please try again.",
          duration: 5000,
        });
      }
      throw error;
    }
  };

  const signInWithGithub = async () => {
    try {
      const provider = new GithubAuthProvider();
      // Use signInWithPopup instead of signInWithRedirect
      // signInWithRedirect fails in production when the app domain differs from
      // Firebase's authDomain due to cross-origin storage restrictions
      const result = await signInWithPopup(auth, provider);
      console.log("✅ GitHub sign in successful:", result.user.email);
      return result;
    } catch (error: any) {
      console.error("❌ GitHub sign in error:", error);
      // Don't show notification for user-cancelled popups
      if (
        error.code !== "auth/popup-closed-by-user" &&
        error.code !== "auth/cancelled-popup-request"
      ) {
        addNotification({
          type: "error",
          title: "GitHub Sign In Failed",
          message: "Failed to sign in with GitHub. Please try again.",
          duration: 5000,
        });
      }
      throw error;
    }
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    try {
      if (!user) throw new Error("No user to update");

      const updatedUser = await updateUser(user.id, {
        ...updates,
        phoneNumber: updates.phone,
      });
      if (!updatedUser) {
        throw new Error("Failed to update user");
      }

      // Convert database user to frontend User type
      const frontendUser: User = {
        id: updatedUser.id,
        email: updatedUser.email,
        name:
          updatedUser.firstName && updatedUser.lastName
            ? `${updatedUser.firstName} ${updatedUser.lastName}`
            : updatedUser.firstName || updatedUser.lastName || undefined,
        avatar_url: undefined, // Profile not available in updateUser response
        company: undefined,
        website: undefined,
        phone: updatedUser.phoneNumber || undefined,
        countryCode: updatedUser.countryCode || undefined,
        timezone: undefined,
        language: "en",
        is_anonymous: false,
        subscription_tier: updatedUser.subscriptionTier as "free" | "pro",
        subscription_status: updatedUser.subscriptionStatus as
          | "active"
          | "inactive"
          | "cancelled",
        stripe_customer_id: updatedUser.stripeCustomerId || undefined,
        stripe_subscription_id: undefined,
        form_limit: 5,
        created_at:
          typeof updatedUser.createdAt === "string"
            ? updatedUser.createdAt
            : new Date(updatedUser.createdAt).toISOString(),
        updated_at:
          typeof updatedUser.updatedAt === "string"
            ? updatedUser.updatedAt
            : new Date(updatedUser.updatedAt).toISOString(),
      };
      setUser(frontendUser);
      console.log("✅ User profile updated successfully");
      addNotification({
        type: "success",
        title: "Profile Updated",
        message: "Your profile has been updated successfully.",
        duration: 3000,
      });
    } catch (error: any) {
      console.error("❌ Update profile error:", error);
      let message = "Failed to update profile. Please try again.";
      if (error.message.includes("Failed to update user")) {
        message =
          "Could not save your changes. Please ensure all fields are valid.";
      } else if (error.code === "permission-denied") {
        message = "You do not have permission to update this profile.";
      }
      addNotification({
        type: "error",
        title: "Profile Update Failed",
        message,
        duration: 5000,
      });
      throw error;
    }
  };

  const getAnonymousUser = async (): Promise<AnonymousUser | null> => {
    try {
      if (!userTracking) return null;
      const anonymousUser = await fetchAnonymousUser(userTracking.fingerprint);
      if (!anonymousUser) return null;

      // Convert database anonymous user to frontend AnonymousUser type
      return {
        fingerprint: anonymousUser.fingerprint,
        ip_address: "unknown", // Not stored in database
        user_agent: "unknown", // Not stored in database
        form_count: anonymousUser.form_count,
        created_at: anonymousUser.created_at,
        last_seen: anonymousUser.last_seen,
      };
    } catch (error) {
      console.error("❌ Get anonymous user error:", error);
      return null;
    }
  };

  const createAnonymousUser = async (): Promise<AnonymousUser> => {
    try {
      // If no tracking data is available, try to get it first
      if (!userTracking) {
        console.log(
          "🔄 No tracking data available, fetching tracking data first...",
        );
        const trackingData = await userTrackingManager.trackUserVisit();
        setUserTracking({
          ip: trackingData.ip,
          fingerprint: trackingData.fingerprint,
          lastVisit: trackingData.timestamp,
        });
      }

      const anonymousUserData = await createAnonymousUserData();
      const createdUser = await createAnonymousUserAPI(anonymousUserData);
      console.log(
        "✅ Anonymous user create API responded",
        createdUser ? "with data" : "(null/fail-soft)",
      );
      // Convert or fallback to a minimal anonymous user object
      const base = createdUser ?? {
        fingerprint: anonymousUserData.fingerprint,
        form_count: 0,
        created_at: new Date().toISOString(),
        last_seen: new Date().toISOString(),
      };
      return {
        fingerprint: base.fingerprint,
        ip_address: "unknown", // Not stored in database
        user_agent: "unknown", // Not stored in database
        form_count: base.form_count || 0,
        created_at: base.created_at,
        last_seen: base.last_seen,
      };
    } catch (error) {
      console.error("❌ Create anonymous user error:", error);
      // Final fail-soft fallback to prevent crashes
      const fp = userTracking?.fingerprint || "unknown";
      return {
        fingerprint: fp,
        ip_address: "unknown",
        user_agent: "unknown",
        form_count: 0,
        created_at: new Date().toISOString(),
        last_seen: new Date().toISOString(),
      };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log("✅ Password reset email sent successfully");
      addNotification({
        type: "success",
        title: "Password Reset Email Sent",
        message: "A password reset link has been sent to your email address.",
        duration: 5000,
      });
    } catch (error: any) {
      console.error("❌ Password reset error:", error);
      let message = "Failed to send password reset email. Please try again.";
      if (error.code === "auth/user-not-found") {
        message = "No user found with this email address.";
      } else if (error.code === "auth/invalid-email") {
        message = "Invalid email address. Please enter a valid email.";
      }
      addNotification({
        type: "error",
        title: "Password Reset Failed",
        message,
        duration: 5000,
      });
      throw error;
    }
  };

  const updateDisplayName = async (displayName: string) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("No user to update");

      await updateFirebaseProfile(currentUser, { displayName });
      console.log("✅ Display name updated successfully");
      addNotification({
        type: "success",
        title: "Display Name Updated",
        message: "Your display name has been updated.",
        duration: 3000,
      });
    } catch (error: any) {
      console.error("❌ Update display name error:", error);
      addNotification({
        type: "error",
        title: "Display Name Update Failed",
        message: "Failed to update display name. Please try again.",
        duration: 5000,
      });
      throw error;
    }
  };

  const debugAuthState = () => {
    console.group("🔍 Auth State Debug");
    console.log("User:", user);
    console.log("Is Authenticated:", isAuthenticated);
    console.log("Is Anonymous:", isAnonymous);
    console.log("Is Loading:", isLoading);

    console.log("Firebase User:", auth.currentUser);
    console.log("User Tracking:", userTracking);
    console.groupEnd();
  };

  const refreshAuthState = async () => {
    try {
      console.log("🔄 Refreshing auth state...");
      await ensureUserState();
      console.log("✅ Auth state refreshed successfully");
      addNotification({
        type: "info",
        title: "Authentication Refreshed",
        message: "Your authentication status has been refreshed.",
        duration: 3000,
      });
    } catch (error: any) {
      console.error("❌ Refresh auth state error:", error);
      addNotification({
        type: "error",
        title: "Refresh Failed",
        message: error?.message?.includes("NETWORK_TIMEOUT")
          ? "Network timeout. Please check your connection."
          : "Failed to refresh authentication. Please try again.",
        duration: 5000,
      });
      throw error;
    }
  };

  const getAuthToken = async (): Promise<string | null> => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken();
        return token;
      }
      return null;
    } catch (error) {
      console.error("❌ Failed to get auth token:", error);
      return null;
    }
  };

  const checkAnonymousFormLimit = async (): Promise<{
    canCreate: boolean;
    currentCount: number;
    limit: number;
  }> => {
    try {
      if (!userTracking) {
        return { canCreate: false, currentCount: 0, limit: 5 };
      }

      const anonymousUser = await fetchAnonymousUser(userTracking.fingerprint);
      if (!anonymousUser) {
        return { canCreate: true, currentCount: 0, limit: 5 };
      }

      const formCountData = await getAnonymousUserFormCount(
        userTracking.fingerprint,
      );
      const canCreate = formCountData.currentCount < formCountData.limit;

      return {
        canCreate,
        currentCount: formCountData.currentCount,
        limit: formCountData.limit,
      };
    } catch (error) {
      console.error("❌ Check form limit error:", error);
      return { canCreate: false, currentCount: 0, limit: 5 };
    }
  };

  const checkUserFormLimit = async (): Promise<{
    canCreate: boolean;
    currentCount: number;
    limit: number;
  }> => {
    try {
      if (!user) {
        return { canCreate: false, currentCount: 0, limit: 5 };
      }

      return await canUserCreateForm(user.id);
    } catch (error) {
      console.error("❌ Check user form limit error:", error);
      return { canCreate: false, currentCount: 0, limit: 5 };
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    isAnonymous,

    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithGithub,
    updateUserProfile,
    getAnonymousUser,
    createAnonymousUser,

    resetPassword,
    updateDisplayName,
    debugAuthState,
    refreshAuthState,
    ensureUserState, // Use the memoized version
    getAuthToken,
    checkAnonymousFormLimit,
    checkUserFormLimit,
    trackUserVisit,
    getUserTrackingData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
