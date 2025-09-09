'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ChartBarIcon, 
  DocumentTextIcon,
  UsersIcon, 
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { Form, FormField, FieldType } from '@/types'
// Database operations now handled via API routes
import { useAuth } from '@/components/providers/AuthProvider'
import { useNotifications } from '@/components/providers/NotificationProvider'

export default function AnalyticsPage() {
  const [selectedForm, setSelectedForm] = useState<string>('')
  const [isLoadingResponses, setIsLoadingResponses] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [forms, setForms] = useState<Form[]>([])
  const [responses, setResponses] = useState<Record<string, any[]>>({})
  const [isLoadingForms, setIsLoadingForms] = useState(true)

  const { user, isAuthenticated, isAnonymous, getUserTrackingData } = useAuth()
  const { addNotification } = useNotifications()

  // Fetch user's forms - optimized to load quickly
  useEffect(() => {
    const fetchForms = async () => {
      if (!isAuthenticated && !isAnonymous) {
        console.log('📊 Analytics: Not authenticated and not anonymous, skipping form fetch')
        return
      }
      
      try {
        setIsLoadingForms(true)
        let userId = ''
        
        if (isAuthenticated && user) {
          userId = user.id
          console.log('📊 Analytics: Using authenticated user ID:', userId)
        } else if (isAnonymous) {
          // For anonymous users, use their device fingerprint
          console.log('📊 Analytics: Getting fingerprint for anonymous user...')
          try {
            const trackingData = await getUserTrackingData()
            userId = trackingData.fingerprint
            console.log('📊 Analytics: Using anonymous fingerprint:', userId)
          } catch (fingerprintError) {
            console.error('📊 Analytics: Error getting fingerprint:', fingerprintError)
            // Fallback to empty - show "no forms" state
            setForms([])
            return
          }
        }
        
        if (!userId) {
          console.log('📊 Analytics: No user ID available')
          setForms([])
          return
        }
        
        console.log('📊 Analytics: Fetching forms for user:', userId)
        // Use API route instead of direct database call
        let userForms = []
        try {
          const response = await fetch('/api/user/forms?summary=true', {
            headers: {
              'Authorization': `Bearer ${userId}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            userForms = data.data || [];
            console.log('📊 Analytics: getUserForms result:', userForms)
          }
          // Convert database forms to frontend Form type
          const convertedForms = (userForms || []).map((form: any) => ({
            id: form.id,
            title: form.title,
            description: form.description || '',
            // Summary payload does not include fields/settings/theme for speed
            fields: [],
            settings: undefined as any,
            theme: undefined as any,
            created_at: form.createdAt ? new Date(form.createdAt).toISOString() : undefined,
            updated_at: form.updatedAt ? new Date(form.updatedAt).toISOString() : undefined,
            user_id: form.userId,
            is_published: form.status === 'published' || form.isPublished === true,
            published_url: (form.publishedUrl) || (form.status === 'published' ? `/forms/${form.slug}` : undefined),
            response_count: form.submissionCount || 0,
          }))
          setForms(convertedForms)
        } catch (dbError) {
          console.error('📊 Analytics: Database error details:', {
            error: dbError,
            userId,
            errorType: typeof dbError,
            errorString: JSON.stringify(dbError),
            errorMessage: dbError instanceof Error ? dbError.message : 'Unknown error'
          })
          

          
          // If everything fails, set empty forms array and continue
          setForms([])
          throw dbError // Re-throw for outer catch
        }
        
        console.log('📊 Analytics: Loaded forms:', userForms?.length || 0, 'forms')
      } catch (error) {
        console.error('📊 Analytics: Error fetching forms:', error)
        // Don't show error notification for anonymous users with no forms
        if (isAuthenticated) {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to load forms. Please try again.',
        })
        }
        setForms([]) // Set empty array on error
      } finally {
        setIsLoadingForms(false)
      }
    }

    fetchForms()
  }, [user, isAuthenticated, isAnonymous, getUserTrackingData, addNotification])

  // Fetch responses for selected form - only when form is selected
  useEffect(() => {
    const fetchResponses = async () => {
      if (!selectedForm) {
        setResponses({}) // Clear responses when no form selected
        return
      }
      
      try {
        setIsLoadingResponses(true)
        console.log('📊 Loading responses for form:', selectedForm)
        
        // Use API route instead of direct database call
        const response = await fetch(`/api/user/forms/${selectedForm}/responses`, {
          headers: {
            'Authorization': `Bearer ${user?.id || 'anonymous'}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const responsesData = data.data || [];
          
          setResponses(prev => ({
            ...prev,
            [selectedForm]: responsesData
          }))
          
          console.log('📊 Loaded responses:', responsesData?.length || 0)
        } else {
          throw new Error('Failed to fetch responses');
        }
      } catch (error) {
        console.error('Error fetching responses:', error)
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to load form responses. Please try again.',
        })
      } finally {
        setIsLoadingResponses(false)
      }
    }

    fetchResponses()
  }, [selectedForm, refreshKey, addNotification])

  const handleFormChange = (formId: string) => {
    setSelectedForm(formId)
    setRefreshKey(prev => prev + 1)
  }

  const handleRefresh = () => {
    if (selectedForm) {
    setRefreshKey(prev => prev + 1)
    addNotification({
      type: 'success',
      title: 'Refreshed',
      message: 'Analytics data updated successfully.',
    })
    }
  }

  // Calculate analytics for selected form
  const getFormAnalytics = () => {
    if (!selectedForm || !responses[selectedForm]) {
      return {
        totalResponses: 0,
        completionRate: 0,
        averageRating: 0,
        recentTrend: 'neutral'
      }
    }

    const formResponses = responses[selectedForm]
    const totalResponses = formResponses.length
    const completedResponses = formResponses.filter(r => r.completed).length
    const completionRate = totalResponses > 0 ? Math.round((completedResponses / totalResponses) * 100) : 0

    // Calculate average rating if applicable
    let totalRating = 0
    let ratingCount = 0
    formResponses.forEach(response => {
      if (response.answers) {
        Object.values(response.answers).forEach(answer => {
          if (typeof answer === 'number' && answer >= 1 && answer <= 5) {
            totalRating += answer
            ratingCount++
          }
        })
      }
    })
    const averageRating = ratingCount > 0 ? Math.round((totalRating / ratingCount) * 10) / 10 : 0

    // Calculate recent trend (simplified)
    const recentTrend = totalResponses > 0 ? 'neutral' : 'neutral'

    return {
      totalResponses,
      completionRate,
      averageRating,
      recentTrend
    }
  }

  const analytics = getFormAnalytics()
  const selectedFormData = forms.find(f => f.id === selectedForm)

  if (isLoadingForms) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your forms...</p>
          </div>
        </div>
      </div>
    )
  }

  if (forms.length === 0) {
    return (
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">
              {isAuthenticated 
                ? 'Track your form performance and user engagement' 
                : 'View analytics for your forms (up to 5 forms for anonymous users)'
              }
            </p>
          </div>
        </div>

      <div className="p-8 text-center">
        <div className="text-gray-400 mb-4">
          <ChartBarIcon className="w-16 h-16 mx-auto" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No forms found</h2>
        <p className="text-gray-600 mb-6">
            {isAuthenticated 
              ? 'Create your first form to start collecting data and viewing analytics.'
              : 'Create your first form to start collecting data and viewing analytics. You can create up to 5 forms as an anonymous user.'
            }
        </p>
        <a 
          href="/builder" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
            Create Your First Form
        </a>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
        {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">
            {isAuthenticated 
              ? 'Track your form performance and user engagement' 
              : 'View analytics for your forms (up to 5 forms for anonymous users)'
            }
          </p>
        </div>

        <div className="flex gap-2">
          <Select value={selectedForm} onValueChange={handleFormChange}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Select a form to analyze" />
            </SelectTrigger>
            <SelectContent>
              {forms.map((form) => (
                <SelectItem key={form.id} value={form.id}>
                  {form.title || 'Untitled Form'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
              <Button
                onClick={handleRefresh}
                disabled={isLoadingResponses || !selectedForm}
                variant="outline"
            className="flex items-center gap-2"
              >
            <div className={`w-4 h-4 ${isLoadingResponses ? 'animate-spin' : ''}`}>
              {isLoadingResponses ? '⟳' : '⟳'}
            </div>
                Refresh
              </Button>
            </div>
                    </div>

      {!selectedForm ? (
        <Card>
          <CardContent className="text-center py-12">
            <ChartBarIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Form to Analyze</h3>
            <p className="text-gray-600 mb-6">
              Choose a form from the dropdown above to view detailed analytics and insights.
            </p>
            {forms.length > 0 && (
              <p className="text-sm text-gray-500">
                You have {forms.length} form{forms.length !== 1 ? 's' : ''} available for analysis.
              </p>
            )}
          </CardContent>
        </Card>
      ) : selectedFormData ? (
        <>
          {/* Form Overview */}
              <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5" />
                {selectedFormData.title}
              </CardTitle>
              <p className="text-gray-600">{selectedFormData.description}</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{analytics.totalResponses}</div>
                  <div className="text-sm text-gray-600">Total Responses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{analytics.completionRate}%</div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                    </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{analytics.averageRating}</div>
                  <div className="text-sm text-gray-600">Avg Rating</div>
                    </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {selectedFormData.fields?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Form Fields</div>
                </div>
                  </div>
                </CardContent>
              </Card>

          {/* Response Chart */}
              <Card>
            <CardHeader>
              <CardTitle>Response Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingResponses ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <p className="ml-2 text-gray-600">Loading response data...</p>
                    </div>
              ) : analytics.totalResponses > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Response Trend</span>
                    <Badge variant="outline">
                      {analytics.recentTrend === 'up' ? (
                        <ArrowUpIcon className="w-3 h-3 mr-1 text-green-600" />
                      ) : analytics.recentTrend === 'down' ? (
                        <ArrowDownIcon className="w-3 h-3 mr-1 text-red-600" />
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                      {analytics.recentTrend === 'up' ? 'Increasing' : 
                       analytics.recentTrend === 'down' ? 'Decreasing' : 'Stable'}
                    </Badge>
                  </div>
                  
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <ChartBarIcon className="w-12 h-12 mx-auto mb-2" />
                      <p>Chart visualization coming soon</p>
                    </div>
                  </div>
                  </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <UsersIcon className="w-12 h-12 mx-auto mb-2" />
                  <p>No responses yet for this form</p>
                  <p className="text-sm">Share your form to start collecting data</p>
            </div>
              )}
                    </CardContent>
                  </Card>

          {/* Recent Responses */}
                  <Card>
            <CardHeader>
              <CardTitle>Recent Responses</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingResponses ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <p className="ml-2 text-gray-600">Loading recent responses...</p>
                </div>
              ) : analytics.totalResponses > 0 ? (
                <div className="space-y-3">
                  {responses[selectedForm]?.slice(0, 5).map((response, index) => (
                    <div key={response.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Response #{response.id}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(response.created_at).toLocaleDateString()}
                      </p>
                    </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={response.completed ? "default" : "secondary"}>
                          {response.completed ? "Completed" : "Partial"}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ClockIcon className="w-12 h-12 mx-auto mb-2" />
                  <p>No responses yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <DocumentTextIcon className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Form Not Found</h3>
            <p className="text-gray-600">
              The selected form could not be found. Please select another form.
            </p>
          </CardContent>
        </Card>
        )}
    </div>
  )
} 