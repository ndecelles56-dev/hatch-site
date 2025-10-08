import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { getContact, type ContactDetails } from '@/lib/api/hatch'
import { Mail, Phone, ShieldAlert } from 'lucide-react'
import { useMessenger } from '@/contexts/MessengerContext'

interface ContactDetailsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contactId: string | null
  tenantId: string
  onAssignOwner: () => void
  refreshKey?: number
  onOwnerChange?: (ownerId: string | null) => void
  onRestore?: (contactId: string) => void
  restoring?: boolean
}

const statusBadge = (status: string) => {
  switch (status) {
    case 'GRANTED':
      return 'bg-green-100 text-green-800'
    case 'REVOKED':
      return 'bg-red-100 text-red-800'
    case 'DELIVERED':
    case 'READ':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-amber-100 text-amber-800'
  }
}

export function ContactDetailsDrawer({ open, onOpenChange, contactId, tenantId, onAssignOwner, refreshKey, onOwnerChange, onRestore, restoring }: ContactDetailsDrawerProps) {
  const { openForContact } = useMessenger()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [contact, setContact] = useState<ContactDetails | null>(null)

  useEffect(() => {
    let cancelled = false
    if (!open || !contactId) {
      setContact(null)
      setError(null)
      return
    }

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await getContact(contactId, tenantId)
        if (!cancelled) {
          setContact(response)
          onOwnerChange?.(response.owner?.id ?? null)
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Unable to load contact details'
          setError(message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [open, contactId, tenantId, refreshKey])

  const consentBadges = useMemo(() => {
    if (!contact) return null
    return (
      <div className="flex flex-wrap gap-2">
        <Badge className={statusBadge(contact.consent.email.status)}>
          Email: {contact.consent.email.status.toLowerCase()}
        </Badge>
        <Badge className={statusBadge(contact.consent.sms.status)}>
          SMS: {contact.consent.sms.status.toLowerCase()}
        </Badge>
        {contact.doNotContact && (
          <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" />
            DNC active
          </Badge>
        )}
      </div>
    )
  }, [contact])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Contact details</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : contact ? (
          <div className="grid gap-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold">{[contact.firstName, contact.lastName].filter(Boolean).join(' ') || 'Unnamed contact'}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {contact.primaryEmail || 'No email'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {contact.primaryPhone || 'No phone'}
                  </span>
                  {contact.owner?.name && <span>Owner: {contact.owner.name}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge>{contact.stage}</Badge>
                {!contact.deletedAt && (
                  <Button
                    size="sm"
                    onClick={() => {
                      onOpenChange(false)
                      openForContact(contact.id)
                    }}
                  >
                    Message
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={onAssignOwner}>
                  Assign owner
                </Button>
                {contact.deletedAt && onRestore && (
                  <Button size="sm" onClick={() => onRestore(contact.id)} disabled={restoring}>
                    {restoring ? 'Restoring…' : 'Restore'}
                  </Button>
                )}
              </div>
            </div>

            {contact.deletedAt && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                This contact was moved to trash on {format(new Date(contact.deletedAt), 'PPpp')}. Restore to resume messaging.
              </div>
            )}

            {consentBadges}

            <div className="grid gap-3 text-sm">
              <div><span className="font-semibold">Address:</span> {contact.address || '—'}</div>
              <div><span className="font-semibold">Source:</span> {contact.source || '—'}</div>
              <div><span className="font-semibold">Tags:</span> {contact.tags.length ? contact.tags.join(', ') : '—'}</div>
              <div><span className="font-semibold">Last activity:</span> {contact.lastActivityAt ? format(new Date(contact.lastActivityAt), 'PPpp') : '—'}</div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-semibold mb-2">Timeline</h3>
              {contact.timeline.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity recorded.</p>
              ) : (
                <ScrollArea className="h-48 rounded-md border p-3">
                  <div className="space-y-3 text-sm">
                    {contact.timeline.map((entry) => (
                      <div key={entry.id} className="border-b pb-2 last:border-b-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{entry.type.replace(/_/g, ' ').toLowerCase()}</span>
                          <span className="text-xs text-muted-foreground">{format(new Date(entry.occurredAt), 'PPpp')}</span>
                        </div>
                        {entry.actor?.name && <div className="text-xs text-muted-foreground">By {entry.actor.name}</div>}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Select a contact to see details.</p>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ContactDetailsDrawer
