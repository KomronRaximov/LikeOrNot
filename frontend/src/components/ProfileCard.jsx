import { Link } from 'react-router-dom'

const RELATION_LABELS = {
  self: 'Self', friend: 'Friend', brother: 'Brother', sister: 'Sister',
  mother: 'Mother', father: 'Father', colleague: 'Colleague', partner: 'Partner',
  girlfriend: 'Girlfriend', boyfriend: 'Boyfriend', custom: 'Custom',
}

export default function ProfileCard({ profile, onDelete }) {
  return (
    <div className="card flex gap-4 hover:shadow-md transition-shadow">
      <div className="flex-shrink-0">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt={profile.full_name} className="w-14 h-14 rounded-full object-cover" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold">
            {profile.full_name[0]?.toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-semibold text-gray-900 truncate">{profile.full_name}</h3>
              {profile.is_self_profile && (
                <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">Me</span>
              )}
              {profile.is_public && (
                <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Public</span>
              )}
            </div>
            <p className="text-sm text-gray-500">@{profile.username}</p>
          </div>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
            {RELATION_LABELS[profile.relation] || profile.relation}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 flex-wrap">
          <span>👍 {profile.like_count}</span>
          <span>👎 {profile.dislike_count}</span>
          <span>📋 {profile.preference_count} total</span>
        </div>
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <Link to={`/profiles/${profile.id}`} className="btn-primary text-xs py-1.5 px-3">
            View
          </Link>
          <Link to={`/profiles/${profile.id}/edit`} className="btn-secondary text-xs py-1.5 px-3">
            Edit
          </Link>
          <Link to={`/preferences/create?profile=${profile.id}`} className="btn-secondary text-xs py-1.5 px-3">
            + Preference
          </Link>
          {onDelete && (
            <button onClick={() => onDelete(profile.id)} className="text-xs text-red-500 hover:text-red-700 ml-auto">
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
