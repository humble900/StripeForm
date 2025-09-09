'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  DocumentDuplicateIcon,
  Cog6ToothIcon,
  UserIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import UserMenu from '@/components/auth/UserMenu'
import { useAuth } from '@/components/providers/AuthProvider'

export function Navigation() {
  const pathname = usePathname()
  const { isAuthenticated, user } = useAuth()

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
            {/* Always show UserMenu - no loading states */}
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  )
} 