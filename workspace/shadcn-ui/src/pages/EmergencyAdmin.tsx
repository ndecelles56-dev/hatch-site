import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, UserPlus, AlertCircle } from 'lucide-react'

export default function EmergencyAdmin() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleCreateAdmin = async () => {
    if (!email.trim()) {
      setMessage('Please enter an email address')
      return
    }

    setLoading(true)
    try {
      // Mock admin creation - replace with actual implementation
      console.log('Creating admin for:', email)
      setMessage(`Admin access granted to ${email}`)
      setEmail('')
    } catch (error) {
      setMessage('Failed to create admin access')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Emergency Admin Access</CardTitle>
          <CardDescription>
            Create emergency admin access for system recovery
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This is for emergency use only. Use with caution.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="email">Admin Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Button 
            onClick={handleCreateAdmin}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              'Creating Admin Access...'
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Create Admin Access
              </>
            )}
          </Button>

          {message && (
            <Alert className={message.includes('Failed') ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
              <AlertDescription className={message.includes('Failed') ? 'text-red-800' : 'text-green-800'}>
                {message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}