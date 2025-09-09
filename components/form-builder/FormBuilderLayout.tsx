'use client'

import { useState } from 'react'
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { FormBuilderSidebar } from './FormBuilderSidebar'
import { FormBuilderCanvas } from './FormBuilderCanvas'
import { FormBuilderInspector } from './FormBuilderInspector'
import { FormBuilderToolbar } from './FormBuilderToolbar'
import { useFormBuilder } from '@/components/providers/FormBuilderProvider'
import { FieldComponent } from './FieldComponents'
import EnhancedFormPreview from './EnhancedFormPreview'
import { EnhancedAutoSave } from './EnhancedAutoSave'
import { ResumeDialog } from './ResumeDialog'

export function FormBuilderLayout() {
  const { 
    state, 
    setPreviewMode, 
    onDraftSaved, 
    onDraftRestored, 
    showResumeDialog, 
    setShowResumeDialog, 
    resumeDraft, 
    startOver, 
    pendingDraft 
  } = useFormBuilder()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [inspectorOpen, setInspectorOpen] = useState(true)
  

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100" style={{
      backgroundColor: (() => {
        const cover = state.current_form?.fields.find(f => f.type === 'cover_slide') as any
        return cover?.settings?.coverBackgroundColor || undefined
      })()
    }}>
      {/* Modern Toolbar */}
      <FormBuilderToolbar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        inspectorOpen={inspectorOpen}
        setInspectorOpen={setInspectorOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden" style={{
        backgroundColor: (() => {
          const cover = state.current_form?.fields.find(f => f.type === 'cover_slide') as any
          return cover?.settings?.coverBackgroundColor || undefined
        })()
      }}>
        {/* Left Sidebar - Field Library */}
        <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 ease-in-out bg-white border-r border-gray-200 shadow-lg relative group`}>
          {sidebarOpen && (
            <>
              {/* Collapse control - left sidebar */}
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="absolute -right-3 top-2 z-10 h-6 w-6 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                title="Collapse fields"
              >
                <ArrowLeftIcon className="h-3.5 w-3.5" />
              </button>
              <FormBuilderSidebar />
            </>
          )}
        </div>

        {/* Center Canvas - Form Builder */}
        <div className="flex-1 flex flex-col relative group" style={{
          backgroundColor: (() => {
            const cover = state.current_form?.fields.find(f => f.type === 'cover_slide') as any
            return cover?.settings?.coverBackgroundColor || undefined
          })()
        }}>
          {/* Peek controls to re-open sidebars when collapsed */}
          {!sidebarOpen && (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="absolute left-1 top-2 z-10 h-6 px-2 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
              title="Show fields"
            >
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </button>
          )}
          {!inspectorOpen && (
            <button
              type="button"
              onClick={() => setInspectorOpen(true)}
              className="absolute right-1 top-2 z-10 h-6 px-2 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
              title="Show properties"
            >
              <ArrowLeftIcon className="h-3.5 w-3.5" />
            </button>
          )}
          <FormBuilderCanvas />
        </div>

        {/* Right Inspector - Question */}
        <div className={`${inspectorOpen ? 'w-80' : 'w-0'} transition-all duration-300 ease-in-out bg-white border-l border-gray-200 shadow-lg relative group`}>
          {inspectorOpen && (
            <>
              {/* Collapse control - right sidebar */}
              <button
                type="button"
                onClick={() => setInspectorOpen(false)}
                className="absolute -left-3 top-2 z-10 h-6 w-6 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                title="Collapse properties"
              >
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </button>
              <FormBuilderInspector />
            </>
          )}
        </div>
      </div>

      {/* Enhanced Preview Overlay */}
      {state.is_preview_mode && state.current_form && (
        <EnhancedFormPreview
          form={state.current_form}
          onClose={() => setPreviewMode(false)}
        />
      )}

      {/* Enhanced AutoSave Component */}
      {state.current_form && (
        <EnhancedAutoSave
          form={state.current_form}
          onSave={async (form) => {
            // The saveForm method is already handled by the FormBuilderProvider
            // This is just for the enhanced autosave component
          }}
          onDraftSaved={onDraftSaved}
          onDraftRestored={onDraftRestored}
        />
      )}

      {/* Resume Dialog */}
      {showResumeDialog && pendingDraft && (
        <ResumeDialog
          draft={pendingDraft.data}
          onResume={resumeDraft}
          onStartOver={startOver}
          onCancel={() => setShowResumeDialog(false)}
          isOpen={showResumeDialog}
        />
      )}
    </div>
  )
} 