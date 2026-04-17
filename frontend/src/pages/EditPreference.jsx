import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { categoriesAPI, preferencesAPI } from '../services/api'

export default function EditPreference() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(null)
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    Promise.all([preferencesAPI.get(id), categoriesAPI.list()]).then(([p, c]) => {
      const d = p.data
      setForm({
        profile: d.profile,
        category: d.category || '',
        title: d.title,
        description: d.description,
        sentiment: d.sentiment,
        level: d.level,
        note: d.note,
      })
      setImagePreview(d.image_url || null)
      setCategories(c.data.results || c.data)
    })
  }, [id])

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
      await preferencesAPI.update(id, data)
      navigate(`/profiles/${form.profile}`)
    } catch (err) {
      const d = err.response?.data
      setError(d && typeof d === 'object'
        ? Object.entries(d).map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`).join(', ')
        : 'Update failed.')
    } finally {
      setLoading(false)
    }
  }

  const f = (field, val) => setForm({ ...form, [field]: val })

  const levelColor = form
    ? form.sentiment === 'like' ? 'bg-green-500' : form.sentiment === 'dislike' ? 'bg-red-500' : 'bg-gray-400'
    : 'bg-blue-500'

  if (!form) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  )

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <h1 className="text-xl sm:text-2xl font-bold">Edit Preference</h1>
      <div className="card">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select className="input-field" value={form.category} onChange={(e) => f('category', e.target.value)}>
              <option value="">No category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input className="input-field" value={form.title} onChange={(e) => f('title', e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="input-field resize-none" rows={2} value={form.description} onChange={(e) => f('description', e.target.value)} />
          </div>

          {/* Sentiment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sentiment</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'like', label: '👍 Like', active: 'bg-green-500 text-white border-green-500' },
                { value: 'neutral', label: '😐 Neutral', active: 'bg-gray-500 text-white border-gray-500' },
                { value: 'dislike', label: '👎 Dislike', active: 'bg-red-500 text-white border-red-500' },
              ].map((s) => (
                <button type="button" key={s.value} onClick={() => f('sentiment', s.value)}
                  className={`py-2.5 rounded-lg text-sm font-medium border-2 transition-all ${
                    form.sentiment === s.value ? s.active : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                  }`}>
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
                <button type="button" key={l} onClick={() => f('level', l)}
                  className={`py-2.5 rounded-lg text-sm font-bold transition-all ${
                    l <= form.level ? `${levelColor} text-white` : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {image ? 'New Image' : 'Current Image'}
            </label>
            {imagePreview && (
              <img src={imagePreview} alt="preview" className="w-20 h-20 rounded-lg object-cover mb-2" />
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm text-gray-600 w-full" />
            {image && (
              <button
                type="button"
                onClick={() => { setImage(null); setImagePreview(null) }}
                className="text-xs text-red-500 hover:underline mt-1"
              >
                Remove new image
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <textarea className="input-field resize-none" rows={2} value={form.note} onChange={(e) => f('note', e.target.value)} />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={loading} className="btn-primary flex-1 py-2.5">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary px-5">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
