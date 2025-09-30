/**
 * Direct admin setup - Simple console commands that work immediately
 */

// Direct admin setup function that works immediately
export const directAdminSetup = () => {
  // Check if we're in a browser environment
  if (typeof globalThis === 'undefined') return
  if (typeof globalThis.localStorage === 'undefined') return

  // Set emergency admin privileges directly
  const setDirectAdmin = (email: string) => {
    try {
      globalThis.localStorage.setItem('hatch_emergency_admin', email)
      globalThis.localStorage.setItem('hatch_admin_timestamp', Date.now().toString())
      globalThis.localStorage.setItem('hatch_force_admin', 'true')
      console.log('✅ Direct admin privileges granted to:', email)
      return true
    } catch (error) {
      console.error('❌ Failed to set admin:', error)
      return false
    }
  }

  // Make functions globally available immediately
  try {
    globalThis.setDirectAdmin = setDirectAdmin
    globalThis.makeAdmin = (email: string) => {
      console.log('🚨 Making admin for:', email)
      const success = setDirectAdmin(email)
      if (success) {
        console.log('✅ Admin privileges granted! Reloading page...')
        setTimeout(() => globalThis.location.reload(), 1000)
      }
      return success
    }

    globalThis.forceAdmin = (email: string) => {
      console.log('💥 FORCE ADMIN for:', email)
      setDirectAdmin(email)
      console.log('💥 Reloading page...')
      globalThis.location.reload()
    }

    console.log('🔧 Direct admin functions loaded!')
    console.log('Available commands:')
    console.log('  makeAdmin("apexsquad7@gmail.com")')
    console.log('  forceAdmin("apexsquad7@gmail.com")')
  } catch (error) {
    console.error('❌ Failed to setup global functions:', error)
  }
}

// Execute immediately when module loads
directAdminSetup()