import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { extractTokensFromUrl, handleProductionRedirect } from '../../utils/redirectHandler';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // First, check if we need to redirect from localhost to production
        if (handleProductionRedirect()) {
          return; // Redirect in progress, don't continue processing
        }

        // Extract tokens from URL (both hash and query parameters)
        const tokens = extractTokensFromUrl();
        
        console.log('Auth callback - extracted tokens:', {
          hasTokens: tokens?.hasTokens,
          type: tokens?.type,
          url: window.location.href
        });

        // Handle password recovery flow with tokens
        if (tokens?.type === 'recovery' && tokens?.hasTokens) {
          console.log('Processing password recovery with tokens...');
          
          try {
            // Set the session with the recovery tokens
            const { data, error } = await supabase.auth.setSession({
              access_token: tokens.accessToken!,
              refresh_token: tokens.refreshToken!
            });
            
            if (error) {
              console.error('Error setting recovery session:', error);
              setError('Invalid or expired recovery link. Please request a new password reset.');
              setLoading(false);
              return;
            }
            
            if (data.session) {
              console.log('Recovery session established successfully');
              setIsPasswordReset(true);
              setLoading(false);
              return;
            }
          } catch (sessionError) {
            console.error('Session setup error:', sessionError);
            setError('Failed to establish recovery session. Please try requesting a new password reset.');
            setLoading(false);
            return;
          }
        }
        
        // Handle regular authentication callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setError(error.message);
          setLoading(false);
          return;
        }

        if (data.session) {
          // User is authenticated, redirect to customer search
          console.log('Regular auth successful, redirecting to customer search');
          navigate('/customer/search');
        } else {
          // No session, redirect to home
          setError('Authentication failed. Please try again.');
          setTimeout(() => {
            navigate('/');
          }, 3000);
        }
      } catch (err) {
        console.error('Unexpected error during auth callback:', err);
        setError('An unexpected error occurred. Please try again.');
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setResetLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setResetSuccess(true);
      
      // Redirect to home after successful password reset
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setResetLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Processing authentication...</p>
        </div>
      </div>
    );
  }

  if (isPasswordReset) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Set New Password</h1>
            <p className="text-muted-foreground mt-2">
              Enter your new password below
            </p>
          </div>

          {resetSuccess ? (
            <Alert>
              <AlertDescription>
                Password updated successfully! Redirecting you to the homepage...
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Confirm new password"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={resetLoading}>
                {resetLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Update Password
              </Button>
            </form>
          )}

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => navigate('/')}
              className="text-sm text-muted-foreground"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={() => navigate('/')}>
              Return to Home
            </Button>
          </>
        ) : (
          <>
            <p className="text-muted-foreground">Authentication successful!</p>
            <p className="text-sm">Redirecting you to the homepage...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;