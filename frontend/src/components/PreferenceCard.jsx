import { Link } from 'react-router-dom'

const SENTIMENT_CONFIG = {
  like: { label: 'Like', bg: 'bg-green-100', text: 'text-green-700', emoji: '👍' },
  dislike: { label: 'Dislike', bg: 'bg-red-100', text: 'text-red-700', emoji: '👎' },
  neutral: { label: 'Neutral', bg: 'bg-gray-100', text: 'text-gray-600', emoji: '😐' },
}

function LevelDots({ level, sentiment }) {
  const color = sentiment === 'like' ? 'bg-green-500' : sentiment === 'dislike' ? 'bg-red-500' : 'bg-gray-400'
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`w-2 h-2 rounded-full ${i <= level ? color : 'bg-gray-200'}`} />
      ))}
    </div>
  )
}

export default function PreferenceCard({ pref, onDelete }) {
  const cfg = SENTIMENT_CONFIG[pref.sentiment] || SENTIMENT_CONFIG.neutral
  return (
    <div className="card flex gap-3">
      <div className="flex-shrink-0">
        <img
          src={pref.image_url || '/media/defaults/preference-default.png'}
          alt={pref.title}
          className="w-12 h-12 rounded-lg object-cover bg-gray-100"
          onError={(e) => {
            e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' fill='%23f3f4f6' rx='8'/%3E%3Ctext x='24' y='32' text-anchor='middle' font-size='22'%3E${encodeURIComponent(pref.category_icon || '📌')}%3C/text%3E%3C/svg%3E`
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="min-w-0">
            <h4 className="font-medium text-gray-900 truncate">{pref.title}</h4>
            {pref.category_name && (
              <span className="text-xs text-gray-500">{pref.category_icon} {pref.category_name}</span>
            )}
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text} whitespace-nowrap`}>
            {cfg.emoji} {cfg.label}
          </span>
        </div>
        <div className="mt-1.5 flex items-center gap-3">
          <LevelDots level={pref.level} sentiment={pref.sentiment} />
          <span className="text-xs text-gray-400">{pref.level}/5</span>
        </div>
        {pref.note && <p className="mt-1 text-xs text-gray-500 line-clamp-1">{pref.note}</p>}
        <div className="mt-2 flex gap-3">
          <Link to={`/preferences/${pref.id}/edit`} className="text-xs text-blue-600 hover:underline">Edit</Link>
          {onDelete && (
            <button onClick={() => onDelete(pref.id)} className="text-xs text-red-500 hover:underline">Delete</button>
          )}
        </div>
      </div>
    </div>
  )
}
