import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { profilesAPI } from '../services/api'
import ProfileCard from '../components/ProfileCard'

export default function Profiles() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    profilesAPI.list().then((res) => {
      setProfiles(res.data.results || res.data)
    }).finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this profile? All preferences will be removed.')) return
    await profilesAPI.delete(id)
    setProfiles(profiles.filter((p) => p.id !== id))
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold">Profiles</h1>
        <div className="flex gap-2">
          <Link to="/profiles/search" className="btn-secondary text-sm">🔍 Search</Link>
          <Link to="/profiles/create" className="btn-primary text-sm">+ New Profile</Link>
        </div>
      </div>

      {profiles.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">👥</div>
          <p className="text-gray-500 font-medium mb-1">No profiles yet</p>
          <p className="text-gray-400 text-sm mb-5">Add people whose preferences you want to track</p>
          <Link to="/profiles/create" className="btn-primary">Create First Profile</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {profiles.map((p) => (
            <ProfileCard key={p.id} profile={p} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
