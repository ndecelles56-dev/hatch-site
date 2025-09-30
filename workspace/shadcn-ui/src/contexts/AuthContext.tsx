'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  role?: 'customer' | 'broker' | 'agent' | 'admin'
  subscription?: {
    status: 'active' | 'inactive' | 'past_due'
    plan: string
  }
}

interface AuthContextType {
  user: User | null
  loading: boolean
  isBroker: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize user from localStorage or session
    const initializeAuth = async () => {
      try {
        const savedUser = localStorage.getItem('auth_user')
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser)
          setUser(parsedUser)
        } else {
          // Create a demo broker user for testing
          const demoUser: User = {
            id: 'demo_broker_1',
            email: 'broker@demo.com',
            role: 'broker',
            subscription: {
              status: 'active',
              plan: 'growth'
            }
          }
          setUser(demoUser)
          localStorage.setItem('auth_user', JSON.stringify(demoUser))
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      // Mock sign in - in real app this would call your auth service
      const mockUser: User = {
        id: Date.now().toString(),
        email,
        role: email.includes('broker') ? 'broker' : 'customer',
        subscription: {
          status: 'active',
          plan: 'growth'
        }
      }
      setUser(mockUser)
      localStorage.setItem('auth_user', JSON.stringify(mockUser))
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem('auth_user')
  }

  const isBroker = user?.role === 'broker' || user?.role === 'agent' || user?.role === 'admin'

  const value = {
    user,
    loading,
    isBroker,
    signIn,
    signOut,
    setUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}