'use client'

import React, { useState, useEffect } from 'react'
import { BrandKitProvider, useBrandKit } from '@/components/providers/BrandKitProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  SwatchIcon,
  DocumentTextIcon,
  PhotoIcon,
  Cog6ToothIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ArrowPathIcon,
  PlusIcon,
  XMarkIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import ColorPicker from '@/components/brand-kit/ColorPicker'
import LogoUpload from '@/components/brand-kit/LogoUpload'
import { BrandAsset } from '@/types/brand-kit'
import FormPreview from '@/components/brand-kit/FormPreview'

function BrandKitContent() {
  const { 
    brandKit, 
    updateColor, 
    updateTypography, 
    updateFormStyling, 
    updateLogo,
    resetToDefault,
    exportBrandKit,
    importBrandKit,
    updateBrandKit
  } = useBrandKit()

  // ALL HOOKS MUST BE CALLED AT THE TOP - BEFORE ANY CONDITIONAL RETURNS
  // Track hydration state to prevent SSR/client mismatch
  const [isHydrated, setIsHydrated] = useState(false)
  const [importData, setImportData] = useState('')
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [newColorName, setNewColorName] = useState('')
  const [activeTab, setActiveTab] = useState('colors')

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Safety check for brandKit and hydration (after all hooks)
  if (!brandKit || !isHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading brand kit...</p>
        </div>
      </div>
    )
  }

  // Helper to ensure text logo object is always complete
  const baseTextLogo = {
    text: '',
    fontFamily: 'Inter',
    fontSize: '2xl' as 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl',
    color: '#3b82f6',
    fontWeight: 'bold' as 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black',
    textTransform: 'none' as 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  }

  const applyTextLogo = (updates: Partial<typeof baseTextLogo>) => {
    const current = (brandKit as any).customTextLogo || {}
    updateBrandKit({ customTextLogo: { ...baseTextLogo, ...current, ...updates } as any })
  }

  const handleImport = () => {
    try {
      importBrandKit(importData)
      setShowImportDialog(false)
      setImportData('')
    } catch (error) {
      alert('Failed to import brand kit: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const addCustomColor = () => {
    if (!newColorName.trim() || !brandKit?.colors) return
    
    const newColor = {
      id: `custom-${Date.now()}`,
      name: newColorName.trim(),
      hex: '#000000',
      rgb: '0, 0, 0',
      hsl: '0, 0%, 0%',
      opacity: 1,
      isCustom: true
    }
    updateBrandKit({
      ...brandKit,
      colors: { ...brandKit.colors, custom: [...(brandKit.colors.custom || []), newColor] }
    })
    setNewColorName('')
  }

  const removeCustomColor = (colorId: string) => {
    if (!brandKit?.colors?.custom) return
    
    const updatedCustom = brandKit.colors.custom.filter(c => c.id !== colorId)
    updateBrandKit({
      ...brandKit,
      colors: { ...brandKit.colors, custom: updatedCustom }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Brand Kit</h1>
              <p className="text-gray-600 mt-2">Customize your form branding and styling with advanced controls</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowImportDialog(true)}
                className="flex items-center space-x-2"
              >
                <ArrowUpTrayIcon className="h-4 w-4" />
                <span>Import</span>
              </Button>
              <Button
                variant="outline"
                onClick={exportBrandKit}
                className="flex items-center space-x-2"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                <span>Export</span>
              </Button>
              <Button
                variant="outline"
                onClick={resetToDefault}
                className="flex items-center space-x-2"
              >
                <ArrowPathIcon className="h-4 w-4" />
                <span>Reset</span>
              </Button>

            </div>
          </div>
        </div>

        {/* Import Dialog */}
        {showImportDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Import Brand Kit</h3>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste your brand kit JSON data here..."
                rows={8}
                className="w-full border border-gray-300 rounded-md p-3 font-mono text-sm"
              />
              <div className="flex items-center justify-end space-x-3 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowImportDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleImport}>
                  Import
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Brand Kit Controls */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="colors">Colors</TabsTrigger>
                <TabsTrigger value="typography">Typography</TabsTrigger>
                <TabsTrigger value="styling">Form Styling</TabsTrigger>
                <TabsTrigger value="logos">Logos</TabsTrigger>
              </TabsList>

              {/* Colors Tab */}
              <TabsContent value="colors" className="space-y-6">
                {/* Form Colors */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <SwatchIcon className="h-5 w-5" />
                      Form Colors
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Define colors for specific form elements
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ColorPicker
                        color={brandKit.colors?.pageBackground || { name: 'Page Background', hex: '#f8fafc', rgb: '248, 250, 252', hsl: '210, 40%, 98%', opacity: 1, isCustom: false }}
                        onChange={(color) => updateColor('pageBackground', 'hex', (color as any).hex || '#f8fafc')}
                        label="Page Background"
                      />
                      <ColorPicker
                        color={brandKit.colors?.formBackground || { name: 'Form Background', hex: '#ffffff', rgb: '255, 255, 255', hsl: '0, 0%, 100%', opacity: 1, isCustom: false }}
                        onChange={(color) => updateColor('formBackground', 'hex', (color as any).hex || '#ffffff')}
                        label="Form Background"
                      />
                      <ColorPicker
                        color={brandKit.colors?.fieldBackground || { name: 'Field Background', hex: '#ffffff', rgb: '255, 255, 255', hsl: '0, 0%, 100%', opacity: 1, isCustom: false }}
                        onChange={(color) => updateColor('fieldBackground', 'hex', (color as any).hex || '#ffffff')}
                        label="Field Background"
                      />
                      <ColorPicker
                        color={brandKit.colors?.buttonPrimary || { name: 'Primary Button', hex: '#3b82f6', rgb: '59, 130, 246', hsl: '217, 91%, 60%', opacity: 1, isCustom: false }}
                        onChange={(color) => updateColor('buttonPrimary', 'hex', (color as any).hex || '#3b82f6')}
                        label="Primary Button"
                      />
                      <ColorPicker
                        color={brandKit.colors?.buttonSecondary || { name: 'Secondary Button', hex: '#6b7280', rgb: '107, 114, 128', hsl: '220, 9%, 46%', opacity: 1, isCustom: false }}
                        onChange={(color) => updateColor('buttonSecondary', 'hex', (color as any).hex || '#000000')}
                        label="Secondary Button"
                      />
                      <ColorPicker
                        color={brandKit.colors?.headerBackground || { name: 'Header Background', hex: '#ffffff', rgb: '255, 255, 255', hsl: '0, 0%, 100%', opacity: 1, isCustom: false }}
                        onChange={(color) => updateColor('headerBackground', 'hex', (color as any).hex || '#000000')}
                        label="Header Background"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Text & Interactive Colors */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <SwatchIcon className="h-5 w-5" />
                      Text & Interactive Colors
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Colors for text, focus states, and feedback
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ColorPicker
                        color={brandKit.colors?.focus || { name: 'Focus Color', hex: '#3b82f6', rgb: '59, 130, 246', hsl: '217, 91%, 60%', opacity: 1, isCustom: false }}
                        onChange={(color) => updateColor('focus', 'hex', (color as any).hex || '#000000')}
                        label="Focus Color"
                      />
                      <ColorPicker
                        color={brandKit.colors?.hover || { name: 'Hover Color', hex: '#2563eb', rgb: '37, 99, 235', hsl: '220, 83%, 53%', opacity: 1, isCustom: false }}
                        onChange={(color) => updateColor('hover', 'hex', (color as any).hex || '#000000')}
                        label="Hover Color"
                      />
                      <ColorPicker
                        color={brandKit.colors?.success || { name: 'Success Color', hex: '#22c55e', rgb: '34, 197, 94', hsl: '142, 76%, 36%', opacity: 1, isCustom: false }}
                        onChange={(color) => updateColor('success', 'hex', (color as any).hex || '#000000')}
                        label="Success Color"
                      />
                      <ColorPicker
                        color={brandKit.colors?.warning || { name: 'Warning Color', hex: '#f59e0b', rgb: '245, 158, 11', hsl: '43, 91%, 47%', opacity: 1, isCustom: false }}
                        onChange={(color) => updateColor('warning', 'hex', (color as any).hex || '#000000')}
                        label="Warning Color"
                      />
                      <ColorPicker
                        color={brandKit.colors?.error || { name: 'Error Color', hex: '#ef4444', rgb: '239, 68, 68', hsl: '0, 84%, 60%', opacity: 1, isCustom: false }}
                        onChange={(color) => updateColor('error', 'hex', (color as any).hex || '#000000')}
                        label="Error Color"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Custom Colors */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <SwatchIcon className="h-5 w-5" />
                      Custom Colors
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Add custom colors for specific use cases
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Input
                        value={newColorName}
                        onChange={(e) => setNewColorName(e.target.value)}
                        placeholder="Color name (e.g., Brand Blue)"
                        className="flex-1"
                        onKeyPress={(e) => e.key === 'Enter' && addCustomColor()}
                      />
                      <Button onClick={addCustomColor} disabled={!newColorName.trim()}>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Color
                      </Button>
                    </div>
                    
                    {brandKit.colors?.custom && brandKit.colors.custom.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {brandKit.colors.custom.map((color) => (
                          <ColorPicker
                            key={color.id || `custom-${Date.now()}`}
                            color={color}
                            onChange={(updatedColor) => {
                              const updatedCustom = (brandKit.colors?.custom || []).map(c => 
                                c.id === color.id ? updatedColor : c
                              )
                              updateBrandKit({
                                ...brandKit,
                                colors: { ...brandKit.colors, custom: updatedCustom }
                              })
                            }}
                            onDelete={() => color.id && removeCustomColor(color.id)}
                            showDelete
                            label={color.name}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Typography Tab */}
              <TabsContent value="typography" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DocumentTextIcon className="h-5 w-5" />
                      Typography Settings
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Configure fonts and text styling for your forms
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Primary Font</label>
                        <select
                          value={brandKit.typography?.fontFamily?.primary || 'Inter'}
                          onChange={(e) => updateTypography('fontFamily', 'primary', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="Inter">Inter</option>
                          <option value="Roboto">Roboto</option>
                          <option value="Open Sans">Open Sans</option>
                          <option value="Lato">Lato</option>
                          <option value="Poppins">Poppins</option>
                          <option value="Montserrat">Montserrat</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Secondary Font</label>
                        <select
                          value={brandKit.typography?.fontFamily?.secondary || 'Inter'}
                          onChange={(e) => updateTypography('fontFamily', 'secondary', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="Inter">Inter</option>
                          <option value="Roboto">Roboto</option>
                          <option value="Open Sans">Open Sans</option>
                          <option value="Lato">Lato</option>
                          <option value="Poppins">Poppins</option>
                          <option value="Montserrat">Montserrat</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Heading Size</label>
                        <Input
                          value={brandKit.typography?.fontSize?.xl || '1.25rem'}
                          onChange={(e) => updateTypography('fontSize', 'xl', e.target.value)}
                          placeholder="e.g., 24px"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Body Size</label>
                        <Input
                          value={brandKit.typography?.fontSize?.base || '1rem'}
                          onChange={(e) => updateTypography('fontSize', 'base', e.target.value)}
                          placeholder="e.g., 16px"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Small Text Size</label>
                        <Input
                          value={brandKit.typography?.fontSize?.sm || '0.875rem'}
                          onChange={(e) => updateTypography('fontSize', 'sm', e.target.value)}
                          placeholder="e.g., 14px"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Form Styling Tab */}
              <TabsContent value="styling" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Cog6ToothIcon className="h-5 w-5" />
                      Form Styling
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Customize the appearance and layout of your forms
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-md font-medium">Layout</h4>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Form Width</label>
                          <select
                            value={brandKit.formStyling?.layout?.width || 'medium'}
                            onChange={(e) => updateFormStyling('layout', 'width', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            <option value="small">Small (480px)</option>
                            <option value="medium">Medium (768px)</option>
                            <option value="large">Large (1024px)</option>
                            <option value="full">Full Width</option>
                            <option value="custom">Custom</option>
                          </select>
                        </div>
                        {brandKit.formStyling?.layout?.width === 'custom' && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Custom Max Width</label>
                          <Input
                            value={brandKit.formStyling?.layout?.maxWidth || '768px'}
                            onChange={(e) => updateFormStyling('layout', 'maxWidth', e.target.value)}
                              placeholder="e.g., 800px, 50%, 100vw"
                          />
                        </div>
                        )}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Border Radius</label>
                          <Input
                            value={brandKit.formStyling?.layout?.borderRadius || '0.5rem'}
                            onChange={(e) => updateFormStyling('layout', 'borderRadius', e.target.value)}
                            placeholder="e.g., 8px"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-md font-medium">Spacing</h4>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Section Gap</label>
                          <Input
                            value={brandKit.formStyling?.spacing?.sectionGap || '2rem'}
                            onChange={(e) => updateFormStyling('spacing', 'sectionGap', e.target.value)}
                            placeholder="e.g., 24px"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Field Gap</label>
                          <Input
                            value={brandKit.formStyling?.spacing?.fieldGap || '1.5rem'}
                            onChange={(e) => updateFormStyling('spacing', 'fieldGap', e.target.value)}
                            placeholder="e.g., 16px"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Label Gap</label>
                          <Input
                            value={brandKit.formStyling?.spacing?.labelGap || '1rem'}
                            onChange={(e) => updateFormStyling('spacing', 'labelGap', e.target.value)}
                            placeholder="e.g., 12px"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-md font-medium">Button Styling</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Primary Button Padding</label>
                          <Input
                            value={brandKit.formStyling?.button?.primary?.padding || '0.75rem 1.5rem'}
                            onChange={(e) => updateFormStyling('button', 'primary', { ...brandKit.formStyling?.button?.primary, padding: e.target.value })}
                            placeholder="e.g., 0.75rem 1.5rem"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Secondary Button Padding</label>
                          <Input
                            value={brandKit.formStyling?.button?.secondary?.padding || '0.75rem 1.5rem'}
                            onChange={(e) => updateFormStyling('button', 'secondary', { ...brandKit.formStyling?.button?.secondary, padding: e.target.value })}
                            placeholder="e.g., 0.75rem 1.5rem"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-md font-medium">Input Styling</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Input Padding</label>
                          <Input
                            value={brandKit.formStyling?.input?.padding || '0.75rem'}
                            onChange={(e) => updateFormStyling('input', 'padding', e.target.value)}
                            placeholder="e.g., 0.75rem"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Input Border Radius</label>
                          <Input
                            value={brandKit.formStyling?.input?.borderRadius || '0.375rem'}
                            onChange={(e) => updateFormStyling('input', 'borderRadius', e.target.value)}
                            placeholder="e.g., 0.375rem"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Logos Tab */}
              <TabsContent value="logos" className="space-y-6">
                {/* Stripeform Logo Options */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Brand Identity Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Primary Logo - Large */}
                      <div className="text-center space-y-2">
                        <button
                          type="button"
                          onClick={() => applyTextLogo({ color: brandKit.colors?.buttonPrimary?.hex || '#3b82f6' })}
                          className="w-full bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="text-3xl font-bold mb-1" style={{ color: brandKit.colors?.buttonPrimary?.hex || '#3b82f6' }}>Stripeform</div>
                          <div className="text-xs text-gray-500">Primary - Large</div>
                        </button>
                      </div>

                      {/* Primary Logo - Medium */}
                      <div className="text-center space-y-2">
                        <button
                          type="button"
                          onClick={() => applyTextLogo({ color: brandKit.colors?.buttonPrimary?.hex || '#3b82f6' })}
                          className="w-full bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="text-xl font-bold mb-1" style={{ color: brandKit.colors?.buttonPrimary?.hex || '#3b82f6' }}>Stripeform</div>
                          <div className="text-xs text-gray-500">Primary - Medium</div>
                        </button>
                      </div>

                      {/* Primary Logo - Small */}
                      <div className="text-center space-y-2">
                        <button
                          type="button"
                          onClick={() => applyTextLogo({ color: brandKit.colors?.buttonPrimary?.hex || '#3b82f6' })}
                          className="w-full bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="text-base font-bold mb-1" style={{ color: brandKit.colors?.buttonPrimary?.hex || '#3b82f6' }}>Stripeform</div>
                          <div className="text-xs text-gray-500">Primary - Small</div>
                        </button>
                      </div>

                      {/* Secondary Logo - Large */}
                      <div className="text-center space-y-2">
                        <button
                          type="button"
                          onClick={() => applyTextLogo({ color: brandKit.colors?.buttonSecondary?.hex || '#8b5cf6' })}
                          className="w-full bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="text-3xl font-bold mb-1" style={{ color: brandKit.colors?.buttonSecondary?.hex || '#8b5cf6' }}>Stripeform</div>
                          <div className="text-xs text-gray-500">Secondary - Large</div>
                        </button>
                      </div>

                      {/* Secondary Logo - Medium */}
                      <div className="text-center space-y-2">
                        <button
                          type="button"
                          onClick={() => applyTextLogo({ color: brandKit.colors?.buttonSecondary?.hex || '#8b5cf6' })}
                          className="w-full bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="text-xl font-bold mb-1" style={{ color: brandKit.colors?.buttonSecondary?.hex || '#8b5cf6' }}>Stripeform</div>
                          <div className="text-xs text-gray-500">Secondary - Medium</div>
                        </button>
                      </div>

                      {/* Secondary Logo - Small */}
                      <div className="text-center space-y-2">
                        <button
                          type="button"
                          onClick={() => applyTextLogo({ color: brandKit.colors?.buttonSecondary?.hex || '#8b5cf6' })}
                          className="w-full bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="text-base font-bold mb-1" style={{ color: brandKit.colors?.buttonSecondary?.hex || '#8b5cf6' }}>Stripeform</div>
                          <div className="text-xs text-gray-500">Secondary - Small</div>
                        </button>
                      </div>

                      {/* Accent Logo - Large */}
                      <div className="text-center space-y-2">
                        <button
                          type="button"
                          onClick={() => applyTextLogo({ color: brandKit.colors?.focus?.hex || '#10b981' })}
                          className="w-full bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="text-3xl font-bold mb-1" style={{ color: brandKit.colors?.focus?.hex || '#10b981' }}>Stripeform</div>
                          <div className="text-xs text-gray-500">Accent - Large</div>
                        </button>
                      </div>

                      {/* Accent Logo - Medium */}
                      <div className="text-center space-y-2">
                        <button
                          type="button"
                          onClick={() => applyTextLogo({ color: brandKit.colors?.focus?.hex || '#10b981' })}
                          className="w-full bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="text-xl font-bold mb-1" style={{ color: brandKit.colors?.focus?.hex || '#10b981' }}>Stripeform</div>
                          <div className="text-xs text-gray-500">Accent - Medium</div>
                        </button>
                      </div>

                      {/* Accent Logo - Small */}
                      <div className="text-center space-y-2">
                        <button
                          type="button"
                          onClick={() => applyTextLogo({ color: brandKit.colors?.focus?.hex || '#10b981' })}
                          className="w-full bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="text-base font-bold mb-1" style={{ color: brandKit.colors?.focus?.hex || '#10b981' }}>Stripeform</div>
                          <div className="text-xs text-gray-500">Accent - Small</div>
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Custom Logo Upload */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PhotoIcon className="h-5 w-5" />
                      Upload Brand Logo
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Upload your brand logo image (SVG, PNG, JPEG)
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <LogoUpload
                      currentAsset={(brandKit as any)?.logo?.main?.light || undefined}
                      onUpload={(asset) => {
                        updateLogo('light', asset)
                        // Automatically set as current logo when uploaded
                        updateBrandKit({
                          logo: {
                            ...brandKit.logo,
                            current: {
                              type: 'image',
                              variant: 'light',
                              file: asset.url
                            }
                          }
                        })
                      }}
                      onRemove={() => {
                        updateLogo('light', null as any)
                        // Clear current logo if it was the uploaded one
                        if (brandKit.logo?.current?.type === 'image') {
                          updateBrandKit({
                            logo: {
                              ...brandKit.logo,
                              current: undefined
                            }
                          })
                        }
                      }}
                      type="light"
                      label="Primary Logo"
                    />
                    
                    {/* Show apply button if logo exists but isn't current */}
                    {(brandKit as any)?.logo?.main?.light && 
                     brandKit.logo?.current?.type !== 'image' && (
                      <div className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateBrandKit({
                            logo: {
                              ...brandKit.logo,
                              current: {
                                type: 'image',
                                variant: 'light',
                                file: (brandKit as any).logo.main.light.url
                              }
                            }
                          })}
                        >
                          Apply Logo to Brand
                        </Button>
                    </div>
                    )}
                  </CardContent>
                </Card>

                {/* Custom Text Logo Creator */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DocumentTextIcon className="h-5 w-5" />
                      Create Custom Text Logo
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Design your own text-based logo with custom styling
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Logo Text</label>
                          <Input
                            placeholder="Enter your brand name"
                            value={brandKit.customTextLogo?.text || ''}
                            onChange={(e) => applyTextLogo({ text: e.target.value })}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Font Family</label>
                          <select
                            value={brandKit.customTextLogo?.fontFamily || 'Inter'}
                            onChange={(e) => applyTextLogo({ fontFamily: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            <option value="Inter">Inter</option>
                            <option value="Roboto">Roboto</option>
                            <option value="Open Sans">Open Sans</option>
                            <option value="Lato">Lato</option>
                            <option value="Poppins">Poppins</option>
                            <option value="Montserrat">Montserrat</option>
                            <option value="Playfair Display">Playfair Display</option>
                            <option value="Merriweather">Merriweather</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Font Size</label>
                          <select
                            value={brandKit.customTextLogo?.fontSize || '2xl'}
                            onChange={(e) => applyTextLogo({ fontSize: e.target.value as any })}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            <option value="sm">Small</option>
                            <option value="base">Base</option>
                            <option value="lg">Large</option>
                            <option value="xl">Extra Large</option>
                            <option value="2xl">2XL</option>
                            <option value="3xl">3XL</option>
                            <option value="4xl">4XL</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Text Color</label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="color"
                              value={brandKit.customTextLogo?.color || '#3b82f6'}
                              onChange={(e) => applyTextLogo({ color: e.target.value })}
                              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                            />
                            <Input
                              value={brandKit.customTextLogo?.color || '#3b82f6'}
                              onChange={(e) => applyTextLogo({ color: e.target.value })}
                              placeholder="#3b82f6"
                              className="flex-1"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Font Weight</label>
                          <select
                            value={brandKit.customTextLogo?.fontWeight || 'bold'}
                            onChange={(e) => applyTextLogo({ fontWeight: e.target.value as any })}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            <option value="normal">Normal</option>
                            <option value="medium">Medium</option>
                            <option value="semibold">Semibold</option>
                            <option value="bold">Bold</option>
                            <option value="extrabold">Extra Bold</option>
                            <option value="black">Black</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Text Transform</label>
                          <select
                            value={brandKit.customTextLogo?.textTransform || 'none'}
                            onChange={(e) => applyTextLogo({ textTransform: e.target.value as any })}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            <option value="none">None</option>
                            <option value="uppercase">Uppercase</option>
                            <option value="lowercase">Lowercase</option>
                            <option value="capitalize">Capitalize</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Live Preview - Always show, with placeholder text */}
                      <div className="mt-6 p-6 bg-white rounded-lg border-2 border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Live Preview</h4>
                        <div className="text-center">
                          <div
                            className="inline-block"
                            style={{
                              fontFamily: brandKit.customTextLogo?.fontFamily || 'Inter',
                              fontSize: brandKit.customTextLogo?.fontSize === 'sm' ? '0.875rem' :
                                       brandKit.customTextLogo?.fontSize === 'base' ? '1rem' :
                                       brandKit.customTextLogo?.fontSize === 'lg' ? '1.125rem' :
                                       brandKit.customTextLogo?.fontSize === 'xl' ? '1.25rem' :
                                       brandKit.customTextLogo?.fontSize === '2xl' ? '1.5rem' :
                                       brandKit.customTextLogo?.fontSize === '3xl' ? '1.875rem' :
                                       brandKit.customTextLogo?.fontSize === '4xl' ? '2.25rem' : '1.5rem',
                              fontWeight: brandKit.customTextLogo?.fontWeight || 'bold',
                              color: brandKit.customTextLogo?.color || '#3b82f6',
                            textTransform: brandKit.customTextLogo?.textTransform || 'none',
                            opacity: brandKit.customTextLogo?.text ? 1 : 0.5
                            }}
                          >
                          {brandKit.customTextLogo?.text || 'Your Brand Name'}
                          </div>
                        </div>
                      {brandKit.customTextLogo?.text && (
                        <div className="mt-4 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => applyTextLogo({})}
                            className="mx-auto"
                          >
                            Apply Custom Logo
                          </Button>
                      </div>
                    )}
                    </div>
                  </CardContent>
                </Card>


              </TabsContent>


            </Tabs>
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-6">
            <div className="sticky top-8">
              <Card>
                <CardContent className="p-6">
                  <FormPreview />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BrandKitPage() {
  // Redirect to profile brand-kit tab
  if (typeof window !== 'undefined') {
    window.location.replace('/profile?tab=brand-kit')
  }
  return null as any
}

// Simple error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Brand Kit Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }

    return this.props.children
  }
} 