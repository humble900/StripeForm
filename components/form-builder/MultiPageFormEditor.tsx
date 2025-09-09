'use client'

import React, { useState } from 'react'
import { FormField, FieldType } from '@/types'

interface Page {
  id: string
  title: string
  description?: string
  fields: string[] // Field IDs
}

interface MultiPageFormEditorProps {
  fields: FormField[]
  onUpdatePages: (pages: Page[]) => void
  onUpdateFieldPage: (fieldId: string, pageId: string) => void
}

export function MultiPageFormEditor({ fields, onUpdatePages, onUpdateFieldPage }: MultiPageFormEditorProps) {
  const [pages, setPages] = useState<Page[]>([
    {
      id: 'page-1',
      title: 'Page 1',
      description: 'First page of your form',
      fields: []
    }
  ])
  const [activePage, setActivePage] = useState('page-1')

  const addPage = () => {
    const newPage: Page = {
      id: `page-${pages.length + 1}`,
      title: `Page ${pages.length + 1}`,
      description: `Page ${pages.length + 1} of your form`,
      fields: []
    }
    const updatedPages = [...pages, newPage]
    setPages(updatedPages)
    onUpdatePages(updatedPages)
  }

  const updatePage = (pageId: string, updates: Partial<Page>) => {
    const updatedPages = pages.map(page => 
      page.id === pageId ? { ...page, ...updates } : page
    )
    setPages(updatedPages)
    onUpdatePages(updatedPages)
  }

  const removePage = (pageId: string) => {
    if (pages.length <= 1) return // Don't allow removing the last page
    
    const updatedPages = pages.filter(page => page.id !== pageId)
    setPages(updatedPages)
    onUpdatePages(updatedPages)
    
    if (activePage === pageId) {
      setActivePage(updatedPages[0].id)
    }
  }

  const moveFieldToPage = (fieldId: string, targetPageId: string) => {
    // Remove field from current page
    const updatedPages = pages.map(page => ({
      ...page,
      fields: page.fields.filter(fid => fid !== fieldId)
    }))
    
    // Add field to target page
    const finalPages = updatedPages.map(page => 
      page.id === targetPageId 
        ? { ...page, fields: [...page.fields, fieldId] }
        : page
    )
    
    setPages(finalPages)
    onUpdatePages(finalPages)
    onUpdateFieldPage(fieldId, targetPageId)
  }

  const getCurrentPage = () => pages.find(p => p.id === activePage) || pages[0]
  const getUnassignedFields = () => fields.filter(f => !pages.some(p => p.fields.includes(f.id)))

  return (
    <div className="space-y-6">
      {/* Page Navigation */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {pages.map((page, index) => (
          <button
            key={page.id}
            onClick={() => setActivePage(page.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              activePage === page.id
                ? 'bg-[#6C5CE7] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {page.title}
          </button>
        ))}
        <button
          onClick={addPage}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-[#6C5CE7] text-white hover:bg-opacity-90"
        >
          + Add Page
        </button>
      </div>

      {/* Current Page Editor */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {getCurrentPage()?.title}
          </h3>
          {pages.length > 1 && (
            <button
              onClick={() => removePage(activePage)}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Remove Page
            </button>
          )}
        </div>

        {/* Page Settings */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Title
            </label>
            <input
              type="text"
              value={getCurrentPage()?.title || ''}
              onChange={(e) => updatePage(activePage, { title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Description
            </label>
            <textarea
              value={getCurrentPage()?.description || ''}
              onChange={(e) => updatePage(activePage, { description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>
        </div>

        {/* Fields in Current Page */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Fields on this page:</h4>
          <div className="space-y-2">
            {getCurrentPage()?.fields.map(fieldId => {
              const field = fields.find(f => f.id === fieldId)
              return field ? (
                <div key={fieldId} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <span className="text-sm text-gray-700">{field.label}</span>
                  <select
                    value={activePage}
                    onChange={(e) => moveFieldToPage(fieldId, e.target.value)}
                    className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {pages.map(page => (
                      <option key={page.id} value={page.id}>
                        Move to {page.title}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null
            })}
            
            {getCurrentPage()?.fields.length === 0 && (
              <p className="text-sm text-gray-500 italic">No fields on this page yet</p>
            )}
          </div>
        </div>

        {/* Unassigned Fields */}
        {getUnassignedFields().length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Unassigned Fields:</h4>
            <div className="space-y-2">
              {getUnassignedFields().map(field => (
                <div key={field.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-md">
                  <span className="text-sm text-gray-700">{field.label}</span>
                  <select
                    value=""
                    onChange={(e) => moveFieldToPage(field.id, e.target.value)}
                    className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Move to page...</option>
                    {pages.map(page => (
                      <option key={page.id} value={page.id}>
                        {page.title}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Page Preview */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Page Preview:</h4>
        <div className="text-sm text-gray-600">
          <p><strong>Title:</strong> {getCurrentPage()?.title}</p>
          <p><strong>Description:</strong> {getCurrentPage()?.description || 'No description'}</p>
          <p><strong>Fields:</strong> {getCurrentPage()?.fields.length || 0} field(s)</p>
        </div>
      </div>
    </div>
  )
} 