import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { notesAPI } from '../services/api'

export default function EditNote() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ profile: '', title: '', body: '' })
  const [fetching, setFetching] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    notesAPI.get(id).then((res) => {
      setForm({ profile: res.data.profile || '', title: res.data.title, body: res.data.body || '' })
    }).catch(() => navigate('/notes'))
    .finally(() => setFetching(false))
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setError('')
    setSaving(true)
    try {
      await notesAPI.update(id, form)
      navigate(form.profile ? `/profiles/${form.profile}` : '/notes')
    } catch {
      setError('Saqlashda xatolik yuz berdi.')
    } finally {
      setSaving(false)
    }
  }

  if (fetching) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  )

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <h1 className="text-xl sm:text-2xl font-bold">Noteni tahrirlash</h1>
      <div className="card">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sarlavha *</label>
            <input
              className="input-field"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Note sarlavhasi..."
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Matn</label>
            <textarea
              className="input-field resize-none"
              rows={8}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Note matni..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5">
              {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
            <button type="button" onClick={() => navigate('/notes')} className="btn-secondary px-5">
              Bekor
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
