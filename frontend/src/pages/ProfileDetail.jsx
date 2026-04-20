import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { profilesAPI, preferencesAPI, notesAPI } from '../services/api'
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
  const [notes, setNotes] = useState([])
  const [tab, setTab] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [noteForm, setNoteForm] = useState({ title: '', body: '' })
  const [noteSaving, setNoteSaving] = useState(false)
  const [noteError, setNoteError] = useState('')

  useEffect(() => {
    Promise.all([
      profilesAPI.get(id),
      preferencesAPI.list({ profile: id }),
      notesAPI.list({ profile: id }),
    ]).then(([p, pr, n]) => {
      setProfile(p.data)
      setPrefs(pr.data.results || pr.data)
      setNotes(n.data.results || n.data)
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

  const handleDeleteProfile = async () => {
    if (!confirm('Delete this profile? All preferences will be removed.')) return
    await profilesAPI.delete(id)
    navigate('/profiles')
  }

  const handleCreateNote = async (e) => {
    e.preventDefault()
    if (!noteForm.title.trim()) return
    setNoteError('')
    setNoteSaving(true)
    try {
      const res = await notesAPI.create({ ...noteForm, profile: id })
      setNotes([res.data, ...notes])
      setNoteForm({ title: '', body: '' })
      setShowNoteForm(false)
    } catch {
      setNoteError('Note saqlashda xatolik yuz berdi.')
    } finally {
      setNoteSaving(false)
    }
  }

  const handleDeleteNote = async (noteId) => {
    if (!confirm('Ushbu noteni o\'chirmoqchimisiz?')) return
    await notesAPI.delete(noteId)
    setNotes(notes.filter((note) => note.id !== noteId))
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
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-bold">{profile.full_name}</h1>
                  {profile.is_self_profile && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Me</span>
                  )}
                  {profile.is_public && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Public</span>
                  )}
                </div>
                <p className="text-gray-500 text-sm">@{profile.username}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Link to={`/profiles/${id}/edit`} className="btn-secondary text-xs py-1.5 px-3">
                  Edit
                </Link>
                <button onClick={() => navigate('/profiles')} className="btn-secondary text-xs py-1.5 px-3">
                  ← Back
                </button>
              </div>
            </div>
            {profile.bio && <p className="text-gray-600 text-sm mt-1">{profile.bio}</p>}
            <div className="flex gap-3 mt-2 text-xs sm:text-sm text-gray-500 flex-wrap">
              <span>👍 {profile.like_count} likes</span>
              <span>👎 {profile.dislike_count} dislikes</span>
              <span>📋 {profile.preference_count} total</span>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <Link to={`/preferences/create?profile=${id}`} className="btn-primary text-sm">
            + Add Preference
          </Link>
          <button onClick={handleDeleteProfile} className="text-sm text-red-500 hover:text-red-700">
            Delete Profile
          </button>
        </div>
      </div>

      {/* Profile Notes */}
      <div className="card">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-semibold text-gray-900">Profile notes</h2>
            <p className="text-xs text-gray-400">Shu odam haqida qo'shimcha ma'lumotlar</p>
          </div>
          <button
            onClick={() => { setShowNoteForm(!showNoteForm); setNoteError('') }}
            className="btn-secondary text-xs py-1.5 px-3"
          >
            {showNoteForm ? 'Bekor qilish' : '+ Note'}
          </button>
        </div>

        {showNoteForm && (
          <form onSubmit={handleCreateNote} className="space-y-3 mb-4 p-3 bg-gray-50 rounded-xl">
            {noteError && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{noteError}</div>}
            <input
              className="input-field"
              value={noteForm.title}
              onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
              placeholder="Masalan: Sevimli kafesi"
              required
            />
            <textarea
              className="input-field resize-none"
              rows={3}
              value={noteForm.body}
              onChange={(e) => setNoteForm({ ...noteForm, body: e.target.value })}
              placeholder="Batafsil ma'lumot..."
            />
            <button type="submit" disabled={noteSaving} className="btn-primary w-full py-2">
              {noteSaving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </form>
        )}

        {notes.length === 0 ? (
          <p className="text-sm text-gray-400">Bu profile uchun hali note yo'q.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {notes.map((note) => (
              <div key={note.id} className="rounded-xl border border-gray-100 p-3 bg-white">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-gray-900 text-sm">{note.title}</h3>
                  <div className="flex gap-2 flex-shrink-0">
                    <Link to={`/notes/${note.id}/edit`} className="text-xs text-blue-500 hover:text-blue-700">
                      Tahrir
                    </Link>
                    <button onClick={() => handleDeleteNote(note.id)} className="text-xs text-red-400 hover:text-red-600">
                      O'chirish
                    </button>
                  </div>
                </div>
                {note.body && <p className="text-sm text-gray-600 whitespace-pre-wrap mt-1">{note.body}</p>}
                <p className="text-xs text-gray-400 mt-2">{formatDate(note.updated_at)}</p>
              </div>
            ))}
          </div>
        )}
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
