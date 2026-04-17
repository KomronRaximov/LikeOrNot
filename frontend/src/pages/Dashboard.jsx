import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { statsAPI, preferencesAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import PreferenceCard from '../components/PreferenceCard'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      statsAPI.overview(),
      preferencesAPI.list({ page: 1 }),
    ]).then(([s, p]) => {
      setStats(s.data)
      setRecent(p.data.results?.slice(0, 6) || p.data.slice(0, 6))
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Welcome, {user?.full_name || user?.username}!
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Your preference library overview</p>
        </div>
        <Link to="/profiles/create" className="btn-primary self-start sm:self-auto">
          + Add Profile
        </Link>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Profiles', value: stats.total_profiles, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
            { label: 'Preferences', value: stats.total_preferences, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
            { label: 'Likes', value: stats.total_likes, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
            { label: 'Dislikes', value: stats.total_dislikes, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border ${s.bg} ${s.border} p-4 text-center`}>
              <div className={`text-2xl sm:text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Recent preferences */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base sm:text-lg font-semibold">Recent Preferences</h2>
          <Link to="/profiles" className="text-sm text-blue-600 hover:underline">View all →</Link>
        </div>
        {recent.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-400 mb-3">No preferences yet</p>
            <Link to="/profiles/create" className="btn-primary text-sm">Create your first profile</Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {recent.map((p) => <PreferenceCard key={p.id} pref={p} />)}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: '/profiles', label: '👥 Profiles', desc: 'View all' },
          { to: '/profiles/create', label: '➕ New Profile', desc: 'Add someone' },
          { to: '/profiles/search', label: '🔍 Search', desc: 'Find profile' },
          { to: '/stats', label: '📊 Statistics', desc: 'View insights' },
        ].map((a) => (
          <Link key={a.to} to={a.to} className="card hover:shadow-md transition-shadow text-center py-4 cursor-pointer">
            <div className="text-sm font-medium text-gray-800">{a.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{a.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
