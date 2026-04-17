import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { profilesAPI } from '../services/api'

const RELATIONS = [
  { value: 'self', label: 'Self' },
  { value: 'friend', label: 'Friend' },
  { value: 'brother', label: 'Brother' },
  { value: 'sister', label: 'Sister' },
  { value: 'mother', label: 'Mother' },
  { value: 'father', label: 'Father' },
  { value: 'colleague', label: 'Colleague' },
  { value: 'partner', label: 'Partner' },
  { value: 'custom', label: 'Other' },
]

export default function CreateProfile() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '', full_name: '', nickname: '',
    relation: 'custom', bio: '', is_self_profile: false, is_public: false,
  })
  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    setAvatar(file)
    if (file) setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([k, v]) => formData.append(k, v))
      if (avatar) formData.append('avatar', avatar)
      const res = await profilesAPI.create(formData)
      navigate(`/profiles/${res.data.id}`)
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        setError(Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`).join(', '))
      } else {
        setError('Failed to create profile.')
      }
    } finally {
      setLoading(false)
    }
  }

  const f = (field, val) => setForm({ ...form, [field]: val })

  return (
    <div className="max-w-lg mx-auto space-y-5 px-0 sm:px-0">
      <h1 className="text-xl sm:text-2xl font-bold">Create Profile</h1>
      <div className="card">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold overflow-hidden flex-shrink-0">
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                form.full_name[0]?.toUpperCase() || '?'
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Avatar (optional)</label>
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="text-sm text-gray-600" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
              <input className="input-field" value={form.username} onChange={(e) => f('username', e.target.value)} placeholder="john_doe" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input className="input-field" value={form.full_name} onChange={(e) => f('full_name', e.target.value)} placeholder="John Doe" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nickname</label>
              <input className="input-field" value={form.nickname} onChange={(e) => f('nickname', e.target.value)} placeholder="Johnny" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Relation *</label>
              <select className="input-field" value={form.relation} onChange={(e) => f('relation', e.target.value)}>
                {RELATIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea className="input-field resize-none" rows={2} value={form.bio} onChange={(e) => f('bio', e.target.value)} placeholder="Short description..." />
          </div>

          <div className="flex gap-5">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_self_profile} onChange={(e) => f('is_self_profile', e.target.checked)} className="rounded text-blue-600 w-4 h-4" />
              This is me
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_public} onChange={(e) => f('is_public', e.target.checked)} className="rounded text-blue-600 w-4 h-4" />
              Public profile
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1 py-2.5">
              {loading ? 'Creating...' : 'Create Profile'}
            </button>
            <button type="button" onClick={() => navigate('/profiles')} className="btn-secondary px-5">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
