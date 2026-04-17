import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { profilesAPI, preferencesAPI } from '../services/api'
import PreferenceCard from '../components/PreferenceCard'

const TABS = [
  { key: '', label: 'All' },
  { key: 'like', label: '👍 Likes' },
  { key: 'dislike', label: '👎 Dislikes' },
  { key: 'neutral', label: '😐 Neutral' },
]

export default function ProfileDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [prefs, setPrefs] = useState([])
  const [tab, setTab] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      profilesAPI.get(id),
      preferencesAPI.list({ profile: id }),
    ]).then(([p, pr]) => {
      setProfile(p.data)
      setPrefs(pr.data.results || pr.data)
    }).finally(() => setLoading(false))
  }, [id])

  const filtered = prefs.filter((p) => {
    const matchTab = tab === '' || p.sentiment === tab
    const matchSearch = search === '' || p.title.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  const handleDeletePref = async (prefId) => {
    if (!confirm('Delete this preference?')) return
    await preferencesAPI.delete(prefId)
    setPrefs(prefs.filter((p) => p.id !== prefId))
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  )
  if (!profile) return <div className="text-center py-20 text-gray-400">Profile not found.</div>

  return (
    <div className="space-y-4">
      {/* Profile Header */}
      <div className="card">
        <div className="flex gap-4 items-start">
          <div className="flex-shrink-0">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover" alt={profile.full_name} />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl sm:text-3xl font-bold">
                {profile.full_name[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h1 className="text-lg sm:text-xl font-bold">{profile.full_name}</h1>
                <p className="text-gray-500 text-sm">@{profile.username}</p>
              </div>
              <button
                onClick={() => navigate('/profiles')}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                ← Back
              </button>
            </div>
            {profile.bio && <p className="text-gray-600 text-sm mt-1">{profile.bio}</p>}
            <div className="flex gap-3 mt-2 text-xs sm:text-sm text-gray-500 flex-wrap">
              <span>👍 {profile.like_count} likes</span>
              <span>👎 {profile.dislike_count} dislikes</span>
              <span>📋 {profile.preference_count} total</span>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Link to={`/preferences/create?profile=${id}`} className="btn-primary text-sm w-full sm:w-auto text-center block sm:inline-block">
            + Add Preference
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === t.key ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <input
          className="input-field"
          placeholder="Search preferences..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Preferences */}
      {filtered.length === 0 ? (
        <div className="card text-center py-10 text-gray-400">
          <p className="mb-3">No preferences found.</p>
          <Link to={`/preferences/create?profile=${id}`} className="btn-primary text-sm">
            Add First Preference
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((p) => <PreferenceCard key={p.id} pref={p} onDelete={handleDeletePref} />)}
        </div>
      )}
    </div>
  )
}
