'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import LoadingSpinner from '@/components/ui/loading-spinner'
import { 
  FileText, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  Edit, 
  Trash2, 
  Copy,
  ExternalLink,
  Calendar,
  User,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
  Globe,
  Lock
} from 'lucide-react'

interface Form {
  id: string
  title: string
  description?: string
  status: 'draft' | 'published' | 'archived'
  isPublished: boolean
  publishedUrl?: string
  responseCount: number
  userId: string
  userEmail?: string
  userName?: string
  createdAt: string
  updatedAt: string
  fields?: any[]
  settings?: any
  theme?: any
}

interface FormManagementProps {
  userRole: 'admin' | 'super_admin'
}

export function FormManagement({ userRole }: FormManagementProps) {
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [userFilter, setUserFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedForm, setSelectedForm] = useState<Form | null>(null)

  const fetchForms = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('admin_token')
      if (!token) {
        throw new Error('No admin token found')
      }

      const queryParams = new URLSearchParams()
      queryParams.append('page', currentPage.toString())
      queryParams.append('limit', '20')
      if (statusFilter) queryParams.append('status', statusFilter)
      if (userFilter) queryParams.append('userId', userFilter)

      const response = await fetch(`/api/admin/forms?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setForms(data.data.forms || [])
        setTotalPages(data.data.pagination?.totalPages || 1)
      } else {
        throw new Error(data.message || 'Failed to fetch forms')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const updateFormStatus = async (formId: string, newStatus: 'draft' | 'published' | 'archived') => {
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) {
        throw new Error('No admin token found')
      }

      const response = await fetch(`/api/admin/forms/${formId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        // Refresh forms list
        fetchForms()
        setSelectedForm(null)
      } else {
        throw new Error(data.message || 'Failed to update form status')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const deleteForm = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      return
    }

    try {
      const token = localStorage.getItem('admin_token')
      if (!token) {
        throw new Error('No admin token found')
      }

      const response = await fetch(`/api/admin/forms/${formId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        // Refresh forms list
        fetchForms()
        setSelectedForm(null)
      } else {
        throw new Error(data.message || 'Failed to delete form')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  useEffect(() => {
    fetchForms()
  }, [currentPage, statusFilter, userFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Form Management</h2>
          <p className="text-gray-600 mt-1">Manage forms, view analytics, and moderate content</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search forms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">User</label>
              <Input
                placeholder="User email..."
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={fetchForms} disabled={loading} variant="outline" className="w-full">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Forms List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Forms ({filteredForms.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : filteredForms.length > 0 ? (
            <div className="space-y-4">
              {filteredForms.map((form) => (
                <div key={form.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">{form.title}</h3>
                        {form.description && (
                          <p className="text-sm text-gray-600 line-clamp-1">{form.description}</p>
                        )}
                      </div>
                      <Badge className={getStatusColor(form.status)}>
                        {form.status}
                      </Badge>
                      {form.isPublished && (
                        <Badge className="bg-blue-100 text-blue-800">
                          <Globe className="w-3 h-3 mr-1" />
                          Live
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {form.userEmail || 'Unknown user'}
                      </span>
                      <span className="flex items-center">
                        <BarChart3 className="w-3 h-3 mr-1" />
                        {form.responseCount} responses
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        Created {new Date(form.createdAt).toLocaleDateString()}
                      </span>
                      {form.fields && (
                        <span className="flex items-center">
                          <FileText className="w-3 h-3 mr-1" />
                          {form.fields.length} fields
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {form.publishedUrl && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(form.publishedUrl, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedForm(form)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Details
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedForm(form)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Manage
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No forms found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 py-2 text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Form Details Modal */}
      {selectedForm && (
        <FormDetailsModal
          form={selectedForm}
          onClose={() => setSelectedForm(null)}
          onUpdateStatus={updateFormStatus}
          onDeleteForm={deleteForm}
        />
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-600">{error}</p>
            </div>
            <Button 
              onClick={fetchForms} 
              variant="outline" 
              className="mt-2"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Form Details Modal Component
function FormDetailsModal({ 
  form, 
  onClose, 
  onUpdateStatus,
  onDeleteForm
}: { 
  form: Form
  onClose: () => void
  onUpdateStatus: (formId: string, status: 'draft' | 'published' | 'archived') => void
  onDeleteForm: (formId: string) => void
}) {
  const [newStatus, setNewStatus] = useState(form.status)

  const handleStatusUpdate = () => {
    if (newStatus !== form.status) {
      onUpdateStatus(form.id, newStatus)
    }
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      onDeleteForm(form.id)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Form Details</CardTitle>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Form Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <p className="text-sm text-gray-900">{form.title}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Badge className={form.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                {form.status}
              </Badge>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
              <p className="text-sm text-gray-900">{form.userEmail || 'Unknown user'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Responses</label>
              <p className="text-sm text-gray-900">{form.responseCount}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Published URL</label>
              {form.publishedUrl ? (
                <a 
                  href={form.publishedUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View Form
                </a>
              ) : (
                <p className="text-sm text-gray-500">Not published</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
              <p className="text-sm text-gray-900">{new Date(form.createdAt).toLocaleDateString()}</p>
            </div>
            {form.description && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-sm text-gray-900">{form.description}</p>
              </div>
            )}
          </div>

          {/* Form Fields Preview */}
          {form.fields && form.fields.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Form Fields ({form.fields.length})</h3>
              <div className="space-y-2">
                {form.fields.slice(0, 10).map((field, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">{field.type}</span>
                    <span className="text-sm text-gray-600">{field.label || field.placeholder || 'Untitled field'}</span>
                  </div>
                ))}
                {form.fields.length > 10 && (
                  <p className="text-sm text-gray-500">... and {form.fields.length - 10} more fields</p>
                )}
              </div>
            </div>
          )}

          {/* Status Management */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Form Management</h3>
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
                <Badge className="bg-blue-100 text-blue-800">
                  {form.status}
                </Badge>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Change Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as 'draft' | 'published' | 'archived')}
                  className="p-2 border rounded-md"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="flex items-end space-x-2">
                <Button 
                  onClick={handleStatusUpdate}
                  disabled={newStatus === form.status}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  Update Status
                </Button>
                <Button 
                  onClick={handleDelete}
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete Form
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
