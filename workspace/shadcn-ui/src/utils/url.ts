/**
 * Get the correct redirect URL for authentication callbacks
 * This handles both local development and production deployments
 */
export const getRedirectUrl = (path: string = '/auth/callback'): string => {
  // In production, use the current origin
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${path}`
  }
  
  // Fallback for SSR or other contexts
  return `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${path}`
}

/**
 * Get the base site URL for the application
 */
export const getSiteUrl = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
}