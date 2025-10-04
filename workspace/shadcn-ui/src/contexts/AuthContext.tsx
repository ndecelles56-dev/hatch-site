'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/lib/api/client'
import { fetchSession, type SessionMembership, type SessionResponse } from '@/lib/api/session'

interface AuthContextValue {
  loading: boolean
  session: SessionResponse | null
  userId: string | null
  user: SessionResponse['user'] | null
  activeOrgId: string | null
  memberships: SessionMembership[]
  activeMembership: SessionMembership | null
  policies: SessionResponse['policies']
  isBroker: boolean
  refresh: () => Promise<void>
  setActiveOrg: (orgId: string | null) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  setUser: (session: SessionResponse | null) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<SessionResponse | null>(null)
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null)
  const [memberships, setMemberships] = useState<SessionMembership[]>([])
  const [policies, setPolicies] = useState<SessionResponse['policies']>([])
  const edgeAvailableRef = useRef(true)

  const activeMembership = useMemo(() => {
    if (!activeOrgId) return null
    return memberships.find((membership) => membership.org_id === activeOrgId && membership.status === 'active') ?? null
  }, [activeOrgId, memberships])

  const userId = session?.user.id ?? null
  const user = session?.user ?? null

  const isBroker = useMemo(() => {
    if (!session) return false
    if (session.user.globalRole === 'SUPER_ADMIN') return true
    return memberships.some((membership) =>
      membership.status === 'active' && ['BROKER_OWNER', 'BROKER_MANAGER', 'AGENT'].includes(membership.role)
    )
  }, [session, memberships])

  const applySession = useCallback((next: SessionResponse | null) => {
    setSession(next)
    if (!next) {
      setActiveOrgId(null)
      setMemberships([])
      setPolicies([])
      return
    }

    const initialActiveOrg = next.activeOrgId
      ?? next.memberships.find((membership) => membership.status === 'active')?.org_id
      ?? null

    setActiveOrgId(initialActiveOrg)
    setMemberships(next.memberships)
    setPolicies(next.policies)
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)

    const conclude = () => setLoading(false)

    if (edgeAvailableRef.current) {
      try {
        const response = await fetchSession()
        applySession(response)
        conclude()
        return
      } catch (error) {
        const status = (error as { status?: number }).status
        const message = error instanceof Error ? error.message : undefined
        console.warn('fetchSession via edge failed', { status, message, error })

        if (status === 404 || message === 'TypeError: Load failed') {
          edgeAvailableRef.current = false
        } else {
          console.warn('Failed to refresh session via edge function', error)
          edgeAvailableRef.current = false
        }
      }
    }

    try {
      console.log('[Auth] Using supabase.auth.getSession fallback')
      const { data } = await supabase.auth.getSession()
      const fallbackSession = data.session

      if (fallbackSession?.user) {
        applySession({
          user: {
            id: fallbackSession.user.id,
            email: fallbackSession.user.email,
            globalRole: (fallbackSession.user.user_metadata?.global_role as SessionResponse['user']['globalRole']) ?? 'USER',
          },
          profile: fallbackSession.user.user_metadata ?? null,
          memberships: [],
          activeOrgId: null,
          policies: [],
        })
        console.log('[Auth] Fallback session applied for', fallbackSession.user.email)
      } else {
        console.log('[Auth] No fallback session found; user not signed in')
        applySession(null)
      }
    } catch (fallbackError) {
      console.error('Failed to load fallback session', fallbackError)
      applySession(null)
    } finally {
      conclude()
    }
  }, [applySession])

  const setActiveOrg = useCallback(async (orgId: string | null) => {
    if (!userId) return
    const { error } = await supabase.from('profiles').update({ active_org_id: orgId }).eq('id', userId)
    if (error) {
      console.error('Failed to update active org', error)
      throw error
    }
    setActiveOrgId(orgId)
  }, [userId])

  const setUser = useCallback((value: SessionResponse | null) => {
    applySession(value)
  }, [applySession])

  const signIn = useCallback(async (email: string, password: string) => {
    console.log('[Auth] signInWithPassword start', email)
    const result = await supabase.auth.signInWithPassword({ email, password })
    console.log('[Auth] signInWithPassword raw result', result)
    const { data, error } = result
    console.log('[Auth] signInWithPassword resolved', { user: data?.user?.id, session: Boolean(data?.session), error })
    if (error) {
      console.error('signInWithPassword failed', error)
      throw error
    }
    void refresh().catch((refreshError) => {
      console.error('Post-sign-in refresh failed', refreshError)
    })
  }, [refresh])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    applySession(null)
    setLoading(false)
  }, [applySession])

  useEffect(() => {
    const initialise = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        edgeAvailableRef.current = true
        await refresh()
      } else {
        edgeAvailableRef.current = true
        applySession(null)
        setLoading(false)
      }
    }

    initialise()

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        edgeAvailableRef.current = true
        await refresh()
      } else {
        edgeAvailableRef.current = true
        applySession(null)
        setLoading(false)
      }
    })

    return () => {
      listener.subscription?.unsubscribe()
    }
  }, [refresh, applySession])

  const value = useMemo<AuthContextValue>(() => ({
    loading,
    session,
    userId,
    user,
    activeOrgId,
    memberships,
    activeMembership,
    policies,
    isBroker,
    refresh,
    setActiveOrg,
    signIn,
    signOut,
    setUser,
  }), [
    loading,
    session,
    userId,
    user,
    activeOrgId,
    memberships,
    activeMembership,
    policies,
    isBroker,
    refresh,
    setActiveOrg,
    signIn,
    signOut,
    setUser,
  ])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
