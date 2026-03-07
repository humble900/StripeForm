/**
 * Get the base URL for the application
 * Uses NEXT_PUBLIC_APP_URL if available, otherwise falls back to window.location.origin
 */
export function getBaseUrl(): string {
  // Always prefer the configured production URL for published form links
  // This ensures URLs stored in the database never contain localhost
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL
  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, '') // strip trailing slash
  }

  // On the client, use window.location.origin only as a last resort
  // but NEVER for localhost — published forms must always use the real domain
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return window.location.origin
    }
  }

  // Final fallback: production domain
  return 'https://stripeform.com'
}

/**
 * Generate a published form URL
 */
export function getPublishedFormUrl(formId: string, slug?: string): string {
  const baseUrl = getBaseUrl()
  return slug ? `${baseUrl}/forms/${slug}` : `${baseUrl}/forms/${formId}`
}
