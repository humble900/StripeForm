'use client'

import { ReactNode } from 'react'
import { AuthProvider } from './AuthProvider'
import { FormBuilderProvider } from './FormBuilderProvider'
import { NotificationProvider } from './NotificationProvider'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <NotificationProvider>
      <AuthProvider>
        <FormBuilderProvider>
          {children}
        </FormBuilderProvider>
      </AuthProvider>
    </NotificationProvider>
  )
} 