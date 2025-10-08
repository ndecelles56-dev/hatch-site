import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { MessageSquare } from 'lucide-react'
import { useAuth } from './AuthContext'
import { MessengerWidget } from '@/components/messenger/MessengerWidget'
import { cn } from '@/lib/utils'

interface MessengerContextValue {
  isOpen: boolean
  open: () => void
  openForContact: (personId: string) => void
  close: () => void
  toggle: () => void
}

const MessengerContext = createContext<MessengerContextValue | undefined>(undefined)

export const MessengerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [initialContactId, setInitialContactId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setIsOpen(false)
      setInitialContactId(null)
    }
  }, [user])

  const open = useCallback(() => {
    if (!user) return
    setIsOpen(true)
  }, [user])

  const openForContact = useCallback(
    (personId: string) => {
      if (!user) return
      setInitialContactId(personId)
      setIsOpen(true)
    },
    [user]
  )

  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => {
    if (!user) return
    setIsOpen((prev) => !prev)
  }, [user])

  const value = useMemo(
    () => ({
      isOpen,
      open,
      openForContact,
      close,
      toggle
    }),
    [isOpen, open, openForContact, close, toggle]
  )

  return (
    <MessengerContext.Provider value={value}>
      {children}
      {user ? (
        <div className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-3">
          {!isOpen ? (
            <button
              onClick={open}
              type="button"
              aria-label="Open messages"
              className={cn(
                'group flex items-center rounded-full bg-slate-900 px-2.5 py-2 text-white shadow-lg transition-all duration-200 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400'
              )}
              style={{ transformOrigin: 'bottom right' }}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 transition-transform duration-200 group-hover:scale-105">
                <MessageSquare className="h-4 w-4" />
              </span>
              <span className="ml-0 max-w-0 overflow-hidden text-sm font-medium opacity-0 transition-all duration-200 group-hover:ml-2 group-hover:max-w-[6rem] group-hover:opacity-100">
                Messages
              </span>
            </button>
          ) : (
            <MessengerWidget
              onClose={close}
              initialContactId={initialContactId}
              onInitialContactConsumed={() => setInitialContactId(null)}
            />
          )}
        </div>
      ) : null}
    </MessengerContext.Provider>
  )
}

export const useMessenger = () => {
  const ctx = useContext(MessengerContext)
  if (!ctx) {
    throw new Error('useMessenger must be used within a MessengerProvider')
  }
  return ctx
}
