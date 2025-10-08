import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { assignContactOwner, type TeamMemberRecord } from '@/lib/api/hatch'

interface AssignOwnerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId: string
  contactId: string | null
  owners: TeamMemberRecord[]
  initialOwnerId?: string | null
  onAssigned?: () => void
}

const AssignOwnerDialog = ({ open, onOpenChange, tenantId, contactId, owners, initialOwnerId, onAssigned }: AssignOwnerDialogProps) => {
  const { toast } = useToast()
  const [ownerId, setOwnerId] = useState<string>('')
  const [notify, setNotify] = useState<boolean>(false)
  const [reason, setReason] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)

  const ownerOptions = useMemo(() => owners ?? [], [owners])

  useEffect(() => {
    if (open) {
      setOwnerId(initialOwnerId ?? ownerOptions[0]?.id ?? '')
      setNotify(false)
      setReason('')
    }
  }, [open, initialOwnerId, ownerOptions])

  const handleAssign = async () => {
    if (!contactId) return
    if (!ownerId) {
      toast({ title: 'Select an owner', description: 'Choose an owner before assigning.', variant: 'destructive' })
      return
    }

    setSubmitting(true)
    try {
      await assignContactOwner(contactId, {
        tenantId,
        ownerId,
        notify,
        reason: reason.trim() || undefined
      })
      toast({ title: 'Owner updated', description: 'The contact owner has been updated.' })
      onOpenChange(false)
      onAssigned?.()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to assign owner'
      toast({ title: 'Failed to assign owner', description: message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign owner</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="owner-select">Owner</Label>
            <Select value={ownerId} onValueChange={setOwnerId}>
              <SelectTrigger id="owner-select">
                <SelectValue placeholder="Select owner" />
              </SelectTrigger>
              <SelectContent>
                {ownerOptions.map((owner) => (
                  <SelectItem key={owner.id} value={owner.id}>
                    {owner.name} ({owner.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-3 rounded-md border p-3">
            <Switch id="notify-owner" checked={notify} onCheckedChange={setNotify} />
            <div>
              <Label htmlFor="notify-owner">Notify new owner</Label>
              <p className="text-sm text-muted-foreground">Send a notification to the new owner.</p>
            </div>
          </div>
          <div>
            <Label htmlFor="assign-reason">Reason (optional)</Label>
            <Textarea
              id="assign-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Provide context for this reassignment"
            />
          </div>
        </div>
        <DialogFooter>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="button" onClick={handleAssign} disabled={submitting || !ownerId}>
              {submitting ? 'Assigning…' : 'Assign owner'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AssignOwnerDialog
