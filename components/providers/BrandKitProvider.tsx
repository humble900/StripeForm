'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { BrandKit, defaultBrandKit } from '@/types/brand-kit'

interface BrandKitContextType {
  brandKit: BrandKit
  updateBrandKit: (updates: Partial<BrandKit>) => void
  updateColor: (category: string, key: string, color: any) => void
  updateTypography: (category: string, key: string, value: any) => void
  updateFormStyling: (category: string, key: string, value: any) => void
  updateLogo: (type: string, asset: any) => void
  resetToDefault: () => void
  exportBrandKit: () => void
  importBrandKit: (data: string) => void
  generateCSSVariables: () => string
  applyToForm: (formId: string) => void
}

const BrandKitContext = createContext<BrandKitContextType | undefined>(undefined)

export const useBrandKit = () => {
  const context = useContext(BrandKitContext)
  if (!context) {
    throw new Error('useBrandKit must be used within a BrandKitProvider')
  }
  return context
}

interface BrandKitProviderProps {
  children: ReactNode
}

export const BrandKitProvider: React.FC<BrandKitProviderProps> = ({ children }) => {
  const [brandKit, setBrandKit] = useState<BrandKit>(defaultBrandKit)

  // Load brand kit from localStorage on mount
  useEffect(() => {
    try {
      // Only run on client side
      if (typeof window === 'undefined') return
      
      const savedBrandKit = localStorage.getItem('stripeform-brand-kit')
      if (savedBrandKit) {
        try {
          const parsed = JSON.parse(savedBrandKit)
          setBrandKit(parsed)
        } catch (error) {
          console.error('Failed to parse saved brand kit:', error)
          setBrandKit(defaultBrandKit)
        }
      }
    } catch (error) {
      console.error('localStorage not available:', error)
      setBrandKit(defaultBrandKit)
    }
  }, [])

  // Save brand kit to localStorage whenever it changes
  useEffect(() => {
    try {
      // Only run on client side
      if (typeof window === 'undefined') return
      
      localStorage.setItem('stripeform-brand-kit', JSON.stringify(brandKit))
      
      // Generate and inject CSS variables
      const cssVariables = generateCSSVariables()
      injectCSSVariables(cssVariables)
      
      // Notify other components about brand kit changes
      window.dispatchEvent(new CustomEvent('brandKitUpdated', { detail: brandKit }))
    } catch (error) {
      console.error('Failed to save brand kit:', error)
    }
  }, [brandKit])

  const updateBrandKit = (updates: Partial<BrandKit>) => {
    setBrandKit(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString()
    }))
  }

  const updateColor = (category: string, key: string, color: any) => {
    setBrandKit(prev => {
      const newBrandKit = { ...prev }
      
      if (category === 'custom') {
        // Ensure custom colors array exists
        if (!newBrandKit.colors.custom) {
          newBrandKit.colors.custom = []
        }
        
        // Handle custom colors array
        if (key === 'add') {
          newBrandKit.colors.custom.push(color)
        } else if (key === 'remove') {
          newBrandKit.colors.custom = newBrandKit.colors.custom.filter(c => c.id !== color.id)
        } else if (key === 'update') {
          const index = newBrandKit.colors.custom.findIndex(c => c.id === color.id)
          if (index !== -1) {
            newBrandKit.colors.custom[index] = color
          }
        }
      } else {
        // Handle nested color properties
        const categoryObj = newBrandKit.colors[category as keyof typeof newBrandKit.colors]
        if (categoryObj && typeof categoryObj === 'object') {
          (categoryObj as any)[key] = color
        }
      }
      
      return {
        ...newBrandKit,
        updatedAt: new Date().toISOString()
      }
    })
  }

  const updateTypography = (category: string, key: string, value: any) => {
    setBrandKit(prev => ({
      ...prev,
      typography: {
        ...prev.typography,
        [category]: {
          ...(prev.typography?.[category as keyof typeof prev.typography] || {}),
          [key]: value
        }
      },
      updatedAt: new Date().toISOString()
    }))
  }

  const updateFormStyling = (category: string, key: string, value: any) => {
    setBrandKit(prev => ({
      ...prev,
      formStyling: {
        ...prev.formStyling,
        [category]: {
          ...(prev.formStyling?.[category as keyof typeof prev.formStyling] || {}),
          [key]: value
        }
      },
      updatedAt: new Date().toISOString()
    }))
  }

  const updateLogo = (type: string, asset: any) => {
    setBrandKit(prev => ({
      ...prev,
      logo: {
        ...prev.logo,
        main: {
          ...(prev.logo?.main || {}),
          [type]: asset
        },
        updatedAt: new Date().toISOString()
      },
      updatedAt: new Date().toISOString()
    }))
  }

  const resetToDefault = () => {
    setBrandKit(defaultBrandKit)
  }

  const exportBrandKit = () => {
    // Only run on client side
    if (typeof window === 'undefined') return
    
    const dataStr = JSON.stringify(brandKit, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    
    const link = document.createElement('a')
    link.href = URL.createObjectURL(dataBlob)
    link.download = `brand-kit-${brandKit.name.toLowerCase().replace(/\s+/g, '-')}.json`
    link.click()
  }

  const importBrandKit = (data: string) => {
    try {
      const imported = JSON.parse(data)
      setBrandKit(imported)
    } catch (error) {
      console.error('Failed to import brand kit:', error)
      throw new Error('Invalid brand kit file format')
    }
  }

  const generateCSSVariables = (): string => {
    const variables: string[] = []
    
    try {
      // Color variables
      if (brandKit.colors) {
        Object.entries(brandKit.colors).forEach(([category, value]) => {
          if (typeof value === 'object' && value && 'hex' in value) {
            // Single color
            variables.push(`--brand-${category}: ${value.hex};`)
            if (value.rgb) variables.push(`--brand-${category}-rgb: ${value.rgb};`)
            if (value.hsl) variables.push(`--brand-${category}-hsl: ${value.hsl};`)
          } else if (typeof value === 'object' && value) {
            // Color category (background, text, border)
            Object.entries(value).forEach(([key, color]) => {
              if (color && typeof color === 'object' && 'hex' in color && 'rgb' in color && 'hsl' in color) {
                const colorValue = color as { hex: string; rgb: string; hsl: string };
                variables.push(`--brand-${category}-${key}: ${colorValue.hex};`)
                variables.push(`--brand-${category}-${key}-rgb: ${colorValue.rgb};`)
                variables.push(`--brand-${category}-${key}-hsl: ${colorValue.hsl};`)
              }
            })
          }
        })
      }
      
      // Typography variables
      if (brandKit.typography) {
        if (brandKit.typography.fontFamily) {
          Object.entries(brandKit.typography.fontFamily).forEach(([key, value]) => {
            if (value) variables.push(`--font-family-${key}: ${value};`)
          })
        }
        
        if (brandKit.typography.fontSize) {
          Object.entries(brandKit.typography.fontSize).forEach(([key, value]) => {
            if (value) variables.push(`--font-size-${key}: ${value};`)
          })
        }
        
        if (brandKit.typography.fontWeight) {
          Object.entries(brandKit.typography.fontWeight).forEach(([key, value]) => {
            if (value) variables.push(`--font-weight-${key}: ${value};`)
          })
        }
        
        if (brandKit.typography.lineHeight) {
          Object.entries(brandKit.typography.lineHeight).forEach(([key, value]) => {
            if (value) variables.push(`--line-height-${key}: ${value};`)
          })
        }
        
        if (brandKit.typography.letterSpacing) {
          Object.entries(brandKit.typography.letterSpacing).forEach(([key, value]) => {
            if (value) variables.push(`--letter-spacing-${key}: ${value};`)
          })
        }
      }
      
      // Form styling variables
      if (brandKit.formStyling) {
        if (brandKit.formStyling.layout) {
          Object.entries(brandKit.formStyling.layout).forEach(([key, value]) => {
            if (value) variables.push(`--form-${key}: ${value};`)
          })
        }
        
        if (brandKit.formStyling.spacing) {
          Object.entries(brandKit.formStyling.spacing).forEach(([key, value]) => {
            if (value) variables.push(`--form-spacing-${key}: ${value};`)
          })
        }
        
        if (brandKit.formStyling.input) {
          Object.entries(brandKit.formStyling.input).forEach(([key, value]) => {
            if (value) variables.push(`--form-input-${key}: ${value};`)
          })
        }
        
        // Button variables
        if (brandKit.formStyling.button) {
          Object.entries(brandKit.formStyling.button).forEach(([buttonType, styles]) => {
            if (styles && typeof styles === 'object') {
              Object.entries(styles).forEach(([key, value]) => {
                if (typeof value === 'string' || typeof value === 'number') {
                  variables.push(`--form-button-${buttonType}-${key}: ${value};`)
                }
              })
            }
          })
        }
        
        // Progress variables
        if (brandKit.formStyling.progress) {
          Object.entries(brandKit.formStyling.progress).forEach(([key, value]) => {
            if (value) variables.push(`--form-progress-${key}: ${value};`)
          })
        }
      }
    } catch (error) {
      console.error('Error generating CSS variables:', error)
      // Return minimal CSS variables to prevent complete failure
      return `:root {\n  --brand-primary: #3b82f6;\n  --brand-secondary: #8b5cf6;\n}`
    }
    
    return `:root {\n  ${variables.join('\n  ')}\n}`
  }

  const injectCSSVariables = (css: string) => {
    try {
      // Only run on client side
      if (typeof window === 'undefined' || typeof document === 'undefined') return
      
      // Remove existing brand kit styles
      const existingStyle = document.getElementById('brand-kit-styles')
      if (existingStyle) {
        existingStyle.remove()
      }
      
      // Inject new styles
      const style = document.createElement('style')
      style.id = 'brand-kit-styles'
      style.textContent = css
      document.head.appendChild(style)
    } catch (error) {
      console.error('Failed to inject CSS variables:', error)
    }
  }

  const applyToForm = async (formId: string) => {
    // Only run on client side
    if (typeof window === 'undefined') return
    
    try {
      console.log(`Applying brand kit to form: ${formId}`)
      
      // Convert complex brand kit to simple form-compatible structure
      const simpleBrandKit = {
        logo: brandKit.logo?.current?.type === 'image' && brandKit.logo?.main?.light ? {
          url: brandKit.logo.main.light.url,
          alt: brandKit.logo.main.light.name || brandKit.logo.main.light.alt,
          width: brandKit.logo.main.light.width,
          height: brandKit.logo.main.light.height
        } : brandKit.logo?.current?.type === 'image' && brandKit.logo?.current?.file ? {
          url: brandKit.logo.current.file,
          alt: 'Brand Logo',
          width: 100,
          height: 100
        } : brandKit.customTextLogo ? {
          url: '', // Text logos don't have URL
          alt: brandKit.customTextLogo.text
        } : undefined,
        textLogo: brandKit.customTextLogo ? {
          text: brandKit.customTextLogo.text,
          fontSize: brandKit.customTextLogo.fontSize,
          color: brandKit.customTextLogo.color,
          fontFamily: brandKit.customTextLogo.fontFamily,
          fontWeight: brandKit.customTextLogo.fontWeight
        } : undefined,
        colors: {
          primary: brandKit.colors?.buttonPrimary?.hex || '#3b82f6',
          secondary: brandKit.colors?.buttonSecondary?.hex || '#6b7280', 
          accent: brandKit.colors?.focus?.hex || '#3b82f6'
        },
        fonts: {
          primary: brandKit.typography?.fontFamily?.primary || 'Inter',
          secondary: brandKit.typography?.fontFamily?.secondary || 'Inter'
        }
      }
      
      // Update form in database
      const response = await fetch(`/api/forms/${formId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer anonymous' // Will be replaced with actual auth
        },
        body: JSON.stringify({
          brandKit: simpleBrandKit
        })
      })
      
      if (!response.ok) {
        console.error('Failed to apply brand kit to form:', response.status)
        return
      }
      
      console.log('✅ Brand kit applied to form successfully')
      
      // Dispatch event for form components to listen to
      window.dispatchEvent(new CustomEvent('applyBrandKitToForm', { 
        detail: { formId, brandKit: simpleBrandKit } 
      }))
      
    } catch (error) {
      console.error('Error applying brand kit to form:', error)
    }
  }

  const value: BrandKitContextType = {
    brandKit,
    updateBrandKit,
    updateColor,
    updateTypography,
    updateFormStyling,
    updateLogo,
    resetToDefault,
    exportBrandKit,
    importBrandKit,
    generateCSSVariables,
    applyToForm
  }

  return (
    <BrandKitContext.Provider value={value}>
      {children}
    </BrandKitContext.Provider>
  )
}