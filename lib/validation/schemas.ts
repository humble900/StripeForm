import { z } from 'zod'

// Base schemas
export const uuidSchema = z.string().uuid('Invalid UUID format')
export const emailSchema = z.string().email('Invalid email format')
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters')

// Form schemas
export const createFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  userId: z.string().min(1, 'User ID is required'),
  fields: z.array(z.object({
    type: z.enum(['text', 'email', 'number', 'select', 'textarea', 'checkbox', 'radio', 'file']),
    label: z.string().min(1, 'Field label is required'),
    placeholder: z.string().optional(),
    required: z.boolean().default(false),
    validation: z.any().optional(),
    options: z.array(z.string()).optional(),
    settings: z.any().optional(),
    conditional_logic: z.any().optional()
  })).optional(),
  settings: z.object({
    allowAnonymous: z.boolean().default(true),
    requireCaptcha: z.boolean().default(false),
    maxSubmissions: z.number().positive().optional(),
    submissionLimit: z.number().positive().optional()
  }).optional()
})

export const updateFormSchema = createFormSchema.partial().extend({
  id: uuidSchema
})

export const getFormsSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  status: z.enum(['draft', 'published', 'archived', 'deleted']).optional()
})

// Form submission schemas
export const submitFormSchema = z.object({
  formId: uuidSchema,
  fields: z.array(z.object({
    id: z.string(),
    value: z.any(),
    type: z.string()
  })),
  userData: z.object({
    email: emailSchema.optional(),
    name: z.string().optional(),
    phone: z.string().optional()
  }).optional(),
  fingerprint: z.string().optional(),
  metadata: z.object({
    userAgent: z.string().optional(),
    ipAddress: z.string().optional(),
    referrer: z.string().optional()
  }).optional()
})

// User schemas
export const createUserSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
  email: emailSchema,
  fullName: z.string().min(1, 'Full name is required'),
  avatarUrl: z.string().url().optional()
})

export const updateUserSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  updates: z.object({
    email: emailSchema.optional(),
    fullName: z.string().min(1).optional(),
    avatarUrl: z.string().url().optional()
  })
})

export const getUserProfileSchema = z.object({
  userId: z.string().min(1, 'User ID is required')
})

// Stripe schemas
export const createPaymentIntentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3, 'Currency must be 3 characters').default('usd'),
  metadata: z.record(z.string()).optional()
})

export const createSubscriptionSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  priceId: z.string().min(1, 'Price ID is required'),
  metadata: z.record(z.string()).optional()
})

// Analytics schemas
export const getAnalyticsSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  period: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
  timezone: z.string().optional()
})

// Anonymous user schemas
export const createAnonymousUserSchema = z.object({
  fingerprint: z.string().min(1, 'Fingerprint is required'),
  sessionData: z.object({
    userAgent: z.string().optional(),
    screenSize: z.string().optional(),
    timezone: z.string().optional(),
    language: z.string().optional()
  }).optional()
})

// Error response schema
export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  details: z.any().optional(),
  timestamp: z.string().datetime().optional()
})

// Success response schema
export const successResponseSchema = z.object({
  success: z.boolean().default(true),
  message: z.string().optional(),
  data: z.any().optional()
})

// Pagination schema
export const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  total: z.number().optional()
})

// Type exports
export type CreateFormInput = z.infer<typeof createFormSchema>
export type UpdateFormInput = z.infer<typeof updateFormSchema>
export type GetFormsInput = z.infer<typeof getFormsSchema>
export type SubmitFormInput = z.infer<typeof submitFormSchema>
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type GetUserProfileInput = z.infer<typeof getUserProfileSchema>
export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>
export type GetAnalyticsInput = z.infer<typeof getAnalyticsSchema>
export type CreateAnonymousUserInput = z.infer<typeof createAnonymousUserSchema>
export type ErrorResponse = z.infer<typeof errorResponseSchema>
export type SuccessResponse = z.infer<typeof successResponseSchema>
export type PaginationInput = z.infer<typeof paginationSchema>







