import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    setMenuOpen(false)
  }

  const isActive = (path) =>
    pathname === path
      ? 'text-blue-600 font-semibold'
      : 'text-gray-600 hover:text-blue-600'

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/profiles', label: 'Profiles' },
    { to: '/stats', label: 'Stats' },
    { to: '/profiles/search', label: 'Search' },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="h-14 flex items-center justify-between">
          <Link to="/dashboard" className="text-xl font-bold text-blue-600">
            LikeOrNot
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-5 text-sm">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} className={isActive(l.to)}>{l.label}</Link>
            ))}
            <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-200">
              <span className="text-gray-500 text-xs">@{user?.username}</span>
              <button onClick={handleLogout} className="btn-secondary text-xs py-1.5 px-3">
                Logout
              </button>
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm ${isActive(l.to)}`}
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100 mt-2 flex items-center justify-between px-3">
              <span className="text-gray-500 text-xs">@{user?.username}</span>
              <button onClick={handleLogout} className="btn-secondary text-xs py-1.5 px-3">
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
