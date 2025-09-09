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
import { Bars3Icon, Cog6ToothIcon } from '@heroicons/react/24/outline'

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
  
  // Auto-collapse side panels on small screens
  // This keeps desktop behavior unchanged while improving mobile usability
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
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Field Library */}
        <div className={`${sidebarOpen ? 'w-80 md:w-80' : 'w-0'} md:block transition-all duration-300 ease-in-out bg-white border-r border-gray-200 shadow-lg relative group ${sidebarOpen ? 'block' : 'hidden md:block'}`}>
          {sidebarOpen && (
            <>
              {/* Mobile overlay */}
              <div 
                className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={() => setSidebarOpen(false)}
              />
              
              {/* Collapse control - left sidebar */}
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="absolute -right-3 top-2 z-50 h-6 w-6 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                title="Collapse fields"
              >
                <ArrowLeftIcon className="h-3.5 w-3.5" />
              </button>
              <div className="relative z-50">
                <FormBuilderSidebar />
              </div>
            </>
          )}
        </div>

        {/* Center Canvas - Form Builder */}
        <div className="flex-1 flex flex-col relative group px-3 py-3 md:px-6 md:py-4">
          {/* Mobile controls to open side panels */}
          <div className="md:hidden flex items-center justify-between mb-2">
            <button
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-gray-200 bg-white text-xs font-medium shadow-sm hover:bg-gray-50"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="w-3.5 h-3.5" /> Add Fields
            </button>
            <button
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-gray-200 bg-white text-xs font-medium shadow-sm hover:bg-gray-50"
              onClick={() => setInspectorOpen(true)}
            >
              <Cog6ToothIcon className="w-3.5 h-3.5" /> Settings
            </button>
          </div>

          {/* Canvas content */}
          <FormBuilderCanvas />
        </div>

        {/* Right Inspector - Field/Form settings */}
        <div className={`${inspectorOpen ? 'w-96 md:w-96' : 'w-0'} md:block transition-all duration-300 ease-in-out bg-white border-l border-gray-200 shadow-lg relative group ${inspectorOpen ? 'block' : 'hidden md:block'}`}>
          {inspectorOpen && (
            <>
              {/* Mobile overlay */}
              <div 
                className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={() => setInspectorOpen(false)}
              />
              
              {/* Collapse control - right sidebar */}
              <button
                type="button"
                onClick={() => setInspectorOpen(false)}
                className="absolute -left-3 top-2 z-50 h-6 w-6 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                title="Collapse settings"
              >
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </button>
              <div className="relative z-50">
                <FormBuilderInspector />
              </div>
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