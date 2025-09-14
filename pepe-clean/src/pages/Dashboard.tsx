import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

interface User {
  email: string
  role: string
  userType: 'client' | 'artist'
  loginTime: string
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [bookingRequests, setBookingRequests] = useState<any[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    // Check authentication
    const authData = localStorage.getItem('pepe-auth')
    if (authData) {
      setUser(JSON.parse(authData))
      
      // Load booking requests from localStorage
      const requests = []
      const lastRequest = localStorage.getItem('last-booking-request')
      const pendingRequest = localStorage.getItem('pending-booking-request')
      
      if (lastRequest) {
        requests.push(JSON.parse(lastRequest))
      }
      if (pendingRequest) {
        requests.push(JSON.parse(pendingRequest))
      }
      
      setBookingRequests(requests)
    } else {
      navigate('/login')
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('pepe-auth')
    navigate('/login')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE')
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <main className="min-h-screen bg-pepe-dark">
      {/* Header */}
      <div className="bg-pepe-ink border-b border-pepe-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <img 
                  src="/src/assets/Logos/icon_pepe.svg" 
                  alt="Pepe Shows" 
                  className="h-8 w-auto mr-3"
                />
                <span className="text-xl font-bold text-pepe-white">Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-pepe-t64">{user.email}</span>
              <button
                onClick={handleLogout}
                className="btn btn-ghost btn-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Welcome Section */}
          <div className="lg:col-span-2">
            <div className="bg-pepe-surface border border-pepe-line rounded-xl p-6">
              <h1 className="text-2xl font-bold text-pepe-white mb-4">
                Welcome back, {user.email.split('@')[0]}!
              </h1>
              <p className="text-pepe-t64 mb-2">
                Logged in since {formatDate(user.loginTime)}
              </p>
              <p className="text-pepe-gold mb-6 text-sm font-medium">
                {user.userType === 'artist' ? '🎪 Artist Account' : '🎭 Client Account'} ({user.role})
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.userType === 'artist' ? (
                  <>
                    <Link to="/galerie" className="btn btn-primary">
                      Manage Portfolio
                    </Link>
                    <Link to="/shows" className="btn btn-secondary">
                      My Shows
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/anfragen" className="btn btn-primary">
                      New Booking Request
                    </Link>
                    <Link to="/shows" className="btn btn-secondary">
                      Browse Shows
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Content based on user type */}
            <div className="mt-8">
              {user.userType === 'artist' ? (
                <>
                  <h2 className="text-xl font-semibold text-pepe-white mb-4">
                    Artist Dashboard - Performance Opportunities
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-pepe-surface border border-pepe-line rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-pepe-white mb-3">Upcoming Performances</h3>
                      <p className="text-pepe-t64 mb-4">No upcoming performances scheduled</p>
                      <Link to="/shows" className="btn btn-primary btn-sm">
                        Browse Opportunities
                      </Link>
                    </div>
                    
                    <div className="bg-pepe-surface border border-pepe-line rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-pepe-white mb-3">Portfolio Status</h3>
                      <p className="text-pepe-t64 mb-4">Keep your portfolio updated to attract more bookings</p>
                      <Link to="/galerie" className="btn btn-secondary btn-sm">
                        Update Portfolio
                      </Link>
                    </div>
                  </div>
                  
                  <div className="mt-6 bg-pepe-surface border border-pepe-line rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-pepe-white mb-3">Performance Stats</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-pepe-gold">0</div>
                        <div className="text-sm text-pepe-t64">Completed Shows</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-pepe-gold">0</div>
                        <div className="text-sm text-pepe-t64">Pending Requests</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-pepe-gold">5.0</div>
                        <div className="text-sm text-pepe-t64">Rating</div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-pepe-white mb-4">
                    Recent Booking Requests ({bookingRequests.length})
                  </h2>
                  
                  {bookingRequests.length > 0 ? (
                    <div className="space-y-4">
                      {bookingRequests.map((request, index) => (
                        <div 
                          key={index} 
                          className="bg-pepe-surface border border-pepe-line rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-pepe-white">
                              {request.eventType || 'Booking Request'}
                            </h3>
                            <span className={`px-2 py-1 rounded text-xs ${
                              request.status === 'submitted' 
                                ? 'bg-green-900/20 text-green-400' 
                                : 'bg-yellow-900/20 text-yellow-400'
                            }`}>
                              {request.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-pepe-t64">
                            <div>Event Date: {request.eventDate || 'Not specified'}</div>
                            <div>Guests: {request.guestCount || 'Not specified'}</div>
                            <div>Team Size: {request.teamSize || 'Not specified'}</div>
                            <div>Style: {request.performanceStyle || 'Not specified'}</div>
                          </div>
                          <div className="mt-2 text-xs text-pepe-t48">
                            Submitted: {formatDate(request.timestamp)}
                            {request.id && <span className="ml-2">ID: {request.id}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-pepe-surface border border-pepe-line rounded-lg p-8 text-center">
                      <p className="text-pepe-t64">No booking requests yet</p>
                      <Link to="/anfragen" className="btn btn-primary mt-4">
                        Make Your First Request
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-pepe-surface border border-pepe-line rounded-xl p-6">
              <h3 className="text-lg font-semibold text-pepe-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {user.userType === 'artist' ? (
                  <>
                    <Link to="/galerie" className="block text-pepe-gold hover:text-pepe-gold-bright">
                      My Portfolio
                    </Link>
                    <Link to="/shows" className="block text-pepe-gold hover:text-pepe-gold-bright">
                      Available Gigs
                    </Link>
                    <Link to="/kontakt" className="block text-pepe-gold hover:text-pepe-gold-bright">
                      Contact Support
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/kuenstler" className="block text-pepe-gold hover:text-pepe-gold-bright">
                      Browse Artists
                    </Link>
                    <Link to="/galerie" className="block text-pepe-gold hover:text-pepe-gold-bright">
                      View Gallery
                    </Link>
                    <Link to="/kontakt" className="block text-pepe-gold hover:text-pepe-gold-bright">
                      Contact Us
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="bg-pepe-surface border border-pepe-line rounded-xl p-6">
              <h3 className="text-lg font-semibold text-pepe-white mb-4">Account</h3>
              <div className="space-y-2 text-sm text-pepe-t64">
                <p>Type: {user.userType === 'artist' ? 'Artist' : 'Client'}</p>
                <p>Role: {user.role}</p>
                <p>Email: {user.email}</p>
                <p>Login: {formatDate(user.loginTime)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}