'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { ChatBubbleOvalLeftEllipsisIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface WhatsAppButtonProps {
  className?: string
  showText?: boolean
  position?: 'fixed' | 'inline'
}

export default function WhatsAppButton({ 
  className = '', 
  showText = true, 
  position = 'fixed' 
}: WhatsAppButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  const baseClasses = position === 'fixed' 
    ? 'fixed bottom-6 right-6 z-50' 
    : 'inline-flex'

  return (
    <a
      href="https://wa.me/message/AU6WGM7HEG63M1"
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseClasses} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group">
        {position === 'fixed' ? (
          <div className="flex items-center space-x-3 px-4 py-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6" />
            </div>
            {showText && (
              <div className={`transition-all duration-300 ${
                isHovered ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0'
              } overflow-hidden whitespace-nowrap`}>
                <span className="text-sm font-medium">Chat with us</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-2 px-4 py-2">
            <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5" />
            {showText && <span className="text-sm font-medium">WhatsApp</span>}
          </div>
        )}
      </div>
    </a>
  )
}

// Floating WhatsApp button for global use
export function FloatingWhatsAppButton() {
  const pathname = usePathname()
  const isCleanPage = pathname ? (
    pathname.startsWith('/forms/') ||
    pathname.startsWith('/builder') ||
    pathname.includes('/preview')
  ) : false
  
  // Don't show WhatsApp button on clean form pages
  if (isCleanPage) {
    return null
  }
  
  return (
    <WhatsAppButton 
      position="fixed"
      showText={true}
      className="animate-pulse hover:animate-none"
    />
  )
}

