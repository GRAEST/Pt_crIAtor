import { useState } from 'react'
import { X, Info, AlertTriangle, CheckCircle } from 'lucide-react'
import { announcements } from '../../data/announcements'

const typeConfig = {
  info: {
    icon: Info,
    bg: 'bg-blue-50/80 backdrop-blur-sm',
    border: 'border-blue-200/60',
    text: 'text-blue-800',
    iconColor: 'text-blue-500',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50/80 backdrop-blur-sm',
    border: 'border-amber-200/60',
    text: 'text-amber-800',
    iconColor: 'text-amber-500',
  },
  success: {
    icon: CheckCircle,
    bg: 'bg-green-50/80 backdrop-blur-sm',
    border: 'border-green-200/60',
    text: 'text-green-800',
    iconColor: 'text-green-500',
  },
}

export function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const active = announcements.filter((a) => a.active && !dismissed.has(a.id))
  if (active.length === 0) return null

  return (
    <section id="avisos" className="py-8 px-4 max-w-4xl mx-auto space-y-3">
      {active.map((a) => {
        const config = typeConfig[a.type]
        const Icon = config.icon
        return (
          <div
            key={a.id}
            className={`flex items-start gap-3 p-4 rounded-xl border ${config.bg} ${config.border} shadow-sm`}
          >
            <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${config.iconColor}`} />
            <p className={`text-sm flex-1 leading-relaxed ${config.text}`}>{a.message}</p>
            <button
              onClick={() => setDismissed((prev) => new Set(prev).add(a.id))}
              className={`shrink-0 p-1.5 rounded-lg hover:bg-black/5 transition-colors ${config.text}`}
              aria-label="Fechar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </section>
  )
}
