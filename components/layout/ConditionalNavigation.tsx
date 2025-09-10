'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  DocumentDuplicateIcon,
  Cog6ToothIcon,
  UserIcon,
  SparklesIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import UserMenu from '@/components/auth/UserMenu'
import { useAuth } from '@/components/providers/AuthProvider'

// Pages that don't require authentication
const PUBLIC_PAGES = [
  '/',
  '/faq',
  // '/pricing', // pricing should use authenticated interface
  '/features',
  '/about',
  '/contact',
  '/help',
  '/guides',
  '/blog',
  '/privacy',
  '/terms',
  '/integrations',
  '/enterprise',
  '/login',
  '/register',
  '/templates',
]

// Pages that should not show navigation (clean form pages and admin pages)
const CLEAN_PAGES = [
  '/forms',
  '/admin',
]

export function ConditionalNavigation() {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()
  const isPublicPage = pathname ? PUBLIC_PAGES.includes(pathname) : false
  const isCleanPage = pathname ? pathname.startsWith('/forms/') : false
  
  if (isCleanPage) {
    return null // Don't show navigation for form pages
  }
  
  if (isAuthenticated) {
    return <AuthenticatedNavigation />
  }

  if (isPublicPage) {
    return <PublicNavigation />
  }

  return <AuthenticatedNavigation />
}

function PublicNavigation() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  
  let publicNavigation = [
    { name: 'Features', href: '/features' },
    // Pricing removed from header per requirement
    { name: 'Templates', href: '/templates' },
    { name: 'FAQ', href: '/faq' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]
  
  // Hide "Templates" on the landing page for public view
  if (pathname === '/') {
    publicNavigation = publicNavigation.filter(item => item.name !== 'Templates');
  }
  
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-[#6C5CE7] flex items-center">
                <span>StripeForm</span>
                <span className="ml-2 bg-[#6C5CE7] text-white text-xs px-2 py-1 rounded-full font-medium">BETA</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {publicNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    prefetch={true}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-[#6C5CE7] text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
              aria-label="Open menu"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
            <Link
              href="/login"
              className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium hidden sm:inline-block"
            >
              Sign In
            </Link>
            {pathname === '/' && (
              <Link
                href="/builder"
                className="bg-[#6C5CE7] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#5a4fd1] hidden sm:inline-block"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
        {mobileOpen && (
          <div className="sm:hidden pb-4 space-y-1">
            {publicNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.name}
                </Link>
              )
            })}
            <Link href="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900" onClick={() => setMobileOpen(false)}>
              Sign In
            </Link>
            {pathname === '/' && (
              <Link href="/builder" className="block px-3 py-2 rounded-md text-base font-medium bg-[#6C5CE7] text-white" onClick={() => setMobileOpen(false)}>
                Get Started
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

function AuthenticatedNavigation() {
  const pathname = usePathname()
  const { isAuthenticated, user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: UserIcon },
    { name: 'Create Form', href: '/builder', icon: Cog6ToothIcon },
    { name: 'Templates', href: '/templates', icon: SparklesIcon },
    { name: 'NPS Analytics', href: '/analytics', icon: DocumentDuplicateIcon },
  ]
  
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-[#6C5CE7] flex items-center">
                <span>StripeForm</span>
                <span className="ml-2 bg-[#6C5CE7] text-white text-xs px-2 py-1 rounded-full font-medium">BETA</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    prefetch={true}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-[#6C5CE7] text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
              aria-label="Open menu"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
            <UserMenu />
          </div>
        </div>
        {mobileOpen && (
          <div className="sm:hidden pb-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </nav>
  )
}
