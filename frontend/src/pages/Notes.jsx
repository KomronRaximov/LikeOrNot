import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { notesAPI } from '../services/api'

export default function Notes() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', body: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    notesAPI.list().then((res) => {
      setNotes(res.data.results || res.data)
    }).finally(() => setLoading(false))
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setError('')
    setSaving(true)
    try {
      const res = await notesAPI.create(form)
      setNotes([res.data, ...notes])
      setForm({ title: '', body: '' })
      setShowForm(false)
    } catch {
      setError('Saqlashda xatolik yuz berdi.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Ushbu noteni o\'chirmoqchimisiz?')) return
    await notesAPI.delete(id)
    setNotes(notes.filter((n) => n.id !== id))
  }

  const formatDate = (str) => {
    const d = new Date(str)
    return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold">Notes</h1>
        <button onClick={() => { setShowForm(!showForm); setError('') }} className="btn-primary text-sm">
          {showForm ? 'Bekor qilish' : '+ Yangi note'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          {error && <div className="mb-3 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
          <form onSubmit={handleCreate} className="space-y-3">
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
                rows={4}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="Note matni..."
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5">
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setError('') }} className="btn-secondary px-5">
                Bekor
              </button>
            </div>
          </form>
        </div>
      )}

      {notes.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-gray-500 font-medium mb-1">Hali note yo'q</p>
          <p className="text-gray-400 text-sm mb-5">Birinchi noteni qo'shing</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">Note qo'shish</button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {notes.map((note) => (
            <div key={note.id} className="card hover:shadow-md transition-shadow flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-gray-900 leading-snug">{note.title}</h3>
                <div className="flex gap-2 flex-shrink-0">
                  <Link to={`/notes/${note.id}/edit`} className="text-xs text-blue-500 hover:text-blue-700">
                    Tahrir
                  </Link>
                  <button onClick={() => handleDelete(note.id)} className="text-xs text-red-400 hover:text-red-600">
                    O'chirish
                  </button>
                </div>
              </div>
              {note.body && (
                <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-4">{note.body}</p>
              )}
              <p className="text-xs text-gray-400 mt-auto pt-1">{formatDate(note.updated_at)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
