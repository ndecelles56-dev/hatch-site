/**
 * Redirect handler to fix localhost URLs in production
 * This handles cases where Supabase is still configured with localhost URLs
 */

export const handleProductionRedirect = () => {
  // Only run in browser environment
  if (typeof window === 'undefined') return;
  
  const currentUrl = window.location.href;
  const currentOrigin = window.location.origin;
  
  // Check if we're on localhost but should be on production
  if (currentOrigin === 'http://localhost:3000' || currentOrigin === 'https://localhost:3000') {
    // Get the actual production URL from environment or detect it
    const productionUrl = process.env.NEXT_PUBLIC_SITE_URL;
    
    // If we have a production URL configured and we're not actually on localhost
    if (productionUrl && productionUrl !== currentOrigin) {
      // Replace localhost with production URL
      const newUrl = currentUrl.replace(currentOrigin, productionUrl);
      console.log('Redirecting from localhost to production:', newUrl);
      window.location.replace(newUrl);
      return true;
    }
  }
  
  return false;
};

export const getCorrectRedirectUrl = (path: string = '/auth/callback'): string => {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    
    // If we're on a deployed site (not localhost), use current origin
    if (!origin.includes('localhost')) {
      return `${origin}${path}`;
    }
    
    // If we have a production URL configured, use it
    const productionUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (productionUrl && !productionUrl.includes('localhost')) {
      return `${productionUrl}${path}`;
    }
  }
  
  // Fallback to environment variable or localhost
  return `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${path}`;
};

export const extractTokensFromUrl = () => {
  if (typeof window === 'undefined') return null;
  
  // First, handle any localhost redirect
  if (handleProductionRedirect()) {
    return null; // Redirect in progress
  }
  
  // Parse both hash and search parameters
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const searchParams = new URLSearchParams(window.location.search);
  
  const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');
  const type = hashParams.get('type') || searchParams.get('type');
  const expiresAt = hashParams.get('expires_at') || searchParams.get('expires_at');
  
  return {
    accessToken,
    refreshToken,
    type,
    expiresAt,
    hasTokens: !!(accessToken && refreshToken)
  };
};