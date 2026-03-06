import { useState, useEffect } from 'react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

export type UserType = 'guest' | 'authenticated' | 'pro' | 'admin'

export interface UserTypeInfo {
  type: UserType
  firebaseUser: any | null
  userId: string | null
  isLoading: boolean
  error: string | null
}

export function useUserType() {
  const [userTypeInfo, setUserTypeInfo] = useState<UserTypeInfo>({
    type: 'guest',
    firebaseUser: null,
    userId: null,
    isLoading: true,
    error: null
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is authenticated via Firebase
          console.log('🔥 User authenticated:', firebaseUser.uid, firebaseUser.email)
          
          try {
            // Get user data from database to determine type
            const response = await fetch(`/api/user?userId=${firebaseUser.uid}`)
            if (response.ok) {
              const userData = await response.json()
              if (userData.success && userData.data) {
                const dbUser = userData.data
                // Determine user type based on role and subscription
                let type: UserType = 'authenticated'
                
                if (dbUser.role === 'admin' || dbUser.role === 'super_admin') {
                  type = 'admin'
                } else if (dbUser.subscriptionTier === 'pro' && dbUser.subscriptionStatus === 'active') {
                  type = 'pro'
                }
                
                setUserTypeInfo({
                  type,
                  firebaseUser,
                  userId: firebaseUser.uid,
                  isLoading: false,
                  error: null
                })
                return
              }
            }
            
            // Default for authenticated users without database record
            setUserTypeInfo({
              type: 'authenticated',
              firebaseUser,
              userId: firebaseUser.uid,
              isLoading: false,
              error: null
            })
          } catch (error) {
            console.warn('Could not fetch user data, defaulting to authenticated:', error)
            setUserTypeInfo({
              type: 'authenticated',
              firebaseUser,
              userId: firebaseUser.uid,
              isLoading: false,
              error: null
            })
          }
        } else {
          // No Firebase user - guest user
          console.log('🔍 No Firebase user - guest mode')
          setUserTypeInfo({
            type: 'guest',
            firebaseUser: null,
            userId: null,
            isLoading: false,
            error: null
          })
        }
      } catch (error) {
        console.error('Error determining user type:', error)
        setUserTypeInfo({
          type: 'guest',
          firebaseUser: null,
          userId: null,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    })

    return () => unsubscribe()
  }, [])

  return userTypeInfo
}

// Helper functions for user type checks
export const userTypeHelpers = {
  isGuest: (type: UserType) => type === 'guest',
  isAuthenticated: (type: UserType) => type === 'authenticated',
  isPro: (type: UserType) => type === 'pro',
  isAdmin: (type: UserType) => type === 'admin',
  
  canPublishForms: (type: UserType) => {
    // Admins and pro users can publish unlimited forms
    // Authenticated users can publish 5 forms
    // Guest users can publish 5 forms
    return true // All user types can publish, but with different limits
  },
  
  getPublishLimit: (type: UserType) => {
    switch (type) {
      case 'admin':
        return Infinity // Unlimited
      case 'pro':
        return Infinity // Unlimited
      case 'authenticated':
        return 5
      case 'guest':
        return 5
      default:
        return 5
    }
  },
  
  canCreateForms: (type: UserType) => {
    // All user types can create unlimited forms (in draft)
    return true
  },
  
  canAccessAdvancedFeatures: (type: UserType) => {
    return type === 'pro' || type === 'admin'
  },
  
  canAccessAdminPanel: (type: UserType) => {
    return type === 'admin'
  }
}


