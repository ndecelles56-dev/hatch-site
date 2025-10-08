'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
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
  signIn: (email: string, password: string, options?: { allowDevFallback?: boolean }) => Promise<void>
  signOut: () => Promise<void>
  setUser: (session: SessionResponse | null) => void
  status: 'loading' | 'authenticated' | 'unauthenticated'
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const DEV_TENANT_ID = import.meta.env.VITE_TENANT_ID || 'tenant-hatch'
const SIGN_IN_TIMEOUT_MS = Number(import.meta.env.VITE_SUPABASE_SIGNIN_TIMEOUT_MS ?? 8000)
const DEV_AUTH_CACHE_KEY = 'hatch_dev_auth'

type DevAuthPayload = {
  timestamp: number
  session: SessionResponse
}

const buildDevSession = (email: string): SessionResponse => {
  const name = email.split('@')[0] || 'Dev'
  return {
    user: {
      id: `dev-${email}`,
      email,
      globalRole: 'SUPER_ADMIN'
    },
    profile: {
      first_name: name,
      last_name: 'User',
      fallback: true
    },
    memberships: [
      {
        id: 'dev-membership',
        org_id: DEV_TENANT_ID,
        role: 'BROKER_OWNER',
        status: 'active',
        can_manage_billing: true,
        metadata: null,
        org: {
          id: DEV_TENANT_ID,
          name: 'Dev Brokerage',
          type: 'BROKERAGE',
          status: 'active',
          billing_email: email,
          stripe_customer_id: null,
          grace_period_ends_at: null,
          metadata: null
        }
      }
    ],
    activeOrgId: DEV_TENANT_ID,
    policies: []
  }
}

const readDevAuth = (): SessionResponse | null => {
  if (!import.meta.env.DEV || typeof window === 'undefined') return null
  const raw = localStorage.getItem(DEV_AUTH_CACHE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as DevAuthPayload
    if (!parsed?.session) return null
    return parsed.session
  } catch (error) {
    console.warn('Failed to parse dev auth cache', error)
    localStorage.removeItem(DEV_AUTH_CACHE_KEY)
    return null
  }
}

const writeDevAuth = (session: SessionResponse | null) => {
  if (typeof window === 'undefined') return
  if (!import.meta.env.DEV) {
    localStorage.removeItem(DEV_AUTH_CACHE_KEY)
    return
  }
  if (!session) {
    localStorage.removeItem(DEV_AUTH_CACHE_KEY)
  } else {
    const payload: DevAuthPayload = {
      timestamp: Date.now(),
      session
    }
    localStorage.setItem(DEV_AUTH_CACHE_KEY, JSON.stringify(payload))
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const withRetry = async <T,>(operation: () => Promise<T>, options: { retries?: number; baseDelayMs?: number } = {}) => {
  const retries = options.retries ?? 2
  const baseDelayMs = options.baseDelayMs ?? 400
  let attempt = 0
  let lastError: unknown

  while (attempt <= retries) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      if (attempt === retries) break
      const delay = baseDelayMs * 2 ** attempt
      await wait(delay)
      attempt += 1
    }
  }

  throw lastError instanceof Error ? lastError : new Error('operation_failed')
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')
  const [supabaseSession, setSupabaseSession] = useState<SessionResponse | null>(null)
  const [devSession, setDevSession] = useState<SessionResponse | null>(null)
  const listenerRef = useRef<ReturnType<typeof supabase.auth.onAuthStateChange> | null>(null)

  const effectiveSession = devSession ?? supabaseSession

  const memberships = effectiveSession?.memberships ?? []
  const activeOrgId = effectiveSession?.activeOrgId ?? null
  const policies = effectiveSession?.policies ?? []
  const user = effectiveSession?.user ?? null
  const userId = user?.id ?? null

  const activeMembership = useMemo(() => {
    if (!activeOrgId) return null
    return memberships.find((membership) => membership.org_id === activeOrgId && membership.status === 'active') ?? null
  }, [memberships, activeOrgId])

  const isBroker = useMemo(() => {
    if (!effectiveSession) return false
    if (effectiveSession.user.globalRole === 'SUPER_ADMIN') return true
    return memberships.some((membership) =>
      membership.status === 'active' && ['BROKER_OWNER', 'BROKER_MANAGER', 'AGENT'].includes(membership.role)
    )
  }, [effectiveSession, memberships])

  const clearDevSession = useCallback(() => {
    setDevSession(null)
    writeDevAuth(null)
  }, [])

  const applySupabaseSession = useCallback((value: SessionResponse | null) => {
    setSupabaseSession(value)
    if (value) {
      setStatus('authenticated')
    } else {
      setStatus('unauthenticated')
    }
  }, [])

  const setDevAuth = useCallback((payload: SessionResponse | null) => {
    if (payload) {
      setDevSession(payload)
      writeDevAuth(payload)
      setStatus('authenticated')
    } else {
      clearDevSession()
      setStatus('unauthenticated')
    }
  }, [clearDevSession])

  const refresh = useCallback(async () => {
    if (devSession) {
      return
    }
    setStatus('loading')
    try {
      const response = await withRetry(fetchSession, { retries: 1, baseDelayMs: 500 })
      applySupabaseSession(response)
    } catch (error) {
      console.warn('Failed to refresh session', error)
      applySupabaseSession(null)
    }
  }, [applySupabaseSession, devSession])

  const setActiveOrg = useCallback(async (orgId: string | null) => {
    if (devSession) {
      const updated: SessionResponse = {
        ...devSession,
        activeOrgId: orgId ?? null
      }
      setDevAuth(updated)
      return
    }
    if (!userId) return
    const { error } = await supabase.from('profiles').update({ active_org_id: orgId }).eq('id', userId)
    if (error) {
      console.error('Failed to update active org', error)
      throw error
    }
    await refresh()
  }, [devSession, userId, refresh, setDevAuth])

  const signIn = useCallback(async (email: string, password: string, options?: { allowDevFallback?: boolean }) => {
    const allowDevFallback = options?.allowDevFallback ?? true
    setStatus('loading')

    const fallback = () => {
      if (import.meta.env.DEV && allowDevFallback) {
        const session = buildDevSession(email)
        setDevAuth(session)
      } else {
        setStatus('unauthenticated')
      }
    }

    clearDevSession()

    const authOperation = () => supabase.auth.signInWithPassword({ email, password })
    const authPromise = withRetry(authOperation, { retries: 1, baseDelayMs: 600 })
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('supabase_signin_timeout')), SIGN_IN_TIMEOUT_MS)
    })

    let authResponse: Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>
    try {
      authResponse = await Promise.race([authPromise, timeoutPromise])
    } catch (error) {
      console.warn('Supabase sign-in failed', error)
      fallback()
      return
    }

    if (authResponse.error) {
      console.error('Supabase sign-in error', authResponse.error)
      throw authResponse.error
    }

    setDevAuth(null)
    try {
      await refresh()
    } catch (error) {
      console.warn('Post sign-in refresh failed', error)
    }
  }, [refresh, setDevAuth, clearDevSession])

  const signOut = useCallback(async () => {
    if (devSession) {
      setDevAuth(null)
      return
    }
    await supabase.auth.signOut()
    applySupabaseSession(null)
  }, [devSession, setDevAuth, applySupabaseSession])

  const setUser = useCallback((value: SessionResponse | null) => {
    if (value && import.meta.env.DEV && value.user.id.startsWith('dev-')) {
      setDevAuth(value)
    } else {
      clearDevSession()
      applySupabaseSession(value)
    }
  }, [applySupabaseSession, clearDevSession, setDevAuth])

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    const initialise = async () => {
      listenerRef.current?.subscription?.unsubscribe()

      if (import.meta.env.DEV) {
        const cachedDev = readDevAuth()
        if (cachedDev) {
          setDevSession((prev) => prev ?? cachedDev)
          setStatus('authenticated')
          return
        }
      }

      try {
        const response = await fetchSession()
        applySupabaseSession(response)
      } catch (error) {
        console.warn('Initial session fetch failed', error)
        applySupabaseSession(null)
      }

      listenerRef.current = supabase.auth.onAuthStateChange((event) => {
        if (devSession) {
          return
        }
        if (event === 'SIGNED_OUT') {
          applySupabaseSession(null)
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          void refresh()
        }
      })
      unsubscribe = () => listenerRef.current?.subscription?.unsubscribe()
    }

    void initialise()

    return () => {
      unsubscribe?.()
    }
  }, [applySupabaseSession, devSession, refresh])

  const contextValue: AuthContextValue = useMemo(() => ({
    loading: status === 'loading',
    status,
    session: effectiveSession ?? null,
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
    setUser
  }), [
    activeMembership,
    activeOrgId,
    effectiveSession,
    isBroker,
    memberships,
    policies,
    refresh,
    setActiveOrg,
    signIn,
    signOut,
    setUser,
    status,
    user,
    userId
  ])

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}
