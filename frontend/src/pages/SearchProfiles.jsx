import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { profilesAPI } from '../services/api'

const RELATIONS = [
  { value: 'friend', label: 'Friend' },
  { value: 'brother', label: 'Brother' },
  { value: 'sister', label: 'Sister' },
  { value: 'mother', label: 'Mother' },
  { value: 'father', label: 'Father' },
  { value: 'colleague', label: 'Colleague' },
  { value: 'partner', label: 'Partner' },
  { value: 'girlfriend', label: 'Girlfriend' },
  { value: 'boyfriend', label: 'Boyfriend' },
  { value: 'custom', label: 'Other' },
]

export default function SearchProfiles() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [relation, setRelation] = useState('custom')
  const [createForm, setCreateForm] = useState({ full_name: '', relation: 'custom' })

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!username.trim()) return
    setLoading(true)
    setResult(null)
    setShowCreateForm(false)
    setRelation('custom')
    try {
      const res = await profilesAPI.search(username.trim())
      setResult(res.data)
    } catch {
      setResult({ found: false, profile: null })
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    setAddLoading(true)
    try {
      const res = await profilesAPI.createFromUsername({
        username: username.trim(),
        full_name: result?.profile?.full_name || username.trim(),
        relation,
      })
      navigate(`/profiles/${res.data.id}`)
    } finally {
      setAddLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setAddLoading(true)
    try {
      const res = await profilesAPI.createFromUsername({
        username: username.trim(),
        full_name: createForm.full_name || username.trim(),
        relation: createForm.relation,
      })
      navigate(`/profiles/${res.data.id}`)
    } finally {
      setAddLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <h1 className="text-xl sm:text-2xl font-bold">Search Profiles</h1>

      <div className="card">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            className="input-field flex-1"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username..."
            autoFocus
          />
          <button type="submit" disabled={loading} className="btn-primary px-4 flex-shrink-0">
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : 'Search'}
          </button>
        </form>
      </div>

      {result && (
        <div className="card space-y-4">
          {result.found && result.profile ? (
            <>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold flex-shrink-0">
                  {result.profile.full_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold truncate">{result.profile.full_name}</h3>
                  <p className="text-sm text-gray-500">@{result.profile.username}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relation</label>
                <select className="input-field" value={relation} onChange={(e) => setRelation(e.target.value)}>
                  {RELATIONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <button onClick={handleAdd} disabled={addLoading} className="btn-primary w-full py-2.5">
                {addLoading ? 'Adding...' : '+ Add to My Profiles'}
              </button>
            </>
          ) : (
            <>
              <div className="text-center py-3">
                <div className="text-3xl mb-2">🔍</div>
                <p className="text-gray-600 text-sm">
                  No profile found for <strong>@{username}</strong>
                </p>
              </div>
              {!showCreateForm ? (
                <button onClick={() => setShowCreateForm(true)} className="btn-primary w-full py-2.5">
                  Create profile for @{username}
                </button>
              ) : (
                <form onSubmit={handleCreate} className="space-y-3 pt-2 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700">Create new profile</p>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Full Name *</label>
                    <input
                      className="input-field"
                      value={createForm.full_name}
                      onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Relation</label>
                    <select className="input-field" value={createForm.relation} onChange={(e) => setCreateForm({ ...createForm, relation: e.target.value })}>
                      {RELATIONS.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" disabled={addLoading} className="btn-primary flex-1 py-2.5">
                      {addLoading ? 'Creating...' : 'Create'}
                    </button>
                    <button type="button" onClick={() => setShowCreateForm(false)} className="btn-secondary px-4">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
