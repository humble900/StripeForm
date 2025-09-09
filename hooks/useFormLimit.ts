'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'

import { getDeviceFingerprint } from '@/lib/fingerprint'

interface FormLimitStatus {
  currentCount: number
  limit: number
  remaining: number
  canCreate: boolean
  isLoading: boolean
  error: string | null
}

export function useFormLimit() {
  const { isAuthenticated, isAnonymous, isLoading: authLoading, user } = useAuth()
  const [status, setStatus] = useState<FormLimitStatus>({
    currentCount: 0,
    limit: 5,
    remaining: 5,
    canCreate: true,
    isLoading: true, // Start loading until auth is determined
    error: null
  })

  const checkFormLimit = async () => {
    if (authLoading) return // Wait for auth to load
    
    if (isAuthenticated && user) {
      // Check if user is Pro - Pro users have unlimited forms
      if (user.subscription_tier === 'pro') {
        setStatus({
          currentCount: 0,
          limit: -1, // -1 indicates unlimited
          remaining: -1,
          canCreate: true,
          isLoading: false,
          error: null
        })
        return
      }
      
      // Non-Pro authenticated users have form limits (5 forms)
      try {
        setStatus(prev => ({ ...prev, isLoading: true, error: null }))
        
        const response = await fetch(`/api/user/form-limits?userId=${user.id}`)
        
        if (response.ok) {
          const data = await response.json()
          const formCount = data.data
          
          setStatus({
            currentCount: formCount.formCount,
            limit: 5, // Non-Pro users have a limit of 5
            remaining: Math.max(0, 5 - formCount.formCount),
            canCreate: formCount.formCount < 5,
            isLoading: false,
            error: null
          })
        } else {
          throw new Error('Failed to fetch form limits')
        }
      } catch (error) {
        console.error('Error checking form limit:', error)
        setStatus(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to check form limit'
        }))
      }
      return
    }

    if (isAnonymous) {
      // Anonymous users have form limits
      try {
        setStatus(prev => ({ ...prev, isLoading: true, error: null }))
        
        const fingerprint = await getDeviceFingerprint()
        const response = await fetch(`/api/user/form-limits?fingerprint=${fingerprint}`)
        
        if (response.ok) {
          const data = await response.json()
          const formCount = data.data
          
          setStatus({
            currentCount: formCount.formCount,
            limit: 5, // Anonymous users have a limit of 5
            remaining: Math.max(0, 5 - formCount.formCount),
            canCreate: formCount.formCount < 5,
            isLoading: false,
            error: null
          })
        } else {
          throw new Error('Failed to fetch form limits')
        }
      } catch (error) {
        console.error('Error checking form limit:', error)
        setStatus(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to check form limit'
        }))
      }
    } else {
      // Neither authenticated nor anonymous - still loading
      setStatus(prev => ({ ...prev, isLoading: true }))
    }
  }

  const incrementFormCount = async () => {
    if (isAuthenticated) return // No need to track for authenticated users
    
    try {
      const fingerprint = await getDeviceFingerprint()
      // For now, just update local state since we don't have an API route for incrementing
      // The actual increment should happen when a form is published
      setStatus(prev => ({
        ...prev,
        currentCount: prev.currentCount + 1,
        remaining: Math.max(0, prev.remaining - 1),
        canCreate: prev.remaining > 1
      }))
    } catch (error) {
      console.error('Error incrementing form count:', error)
    }
  }

  useEffect(() => {
    checkFormLimit()
  }, [isAuthenticated, isAnonymous, authLoading])

  return {
    ...status,
    checkFormLimit,
    incrementFormCount,
    isUnlimited: isAuthenticated && user?.subscription_tier === 'pro'
  }
}


