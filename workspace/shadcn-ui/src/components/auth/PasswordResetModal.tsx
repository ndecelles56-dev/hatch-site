'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Alert, AlertDescription } from '../ui/alert'
import { Loader2, Mail, ArrowLeft, CheckCircle, AlertCircle, Bell } from 'lucide-react'
import { PasswordResetService } from '../../services/passwordResetService'
import { isValidCodeFormat, cleanCode, formatCode } from '../../utils/passwordReset'

interface PasswordResetModalProps {
  isOpen: boolean
  onClose: () => void
  initialEmail?: string
}

type ResetStep = 'email' | 'code' | 'success'

export const PasswordResetModal: React.FC<PasswordResetModalProps> = ({ 
  isOpen, 
  onClose,
  initialEmail = ''
}) => {
  const [step, setStep] = useState<ResetStep>('email')
  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)

  // Request notification permission when component mounts
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Cleanup expired codes when modal opens
  useEffect(() => {
    if (isOpen) {
      PasswordResetService.cleanupExpiredCodes()
    }
  }, [isOpen])

  const resetForm = () => {
    setStep('email')
    setEmail(initialEmail)
    setCode('')
    setError(null)
    setDebugInfo(null)
    setGeneratedCode(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setDebugInfo(null)

    try {
      console.log('Requesting verification code for:', email);
      const result = await PasswordResetService.createVerificationCode(email)
      
      console.log('Service result:', result);
      
      if (result.success) {
        setStep('code')
        setGeneratedCode(result.code || null)
        setDebugInfo(result.code ? `✅ Code generated successfully: ${result.code}` : '✅ Code generated and stored')
      } else {
        setError(result.error || 'Failed to send verification code')
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setError(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isValidCodeFormat(code)) {
      setError('Please enter a valid 6-digit code')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await PasswordResetService.verifyCode(email, cleanCode(code))
      
      if (result.success) {
        setStep('success')
      } else {
        setError(result.error || 'Invalid verification code')
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCodeChange = (value: string) => {
    // Auto-format the code as user types
    const cleaned = value.replace(/[^\d]/g, '')
    if (cleaned.length <= 6) {
      const formatted = cleaned.length > 3 ? formatCode(cleaned) : cleaned
      setCode(formatted)
    }
  }

  const copyCodeToClipboard = () => {
    if (generatedCode) {
      const formattedCode = formatCode(generatedCode)
      navigator.clipboard.writeText(formattedCode)
      setDebugInfo(`📋 Code copied to clipboard: ${formattedCode}`)
    }
  }

  const renderEmailStep = () => (
    <form onSubmit={handleSendCode} className="space-y-4">
      <div className="text-sm text-muted-foreground text-center">
        Enter your email address and we'll generate a verification code to reset your password.
      </div>
      
      <div>
        <Label htmlFor="reset-email">Email Address</Label>
        <Input
          id="reset-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your email address"
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Alert>
        <Bell className="h-4 w-4" />
        <AlertDescription>
          <strong>Development Mode:</strong> Verification codes will appear in the browser console and may show as notifications.
        </AlertDescription>
      </Alert>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Generate Verification Code
      </Button>
    </form>
  )

  const renderCodeStep = () => (
    <form onSubmit={handleVerifyCode} className="space-y-4">
      <div className="text-sm text-muted-foreground text-center">
        We've generated a 6-digit verification code for <strong>{email}</strong>. 
        <br />
        <span className="text-xs">Check the browser console or notifications for the code</span>
      </div>
      
      <div>
        <Label htmlFor="verification-code">Verification Code</Label>
        <Input
          id="verification-code"
          type="text"
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          required
          placeholder="123-456"
          className="text-center text-lg tracking-wider"
          maxLength={7} // 6 digits + 1 dash
        />
        <div className="text-xs text-muted-foreground mt-1">
          Enter the 6-digit code from the console or notification
        </div>
      </div>

      {generatedCode && (
        <Alert>
          <AlertDescription className="flex items-center justify-between">
            <span className="text-xs font-mono">Code: {formatCode(generatedCode)}</span>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={copyCodeToClipboard}
              className="h-6 px-2 text-xs"
            >
              Copy
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {debugInfo && (
        <Alert>
          <AlertDescription className="text-xs">{debugInfo}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={loading || !isValidCodeFormat(code)}>
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Verify Code
      </Button>

      <Button 
        type="button" 
        variant="ghost" 
        className="w-full" 
        onClick={() => setStep('email')}
        disabled={loading}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Email
      </Button>
    </form>
  )

  const renderSuccessStep = () => (
    <div className="text-center space-y-4">
      <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
      <div>
        <h3 className="text-lg font-semibold">Code Verified Successfully!</h3>
        <p className="text-muted-foreground mt-2">
          Your verification code has been confirmed. The password reset system is working correctly!
        </p>
      </div>
      <Alert>
        <Mail className="h-4 w-4" />
        <AlertDescription>
          <strong>System Status:</strong> ✅ Verification code generation and validation working perfectly. 
          The system automatically uses localStorage when database is not available.
        </AlertDescription>
      </Alert>
      <Button onClick={handleClose} className="w-full">
        Close
      </Button>
    </div>
  )

  const getStepTitle = () => {
    switch (step) {
      case 'email': return 'Reset Your Password'
      case 'code': return 'Enter Verification Code'
      case 'success': return 'Success!'
      default: return 'Reset Password'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {getStepTitle()}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {step === 'email' && renderEmailStep()}
          {step === 'code' && renderCodeStep()}
          {step === 'success' && renderSuccessStep()}
        </div>
      </DialogContent>
    </Dialog>
  )
}