import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  UserPlus, 
  Mail, 
  Trash2, 
  RefreshCw,
  AlertCircle,
  Check,
  Clock,
  X
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface Invitation {
  id: string
  email: string
  role: string
  status: string
  expires_at: string
  created_at: string
}

interface Subscription {
  seats_purchased: number
  seats_used: number
}

export function AgentInvitation() {
  const { user } = useAuth()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('agent')
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchInvitations()
      fetchSubscription()
    }
  }, [user])

  const fetchInvitations = async () => {
    if (!user) return

    try {
      // Get firm ID for current user
      const { data: membership } = await supabase
        .from('firm_memberships')
        .select('firm_id')
        .eq('user_id', user.id)
        .eq('role', 'primary_broker')
        .single()

      if (!membership) return

      const { data, error } = await supabase
        .from('agent_invitations')
        .select('*')
        .eq('firm_id', membership.firm_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setInvitations(data || [])
    } catch (error) {
      console.error('Error fetching invitations:', error)
    } finally {
      setFetchLoading(false)
    }
  }

  const fetchSubscription = async () => {
    if (!user) return

    try {
      // Get firm and subscription info
      const { data: membership } = await supabase
        .from('firm_memberships')
        .select('firm_id')
        .eq('user_id', user.id)
        .eq('role', 'primary_broker')
        .single()

      if (!membership) return

      const { data, error } = await supabase
        .from('firms')
        .select('seats_purchased, seats_used')
        .eq('id', membership.firm_id)
        .eq('subscription_status', 'active')
        .single()

      if (error) throw error
      setSubscription(data)
    } catch (error) {
      console.error('Error fetching subscription:', error)
    }
  }

  const sendInvitation = async () => {
    if (!user || !email.trim()) return

    setLoading(true)
    try {
      // Check if we have available seats
      if (subscription && subscription.seats_used >= subscription.seats_purchased) {
        alert('You have reached your seat limit. Please upgrade your plan to invite more agents.')
        return
      }

      // Get firm ID
      const { data: membership } = await supabase
        .from('firm_memberships')
        .select('firm_id')
        .eq('user_id', user.id)
        .eq('role', 'primary_broker')
        .single()

      if (!membership) {
        alert('You must be a primary broker to send invitations.')
        return
      }

      // Check if email is already invited or is a member
      const { data: existingInvite } = await supabase
        .from('agent_invitations')
        .select('id')
        .eq('firm_id', membership.firm_id)
        .eq('email', email.toLowerCase())
        .eq('status', 'pending')
        .single()

      if (existingInvite) {
        alert('This email already has a pending invitation.')
        return
      }

      // Generate invitation token
      const token = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiration

      // Create invitation
      const { error } = await supabase
        .from('agent_invitations')
        .insert({
          firm_id: membership.firm_id,
          invited_by: user.id,
          email: email.toLowerCase(),
          role,
          token,
          expires_at: expiresAt.toISOString()
        })

      if (error) throw error

      // In a real app, you would send an email here
      console.log(`Invitation sent to ${email} with token: ${token}`)
      
      // Reset form and refresh list
      setEmail('')
      fetchInvitations()
      
      alert(`Invitation sent to ${email}! They will receive an email with instructions to join your team.`)
    } catch (error) {
      console.error('Error sending invitation:', error)
      alert('Failed to send invitation. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const revokeInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('agent_invitations')
        .update({ status: 'revoked' })
        .eq('id', invitationId)

      if (error) throw error
      
      fetchInvitations()
      alert('Invitation revoked successfully.')
    } catch (error) {
      console.error('Error revoking invitation:', error)
      alert('Failed to revoke invitation.')
    }
  }

  const resendInvitation = async (invitationId: string, email: string) => {
    try {
      // Update expiration date
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      const { error } = await supabase
        .from('agent_invitations')
        .update({ 
          expires_at: expiresAt.toISOString(),
          status: 'pending'
        })
        .eq('id', invitationId)

      if (error) throw error
      
      // In a real app, you would resend the email here
      console.log(`Invitation resent to ${email}`)
      
      fetchInvitations()
      alert(`Invitation resent to ${email}!`)
    } catch (error) {
      console.error('Error resending invitation:', error)
      alert('Failed to resend invitation.')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'accepted':
        return <Check className="h-4 w-4 text-green-500" />
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'revoked':
        return <X className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      case 'revoked':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const availableSeats = subscription ? subscription.seats_purchased - subscription.seats_used : 0
  const canInvite = availableSeats > 0

  if (fetchLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Agent Invitations</h2>
        {subscription && (
          <Badge variant="outline" className="text-sm">
            {subscription.seats_used}/{subscription.seats_purchased} seats used
          </Badge>
        )}
      </div>

      {/* Seat Usage Warning */}
      {!canInvite && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Seat Limit Reached
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 mb-4">
              You've reached your agent seat limit. Upgrade your plan to invite more team members.
            </p>
            <Button onClick={() => window.location.href = '/pricing'}>
              Upgrade Plan
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Invitation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserPlus className="h-5 w-5 mr-2" />
            Invite New Agent
          </CardTitle>
          <CardDescription>
            Send an invitation to add a new agent to your team
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="agent@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!canInvite}
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!canInvite}
              >
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <Button 
            onClick={sendInvitation} 
            disabled={loading || !email.trim() || !canInvite}
            className="w-full md:w-auto"
          >
            {loading ? 'Sending...' : 'Send Invitation'}
          </Button>
        </CardContent>
      </Card>

      {/* Invitations List */}
      <Card>
        <CardHeader>
          <CardTitle>Pending & Recent Invitations</CardTitle>
          <CardDescription>
            Manage your team invitations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No invitations sent yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(invitation.status)}
                    <div>
                      <p className="font-medium">{invitation.email}</p>
                      <p className="text-sm text-gray-500">
                        {invitation.role} • Sent {new Date(invitation.created_at).toLocaleDateString()}
                        {invitation.status === 'pending' && (
                          <span className="ml-2">
                            Expires {new Date(invitation.expires_at).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(invitation.status)}>
                      {invitation.status}
                    </Badge>
                    {invitation.status === 'pending' && (
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resendInvitation(invitation.id, invitation.email)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => revokeInvitation(invitation.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}