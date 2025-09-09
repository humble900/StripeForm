'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { Providers } from './Providers'
import { AuthProvider } from './AuthProvider'
import { NotificationProvider } from './NotificationProvider'

interface ConditionalProvidersProps {
  children: ReactNode
}

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

export function ConditionalProviders({ children }: ConditionalProvidersProps) {
  const pathname = usePathname()
  
  // Check if current page is public
  const isPublicPage = pathname ? PUBLIC_PAGES.includes(pathname) : false
  
  // Pages that need authentication providers (login, register, pricing uses useAuth)
  const authPages = ['/login', '/register', '/pricing']
  const needsAuth = pathname ? authPages.includes(pathname) : false
  
  if (needsAuth) {
    // For login/register pages, provide authentication providers
    return (
      <NotificationProvider>
        {children}
      </NotificationProvider>
    )
  }
  
  if (isPublicPage) {
    // For other public pages, only provide basic providers without authentication
    return (
      <>
        {children}
      </>
    )
  }
  
  // For protected pages, provide full authentication
  return (
    <Providers>
      {children}
    </Providers>
  )
}
