import { createClient } from 'npm:@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase configuration for invitations edge function')
}

const json = (status: number, payload: unknown) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })

const sanitizeEmail = (value: string) => value.trim().toLowerCase()

const ensureSeatAvailability = async (
  serviceClient: ReturnType<typeof createClient>,
  orgId: string
) => {
  const { data: subscription, error } = await serviceClient
    .from('org_subscriptions')
    .select('id, seats_purchased, seats_used, status')
    .eq('org_id', orgId)
    .maybeSingle()

  if (error) {
    console.error('Seat check failed', error)
    throw new Error('seat_check_failed')
  }

  if (!subscription) return

  if (subscription.status !== 'active' && subscription.status !== 'trialing') {
    throw new Error('subscription_inactive')
  }

  if (subscription.seats_used >= subscription.seats_purchased) {
    throw new Error('seats_full')
  }
}

const syncSeatUsage = async (
  serviceClient: ReturnType<typeof createClient>,
  orgId: string
) => {
  const { count, error } = await serviceClient
    .from('org_members')
    .select('id', { count: 'exact', head: true })
    .eq('org_id', orgId)
    .eq('status', 'active')

  if (error) {
    console.error('Failed to count seats', error)
    return
  }

  const { error: updateError } = await serviceClient
    .from('org_subscriptions')
    .update({ seats_used: count ?? 0 })
    .eq('org_id', orgId)

  if (updateError) {
    console.error('Failed to update seat usage', updateError)
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return json(200, { ok: true })

  if (req.method !== 'POST') {
    return json(405, { error: 'method_not_allowed' })
  }

  const url = new URL(req.url)
  const segments = url.pathname.split('/').filter(Boolean)

  if (segments.length < 2 || segments[0] !== 'invitations' || segments[1] !== 'accept') {
    return json(404, { error: 'not_found' })
  }

  const authHeader = req.headers.get('Authorization') ?? ''
  const authClient = createClient(supabaseUrl!, supabaseAnonKey!, {
    global: {
      headers: { Authorization: authHeader },
    },
  })

  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser()

  if (userError || !user) {
    return json(401, { error: 'unauthorized' })
  }

  const body = await req.json().catch(() => null)
  if (!body || typeof body.token !== 'string') {
    return json(400, { error: 'invalid_payload' })
  }

  const serviceClient = createClient(supabaseUrl!, supabaseServiceRoleKey!)

  const { data: invitation, error: invitationError } = await serviceClient
    .from('org_invitations')
    .select('*')
    .eq('token', body.token)
    .maybeSingle()

  if (invitationError) {
    console.error('Failed to load invitation', invitationError)
    return json(500, { error: 'invitation_fetch_failed' })
  }

  if (!invitation) {
    return json(404, { error: 'invitation_not_found' })
  }

  if (invitation.status !== 'sent') {
    return json(409, { error: 'invitation_consumed' })
  }

  if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
    return json(409, { error: 'invitation_expired' })
  }

  if (sanitizeEmail(invitation.email) !== sanitizeEmail(user.email ?? '')) {
    return json(403, { error: 'email_mismatch' })
  }

  await ensureSeatAvailability(serviceClient, invitation.org_id)

  const { data: existingMembership, error: membershipError } = await serviceClient
    .from('org_members')
    .select('id, status, role')
    .eq('org_id', invitation.org_id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (membershipError) {
    console.error('Failed to check existing membership', membershipError)
    return json(500, { error: 'membership_fetch_failed' })
  }

  const now = new Date().toISOString()

  if (existingMembership) {
    const { error: updateError } = await serviceClient
      .from('org_members')
      .update({
        role: invitation.role,
        status: 'active',
        accepted_at: now,
      })
      .eq('id', existingMembership.id)

    if (updateError) {
      console.error('Failed to update membership during acceptance', updateError)
      return json(500, { error: 'membership_update_failed' })
    }
  } else {
    const { error: insertError } = await serviceClient
      .from('org_members')
      .insert({
        org_id: invitation.org_id,
        user_id: user.id,
        role: invitation.role,
        status: 'active',
        joined_at: now,
        invited_at: invitation.created_at,
        accepted_at: now,
      })

    if (insertError) {
      console.error('Failed to create membership during acceptance', insertError)
      return json(500, { error: 'membership_insert_failed' })
    }
  }

  const license = body.license as
    | {
        number: string
        state: string
        type?: 'agent' | 'brokerage'
        docs_url?: string
        metadata?: Record<string, unknown>
      }
    | undefined

  if (license && typeof license.number === 'string' && typeof license.state === 'string') {
    const licenseType = (license.type ?? 'agent') as 'agent' | 'brokerage'
    const { error: licenseError } = await serviceClient
      .from('licenses')
      .insert({
        org_id: licenseType === 'brokerage' ? invitation.org_id : null,
        user_id: licenseType === 'agent' ? user.id : null,
        type: licenseType,
        state: license.state,
        license_number_encrypted: 'pending',
        metadata: {
          ...(license.metadata ?? {}),
          license_number_plain: license.number,
        },
        docs_url: license.docs_url ?? null,
      })

    if (licenseError) {
      console.error('Failed to store license during invitation acceptance', licenseError)
      return json(500, { error: 'license_store_failed' })
    }
  }

  const { error: invitationUpdateError } = await serviceClient
    .from('org_invitations')
    .update({
      status: 'accepted',
      accepted_at: now,
      accepted_by: user.id,
    })
    .eq('id', invitation.id)

  if (invitationUpdateError) {
    console.error('Failed to update invitation status', invitationUpdateError)
    return json(500, { error: 'invitation_update_failed' })
  }

  await syncSeatUsage(serviceClient, invitation.org_id)

  return json(200, { data: { orgId: invitation.org_id, role: invitation.role } })
})
