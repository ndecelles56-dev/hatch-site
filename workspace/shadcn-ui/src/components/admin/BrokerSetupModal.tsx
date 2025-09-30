'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Alert, AlertDescription } from '../ui/alert'
import { Loader2, CheckCircle, AlertCircle, UserPlus } from 'lucide-react'
import { RoleService } from '../../services/roleService'

interface BrokerSetupModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export const BrokerSetupModal: React.FC<BrokerSetupModalProps> = ({ 
  isOpen, 
  onClose,
  onSuccess
}) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const resetForm = () => {
    setEmail('')
    setError(null)
    setSuccess(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleQuickSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log('Setting up broker privileges for:', email);
      
      const result = await RoleService.quickBrokerSetup(email, {
        licenseNumber: 'FL-BK-' + Math.floor(Math.random() * 1000000),
        firmName: 'Hatch Realty Group',
        firmLicense: 'FL-FIRM-' + Math.floor(Math.random() * 1000000),
        firmAddress: '123 Main St, Miami, FL 33101',
        firmPhone: '(305) 555-0100',
        firmEmail: email
      });
      
      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          handleClose()
          onSuccess?.()
        }, 2000)
      } else {
        setError(result.error || 'Failed to setup broker privileges')
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Success!</DialogTitle>
          </DialogHeader>
          
          <div className="text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">Broker Privileges Granted!</h3>
              <p className="text-muted-foreground mt-2">
                The user <strong>{email}</strong> now has broker privileges and access to:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• Property listing management</li>
                <li>• Broker dashboard and analytics</li>
                <li>• Agent and client management</li>
                <li>• Commission tracking</li>
                <li>• Firm management tools</li>
              </ul>
            </div>
            <Alert>
              <AlertDescription>
                The user will need to sign out and sign back in to see the new broker features.
              </AlertDescription>
            </Alert>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            <UserPlus className="w-6 h-6 mx-auto mb-2" />
            Grant Broker Privileges
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleQuickSetup} className="space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            Enter the email address of the user you want to grant broker privileges to.
          </div>
          
          <div>
            <Label htmlFor="broker-email">User Email Address</Label>
            <Input
              id="broker-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="broker@example.com"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertDescription>
              <strong>What will be created:</strong>
              <ul className="mt-2 space-y-1 text-xs">
                <li>• Broker role assignment</li>
                <li>• Default firm "Hatch Realty Group"</li>
                <li>• Florida real estate license numbers</li>
                <li>• Full broker dashboard access</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Grant Broker Privileges
          </Button>

          <Button 
            type="button" 
            variant="ghost" 
            className="w-full" 
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}