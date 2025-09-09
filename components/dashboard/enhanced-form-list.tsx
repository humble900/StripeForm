'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  PlusIcon, 
  Cog6ToothIcon, 
  EyeIcon, 
  CalendarIcon, 
  DocumentTextIcon, 
  TrashIcon,
  DocumentDuplicateIcon,
  UsersIcon,
  ChartBarIcon,
  ShareIcon,
  ArchiveBoxIcon,
  StarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface Form {
  id: string
  title: string
  description: string | null
  status: 'draft' | 'published' | 'archived' | 'deleted'
  slug?: string
  publishedUrl?: string
  updated_at?: string
  updatedAt?: string
  publishedAt?: string
  submission_count: number
  category?: string
  tags?: string[]
  isFeatured?: boolean
  isArchived?: boolean
  lastResponseDate?: string
  avgCompletionRate?: number
}

interface EnhancedFormListProps {
  forms: Form[]
  onEditForm: (formId: string) => void
  onViewForm: (formId: string) => void
  onCloneForm: (formId: string) => void
  onDeleteForm: (formId: string) => void
  onArchiveForm: (formId: string) => void
  onToggleFeatured: (formId: string) => void
  onCreateForm: () => void
}

const EnhancedFormList: React.FC<EnhancedFormListProps> = ({
  forms,
  onEditForm,
  onViewForm,
  onCloneForm,
  onDeleteForm,
  onArchiveForm,
  onToggleFeatured,
  onCreateForm
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'drafts' | 'archived'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'responses' | 'completion'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [responseRangeFilter, setResponseRangeFilter] = useState<'all' | 'none' | 'low' | 'medium' | 'high'>('all')
  const [completionRateFilter, setCompletionRateFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all')
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | 'today' | 'week' | 'month' | 'quarter'>('all')
  const [copiedFormId, setCopiedFormId] = useState<string | null>(null)

  // Get unique categories
  const categories = useMemo(() => {
    const cats = forms.map(f => f.category).filter(Boolean) as string[]
    return ['all', ...Array.from(new Set(cats))]
  }, [forms])

  // Filter and sort forms
  const filteredAndSortedForms = useMemo(() => {
    let filtered = forms.filter(form => {
      // Status filter
      if (statusFilter === 'published' && form.status !== 'published') return false
      if (statusFilter === 'drafts' && form.status === 'published') return false
      if (statusFilter === 'archived' && form.status !== 'archived') return false
      if (statusFilter === 'all' && form.status === 'archived') return false

      // Category filter
      if (categoryFilter !== 'all' && form.category !== categoryFilter) return false

      // Response range filter
      if (responseRangeFilter !== 'all') {
        if (responseRangeFilter === 'none' && form.submission_count > 0) return false
        if (responseRangeFilter === 'low' && (form.submission_count === 0 || form.submission_count > 10)) return false
        if (responseRangeFilter === 'medium' && (form.submission_count <= 10 || form.submission_count > 100)) return false
        if (responseRangeFilter === 'high' && form.submission_count <= 100) return false
      }

      // Completion rate filter
      if (completionRateFilter !== 'all' && form.avgCompletionRate) {
        if (completionRateFilter === 'low' && form.avgCompletionRate >= 70) return false
        if (completionRateFilter === 'medium' && (form.avgCompletionRate < 70 || form.avgCompletionRate > 90)) return false
        if (completionRateFilter === 'high' && form.avgCompletionRate <= 90) return false
      }

      // Date range filter
      if (dateRangeFilter !== 'all') {
        const formDate = new Date(form.updated_at || form.updatedAt || new Date())
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - formDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        if (dateRangeFilter === 'today' && diffDays > 1) return false
        if (dateRangeFilter === 'week' && diffDays > 7) return false
        if (dateRangeFilter === 'month' && diffDays > 30) return false
        if (dateRangeFilter === 'quarter' && diffDays > 90) return false
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
          form.title.toLowerCase().includes(query) ||
          form.description?.toLowerCase().includes(query) ||
          form.tags?.some(tag => tag.toLowerCase().includes(query))
        
        if (!matchesSearch) return false
      }

      return true
    })

    // Sort forms
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'name':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'date':
          aValue = new Date(a.updated_at || a.updatedAt || new Date()).getTime()
          bValue = new Date(b.updated_at || b.updatedAt || new Date()).getTime()
          break
        case 'responses':
          aValue = a.submission_count
          bValue = b.submission_count
          break
        case 'completion':
          aValue = a.avgCompletionRate || 0
          bValue = b.avgCompletionRate || 0
          break
        default:
          return 0
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [forms, searchQuery, statusFilter, categoryFilter, sortBy, sortOrder, responseRangeFilter, completionRateFilter, dateRangeFilter])

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      // If same field, just toggle order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      // If new field, set it and default to descending
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
  }

  const getStatusBadge = (form: Form) => {
    if (form.isArchived) {
      return <Badge variant="secondary" className="text-xs">Archived</Badge>
    }
    if (form.status === 'published') {
      return <Badge variant="default" className="text-xs">Published</Badge>
    }
    return <Badge variant="outline" className="text-xs">Draft</Badge>
  }

  const handleShareForm = async (formId: string) => {
    const origin = window.location.origin
    const form = forms.find(f => f.id === formId)
    const formUrl = form?.publishedUrl
      || (form?.slug ? `${origin}/forms/${form.slug}` : `${origin}/forms/${formId}`)
    
    try {
      await navigator.clipboard.writeText(formUrl)
      setCopiedFormId(formId)
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedFormId(null)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = formUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopiedFormId(formId)
      setTimeout(() => {
        setCopiedFormId(null)
      }, 2000)
    }
  }

  const getFormCard = (form: Form) => (
    <Card key={form.id} className="hover:shadow-md transition-all duration-200 group border-gray-200">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {form.title}
              </h3>
              {form.isFeatured && (
                <StarIcon className="h-3 w-3 text-yellow-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-gray-600 text-xs mb-2 line-clamp-2">
              {form.description || "No description"}
            </p>
          </div>
          <div className="flex items-center space-x-1 ml-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onToggleFeatured(form.id)}
              title={form.isFeatured ? "Remove from featured" : "Mark as featured"}
            >
              <StarIcon className={`h-3 w-3 ${form.isFeatured ? 'text-yellow-500' : 'text-gray-400'}`} />
            </Button>
          </div>
        </div>

        {/* Tags */}
        {form.tags && form.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {form.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                {tag}
              </Badge>
            ))}
            {form.tags.length > 2 && (
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                +{form.tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center space-x-1">
            <UsersIcon className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-600">
              {form.submission_count} responses
            </span>
          </div>
          {form.avgCompletionRate && (
            <div className="flex items-center space-x-1">
              <ChartBarIcon className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-600">
                {form.avgCompletionRate}% completion
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <CalendarIcon className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500">
              {form.status === 'published' 
                ? `Published ${new Date(form.publishedAt || form.updatedAt || form.updated_at || new Date()).toLocaleDateString()}`
                : form.lastResponseDate 
                  ? `Last response ${new Date(form.lastResponseDate).toLocaleDateString()}`
                  : `Updated ${new Date(form.updatedAt || form.updated_at || new Date()).toLocaleDateString()}`
              }
            </span>
          </div>
          <div className="flex items-center space-x-1">
            {form.status === 'published' ? (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => onViewForm(form.id)}
                  title="View form"
                >
                  <EyeIcon className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => handleShareForm(form.id)}
                  title={copiedFormId === form.id ? "Link copied!" : "Copy sharing link"}
                >
                  <ShareIcon className={`h-3 w-3 ${copiedFormId === form.id ? 'text-green-500' : 'text-gray-400'}`} />
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => onEditForm(form.id)}
                title="Edit form"
              >
                <DocumentTextIcon className="h-3 w-3" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => onCloneForm(form.id)}
              title="Clone form"
            >
              <DocumentDuplicateIcon className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => onArchiveForm(form.id)}
              title={form.isArchived ? "Unarchive" : "Archive"}
            >
              <ArchiveBoxIcon className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 hover:text-red-500"
              onClick={() => onDeleteForm(form.id)}
              title="Delete form"
            >
              <TrashIcon className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-2">
          {getStatusBadge(form)}
        </div>
      </CardContent>
    </Card>
  )

  const clearAllFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setCategoryFilter('all')
    setResponseRangeFilter('all')
    setCompletionRateFilter('all')
    setDateRangeFilter('all')
    setSortBy('date')
    setSortOrder('desc')
  }

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' || 
                          responseRangeFilter !== 'all' || completionRateFilter !== 'all' || dateRangeFilter !== 'all'

  return (
    <div className="space-y-4">
      {/* Header - Removed form counting from here */}
      <div className="flex items-center justify-between">
        <div>
          {/* Form counting moved below sort controls */}
        </div>
      </div>

      {/* Advanced Filters and Controls */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Filter Header */}
        <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-3 w-3 text-gray-600" />
              <h3 className="text-xs font-medium text-gray-700">Filters & Search</h3>
              {hasActiveFilters && (
                <Badge variant="secondary" className="text-xs">
                  {Object.values({
                    search: searchQuery,
                    status: statusFilter,
                    category: categoryFilter,
                    responses: responseRangeFilter,
                    completion: completionRateFilter,
                    date: dateRangeFilter
                  }).filter(v => v !== 'all' && v !== '').length} active
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="text-xs h-7 px-2"
              >
                <AdjustmentsHorizontalIcon className="h-3 w-3 mr-1" />
                {showAdvancedFilters ? 'Hide' : 'Show'} Advanced
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs text-red-600 hover:text-red-700 h-7 px-2"
                >
                  <XMarkIcon className="h-3 w-3 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Basic Filters */}
        <div className="p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <MagnifyingGlassIcon className="h-3 w-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search forms by title, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 text-xs h-8"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Forms</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="drafts">Drafts</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Response Range Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Response Count</label>
                  <Select value={responseRangeFilter} onValueChange={(value: any) => setResponseRangeFilter(value)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Response range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All responses</SelectItem>
                      <SelectItem value="none">No responses</SelectItem>
                      <SelectItem value="low">1-10 responses</SelectItem>
                      <SelectItem value="medium">11-100 responses</SelectItem>
                      <SelectItem value="high">100+ responses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Completion Rate Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Completion Rate</label>
                  <Select value={completionRateFilter} onValueChange={(value: any) => setCompletionRateFilter(value)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Completion rate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All rates</SelectItem>
                      <SelectItem value="low">Below 70%</SelectItem>
                      <SelectItem value="medium">70-90%</SelectItem>
                      <SelectItem value="high">Above 90%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Last Updated</label>
                  <Select value={dateRangeFilter} onValueChange={(value: any) => setDateRangeFilter(value)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This week</SelectItem>
                      <SelectItem value="quarter">This quarter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Sort and View Controls */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-medium text-gray-700">Sort by:</span>
              <div className="flex items-center space-x-2">
                <Select value={sortBy} onValueChange={(value: any) => handleSort(value)}>
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="responses">Responses</SelectItem>
                    <SelectItem value="completion">Completion</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSortOrder}
                  className="h-8 px-2 text-xs"
                  title={`Sort ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
                >
                  {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
                </Button>
              </div>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-7 px-2 text-xs"
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-7 px-2 text-xs"
              >
                List
              </Button>
            </div>
          </div>
          
          {/* Form Count - Moved below sort controls */}
          <div className="text-center pt-2">
            <p className="text-xs text-gray-500">
              {filteredAndSortedForms.length} of {forms.length} forms
            </p>
          </div>
        </div>
      </div>

      {/* Forms Grid/List */}
      {filteredAndSortedForms.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50">
          {hasActiveFilters ? (
            // Filtered results empty state
            <>
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                No forms match your filters
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Try adjusting your search or filters to find more forms. You can also clear all filters to see all your forms.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button onClick={clearAllFilters} variant="outline" className="px-6">
                  Clear All Filters
                </Button>
                <Button onClick={onCreateForm} className="bg-blue-600 hover:bg-blue-700 px-6">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Create New Form
                </Button>
              </div>
            </>
          ) : (
            // Beautiful empty state for new users
            <>
              <div className="relative mb-8">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                  <PlusIcon className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-sm font-bold text-yellow-900">✨</span>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Welcome to your Dashboard!
              </h3>
              <p className="text-gray-600 mb-2 max-w-lg mx-auto">
                You're all set to start creating amazing forms. Build surveys, collect feedback, 
                gather leads, and so much more.
              </p>
              <p className="text-gray-500 mb-8 text-sm">
                Your first form is just a click away
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  onClick={onCreateForm} 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <PlusIcon className="mr-3 h-5 w-5" />
                  Create Your First Form
                </Button>
                
                <div className="text-center sm:text-left">
                  <p className="text-sm text-gray-500 mb-1">What you can create:</p>
                  <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      Surveys
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      Contact Forms
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                      Applications
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-400">
                  💡 Tip: Start with a simple contact form to get familiar with the builder
                </p>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4'
          : 'space-y-3'
        }>
          {filteredAndSortedForms.map(form => getFormCard(form))}
        </div>
      )}
    </div>
  )
}

export default EnhancedFormList
