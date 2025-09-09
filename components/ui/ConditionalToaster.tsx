'use client'

import { usePathname } from 'next/navigation'
import { Toaster } from './toaster'

// Pages that don't require authentication
const PUBLIC_PAGES = [
  '/',
  '/faq',
  '/pricing',
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
]

export function ConditionalToaster() {
  const pathname = usePathname()
  const isPublicPage = pathname ? PUBLIC_PAGES.includes(pathname) : false
  const isCleanPage = pathname ? pathname.startsWith('/forms/') : false
  
  // Don't show toaster on public pages or clean form pages
  if (isPublicPage || isCleanPage) {
    return null
  }
  
  return <Toaster />
}
