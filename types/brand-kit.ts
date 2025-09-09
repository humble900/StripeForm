export interface BrandKit {
  id: string
  name: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  
  // Colors
  colors: BrandColors
  
  // Typography
  typography: BrandTypography
  
  // Logo & Assets
  logo: BrandLogo
  favicon?: BrandAsset
  
  // Custom text logo for user customization
  customTextLogo?: {
    text: string
    fontFamily: string
    fontSize: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
    color: string
    fontWeight: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black'
    textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  }
  
  // Form Styling
  formStyling: FormStyling
  
  // Advanced Settings
  advanced: BrandAdvanced
}

export interface BrandColors {
  // Form-specific colors
  pageBackground: ColorValue        // Page background color
  formBackground: ColorValue        // Form body/container background
  fieldBackground: ColorValue       // Individual field background
  buttonPrimary: ColorValue         // Primary buttons (submit, next)
  buttonSecondary: ColorValue       // Secondary buttons (back, cancel)
  headerBackground: ColorValue      // Header section background
  
  // Text colors
  text: {
    primary: ColorValue             // Main text color
    secondary: ColorValue           // Secondary text (descriptions, hints)
    muted: ColorValue              // Muted text (placeholders)
    inverse: ColorValue            // Inverse text (on dark backgrounds)
  }
  
  // Interactive colors
  focus: ColorValue                 // Focus ring color
  hover: ColorValue                // Hover state color
  success: ColorValue              // Success states
  warning: ColorValue              // Warning states
  error: ColorValue                // Error states
  
  // Border colors
  border: {
    primary: ColorValue            // Main borders
    secondary: ColorValue          // Secondary borders
    focus: ColorValue             // Focus state borders
  }
  
  // Custom color palette
  custom: ColorValue[]
}

export interface ColorValue {
  id?: string
  name: string
  hex: string
  rgb: string
  hsl: string
  opacity: number
  isCustom: boolean
}

export interface BrandTypography {
  // Font families
  fontFamily: {
    primary: string
    secondary: string
    monospace: string
  }
  
  // Font sizes
  fontSize: {
    xs: string
    sm: string
    base: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
    '4xl': string
  }
  
  // Font weights
  fontWeight: {
    normal: string
    medium: string
    semibold: string
    bold: string
  }
  
  // Line heights
  lineHeight: {
    tight: string
    normal: string
    relaxed: string
  }
  
  // Letter spacing
  letterSpacing: {
    tight: string
    normal: string
    wide: string
  }
}

export interface BrandLogo {
  // Main logo
  main: {
    light: BrandAsset
    dark: BrandAsset
  }
  
  // Alternative logos
  alternatives: BrandAsset[]
  
  // Current active logo
  current?: {
    type: 'text' | 'image'
    variant: string
    size?: 'small' | 'medium' | 'large'
    color?: string
    text?: string
    file?: File | string
    fontFamily?: string
    fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
    fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black'
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  }
  
  updatedAt: string
}

export interface BrandAsset {
  id: string
  name: string
  url: string
  alt: string
  width: number
  height: number
  format: 'svg' | 'png' | 'jpg' | 'jpeg' | 'webp'
  size: number // in bytes
  uploadedAt: string
}

export interface FormStyling {
  // Layout
  layout: {
    width: string
    maxWidth: string
    padding: string
    borderRadius: string
    shadow: string
  }
  
  // Spacing
  spacing: {
    sectionGap: string
    fieldGap: string
    labelGap: string
  }
  
  // Input styling
  input: {
    padding: string
    borderRadius: string
    borderWidth: string
    fontSize: string
  }
  
  // Button styling
  button: {
    primary: ButtonStyle
    secondary: ButtonStyle
  }
  
  // Progress styling
  progress: {
    height: string
    borderRadius: string
  }
}

export interface ButtonStyle {
  padding: string
  borderRadius: string
  fontSize: string
  fontWeight: string
}

export interface BrandAdvanced {
  // CSS Custom Properties
  cssVariables: boolean
  
  // Dark mode support
  darkMode: {
    enabled: boolean
    auto: boolean
    colors: Partial<BrandColors>
  }
  
  // Responsive design
  responsive: {
    mobile: boolean
    tablet: boolean
    desktop: boolean
  }
  
  // Animation settings
  animations: {
    enabled: boolean
    duration: string
    easing: string
    hoverEffects: boolean
    focusEffects: boolean
  }
  
  // Accessibility
  accessibility: {
    highContrast: boolean
    reducedMotion: boolean
    focusIndicators: boolean
  }
}

// Default brand kit values
export const defaultBrandKit: BrandKit = {
  id: 'default',
  name: 'StripeForm',
  description: 'Professional form building platform with integrated payments',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  
  colors: {
    // Form-specific colors
    pageBackground: {
      name: 'Page Background',
      hex: '#f8fafc',
      rgb: '248, 250, 252',
      hsl: '210, 40%, 98%',
      opacity: 1,
      isCustom: false
    },
    formBackground: {
      name: 'Form Background',
      hex: '#ffffff',
      rgb: '255, 255, 255',
      hsl: '0, 0%, 100%',
      opacity: 1,
      isCustom: false
    },
    fieldBackground: {
      name: 'Field Background',
      hex: '#ffffff',
      rgb: '255, 255, 255',
      hsl: '0, 0%, 100%',
      opacity: 1,
      isCustom: false
    },
    buttonPrimary: {
      name: 'Primary Button',
      hex: '#3b82f6',
      rgb: '59, 130, 246',
      hsl: '217, 91%, 60%',
      opacity: 1,
      isCustom: false
    },
    buttonSecondary: {
      name: 'Secondary Button',
      hex: '#6b7280',
      rgb: '107, 114, 128',
      hsl: '220, 9%, 46%',
      opacity: 1,
      isCustom: false
    },
    headerBackground: {
      name: 'Header Background',
      hex: '#ffffff',
      rgb: '255, 255, 255',
      hsl: '0, 0%, 100%',
      opacity: 1,
      isCustom: false
    },
    
    // Text colors
    text: {
      primary: {
        name: 'Primary Text',
        hex: '#0f172a',
        rgb: '15, 23, 42',
        hsl: '222, 84%, 5%',
        opacity: 1,
        isCustom: false
      },
      secondary: {
        name: 'Secondary Text',
        hex: '#475569',
        rgb: '71, 85, 105',
        hsl: '215, 25%, 27%',
        opacity: 1,
        isCustom: false
      },
      muted: {
        name: 'Muted Text',
        hex: '#64748b',
        rgb: '100, 116, 139',
        hsl: '215, 25%, 27%',
        opacity: 1,
        isCustom: false
      },
      inverse: {
        name: 'Inverse Text',
        hex: '#ffffff',
        rgb: '255, 255, 255',
        hsl: '0, 0%, 100%',
        opacity: 1,
        isCustom: false
      }
    },
    
    // Interactive colors
    focus: {
      name: 'Focus Color',
      hex: '#3b82f6',
      rgb: '59, 130, 246',
      hsl: '217, 91%, 60%',
      opacity: 1,
      isCustom: false
    },
    hover: {
      name: 'Hover Color',
      hex: '#2563eb',
      rgb: '37, 99, 235',
      hsl: '220, 83%, 53%',
      opacity: 1,
      isCustom: false
    },
    success: {
      name: 'Success Color',
      hex: '#22c55e',
      rgb: '34, 197, 94',
      hsl: '142, 76%, 36%',
      opacity: 1,
      isCustom: false
    },
    warning: {
      name: 'Warning Color',
      hex: '#f59e0b',
      rgb: '245, 158, 11',
      hsl: '43, 91%, 47%',
      opacity: 1,
      isCustom: false
    },
    error: {
      name: 'Error Color',
      hex: '#ef4444',
      rgb: '239, 68, 68',
      hsl: '0, 84%, 60%',
      opacity: 1,
      isCustom: false
    },
    
    // Border colors
    border: {
      primary: {
        name: 'Primary Border',
        hex: '#e2e8f0',
        rgb: '226, 232, 240',
        hsl: '214, 32%, 91%',
        opacity: 1,
        isCustom: false
      },
      secondary: {
        name: 'Secondary Border',
        hex: '#cbd5e1',
        rgb: '203, 213, 225',
        hsl: '214, 32%, 91%',
        opacity: 1,
        isCustom: false
      },
      focus: {
        name: 'Focus Border',
        hex: '#3b82f6',
        rgb: '59, 130, 246',
        hsl: '217, 91%, 60%',
        opacity: 1,
        isCustom: false
      }
    },
    
    custom: []
  },

  typography: {
    fontFamily: {
      primary: 'Inter',
      secondary: 'system-ui',
      monospace: 'JetBrains Mono'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75'
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em'
    }
  },

  logo: {
    main: {
      light: {
        id: 'stripeform-logo-light',
        name: 'StripeForm Logo (Light)',
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMjAwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjUwIiByeD0iOCIgZmlsbD0iIzNiODJmNiIvPgo8cGF0aCBkPSJNMTUgMTVIMzVWMTlIMTVWMTVaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTUgMjFIMzVWMjVIMTVWMjFaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTUgMjdIMzVWMzFIMTVWMjdaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNNDAgMTVINjBWMTlINDBWMTVaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNNDAgMjFINjBWMjVINDBWMjFaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNNDAgMjdINjBWMzFINDBWMjdaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNNjUgMTVINzVWMjFINjVWMTVaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNNjUgMjFINzVWMjVINjVWMjFaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNNjUgMjdINzVWMzFINjVWMjdaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNODAgMTVIMTAwVjE5SDgwVjE1WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTgwIDIxSDEwMFYyNUg4MFYyMVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik04MCAyN0gxMDBWMzFIOFYyN1oiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMDUgMTVIMTI1VjE5SDEwNVYxNVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMDUgMjFIMTI1VjI1SDEwNVYyMVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMDUgMjdIMTI1VjMxSDEwNVYyN1oiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMzAgMTVIMTUwVjE5SDEzMFYxNVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMzAgMjFIMTUwVjI1SDEzMFYyMVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMzAgMjdIMTUwVjMxSDEzMFYyN1oiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xNTUgMTVIMTc1VjE5SDE1NVYxNVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xNTUgMjFIMTc1VjI1SDE1NVYyMVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xNTUgMjdIMTc1VjMxSDE1NVYyN1oiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xODAgMTVIMjAwVjE5SDE4MFYxNVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xODAgMjFIMjAwVjI1SDE4MFYyMVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xODAgMjdIMjAwVjMxSDE4MFYyN1oiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
        format: 'svg',
        width: 200,
        height: 50,
        size: 1024,
        alt: 'StripeForm Logo',
        uploadedAt: new Date().toISOString()
      },
      dark: {
        id: 'stripeform-logo-dark',
        name: 'StripeForm Logo (Dark)',
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMjAwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjUwIiByeD0iOCIgZmlsbD0iIzFmMjkzZSIvPgo8cGF0aCBkPSJNMTUgMTVIMzVWMTlIMTVWMTVaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTUgMjFIMzVWMjVIMTVWMjFaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTUgMjdIMzVWMzFIMTVWMjdaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNNDAgMTVINjBWMTlINDBWMTVaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNNDAgMjFINjBWMjVINDBWMjFaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNNDAgMjdINjBWMzFINDBWMjdaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNNjUgMTVINzVWMjFINjVWMTVaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNNjUgMjFINzVWMjVINjVWMjFaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNNjUgMjdINzVWMzFINjVWMjdaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNODAgMTVIMTAwVjE5SDgwVjE1WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTgwIDIxSDEwMFYyNUg4MFYyMVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik04MCAyN0gxMDBWMzFIOFYyN1oiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMDUgMTVIMTI1VjE5SDEwNVYxNVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMDUgMjFIMTI1VjI1SDEwNVYyMVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMDUgMjdIMTI1VjMxSDEwNVYyN1oiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMzAgMTVIMTUwVjE5SDEzMFYxNVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMzAgMjFIMTUwVjI1SDEzMFYyMVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMzAgMjdIMTUwVjMxSDEzMFYyN1oiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xNTUgMTVIMTc1VjE5SDE1NVYxNVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xNTUgMjFIMTc1VjI1SDE1NVYyMVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xNTUgMjdIMTc1VjMxSDE1NVYyN1oiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xODAgMTVIMjAwVjE5SDE4MFYxNVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xODAgMjFIMjAwVjI1SDE4MFYyMVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xODAgMjdIMjAwVjMxSDE4MFYyN1oiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
        format: 'svg',
        width: 200,
        height: 50,
        size: 1024,
        alt: 'StripeForm Logo',
        uploadedAt: new Date().toISOString()
      }
    },
    alternatives: [
      {
        id: 'stripeform-icon-light',
        name: 'StripeForm Icon (Light)',
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzNiODJmNiIvPgo8cGF0aCBkPSJNMTAgMTBIMzBWMTRIMTBWMTBaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTAgMTZIMzBWMjBIMTBWMTZaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTAgMjJIMzBWMjZIMTBWMjJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
        format: 'svg',
        width: 40,
        height: 40,
        size: 512,
        alt: 'StripeForm Icon',
        uploadedAt: new Date().toISOString()
      },
      {
        id: 'stripeform-icon-dark',
        name: 'StripeForm Icon (Dark)',
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzFmMjkzZSIvPgo8cGF0aCBkPSJNMTAgMTBIMzBWMTRIMTBWMTBaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTAgMTZIMzBWMjBIMTBWMTZaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTAgMjJIMzBWMjZIMTBWMjJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
        format: 'svg',
        width: 40,
        height: 40,
        size: 512,
        alt: 'StripeForm Icon',
        uploadedAt: new Date().toISOString()
      }
    ],
    updatedAt: new Date().toISOString()
  },

  formStyling: {
    layout: {
      width: 'medium',
      maxWidth: '768px',
      padding: '2rem',
      borderRadius: '0.75rem',
      shadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)'
    },
    spacing: {
      sectionGap: '2rem',
      fieldGap: '1.5rem',
      labelGap: '0.5rem'
    },
    input: {
      padding: '0.75rem',
      borderRadius: '0.5rem',
      borderWidth: '1px',
      fontSize: '1rem'
    },
    button: {
      primary: {
        padding: '0.75rem 1.5rem',
        borderRadius: '0.5rem',
        fontSize: '1rem',
        fontWeight: '600'
      },
      secondary: {
        padding: '0.75rem 1.5rem',
        borderRadius: '0.5rem',
        fontSize: '1rem',
        fontWeight: '500'
      }
    },
    progress: {
      height: '0.25rem',
      borderRadius: '0.125rem'
    }
  },
  
  advanced: {
    cssVariables: true,
    darkMode: {
      enabled: false,
      auto: false,
      colors: {}
    },
    responsive: {
      mobile: true,
      tablet: true,
      desktop: true
    },
    animations: {
      enabled: true,
      duration: '200ms',
      easing: 'ease-in-out',
      hoverEffects: true,
      focusEffects: true
    },
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      focusIndicators: true
    }
  }
}
