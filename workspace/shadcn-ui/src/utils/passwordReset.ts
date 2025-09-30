/**
 * Custom password reset system using verification codes
 * Bypasses Supabase's redirect system entirely
 */

export interface PasswordResetCode {
  id: string;
  email: string;
  code: string;
  expires_at: string;
  created_at: string;
  used: boolean;
}

// Generate a 6-digit verification code
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Check if code is expired (15 minutes expiry)
export const isCodeExpired = (expiresAt: string): boolean => {
  return new Date() > new Date(expiresAt);
};

// Format code for display (123-456)
export const formatCode = (code: string): string => {
  return code.replace(/(\d{3})(\d{3})/, '$1-$2');
};

// Validate code format
export const isValidCodeFormat = (code: string): boolean => {
  const cleanCode = code.replace(/[-\s]/g, '');
  return /^\d{6}$/.test(cleanCode);
};

// Clean code input (remove spaces and dashes)
export const cleanCode = (code: string): string => {
  return code.replace(/[-\s]/g, '');
};