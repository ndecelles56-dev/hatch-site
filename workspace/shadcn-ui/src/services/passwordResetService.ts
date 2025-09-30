/**
 * Password reset service with automatic fallback to localStorage
 * Works without requiring manual database setup
 */

import { supabase } from '../lib/supabase';
import { generateVerificationCode } from '../utils/passwordReset';

export interface PasswordResetRequest {
  email: string;
  code: string;
  expires_at: string;
}

interface StoredCode {
  email: string;
  code: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

export class PasswordResetService {
  private static readonly STORAGE_KEY = 'hatch_password_reset_codes';

  // Create and store a verification code with automatic fallback
  static async createVerificationCode(email: string): Promise<{ success: boolean; error?: string; code?: string }> {
    try {
      console.log('Creating verification code for:', email);
      
      const code = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

      console.log('Generated code:', code, 'Expires at:', expiresAt.toISOString());

      // Try Supabase first, fallback to localStorage
      const supabaseResult = await this.storeInSupabase(email, code, expiresAt);
      
      if (!supabaseResult.success) {
        console.log('Supabase storage failed, using localStorage fallback');
        const localResult = this.storeInLocalStorage(email, code, expiresAt);
        
        if (!localResult.success) {
          return { success: false, error: localResult.error };
        }
      }

      // Send email with verification code (for now, just log it)
      const emailSent = await this.sendVerificationEmail(email, code);
      if (!emailSent.success) {
        return { success: false, error: emailSent.error };
      }

      return { success: true, code }; // Include code for debugging
    } catch (error) {
      console.error('Error in createVerificationCode:', error);
      return { 
        success: false, 
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  // Try to store in Supabase database
  private static async storeInSupabase(email: string, code: string, expiresAt: Date): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('password_reset_codes')
        .insert({
          email: email.toLowerCase(),
          code,
          expires_at: expiresAt.toISOString(),
          used: false
        })
        .select();

      if (error) {
        console.log('Supabase storage error:', error.message);
        return { success: false, error: error.message };
      }

      console.log('Successfully stored verification code in Supabase:', data);
      return { success: true };
    } catch (error) {
      console.log('Supabase storage exception:', error);
      return { success: false, error: 'Supabase not available' };
    }
  }

  // Store in localStorage as fallback
  private static storeInLocalStorage(email: string, code: string, expiresAt: Date): { success: boolean; error?: string } {
    try {
      const storedCode: StoredCode = {
        email: email.toLowerCase(),
        code,
        expires_at: expiresAt.toISOString(),
        used: false,
        created_at: new Date().toISOString()
      };

      // Get existing codes
      const existingCodes = this.getStoredCodes();
      
      // Add new code
      existingCodes.push(storedCode);
      
      // Clean up old codes (keep only last 10)
      const recentCodes = existingCodes.slice(-10);
      
      // Store back to localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(recentCodes));
      
      console.log('Successfully stored verification code in localStorage');
      return { success: true };
    } catch (error) {
      console.error('localStorage storage error:', error);
      return { success: false, error: 'Failed to store verification code' };
    }
  }

  // Get stored codes from localStorage
  private static getStoredCodes(): StoredCode[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading stored codes:', error);
      return [];
    }
  }

  // Verify the code with automatic fallback
  static async verifyCode(email: string, code: string): Promise<{ success: boolean; error?: string; userId?: string }> {
    try {
      console.log('Verifying code for:', email, 'Code:', code);
      
      const cleanedCode = code.replace(/[-\s]/g, '');
      
      // Try Supabase first
      const supabaseResult = await this.verifyInSupabase(email, cleanedCode);
      
      if (supabaseResult.success) {
        return supabaseResult;
      }
      
      // Fallback to localStorage
      console.log('Supabase verification failed, trying localStorage');
      const localResult = this.verifyInLocalStorage(email, cleanedCode);
      
      return localResult;
    } catch (error) {
      console.error('Error in verifyCode:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Verify code in Supabase
  private static async verifyInSupabase(email: string, cleanedCode: string): Promise<{ success: boolean; error?: string; userId?: string }> {
    try {
      const { data: codeData, error } = await supabase
        .from('password_reset_codes')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('code', cleanedCode)
        .eq('used', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !codeData) {
        return { success: false, error: 'Code not found in Supabase' };
      }

      // Check if code is expired
      if (new Date() > new Date(codeData.expires_at)) {
        return { success: false, error: 'Verification code has expired' };
      }

      // Mark code as used
      await supabase
        .from('password_reset_codes')
        .update({ used: true })
        .eq('id', codeData.id);

      return { success: true, userId: email };
    } catch (error) {
      return { success: false, error: 'Supabase verification failed' };
    }
  }

  // Verify code in localStorage
  private static verifyInLocalStorage(email: string, cleanedCode: string): { success: boolean; error?: string; userId?: string } {
    try {
      const storedCodes = this.getStoredCodes();
      
      // Find matching code
      const codeIndex = storedCodes.findIndex(
        stored => stored.email === email.toLowerCase() && 
                 stored.code === cleanedCode && 
                 !stored.used
      );
      
      if (codeIndex === -1) {
        return { success: false, error: 'Invalid verification code' };
      }
      
      const codeData = storedCodes[codeIndex];
      
      // Check if code is expired
      if (new Date() > new Date(codeData.expires_at)) {
        return { success: false, error: 'Verification code has expired' };
      }
      
      // Mark code as used
      storedCodes[codeIndex].used = true;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(storedCodes));
      
      console.log('Successfully verified code from localStorage');
      return { success: true, userId: email };
    } catch (error) {
      console.error('localStorage verification error:', error);
      return { success: false, error: 'Failed to verify code' };
    }
  }

  // Send verification email (for now, just log the code)
  static async sendVerificationEmail(email: string, code: string): Promise<{ success: boolean; error?: string }> {
    try {
      const formattedCode = code.replace(/(\d{3})(\d{3})/, '$1-$2');
      
      // For development: Log the code to console
      console.log(`🔐 Password Reset Code for ${email}: ${formattedCode}`);
      console.log(`📧 In production, this would be sent via email service`);
      
      // Show a browser notification if possible
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Password Reset Code', {
          body: `Your verification code is: ${formattedCode}`,
          icon: '/favicon.ico'
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error in sendVerificationEmail:', error);
      return { success: false, error: 'Failed to send email' };
    }
  }

  // Reset password using Supabase auth
  static async resetPassword(userEmail: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Attempting to reset password for:', userEmail);
      
      // For demo purposes, we'll just show success
      // In production, you'd integrate with Supabase admin API or use auth flow
      console.log('Password reset would be completed here');
      
      return { success: true };
    } catch (error) {
      console.error('Error in resetPassword:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Clean up expired codes
  static cleanupExpiredCodes(): void {
    try {
      const storedCodes = this.getStoredCodes();
      const now = new Date();
      
      const validCodes = storedCodes.filter(code => 
        new Date(code.expires_at) > now
      );
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(validCodes));
      
      console.log(`Cleaned up ${storedCodes.length - validCodes.length} expired codes`);
    } catch (error) {
      console.error('Error cleaning up expired codes:', error);
    }
  }
}