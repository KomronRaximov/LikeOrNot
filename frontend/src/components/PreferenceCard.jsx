import { Link } from 'react-router-dom'

const SENTIMENT_CONFIG = {
  like: { label: 'Like', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', emoji: '👍' },
  dislike: { label: 'Dislike', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', emoji: '👎' },
  neutral: { label: 'Neutral', bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', emoji: '😐' },
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
    <div className={`card flex gap-3 border-l-4 ${cfg.border}`}>
      <div className="flex-shrink-0">
        <img
          src={pref.image_url || '/media/defaults/preference-default.png'}
          alt={pref.title}
          className="w-14 h-14 rounded-lg object-cover bg-gray-100"
          onError={(e) => {
            e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'%3E%3Crect width='56' height='56' fill='%23f3f4f6' rx='8'/%3E%3Ctext x='28' y='38' text-anchor='middle' font-size='26'%3E${encodeURIComponent(pref.category_icon || '📌')}%3C/text%3E%3C/svg%3E`
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-gray-900 truncate flex-1">{pref.title}</h4>
          <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text} whitespace-nowrap flex-shrink-0`}>
            {cfg.emoji} {cfg.label}
          </span>
        </div>
        {pref.category_name && (
          <p className="text-xs text-gray-400 mt-0.5">{pref.category_icon} {pref.category_name}</p>
        )}
        <div className="mt-1.5 flex items-center gap-2">
          <LevelDots level={pref.level} sentiment={pref.sentiment} />
          <span className="text-xs text-gray-400">{pref.level}/5</span>
        </div>
        {pref.note && <p className="mt-1 text-xs text-gray-500 line-clamp-1">{pref.note}</p>}
        <div className="mt-2.5 flex items-center gap-2">
          <Link
            to={`/preferences/${pref.id}/edit`}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2.5 py-1 rounded-md transition-colors"
          >
            Edit
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(pref.id)}
              className="text-xs bg-red-50 hover:bg-red-100 text-red-500 px-2.5 py-1 rounded-md transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
