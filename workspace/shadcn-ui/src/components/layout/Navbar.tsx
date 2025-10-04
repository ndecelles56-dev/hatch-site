import React, { useCallback, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import {
  Building2,
  Menu,
  X,
  LogOut,
  BarChart3
} from 'lucide-react'
import { cn, resolveUserIdentity } from '@/lib/utils'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, signOut, isBroker, session } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const identity = useMemo(
    () => resolveUserIdentity(session?.profile, user?.email ?? null),
    [session?.profile, user?.email]
  )
  const fallbackLabel = user?.email ? user.email.split('@')[0] : 'Account'
  const navGreeting = identity.displayName === 'Your Account'
    ? fallbackLabel
    : identity.displayName
  const mobileAccountLabel = identity.displayName === 'Your Account'
    ? fallbackLabel
    : identity.displayName
  const isAuthenticated = Boolean(user)
  const navigation = useMemo(() => {
    const items = [
      { name: 'Home', href: '/' },
      { name: 'Properties', href: '/properties' },
    ]

    if (isBroker) {
      items.push({ name: 'Broker Dashboard', href: '/broker/dashboard' })
    }

    return items
  }, [isBroker])

  const handleSignOut = useCallback(async () => {
    await signOut()
    setIsOpen(false)
    navigate('/')
  }, [navigate, signOut])

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const isPropertiesPage = location.pathname === '/properties'

  const desktopNavClasses = useMemo(
    () =>
      cn(
        'hidden md:flex items-center space-x-8',
        isPropertiesPage && 'md:flex-1 md:justify-start md:pr-16'
      ),
    [isPropertiesPage]
  )

  const logoWrapperClasses = useMemo(
    () => cn('flex items-center', isPropertiesPage && 'md:absolute md:left-1/2 md:-translate-x-1/2'),
    [isPropertiesPage]
  )

  const desktopUserClasses = useMemo(
    () =>
      cn(
        'hidden md:flex items-center space-x-4',
        isPropertiesPage && 'md:flex-1 md:justify-end md:pl-16'
      ),
    [isPropertiesPage]
  )

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          {/* Logo */}
          <div className={logoWrapperClasses}>
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Hatch</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className={desktopNavClasses}>
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className={desktopUserClasses}>
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 font-semibold flex items-center justify-center">
                    {identity.initials}
                  </div>
                  <div className="text-left leading-tight">
                    <div className="text-sm font-medium text-gray-900">{navGreeting}</div>
                    {user?.email && (
                      <div className="text-xs text-gray-500">{user.email}</div>
                    )}
                  </div>
                </div>
                {isBroker && (
                  <Link to="/broker/dashboard">
                    <Button variant="outline" size="sm">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                )}
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
                <Button size="sm" onClick={() => navigate('/register')}>
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center ml-auto">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(item.href)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {isAuthenticated ? (
              <div className="border-t pt-4 mt-4">
                <div className="px-3 py-2 text-sm text-gray-700 flex items-center space-x-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold">
                    {identity.initials}
                  </span>
                  <span>{mobileAccountLabel}</span>
                </div>
                {isBroker && (
                  <Link
                    to="/broker/dashboard"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    onClick={() => setIsOpen(false)}
                  >
                    <BarChart3 className="w-4 h-4 inline mr-2" />
                    Broker Dashboard
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                >
                  <LogOut className="w-4 h-4 inline mr-2" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="border-t pt-4 mt-4 space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    navigate('/login')
                    setIsOpen(false)
                  }}
                >
                  Sign In
                </Button>
                <Button
                  className="w-full"
                  onClick={() => {
                    navigate('/register')
                    setIsOpen(false)
                  }}
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
