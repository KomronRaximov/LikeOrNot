import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { statsAPI, profilesAPI } from '../services/api'

export default function Stats() {
  const [overview, setOverview] = useState(null)
  const [profiles, setProfiles] = useState([])
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [profileStats, setProfileStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([statsAPI.overview(), profilesAPI.list()]).then(([s, p]) => {
      setOverview(s.data)
      const list = p.data.results || p.data
      setProfiles(list)
      if (list.length > 0) {
        loadProfileStats(list[0].id)
        setSelectedProfile(list[0].id)
      }
    }).finally(() => setLoading(false))
  }, [])

  const loadProfileStats = (id) => {
    setProfileStats(null)
    statsAPI.profile(id).then((res) => setProfileStats(res.data))
  }

  const handleProfileChange = (id) => {
    setSelectedProfile(Number(id))
    loadProfileStats(id)
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  )

  return (
    <div className="space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold">Statistics</h1>

      {/* Overview */}
      {overview && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Profiles', value: overview.total_profiles, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
            { label: 'Preferences', value: overview.total_preferences, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
            { label: 'Likes', value: overview.total_likes, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
            { label: 'Dislikes', value: overview.total_dislikes, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border ${s.bg} ${s.border} p-4 text-center`}>
              <div className={`text-2xl sm:text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Profile breakdown */}
      {profiles.length > 0 && (
        <div className="card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h2 className="text-base sm:text-lg font-semibold flex-shrink-0">Profile Breakdown</h2>
            <select
              className="input-field sm:max-w-xs"
              value={selectedProfile || ''}
              onChange={(e) => handleProfileChange(e.target.value)}
            >
              {profiles.map((p) => <option key={p.id} value={p.id}>{p.full_name} (@{p.username})</option>)}
            </select>
          </div>

          {profileStats ? (
            <div className="space-y-5">
              {/* Sentiment breakdown */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">{profileStats.likes}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Likes</div>
                </div>
                <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                  <div className="text-xl sm:text-2xl font-bold text-red-600">{profileStats.dislikes}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Dislikes</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                  <div className="text-xl sm:text-2xl font-bold text-gray-600">{profileStats.neutral}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Neutral</div>
                </div>
              </div>

              {profileStats.avg_level && (
                <p className="text-sm text-gray-500">
                  Average intensity: <strong className="text-blue-600">{Number(profileStats.avg_level).toFixed(1)}/5</strong>
                </p>
              )}

              {/* By category */}
              {profileStats.by_category?.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-3 text-sm">By Category</h3>
                  <div className="space-y-2">
                    {profileStats.by_category.map((cat) => (
                      <div key={cat.category__name || 'none'} className="flex items-center gap-3">
                        <span className="text-xs w-28 truncate text-gray-600 flex-shrink-0">
                          {cat.category__icon} {cat.category__name || 'Uncategorized'}
                        </span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2 min-w-0">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${Math.round((cat.count / profileStats.total) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-5 text-right flex-shrink-0">{cat.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top liked/disliked */}
              <div className="grid sm:grid-cols-2 gap-4">
                {profileStats.top_liked?.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2 text-sm">Top Liked</h3>
                    <ul className="space-y-1.5">
                      {profileStats.top_liked.map((p) => (
                        <li key={p.id} className="flex items-center gap-2 text-sm">
                          <span>👍</span>
                          <span className="truncate flex-1 text-gray-700">{p.title}</span>
                          <span className="text-xs text-gray-400 flex-shrink-0">{p.level}/5</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {profileStats.top_disliked?.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2 text-sm">Top Disliked</h3>
                    <ul className="space-y-1.5">
                      {profileStats.top_disliked.map((p) => (
                        <li key={p.id} className="flex items-center gap-2 text-sm">
                          <span>👎</span>
                          <span className="truncate flex-1 text-gray-700">{p.title}</span>
                          <span className="text-xs text-gray-400 flex-shrink-0">{p.level}/5</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
          )}
        </div>
      )}

      {profiles.length === 0 && (
        <div className="card text-center py-12 text-gray-400">
          <p>No profiles yet. <Link to="/profiles/create" className="text-blue-600 hover:underline">Create one</Link> to see stats.</p>
        </div>
      )}
    </div>
  )
}
