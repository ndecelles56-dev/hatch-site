import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { createContact, type TeamMemberRecord } from '@/lib/api/hatch'
import { useAuth } from '@/contexts/AuthContext'

const STAGE_OPTIONS = ['NEW', 'NURTURE', 'ACTIVE', 'UNDER_CONTRACT', 'CLOSED', 'LOST'] as const

type StageOption = (typeof STAGE_OPTIONS)[number]

interface NewContactDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId: string
  organizationId?: string | null
  owners: TeamMemberRecord[]
  onCreated?: () => void
}

type ConsentState = {
  email: boolean
  sms: boolean
}

type FormState = {
  firstName: string
  lastName: string
  primaryEmail: string
  primaryPhone: string
  stage: StageOption
  ownerId: string | null
  tags: string
  address: string
  notes: string
  doNotContact: boolean
  consent: ConsentState
}

const INITIAL_FORM: FormState = {
  firstName: '',
  lastName: '',
  primaryEmail: '',
  primaryPhone: '',
  stage: 'NEW',
  ownerId: null,
  tags: '',
  address: '',
  notes: '',
  doNotContact: false,
  consent: {
    email: false,
    sms: false
  }
}

export function NewContactDrawer({ open, onOpenChange, tenantId, organizationId, owners, onCreated }: NewContactDrawerProps) {
  const { toast } = useToast()
  const { userId, activeMembership } = useAuth()
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setForm((prev) => ({
        ...INITIAL_FORM,
        ownerId: owners.find((owner) => owner.id === userId)?.id ?? userId ?? owners[0]?.id ?? null
      }))
    } else {
      setForm(INITIAL_FORM)
      setIsSubmitting(false)
    }
  }, [open, owners, userId])

  const handleChange = (field: keyof FormState, value: string | boolean | ConsentState | null) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!organizationId && !activeMembership?.org_id) {
      toast({
        title: 'Missing organization',
        description: 'Cannot create contact because no active organization is selected.',
        variant: 'destructive'
      })
      return
    }

    const payload: Record<string, unknown> = {
      tenantId,
      organizationId: organizationId ?? activeMembership?.org_id ?? owners[0]?.orgId ?? 'org-hatch',
      ownerId: form.ownerId ?? userId ?? undefined,
      firstName: form.firstName || undefined,
      lastName: form.lastName || undefined,
      primaryEmail: form.primaryEmail || undefined,
      primaryPhone: form.primaryPhone || undefined,
      stage: form.stage,
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      address: form.address || undefined,
      doNotContact: form.doNotContact,
      notes: form.notes || undefined,
      secondaryEmails: [],
      secondaryPhones: []
    }

    const consents: Array<Record<string, unknown>> = []
    if (form.consent.email) {
      consents.push({
        channel: 'EMAIL',
        scope: 'TRANSACTIONAL',
        verbatimText: 'Email consent captured in CRM',
        source: 'crm_manual'
      })
    }
    if (form.consent.sms) {
      consents.push({
        channel: 'SMS',
        scope: 'PROMOTIONAL',
        verbatimText: 'SMS consent captured in CRM',
        source: 'crm_manual'
      })
    }
    if (consents.length) {
      payload.consents = consents
    }

    setIsSubmitting(true)
    try {
      await createContact(payload)
      toast({ title: 'Contact created', description: 'The new contact has been added successfully.' })
      onOpenChange(false)
      onCreated?.()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create contact.'
      toast({ title: 'Failed to create contact', description: message, variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New contact</DialogTitle>
          <DialogDescription>Create a contact record and optionally capture consent.</DialogDescription>
        </DialogHeader>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" value={form.firstName} onChange={(event) => handleChange('firstName', event.target.value)} autoFocus />
            </div>
            <div>
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" value={form.lastName} onChange={(event) => handleChange('lastName', event.target.value)} />
            </div>
            <div>
              <Label htmlFor="primaryEmail">Primary email</Label>
              <Input id="primaryEmail" type="email" value={form.primaryEmail} onChange={(event) => handleChange('primaryEmail', event.target.value)} />
            </div>
            <div>
              <Label htmlFor="primaryPhone">Primary phone</Label>
              <Input id="primaryPhone" value={form.primaryPhone} onChange={(event) => handleChange('primaryPhone', event.target.value)} placeholder="+15551234567" />
            </div>
            <div>
              <Label htmlFor="stage">Stage</Label>
              <Select value={form.stage} onValueChange={(value) => handleChange('stage', value as StageOption)}>
                <SelectTrigger id="stage">
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {STAGE_OPTIONS.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="owner">Owner</Label>
              <Select value={form.ownerId ?? undefined} onValueChange={(value) => handleChange('ownerId', value)}>
                <SelectTrigger id="owner">
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent>
                  {owners.map((owner) => (
                    <SelectItem key={owner.id} value={owner.id}>
                      {owner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="Comma separated"
              value={form.tags}
              onChange={(event) => handleChange('tags', event.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={form.address} onChange={(event) => handleChange('address', event.target.value)} />
          </div>

          <div>
            <Label htmlFor="notes">Internal notes</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(event) => handleChange('notes', event.target.value)}
              placeholder="Add any context or notes for your team"
            />
          </div>

          <div className="flex items-center space-x-3 rounded-md border p-3">
            <Switch id="do-not-contact" checked={form.doNotContact} onCheckedChange={(checked) => handleChange('doNotContact', checked)} />
            <div>
              <Label htmlFor="do-not-contact">Do not contact</Label>
              <p className="text-sm text-muted-foreground">Block outbound messaging for this contact.</p>
            </div>
          </div>

          <div className="space-y-3 rounded-md border p-3">
            <h4 className="text-sm font-semibold">Consent capture</h4>
            <div className="flex items-center space-x-3">
              <Switch checked={form.consent.email} onCheckedChange={(checked) => handleChange('consent', { ...form.consent, email: checked })} id="email-consent" />
              <div>
                <Label htmlFor="email-consent">Email consent</Label>
                <p className="text-xs text-muted-foreground">Mark consent for transactional email updates.</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Switch checked={form.consent.sms} onCheckedChange={(checked) => handleChange('consent', { ...form.consent, sms: checked })} id="sms-consent" />
              <div>
                <Label htmlFor="sms-consent">SMS consent</Label>
                <p className="text-xs text-muted-foreground">Mark consent for promotional SMS messaging.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Create contact'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default NewContactDrawer
