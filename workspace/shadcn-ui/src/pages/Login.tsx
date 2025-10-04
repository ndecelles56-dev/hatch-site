import React, { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Lock, Mail } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { signIn, user, loading } = useAuth()

  useEffect(() => {
    if (user) {
      navigate('/broker/dashboard', { replace: true })
    } else if (!loading) {
      setSubmitting(false)
    }
  }, [loading, navigate, user])

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      console.log('[Login] attempting sign-in')
      await signIn(email, password)
      console.log('[Login] sign-in successful, navigating')
      setSubmitting(false)
      navigate('/broker/dashboard', { replace: true })
    } catch (authError) {
      const message = authError instanceof Error ? authError.message : 'Unable to sign in. Please try again.'
      setError(message)
      console.error('[Login] sign-in failed', authError)
    } finally {
      console.log('[Login] reset submitting state')
      setSubmitting(false)
    }
  }, [email, password, signIn, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="pl-9"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="pl-9"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50 text-red-700">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <span className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing in…</span>
                </span>
              ) : (
                'Login'
              )}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">Don't have an account?</span>{' '}
              <Button
                type="button"
                variant="link"
                className="p-0"
                onClick={() => navigate('/register')}
              >
                Register here
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
