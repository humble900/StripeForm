'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { useNotifications } from '@/components/providers/NotificationProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  TableCellsIcon,
  EyeIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline'
import { formatDate } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'

interface FormSubmission {
  id: string
  formId: string
  userId?: string
  data: Record<string, any>
  submittedAt: string
  ipAddress?: string
  userAgent?: string
  status: string
}

interface Form {
  id: string
  title: string
  description?: string
  status: string
  submissionCount: number
  createdAt: string
  updatedAt: string
}

const FormResponsesPage = () => {
  const router = useRouter()
  const params = useParams()
  const formId = params?.id as string
  const { user, getUserTrackingData } = useAuth()
  const { addNotification } = useNotifications()

  const [form, setForm] = useState<Form | null>(null)
  const [responses, setResponses] = useState<FormSubmission[]>([])
  const [fields, setFields] = useState<Array<{ id: string; title?: string; label?: string; required?: boolean }>>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [exportMenuOpen, setExportMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'complete' | 'partial'>('all')

  // Helper function to make authenticated API calls
  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    const userTrackingData = await getUserTrackingData()
    const userId = userTrackingData?.fingerprint || user?.id
    
    if (!userId) {
      throw new Error('No user ID available for authentication')
    }

    return fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${userId}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
  }

  useEffect(() => {
    const fetchFormAndResponses = async () => {
      try {
        setLoading(true)

        // Fetch form details and responses
        const [formResponse, responsesResponse] = await Promise.all([
          makeAuthenticatedRequest(`/api/user/forms/${formId}`),
          makeAuthenticatedRequest(`/api/user/forms/${formId}/responses`)
        ])

        if (!formResponse.ok || !responsesResponse.ok) {
          throw new Error('Failed to fetch form data')
        }

        const formData = await formResponse.json()
        const responsesData = await responsesResponse.json()

        setForm(formData.data)
        setResponses(responsesData.data || [])
        // Try to hydrate fields from form payload if present
        const formFields = (formData?.data?.fields || []) as Array<any>
        if (Array.isArray(formFields)) {
          setFields(formFields.map((f: any) => ({ id: f.id, title: f.title || f.label, label: f.label, required: !!f.required })))
        }
      } catch (error) {
        console.error('Error fetching form responses:', error)
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to load form responses',
          duration: 5000
        })
      } finally {
        setLoading(false)
      }
    }

    if (formId) {
      fetchFormAndResponses()
    }
  }, [formId, getUserTrackingData, user])

  // Real-time subscription for new submissions on this form
  useEffect(() => {
    if (!formId) return
    const channel = supabase
      .channel('responses-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'form_submissions',
        filter: `form_id=eq.${formId}`
      }, (payload: any) => {
        const newRow = payload.new
        setResponses(prev => [
          {
            id: newRow.id,
            formId: newRow.form_id,
            userId: newRow.user_id || undefined,
            data: newRow.data || {},
            submittedAt: newRow.submitted_at,
            ipAddress: newRow.ip_address || undefined,
            userAgent: newRow.user_agent || undefined,
            status: newRow.status
          },
          ...prev
        ])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [formId])

  const exportResponses = async (format: 'json' | 'csv') => {
    try {
      setExporting(true)
      
      const response = await makeAuthenticatedRequest(
        `/api/user/forms/${formId}/export?format=${format}`
      )

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `${form?.title || 'form'}-responses.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      addNotification({
        type: 'success',
        title: 'Export Complete',
        message: `Responses exported as ${format.toUpperCase()}`,
        duration: 3000
      })
    } catch (error) {
      console.error('Export error:', error)
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: 'Failed to export responses',
        duration: 5000
      })
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Form Not Found</h1>
          <Button onClick={() => router.push('/dashboard')}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="bg-white/80 backdrop-blur-sm h-7 px-2 text-xs"
            >
              <ArrowLeftIcon className="h-3 w-3 mr-1" />
              Back to dashboard
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{form.title}</h1>
              <p className="text-gray-500 mt-0.5 text-xs">{responses.length} responses</p>
            </div>
          </div>
        </div>

        {/* Form Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white/80 backdrop-blur-sm border-white/30">
            <CardContent className="p-4">
              <div className="flex items-center">
                <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
                <div className="ml-3">
                  <p className="text-lg font-bold text-gray-900">{responses.length}</p>
                  <p className="text-gray-500 text-xs">Total Responses</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-white/30">
            <CardContent className="p-4">
              <div className="flex items-center">
                <CalendarIcon className="h-6 w-6 text-green-600" />
                <div className="ml-3">
                  <p className="text-lg font-bold text-gray-900">
                    {responses.length > 0 ? formatDate(responses[0].submittedAt) : 'N/A'}
                  </p>
                  <p className="text-gray-500 text-xs">Latest Response</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-white/30">
            <CardContent className="p-4">
              <div className="flex items-center">
                <EyeIcon className="h-6 w-6 text-purple-600" />
                <div className="ml-3">
                  <p className="text-lg font-bold text-gray-900">{form.status}</p>
                  <p className="text-gray-500 text-xs">Form Status</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Responses - search/filter + list */}
        <div className="bg-white/80 backdrop-blur-sm border border-white/30 rounded-lg shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center">
            <ClipboardDocumentListIcon className="h-4 w-4 mr-2 text-gray-600" />
            <h2 className="text-sm font-medium text-gray-900 mr-auto">Form Responses</h2>
            <div className="flex items-center gap-2 relative">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="h-7 px-2 rounded-md border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white/90 w-32"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="h-7 px-2 rounded-md border border-gray-200 text-xs bg-white/90"
              >
                <option value="all">All</option>
                <option value="complete">Complete</option>
                <option value="partial">Partial</option>
              </select>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => setExportMenuOpen(v => !v)}
                    disabled={responses.length === 0 || exporting}
                    className="bg-white/90 border-gray-200 h-7 w-7 p-0"
                  >
                    <ArrowDownTrayIcon className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Export responses</p>
                </TooltipContent>
              </Tooltip>
              
              {exportMenuOpen && (
                <div className="absolute right-0 top-8 z-10 bg-white border border-gray-200 rounded-md shadow-lg w-32">
                  <button
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-xs border-b border-gray-100"
                    onClick={async () => { setExportMenuOpen(false); await exportResponses('csv') }}
                  >
                    <div className="flex items-center space-x-2">
                      <TableCellsIcon className="h-3 w-3 text-gray-500" />
                      <span>CSV</span>
              </div>
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-xs"
                    onClick={async () => { setExportMenuOpen(false); await exportResponses('json') }}
                  >
                    <div className="flex items-center space-x-2">
                      <DocumentArrowDownIcon className="h-3 w-3 text-gray-500" />
                      <span>JSON</span>
                    </div>
                  </button>
                          </div>
              )}
                      </div>
                    </div>
          {responses.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardDocumentListIcon className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-gray-900 mb-1">No responses yet</h3>
              <p className="text-xs text-gray-500">This form hasn't received any responses.</p>
                  </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {responses
                .map((r) => ({
                  r,
                  isComplete: !!r.submittedAt,
                }))
                .filter(({ r, isComplete }) => {
                  if (filterStatus === 'complete' && !isComplete) return false
                  if (filterStatus === 'partial' && isComplete) return false
                  if (!searchQuery.trim()) return true
                  const hay = JSON.stringify(r.data || {}).toLowerCase()
                  return hay.includes(searchQuery.toLowerCase())
                })
                .map(({ r }, index) => (
                  <ExpandableRow key={r.id} index={index} response={r} fields={fields} />
                ))}
            </ul>
          )}
              </div>
        {/* drafts removed per requirements */}
      </div>
    </div>
    </TooltipProvider>
  )
}

export default FormResponsesPage

// Minimal expandable row for a single response
function ExpandableRow({ response, index, fields }: { response: any, index: number, fields: Array<{ id: string; title?: string; label?: string; required?: boolean }> }) {
  const [open, setOpen] = useState(false)
  const answerCount = Object.keys(response?.data || {}).length
  const label = response?.userId || `Response #${index + 1}`
  // Completion: any response with submittedAt is Complete; otherwise Partial
  const isComplete = !!response?.submittedAt
  return (
    <li>
      <button
        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${open ? 'bg-gray-50' : ''}`}
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-[10px] font-medium text-blue-700">{index + 1}</div>
            <div>
              <p className="text-sm font-medium text-gray-900 truncate max-w-[50vw]">{label}</p>
              <p className="text-[10px] text-gray-500">{formatDate(response.submittedAt)} • {answerCount} fields</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${isComplete ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {isComplete ? 'Complete' : 'Partial'}
            </span>
            <svg className={`h-3 w-3 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
          </div>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4">
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
            {(fields && fields.length > 0 ? fields : Object.keys(response?.data || {}).map(id => ({ id, title: id }))).map((f: any) => {
              const answer = response?.data?.[f.id]
              return (
                <div key={f.id} className="border-b border-gray-50 pb-2">
                  <p className="text-xs font-medium text-gray-600 mb-1">{f.title || f.label || f.id}</p>
                  <p className="text-xs text-gray-900 whitespace-pre-wrap">{answer ? (typeof answer === 'string' ? answer : JSON.stringify(answer)) : ''}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </li>
  )
}
