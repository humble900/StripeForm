'use client'

import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useNotifications } from '@/components/providers/NotificationProvider'
import { supabase } from '@/lib/supabase'

import { FormResponse, FormField } from '@/types'

interface FormResponsesProps {
  formId: string
  formTitle: string
}

const FormResponses: React.FC<FormResponsesProps> = ({ formId, formTitle }) => {
  // UI state
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "partial">("all")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null)
  const [responseDialogOpen, setResponseDialogOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Data state
  const [responses, setResponses] = useState<FormResponse[]>([])
  const [formFields, setFormFields] = useState<FormField[]>([])

  // Notifications
  const { addNotification } = useNotifications()

  // Fetch real data from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch form fields
        const { data: formFields, error: fieldsError } = await supabase
          .from('form_fields')
          .select('*')
          .eq('form_id', formId)
          .order('order')

        if (fieldsError) {
          console.error('Error fetching form fields:', fieldsError)
          return
        }
        setFormFields(formFields || [])

        // Fetch form responses
        const { data: submissions, error: submissionsError } = await supabase
          .from('form_submissions')
          .select('*')
          .eq('form_id', formId)
          .order('created_at', { ascending: false })

        if (submissionsError) throw submissionsError
        setResponses(submissions || [])

      } catch (error) {
        console.error('Error fetching form data:', error)
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to load form responses. Please try again.',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [formId, sortOrder])

  // Filter responses based on search and status
  const filteredResponses = responses.filter(response => {
    const matchesSearch = searchQuery === "" || 
      Object.values(response.answers || {}).some(answer => 
        String(answer).toLowerCase().includes(searchQuery.toLowerCase())
      )
    
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "completed" && response.completed) ||
      (filterStatus === "partial" && !response.completed)

    return matchesSearch && matchesStatus
  })

  // Export responses to CSV
  const exportToCSV = async () => {
    try {
      if (responses.length === 0) {
    addNotification({
          type: 'warning',
          title: 'No Data',
          message: 'No responses to export.',
        })
        return
      }

      // Create CSV content
      const questionHeaders = formFields.map(field => field.title || `Question ${field.order}`)
      const csvHeaders = ['Response ID', 'Date', 'Status', ...questionHeaders]
      
      const csvRows = responses.map(response => {
        const answers = formFields.map(field => {
          const answer = response.answers?.[field.id] || ''
          return typeof answer === 'string' ? answer : JSON.stringify(answer)
        })
        return [
          response.id,
          new Date(response.created_at).toLocaleDateString(),
          response.completed ? 'Completed' : 'Partial',
          ...answers
        ]
      })

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n')

      // Download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${formTitle}_responses_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

        addNotification({
          type: 'success',
          title: 'Export Successful',
        message: `Successfully exported ${responses.length} responses to CSV!`,
        })
    } catch (error) {
      console.error('Error exporting CSV:', error)
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: 'Failed to export responses. Please try again.',
      })
    }
  }

  // Refresh data
  const refreshData = async () => {
    setIsRefreshing(true)
    try {
      const { data: responsesData, error } = await supabase
        .from('form_submissions')
        .select('*')
        .eq('form_id', formId)
        .order(sortOrder === 'newest' ? 'created_at' : 'created_at', { ascending: sortOrder === 'oldest' })

      if (error) throw error
      setResponses(responsesData || [])
      
      addNotification({
        type: 'success',
        title: 'Refreshed',
        message: 'Form responses updated successfully.',
      })
    } catch (error) {
      console.error('Error refreshing data:', error)
      addNotification({
        type: 'error',
        title: 'Refresh Failed',
        message: 'Failed to refresh data. Please try again.',
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  // Open response details dialog
  const openResponseDetails = (response: FormResponse) => {
    setSelectedResponse(response)
    setResponseDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form responses...</p>
        </div>
      </div>
    )
  }

  const completedResponses = responses.filter(r => r.completed)
  const completionRate = responses.length > 0 ? Math.round((completedResponses.length / responses.length) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{formTitle}</h2>
          <p className="text-gray-600">
            {responses.length} total responses • {completionRate}% completion rate
          </p>
        </div>
        
        <div className="flex gap-2">
              <Button
                variant="outline"
            onClick={refreshData}
            disabled={isRefreshing}
                className="flex items-center gap-2"
              >
            <div className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}>
              {isRefreshing ? '⟳' : '⟳'}
            </div>
            Refresh
              </Button>
          
              <Button
            onClick={exportToCSV}
            disabled={responses.length === 0}
                className="flex items-center gap-2"
              >
            <Download className="w-4 h-4" />
            Export CSV
              </Button>
            </div>
          </div>
          
      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search responses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
              />
            </div>
            
        <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Responses</SelectItem>
            <SelectItem value="completed">Completed Only</SelectItem>
            <SelectItem value="partial">Partial Only</SelectItem>
                </SelectContent>
              </Select>
              
        <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

      {/* Responses list */}
      <div className="space-y-4">
        {filteredResponses.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <AlertCircle className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No responses found</h3>
              <p className="text-gray-600">
                {searchQuery || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters.'
                  : 'This form hasn\'t received any responses yet.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredResponses.map((response) => (
            <Card key={response.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant={response.completed ? "default" : "secondary"}>
                        {response.completed ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completed
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 mr-1" />
                            Partial
                          </>
                        )}
                      </Badge>
                      
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(response.created_at).toLocaleDateString()}
                      </span>
          </div>
          
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {formFields.slice(0, 3).map((field) => {
                        const answer = response.answers?.[field.id]
                        if (!answer) return null
                        
                        return (
                          <div key={field.id} className="space-y-1">
                            <p className="text-sm font-medium text-gray-700">{field.title}</p>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {typeof answer === 'string' ? answer : JSON.stringify(answer)}
                            </p>
              </div>
                        )
                      })}
        </div>
      </div>
      
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openResponseDetails(response)}
                    className="ml-4"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
            </Button>
          </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      {/* Response details dialog */}
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Response Details</DialogTitle>
          </DialogHeader>
          
          {selectedResponse && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Badge variant={selectedResponse.completed ? "default" : "secondary"}>
                  {selectedResponse.completed ? "Completed" : "Partial"}
                </Badge>
                <span>•</span>
                <span>ID: {selectedResponse.id}</span>
                <span>•</span>
                <span>{new Date(selectedResponse.created_at).toLocaleString()}</span>
              </div>
              
              <div className="space-y-4">
                {formFields.map((field) => {
                  const answer = selectedResponse.answers?.[field.id]
                  if (!answer) return null
                
                return (
                    <div key={field.id} className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{field.title}</h4>
                      <p className="text-gray-700">
                        {typeof answer === 'string' ? answer : JSON.stringify(answer, null, 2)}
                      </p>
                  </div>
                )
              })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default FormResponses 