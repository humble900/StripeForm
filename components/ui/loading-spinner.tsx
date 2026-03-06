import React from 'react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  centered?: boolean
  text?: string
  fullScreen?: boolean
  variant?: 'default' | 'accent'
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className,
  centered = false,
  text,
  fullScreen = false,
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div
        className={cn(
          'rounded-full',
          variant === 'accent' ? 'loading-spinner-accent' : 'loading-spinner-enhanced',
          sizeClasses[size],
          className
        )}
      />
      {text && (
        <p className="text-sm text-gray-600 font-medium loading-text-enhanced">
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    )
  }

  if (centered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {spinner}
      </div>
    )
  }

  return spinner
}

export default LoadingSpinner 