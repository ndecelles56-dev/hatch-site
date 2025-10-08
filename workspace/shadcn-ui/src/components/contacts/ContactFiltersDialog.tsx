import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { type TeamMemberRecord } from '@/lib/api/hatch'

const STAGE_OPTIONS = ['NEW', 'NURTURE', 'ACTIVE', 'UNDER_CONTRACT', 'CLOSED', 'LOST', 'CONTACTED', 'QUALIFIED', 'PAST_CLIENT', 'ARCHIVED'] as const

export interface ContactFiltersState {
  stage?: string[]
  ownerId?: string[]
  doNotContact?: boolean
  includeDeleted?: boolean
}

interface ContactFiltersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialFilters: ContactFiltersState
  owners: TeamMemberRecord[]
  onApply: (filters: ContactFiltersState) => void
}

export function ContactFiltersDialog({ open, onOpenChange, initialFilters, owners, onApply }: ContactFiltersDialogProps) {
  const [stageSelection, setStageSelection] = useState<string[]>(initialFilters.stage ?? [])
  const [ownerSelection, setOwnerSelection] = useState<string[]>(initialFilters.ownerId ?? [])
  const [doNotContact, setDoNotContact] = useState<boolean>(initialFilters.doNotContact ?? false)
  const [includeDeleted, setIncludeDeleted] = useState<boolean>(initialFilters.includeDeleted ?? false)

  useEffect(() => {
    if (open) {
      setStageSelection(initialFilters.stage ?? [])
      setOwnerSelection(initialFilters.ownerId ?? [])
      setDoNotContact(initialFilters.doNotContact ?? false)
      setIncludeDeleted(initialFilters.includeDeleted ?? false)
    }
  }, [initialFilters, open])

  const toggleStage = (stage: string, checked: boolean | string) => {
    setStageSelection((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(stage)
      } else {
        next.delete(stage)
      }
      return Array.from(next)
    })
  }

  const toggleOwner = (ownerId: string, checked: boolean | string) => {
    setOwnerSelection((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(ownerId)
      } else {
        next.delete(ownerId)
      }
      return Array.from(next)
    })
  }

  const handleApply = () => {
    onApply({
      stage: stageSelection.length ? stageSelection : undefined,
      ownerId: ownerSelection.length ? ownerSelection : undefined,
      doNotContact: doNotContact ? true : undefined,
      includeDeleted: includeDeleted ? true : undefined
    })
    onOpenChange(false)
  }

  const handleClear = () => {
    setStageSelection([])
    setOwnerSelection([])
    setDoNotContact(false)
    setIncludeDeleted(false)
    onApply({})
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Filter contacts</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6">
          <div>
            <h4 className="text-sm font-semibold">Stages</h4>
            <ScrollArea className="mt-2 h-40 rounded-md border p-3">
              <div className="space-y-2">
                {STAGE_OPTIONS.map((stage) => (
                  <div key={stage} className="flex items-center space-x-2">
                    <Checkbox
                      id={`stage-${stage}`}
                      checked={stageSelection.includes(stage)}
                      onCheckedChange={(checked) => toggleStage(stage, checked)}
                    />
                    <Label htmlFor={`stage-${stage}`} className="text-sm capitalize">
                      {stage.replace(/_/g, ' ').toLowerCase()}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Owners</h4>
            <ScrollArea className="mt-2 h-40 rounded-md border p-3">
              <div className="space-y-2">
                {owners.length === 0 && <p className="text-sm text-muted-foreground">No owners available.</p>}
                {owners.map((owner) => (
                  <div key={owner.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`owner-${owner.id}`}
                      checked={ownerSelection.includes(owner.id)}
                      onCheckedChange={(checked) => toggleOwner(owner.id, checked)}
                    />
                    <Label htmlFor={`owner-${owner.id}`} className="text-sm">
                      {owner.name}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <Separator />

          <div className="flex items-center space-x-3">
            <Switch id="dnc-only" checked={doNotContact} onCheckedChange={setDoNotContact} />
            <div>
              <Label htmlFor="dnc-only">Do not contact</Label>
              <p className="text-sm text-muted-foreground">Show only contacts marked as do not contact.</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Switch id="include-deleted" checked={includeDeleted} onCheckedChange={setIncludeDeleted} />
            <div>
              <Label htmlFor="include-deleted">Include deleted</Label>
              <p className="text-sm text-muted-foreground">Show contacts moved to trash within 30 days.</p>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 flex flex-row justify-between">
          <Button type="button" variant="ghost" onClick={handleClear}>
            Clear filters
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleApply}>
              Apply filters
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ContactFiltersDialog
