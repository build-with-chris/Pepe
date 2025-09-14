import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [userType, setUserType] = useState<'client' | 'artist'>('client')
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Demo login credentials for different user types
      const credentials = {
        // Admin access
        'admin@pepe-shows.com': { password: 'demo123', role: 'admin', userType: 'client' },
        // Artist accounts
        'artist@pepe-shows.com': { password: 'artist123', role: 'artist', userType: 'artist' },
        'performer@pepe-shows.com': { password: 'perform123', role: 'artist', userType: 'artist' },
        // Client accounts  
        'client@pepe-shows.com': { password: 'client123', role: 'user', userType: 'client' }
      }

      const userCredential = credentials[formData.email as keyof typeof credentials]
      
      if (userCredential && formData.password === userCredential.password) {
        // Check if user type matches selected type
        if (userCredential.userType !== userType) {
          setError(`This email is registered as ${userCredential.userType === 'artist' ? 'an artist' : 'a client'}. Please select the correct account type.`)
          return
        }
        
        localStorage.setItem('pepe-auth', JSON.stringify({
          email: formData.email,
          role: userCredential.role,
          userType: userCredential.userType,
          loginTime: new Date().toISOString()
        }))
        
        // Navigate based on role and user type
        if (userCredential.role === 'admin') {
          navigate('/dashboard')
        } else if (userCredential.role === 'artist') {
          navigate('/dashboard') // Artists get their own dashboard view
        } else {
          navigate('/dashboard') // Clients get standard dashboard
        }
      } else if (formData.email.includes('@') && formData.password.length >= 6) {
        // Generic login for development
        localStorage.setItem('pepe-auth', JSON.stringify({
          email: formData.email,
          role: userType === 'artist' ? 'artist' : 'user',
          userType: userType,
          loginTime: new Date().toISOString()
        }))
        navigate('/dashboard')
      } else {
        setError('Invalid credentials. Try demo accounts or any valid email with 6+ character password.')
      }
    } catch (err) {
      setError('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-pepe-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-block">
            <img 
              src="/src/assets/Logos/icon_pepe.svg" 
              alt="Pepe Shows" 
              className="mx-auto h-16 w-auto"
            />
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-pepe-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-pepe-t64">
            Or{' '}
            <Link to="/register" className="font-medium text-pepe-gold hover:text-pepe-gold-bright">
              create a new account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* User Type Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-pepe-white mb-3">
              Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUserType('client')}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  userType === 'client'
                    ? 'bg-pepe-gold text-pepe-ink'
                    : 'bg-pepe-surface text-pepe-white border border-pepe-line hover:bg-pepe-line'
                }`}
              >
                🎭 Client Login
              </button>
              <button
                type="button"
                onClick={() => setUserType('artist')}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  userType === 'artist'
                    ? 'bg-pepe-gold text-pepe-ink'
                    : 'bg-pepe-surface text-pepe-white border border-pepe-line hover:bg-pepe-line'
                }`}
              >
                🎪 Artist Login
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input"
                placeholder={userType === 'artist' ? 'Artist email address' : 'Client email address'}
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="input"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-pepe-gold hover:text-pepe-gold-bright">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-lg w-full"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center text-xs text-pepe-t64 space-y-2">
            <p className="font-medium">Demo Credentials:</p>
            {userType === 'client' ? (
              <div className="space-y-1">
                <p>Admin: admin@pepe-shows.com / demo123</p>
                <p>Client: client@pepe-shows.com / client123</p>
              </div>
            ) : (
              <div className="space-y-1">
                <p>Artist: artist@pepe-shows.com / artist123</p>
                <p>Performer: performer@pepe-shows.com / perform123</p>
              </div>
            )}
          </div>
        </form>
      </div>
    </main>
  )
}