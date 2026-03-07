"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DocumentDuplicateIcon,
  Cog6ToothIcon,
  UserIcon,
  SparklesIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import UserMenu from "@/components/auth/UserMenu";
import { useAuth } from "@/components/providers/AuthProvider";

// Pages that don't require authentication
const PUBLIC_PAGES = [
  "/",
  "/faq",
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
  "/templates",
];

// Pages that should not show navigation (clean form pages and admin pages)
const CLEAN_PAGES = ["/forms", "/admin", "/builder"];

export function ConditionalNavigation() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const isPublicPage = pathname ? PUBLIC_PAGES.includes(pathname) : false;
  const isCleanPage = pathname
    ? CLEAN_PAGES.some((cleanPage) => pathname.startsWith(cleanPage))
    : false;

  if (isCleanPage) {
    return null;
  }

  if (isAuthenticated) {
    return <AuthenticatedNavigation />;
  }

  if (isPublicPage) {
    return <PublicNavigation />;
  }

  return <AuthenticatedNavigation />;
}

function PublicNavigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track scroll for glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  let publicNavigation = [
    { name: "Features", href: "/features" },
    { name: "Templates", href: "/templates" },
    { name: "FAQ", href: "/faq" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  if (pathname === "/") {
    publicNavigation = publicNavigation.filter(
      (item) => item.name !== "Templates",
    );
  }

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-nav shadow-sm" : "bg-white/0"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-xl font-extrabold gradient-text-brand">
                  StripeForm
                </span>
                <span className="bg-brand/10 text-brand text-xs px-2 py-0.5 rounded-full font-semibold">
                  BETA
                </span>
              </Link>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
              {publicNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    prefetch={true}
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "text-brand bg-brand-50"
                        : "text-text-body hover:text-text-primary-dark hover:bg-gray-50"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              className="sm:hidden inline-flex items-center justify-center p-2 rounded-lg text-text-body hover:text-text-primary-dark hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand"
              aria-label="Open menu"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
            <Link
              href="/login"
              className="text-text-body hover:text-text-primary-dark px-3 py-2 rounded-lg text-sm font-medium hidden sm:inline-block transition-colors"
            >
              Sign In
            </Link>
            {pathname === "/" && (
              <Link
                href="/builder"
                className="btn-glow bg-brand text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-brand-dark hidden sm:inline-flex items-center transition-all"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
        {mobileOpen && (
          <div className="sm:hidden pb-4 space-y-1 animate-fade-in">
            {publicNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${isActive ? "bg-brand-50 text-brand" : "text-text-body hover:bg-gray-50 hover:text-text-primary-dark"}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.name}
                </Link>
              );
            })}
            <Link
              href="/login"
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-text-body hover:bg-gray-50 hover:text-text-primary-dark"
              onClick={() => setMobileOpen(false)}
            >
              Sign In
            </Link>
            {pathname === "/" && (
              <Link
                href="/builder"
                className="block px-3 py-2.5 rounded-xl text-base font-semibold bg-brand text-white text-center"
                onClick={() => setMobileOpen(false)}
              >
                Get Started
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

function AuthenticatedNavigation() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: UserIcon },
    { name: "Create Form", href: "/builder", icon: Cog6ToothIcon },
    { name: "Templates", href: "/templates", icon: SparklesIcon },
    { name: "NPS Analytics", href: "/analytics", icon: DocumentDuplicateIcon },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-nav shadow-sm" : "bg-white border-b border-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-xl font-extrabold gradient-text-brand">
                  StripeForm
                </span>
                <span className="bg-brand/10 text-brand text-xs px-2 py-0.5 rounded-full font-semibold">
                  BETA
                </span>
              </Link>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    prefetch={true}
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "text-brand bg-brand-50"
                        : "text-text-body hover:text-text-primary-dark hover:bg-gray-50"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              className="sm:hidden inline-flex items-center justify-center p-2 rounded-lg text-text-body hover:text-text-primary-dark hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand"
              aria-label="Open menu"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
            <UserMenu />
          </div>
        </div>
        {mobileOpen && (
          <div className="sm:hidden pb-4 space-y-1 animate-fade-in">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${isActive ? "bg-brand-50 text-brand" : "text-text-body hover:bg-gray-50 hover:text-text-primary-dark"}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
