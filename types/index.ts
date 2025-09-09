// Form and Question Types
export interface FormField {
  id: string
  type: FieldType
  label: string
  required: boolean
  description?: string
  show_description?: boolean
  placeholder?: string
  options?: string[] // For multiple choice, dropdown, etc.
  validation?: ValidationRule[]
  conditional?: ConditionalLogic
  settings?: FieldSettings
  // Add missing properties for form fields
  title?: string
  order?: number
  form_id?: string
}

export type FieldType = 
  | 'short_text'
  | 'long_text'
  | 'email'
  | 'number'
  | 'phone'
  | 'address'
  | 'date'
  | 'time'
  | 'url'
  | 'dropdown'
  | 'multiple_choice'
  | 'checkbox'
  | 'radio'
  | 'rating'
  | 'nps'
  | 'file_upload'
  | 'payment'
  | 'section'
  | 'page_break'
  | 'image_upload'
  | 'video_upload'
  | 'location'
  | 'name'
  | 'password'
  | 'likert'
  | 'star_rating'
  | 'linear_scale'
  | 'nps_score'
  | 'likert_scale'
  | 'ranking'
  | 'yes_no'
  | 'multiple_dates'
  | 'time_range'
  | 'captcha'
  | 'matrix_grid'
  | 'signature_upload'
  | 'geo_restriction'
  | 'cover_slide'
  | 'end_page'
  | 'url_redirect'

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'email' | 'url' | 'no_special_chars' | 'min_length' | 'max_length' | 'exact_length' | 'no_html' | 'no_links' | 'no_profanity' | 'custom_regex'
  value?: string | number
  pattern?: string
  message: string
}

export interface ConditionalLogic {
  fieldId: string
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty'
  value: string | number | boolean
  action: 'show' | 'hide'
}

export interface FieldSettings {
  min?: number
  max?: number
  step?: number
  rows?: number
  maxLength?: number
  accept?: string // For file uploads
  currency?: string // For payment fields
  amount?: number // For payment fields
  allowCustomAmount?: boolean
  recurring?: boolean // For payment fields (subscription mode)
  blockedCountries?: string[] // ISO country codes to block

  // Geo restriction
  geoAllowedCountries?: string[]
  geoBlockMode?: 'allow' | 'block'
  geoIpList?: string[]

  // Cover slide settings
  coverTitle?: string
  coverSubtitle?: string
  coverMediaUrl?: string
  coverCtaText?: string
  coverBackgroundColor?: string
  coverButtonColor?: string

  // End page settings
  endTitle?: string
  endSubtitle?: string
  endMediaUrl?: string
  endButtonText?: string
  endButtonUrl?: string

  // Redirect action
  redirectUrl?: string
  redirectDelayMs?: number
  allowMultiple?: boolean
  selectedFile?: {
    name: string
    size: number
    type: string
    lastModified: number
  }
  
  // Dropdown-specific settings
  defaultValue?: string | number
  maxSelections?: number
  dropdownType?: 'single' | 'multiple' | 'searchable' | 'tags'
  dropdownPosition?: 'top' | 'bottom' | 'auto'
  clearable?: boolean
  searchable?: boolean
  allowCustom?: boolean
  showSelectedCount?: boolean
  maxDropdownHeight?: number
  numberingStyle?: 'none' | 'numeric' | 'alphabetic'
  dropdownStyle?: 'default' | 'cards' | 'pills' | 'minimal'
  // Choice field behaviors
  randomize?: boolean
  // Yes/No appearance
  yesNoStyle?: 'buttons' | 'cards' | 'chips' | 'toggle' | 'thumbs'
  
  // Email-specific settings
  emailType?: 'standard' | 'multiple' | 'confirm'
  showEmailIcon?: boolean
  validateOn?: 'blur' | 'change' | 'submit' | 'always'
  allowedDomains?: string[]
  blockedDomains?: string[]
  
  // Text area specific settings
  resize?: 'none' | 'both' | 'horizontal' | 'vertical'
  wrap?: 'soft' | 'hard' | 'off'
  autoGrow?: boolean
  showCharCounter?: boolean
  minLength?: number
  
  // Number-specific settings
  numberType?: 'integer' | 'decimal' | 'currency' | 'percentage' | 'phone' | 'postal'
  decimalPlaces?: number
  showSpinner?: boolean
  allowNegative?: boolean
  formatOnBlur?: boolean
  inputMode?: 'numeric' | 'decimal' | 'tel'
  
  // Multiple Choice-specific settings
  multipleChoiceType?: 'radio' | 'checkbox' | 'buttons' | 'cards' | 'dropdown'
  layout?: 'vertical' | 'horizontal' | 'grid' | 'inline'
  showOther?: boolean
  randomizeOptions?: boolean
  optionStyle?: 'default' | 'cards' | 'buttons' | 'minimal' | 'custom'
  selectedColor?: string
  hoverColor?: string
  borderRadius?: 'none' | 'small' | 'medium' | 'large' | 'full'
  spacing?: 'compact' | 'normal' | 'loose'
  allowClear?: boolean
  showSelectionCount?: boolean
  
  // Checkbox-specific settings
  checkboxType?: 'single' | 'multiple' | 'toggle' | 'custom'
  labelPosition?: 'left' | 'right' | 'top' | 'bottom'
  checkboxSize?: 'small' | 'medium' | 'large' | 'custom'
  checkboxStyle?: 'default' | 'rounded' | 'square' | 'custom'
  checkboxShape?: 'square' | 'rounded' | 'circle' | 'triangle'
  selectionStyle?: 'checkmark' | 'fill' | 'cross'
  checkedColor?: string
  uncheckedColor?: string
  borderColor?: string
  borderWidth?: string
  animation?: 'none' | 'fade' | 'scale' | 'slide' | 'bounce'
  allowIndeterminate?: boolean
  autoSave?: boolean
  showCheckMark?: boolean
  
  // Star Rating-specific settings
  // Matrix-specific settings
  matrixRows?: string[]
  matrixColumns?: string[]
  matrixSelection?: 'single' | 'multiple'
  matrixBoxShape?: 'square' | 'rounded' | 'circle'

  // Signature-specific settings
  signatureMode?: 'draw' | 'type' | 'upload'
  signatureText?: string
  signatureImageData?: string // Data URL for drawn or uploaded image
  penSize?: number
  // Rating & Scale
  ratingType?: 'stars' | 'hearts' | 'thumbs' | 'circles'
  maxRating?: number
  allowHalfRatings?: boolean
  showRatingText?: boolean
  showAverageRating?: boolean
  iconSize?: 'small' | 'medium' | 'large' | 'custom'
  filledColor?: string
  emptyColor?: string
  iconSpacing?: 'compact' | 'normal' | 'loose'
  showTooltip?: boolean
  // NPS
  npsStyle?: 'buttons' | 'chips' | 'cards' | 'scale' | 'typeform'
  npsCardView?: boolean
  // Linear scale
  minRating?: number
  leftLabel?: string
  rightLabel?: string
  // Likert
  likertRows?: string[]
  likertCols?: string[]
  likertSelection?: 'single' | 'multiple'

  // Upload settings (applies to file/image/video)
  maxFiles?: number
  allowedMimeList?: string // comma-separated accept string, e.g. ".pdf,.docx"

  // Address settings
  googlePlacesEnabled?: boolean
  addressRequireStreet1?: boolean
  addressRequireStreet2?: boolean
  addressRequireCity?: boolean
  addressRequireRegion?: boolean
  addressRequirePostalCode?: boolean
  addressRequireCountry?: boolean
  
  // Advanced Styling Options
  styling?: {
    // Text styling
    textColor?: string
    fontSize?: number
    fontWeight?: 'normal' | 'bold' | 'lighter' | 'bolder' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'
    fontFamily?: string
    textAlign?: 'left' | 'center' | 'right' | 'justify'
    lineHeight?: number
    
    // Background and border
    backgroundColor?: string
    borderColor?: string
    borderWidth?: number
    borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none'
    borderRadius?: number
    
    // Spacing
    padding?: {
      top?: number
      right?: number
      bottom?: number
      left?: number
    }
    margin?: {
      top?: number
      right?: number
      bottom?: number
      left?: number
    }
    
    // Input field specific
    width?: 'full' | 'half' | 'third' | 'quarter'
    inputBackgroundColor?: string
    inputBorderColor?: string
    inputBorderWidth?: number
    inputBorderRadius?: number
    inputPadding?: {
      top?: number
      right?: number
      bottom?: number
      left?: number
    }
    
    // Focus states
    focusBorderColor?: string
    focusBackgroundColor?: string
    focusBoxShadow?: string
    
    // Hover states
    hoverBorderColor?: string
    hoverBackgroundColor?: string
    
    // Placeholder styling
    placeholderColor?: string
    placeholderFontSize?: number
    placeholderFontWeight?: string
  }
  
  // Advanced Behavior Options
  behavior?: {
    autoComplete?: 'on' | 'off' | 'name' | 'email' | 'tel' | 'url' | 'current-password' | 'new-password'
    autoFocus?: boolean
    readOnly?: boolean
    disabled?: boolean
    spellCheck?: boolean
    autoCapitalize?: 'off' | 'on' | 'sentences' | 'words' | 'characters'
    autoCorrect?: 'off' | 'on'
    
    // Validation behavior
    validateOnBlur?: boolean
    validateOnChange?: boolean
    validateOnSubmit?: boolean
    validateOn?: 'blur' | 'change' | 'submit' | 'always'
    
    // Input behavior
    debounceTime?: number
    throttleTime?: number
    maxFileSize?: number // in bytes
    allowedFileTypes?: string[]
    
    // Conditional behavior
    showOn?: ConditionalLogic[]
    hideOn?: ConditionalLogic[]
    enableOn?: ConditionalLogic[]
    disableOn?: ConditionalLogic[]
  }
  
  // Advanced Validation Options
  validation?: {
    customRules?: ValidationRule[]
    emailType?: 'standard' | 'strict' | 'custom' | 'none'
    numberFormat?: 'any' | 'integer' | 'decimal' | 'currency' | 'percentage' | 'phone' | 'postal'
    errorMessages?: {
      required?: string
      min?: string
      max?: string
      pattern?: string
      email?: string
      url?: string
      custom?: string
      minSelections?: string
      maxSelections?: string
      domainNotAllowed?: string
      domainBlocked?: string
      minLength?: string
      maxLength?: string
      number?: string
      minRating?: string
      maxRating?: string
    }
    showValidationOn?: 'blur' | 'change' | 'submit' | 'always'
    validationStyle?: 'inline' | 'tooltip' | 'modal'
    minSelections?: number
    maxSelections?: number
    mustBeChecked?: boolean
    minRating?: number
    maxRating?: number
  }
  
  // Advanced Accessibility Options
  accessibility?: {
    ariaLabel?: string
    ariaDescribedBy?: string
    ariaRequired?: boolean
    ariaInvalid?: boolean
    tabIndex?: number
    role?: string
    dataAttributes?: Record<string, string>
  }
  
  // Advanced Integration Options
  integration?: {
    webhookUrl?: string
    webhookHeaders?: Record<string, string>
    webhookMethod?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    webhookTimeout?: number
    
    // Third-party integrations
    googleSheetsId?: string
    googleSheetsRange?: string
    zapierWebhookUrl?: string
    makeWebhookUrl?: string
    n8nWebhookUrl?: string
    
    // Custom JavaScript
    customJS?: string
    customCSS?: string
  }
}

// Form Structure
export interface Form {
  id: string
  title: string
  description?: string
  slug?: string
  fields: FormField[]
  settings: FormSettings
  theme: FormTheme
  brandKit?: BrandKit
  created_at: string
  updated_at: string
  user_id: string
  isPublished: boolean
  status?: 'draft' | 'published' | 'archived' | 'deleted'
  publishedUrl?: string
  response_count: number
}

export interface FormSettings {
  allow_multiple_responses: boolean
  require_login: boolean
  show_progress_bar: boolean
  submit_button_text: string
  success_message: string
  redirect_url?: string
  email_notifications: boolean
  notification_email?: string
  // Rendering preferences
  display_mode?: 'single_page' | 'progressive'
  layout?: 'vertical' | 'horizontal' | 'grid'
  // Presentation controls
  // Form size presets: 'typeform' | 'stitch' | 'tripe'
  width?: any
  // New numeric sizing controls
  widthMode?: 'px' | 'ratio'
  widthPx?: number // e.g., 480 means max-width: 480px
  widthRatio?: number // 0.3 - 1.0 means max-width: 30vw - 100vw
  // Height sizing controls
  heightMode?: 'px' | 'ratio'
  heightPx?: number // e.g., 640 means max-height: 640px
  heightRatio?: number // 0.5 - 1.0 means max-height: 50vh - 100vh
  use_cover?: boolean
  cover_title?: string
  cover_description?: string
  cover_button_text?: string
  thankyou_title?: string
  thankyou_description?: string
}

export interface FormTheme {
  primary_color: string      // Form body/background color
  secondary_color: string    // Form boxes/container color  
  background_color: string   // Page background color
  text_color: string
  font_family: string
  border_radius: number
  header_color?: string
  background_image_url?: string  // Page background image
  header_image_url?: string      // Header background image
  custom_css?: string
  // Optional branding applied at the theme level
  logo?: {
    url: string
    alt?: string
    width?: number
    height?: number
  }
  textLogo?: {
    text?: string
    fontSize?: string
    color?: string
    fontFamily?: string
    fontWeight?: string | number
  }
}

export interface BrandKit {
  logo?: {
    url: string
    alt: string
    width?: number
    height?: number
  }
  textLogo?: {
    text: string
    fontSize: string
    color: string
    fontFamily: string
    fontWeight: string
  }
  favicon?: {
    url: string
  }
  colors?: {
    primary: string
    secondary: string
    accent: string
  }
  fonts?: {
    primary: string
    secondary: string
  }
  socialMedia?: {
    website?: string
    twitter?: string
    linkedin?: string
    facebook?: string
    instagram?: string
  }
}

// User Management
export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  bio?: string
  company?: string
  website?: string
  phone?: string
  countryCode?: string
  timezone?: string
  language?: string
  is_anonymous: boolean
  subscription_tier: 'free' | 'pro'
  subscription_status: 'active' | 'inactive' | 'cancelled'
  stripe_customer_id?: string
  stripe_subscription_id?: string
  form_limit: number
  created_at: string
  updated_at: string
}

export interface AnonymousUser {
  fingerprint: string
  ip_address: string
  user_agent: string
  form_count: number
  created_at: string
  last_seen: string
}

// Form Responses
export interface FormResponse {
  id: string
  form_id: string
  user_id?: string
  anonymous_id?: string
  responses: FieldResponse[]
  metadata: ResponseMetadata
  created_at: string
  payment_status?: 'pending' | 'completed' | 'failed'
  payment_amount?: number
  payment_currency?: string
  // Add missing properties for form responses
  answers?: Record<string, any>
  completed?: boolean
}

export interface FieldResponse {
  field_id: string
  value: string | number | boolean | string[] | Record<string, any>
  field_type: FieldType
}

export interface ResponseMetadata {
  ip_address: string
  user_agent: string
  referrer?: string
  time_spent: number
  device_info: DeviceInfo
}

export interface DeviceInfo {
  screen_size: string
  timezone: string
  language: string
  platform: string
}

// NPS Calculation
export interface NPSData {
  promoters: number
  passives: number
  detractors: number
  total_responses: number
  nps_score: number
}

// Payment Integration
export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: 'pending' | 'succeeded' | 'failed'
  form_id: string
  response_id: string
  stripe_payment_intent_id: string
  created_at: string
}

// Analytics and Reporting
export interface FormAnalytics {
  form_id: string
  total_responses: number
  completion_rate: number
  average_time: number
  field_analytics: FieldAnalytics[]
  nps_data?: NPSData
  revenue_data?: RevenueData
}

export interface FieldAnalytics {
  field_id: string
  field_type: FieldType
  response_count: number
  completion_rate: number
  average_value?: number
  top_responses?: string[]
}

export interface RevenueData {
  total_revenue: number
  currency: string
  payment_count: number
  average_payment: number
}



// API Response Types
export interface ApiResponse<T> {
  data: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  has_more: boolean
}

// Form Builder State
export interface FormBuilderState {
  current_form: Form | null
  selected_field: FormField | null
  is_preview_mode: boolean
  is_saving: boolean
  has_unsaved_changes: boolean
  undo_stack: Form[]
  redo_stack: Form[]
}

// Authentication
export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isAnonymous: boolean
}

// Stripe Integration
export interface StripeConfig {
  publishable_key: string
  client_secret?: string
  payment_intent_id?: string
}

// Device Fingerprinting
export interface DeviceFingerprint {
  fingerprint: string
  components: FingerprintComponents
  confidence: number
}

export interface FingerprintComponents {
  user_agent: string
  screen_resolution: string
  timezone: string
  language: string
  platform: string
  canvas_fingerprint: string
  webgl_fingerprint: string
  installed_fonts: string[]
  plugins: string[]
  capabilities?: {
    cookies: boolean
    localStorage: boolean
    sessionStorage: boolean
    geolocation: boolean
    notifications: boolean
    serviceWorker: boolean
    webGL: boolean
    canvas: boolean
  }
}

// Error Types
export interface FormError {
  field_id?: string
  message: string
  type: 'validation' | 'network' | 'payment' | 'general'
}

// Notification Types
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// Long Text Question Field Types
export type LongTextInputType = 
  | 'textarea'
  | 'rich_text'
  | 'markdown'
  | 'html'
  | 'plain_text'

export type LongTextValidationType = 
  | 'required'
  | 'min_length'
  | 'max_length'
  | 'exact_length'
  | 'pattern'
  | 'no_special_chars'
  | 'no_html'
  | 'no_links'
  | 'no_profanity'
  | 'custom_regex'

export type LongTextFormatting = 
  | 'none'
  | 'uppercase'
  | 'lowercase'
  | 'capitalize'
  | 'title_case'
  | 'remove_spaces'
  | 'trim'
  | 'custom'

export type LongTextAccessibilityFeature = 
  | 'aria_label'
  | 'aria_describedby'
  | 'aria_required'
  | 'aria_invalid'
  | 'screen_reader_text'
  | 'high_contrast'
  | 'large_text'
  | 'keyboard_navigation'

export interface LongTextQuestionField {
  // Basic settings
  label: string
  placeholder: string
  required: boolean
  helpText: string
  
  // Advanced input settings
  inputType: LongTextInputType
  customInputType: string
  defaultValue: string
  autoComplete: string
  
  // Text area specific settings
  rows: number
  resize: 'none' | 'both' | 'horizontal' | 'vertical'
  wrap: 'soft' | 'hard' | 'off'
  autoGrow: boolean
  showCharCounter: boolean
  minLength: number
  maxLength: number
  
  // Validation settings
  validation: ValidationRule[]
  exactLength: number
  pattern: string
  customRegex: string
  customErrorMessage: string
  disallowSpecialChars: boolean
  disallowHtml: boolean
  disallowLinks: boolean
  disallowProfanity: boolean
  
  // Formatting settings
  textFormatting: LongTextFormatting
  customFormatting: string
  autoFormat: boolean
  
  // Prefill settings
  prefillFromUrl: boolean
  urlParamName: string
  
  // Variable binding
  variableBinding: boolean
  variableName: string
  
  // Visual settings
  textColor: string
  backgroundColor: string
  borderColor: string
  fontSize: number
  borderRadius: number
  padding: number
  
  // Advanced features
  smartSuggestions: boolean
  autoSave: boolean
  realTimeValidation: boolean
  characterCounter: boolean
  accessibilityFeatures: LongTextAccessibilityFeature[]
  
  // Behavior settings
  autoFocus: boolean
  readOnly: boolean
  disabled: boolean
  clearOnSubmit: boolean
  preserveOnError: boolean
  spellCheck: boolean
  
  // Conditional logic
  showCondition: string
  hideCondition: string
  
  // Integration settings
  webhookUrl: string
  apiKey: string
  customValidation: string
}