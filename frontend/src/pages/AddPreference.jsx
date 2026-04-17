import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { profilesAPI, categoriesAPI, preferencesAPI } from '../services/api'

export default function AddPreference() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const defaultProfileId = searchParams.get('profile') || ''

  const [profiles, setProfiles] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({
    profile: defaultProfileId,
    category: '',
    title: '',
    description: '',
    sentiment: 'like',
    level: 3,
    note: '',
  })
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    Promise.all([profilesAPI.list(), categoriesAPI.list()]).then(([p, c]) => {
      setProfiles(p.data.results || p.data)
      setCategories(c.data.results || c.data)
    })
  }, [])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    setImage(file)
    if (file) setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = { ...form }
      if (image) data.image = image
      await preferencesAPI.create(data)
      navigate(form.profile ? `/profiles/${form.profile}` : '/profiles')
    } catch (err) {
      const d = err.response?.data
      if (d && typeof d === 'object') {
        setError(Object.entries(d).map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`).join(', '))
      } else {
        setError('Failed to add preference.')
      }
    } finally {
      setLoading(false)
    }
  }

  const f = (field, val) => setForm({ ...form, [field]: val })

  const sentimentColors = {
    like: { active: 'bg-green-500 text-white border-green-500', inactive: 'bg-white text-gray-600 border-gray-300 hover:border-green-400' },
    neutral: { active: 'bg-gray-500 text-white border-gray-500', inactive: 'bg-white text-gray-600 border-gray-300 hover:border-gray-400' },
    dislike: { active: 'bg-red-500 text-white border-red-500', inactive: 'bg-white text-gray-600 border-gray-300 hover:border-red-400' },
  }

  const levelColor = form.sentiment === 'like' ? 'bg-green-500' : form.sentiment === 'dislike' ? 'bg-red-500' : 'bg-gray-400'

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <h1 className="text-xl sm:text-2xl font-bold">Add Preference</h1>
      <div className="card">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profile *</label>
            <select className="input-field" value={form.profile} onChange={(e) => f('profile', e.target.value)} required>
              <option value="">Select profile...</option>
              {profiles.map((p) => <option key={p.id} value={p.id}>{p.full_name} (@{p.username})</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select className="input-field" value={form.category} onChange={(e) => f('category', e.target.value)}>
              <option value="">No category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input className="input-field" value={form.title} onChange={(e) => f('title', e.target.value)} placeholder="e.g. Black Coffee, Marvel movies..." required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="input-field resize-none" rows={2} value={form.description} onChange={(e) => f('description', e.target.value)} placeholder="More details..." />
          </div>

          {/* Sentiment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sentiment *</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'like', label: '👍 Like' },
                { value: 'neutral', label: '😐 Neutral' },
                { value: 'dislike', label: '👎 Dislike' },
              ].map((s) => (
                <button
                  type="button"
                  key={s.value}
                  onClick={() => f('sentiment', s.value)}
                  className={`py-2.5 rounded-lg text-sm font-medium border-2 transition-all ${
                    form.sentiment === s.value
                      ? sentimentColors[s.value].active
                      : sentimentColors[s.value].inactive
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Intensity: <span className="text-blue-600 font-semibold">{form.level}/5</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((l) => (
                <button
                  type="button"
                  key={l}
                  onClick={() => f('level', l)}
                  className={`py-2.5 rounded-lg text-sm font-bold transition-all ${
                    l <= form.level ? `${levelColor} text-white` : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              {form.level === 1 ? 'Very weak' : form.level === 2 ? 'Weak' : form.level === 3 ? 'Moderate' : form.level === 4 ? 'Strong' : 'Very strong'}
            </p>
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image (optional)</label>
            {imagePreview && (
              <img src={imagePreview} alt="preview" className="w-20 h-20 rounded-lg object-cover mb-2" />
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm text-gray-600 w-full" />
            <p className="text-xs text-gray-400 mt-1">Default image used if none uploaded.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
            <textarea className="input-field resize-none" rows={2} value={form.note} onChange={(e) => f('note', e.target.value)} placeholder="Any extra notes..." />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={loading} className="btn-primary flex-1 py-2.5">
              {loading ? 'Saving...' : 'Add Preference'}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary px-5">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
