/**
 * Get the base URL for the application
 * Uses NEXT_PUBLIC_APP_URL if available, otherwise falls back to window.location.origin
 */
export function getBaseUrl(): string {
  // In server-side rendering, use the environment variable
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_APP_URL || 'https://stripeform.com'
  }
  
  // In client-side, prefer environment variable over window.location.origin
  // This ensures production URLs are used even in development previews
  return process.env.NEXT_PUBLIC_APP_URL || window.location.origin
}

/**
 * Generate a published form URL
 */
export function getPublishedFormUrl(formId: string, slug?: string): string {
  const baseUrl = getBaseUrl()
  return slug ? `${baseUrl}/forms/${slug}` : `${baseUrl}/forms/${formId}`
}
