"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Providers } from "./Providers";
import { AuthProvider } from "./AuthProvider";
import { NotificationProvider } from "./NotificationProvider";

interface ConditionalProvidersProps {
  children: ReactNode;
}

// Pages that don't require authentication
const PUBLIC_PAGES = [
  "/",
  "/faq",
  "/pricing",
  "/features",
  "/about",
  "/contact",
  "/help",
  "/guides",
  "/blog",
  "/privacy",
  "/terms",
  "/integrations",
  "/enterprise",
  "/login",
  "/register",
];

// Admin pages that use custom authentication (not Firebase)
const ADMIN_PAGES = ["/admin", "/admin/login", "/admin/faq"];

export function ConditionalProviders({ children }: ConditionalProvidersProps) {
  const pathname = usePathname();

  // Check if current page is public
  const isPublicPage = pathname ? PUBLIC_PAGES.includes(pathname) : false;

  // Check if current page is admin (uses custom auth, not Firebase)
  const isAdminPage = pathname
    ? ADMIN_PAGES.some((adminPath) => pathname.startsWith(adminPath))
    : false;

  // Pages that need authentication providers (login, register, pricing uses useAuth)
  const authPages = ["/login", "/register", "/pricing"];
  const needsAuth = pathname ? authPages.includes(pathname) : false;

  if (isAdminPage) {
    // For admin pages, don't provide Firebase authentication
    return <NotificationProvider>{children}</NotificationProvider>;
  }

  if (needsAuth) {
    // For login/register pages, provide authentication providers
    // AuthProvider is required so that onAuthStateChanged fires after OAuth redirects
    // and so useAuth() works for signIn/signUp/signInWithGoogle/signInWithGithub
    return (
      <NotificationProvider>
        <AuthProvider>{children}</AuthProvider>
      </NotificationProvider>
    );
  }

  if (isPublicPage) {
    // For other public pages, only provide basic providers without authentication
    return <>{children}</>;
  }

  // For protected pages, provide full authentication
  return <Providers>{children}</Providers>;
}
