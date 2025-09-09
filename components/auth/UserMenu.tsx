'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { 
  UserIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  ShieldCheckIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function UserMenu() {
  const { user, signOut, isAuthenticated, ensureUserState } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Ensure user state is properly set when component mounts (silently in background)
  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Run this silently in the background without showing loading states
      ensureUserState().catch(console.error)
    }
  }, [isAuthenticated, user, ensureUserState])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Show unauthenticated state immediately (no loading)
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center space-x-4">
        <Link href="/login" prefetch={true}>
          <Button variant="ghost" size="sm" className="text-gray-700 hover:text-[#6C5CE7] hover:bg-gray-50">
            Sign In
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="relative" ref={menuRef}>
              <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:ring-offset-2"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-[#6C5CE7] to-[#8B5CF6] rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm">
            {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-gray-900">
              {user.name || 'User'}
            </p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-semibold">
                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant={user.subscription_status === 'active' ? 'default' : 'secondary'} className="text-xs">
                    {user.subscription_tier}
                  </Badge>
                  <Badge variant={user.subscription_status === 'active' ? 'default' : 'secondary'} className="text-xs">
                    {user.subscription_status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link href="/profile" prefetch={true}>
              <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                <UserIcon className="w-4 h-4 mr-3 text-gray-400" />
                Profile
              </button>
            </Link>

            <Link href="/profile?tab=security" prefetch={true}>
              <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                <ShieldCheckIcon className="w-4 h-4 mr-3 text-gray-400" />
                Security
              </button>
            </Link>

            <Link href="/profile?tab=subscription" prefetch={true}>
              <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                <CreditCardIcon className="w-4 h-4 mr-3 text-gray-400" />
                Subscription
              </button>
            </Link>

            <Link href="/profile?tab=preferences" prefetch={true}>
              <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                <Cog6ToothIcon className="w-4 h-4 mr-3 text-gray-400" />
                Settings
              </button>
            </Link>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-1"></div>

          {/* Sign Out */}
          <div className="py-1">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3 text-red-400" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
