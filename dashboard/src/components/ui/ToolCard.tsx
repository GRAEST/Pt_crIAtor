import { GitBranch, Users, KanbanSquare, FileSpreadsheet, Calendar, Clock, ArrowUpRight } from 'lucide-react'
import type { ComponentType } from 'react'
import type { Tool } from '../../types'

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  GitBranch,
  Calendar,
  Users,
  KanbanSquare,
  FileSpreadsheet,
}

interface ToolCardProps {
  tool: Tool
  accentColor?: 'primary' | 'accent'
}

export function ToolCard({ tool, accentColor = 'primary' }: ToolCardProps) {
  const IconComponent = iconMap[tool.icon]

  const iconBoxClass = {
    primary: 'icon-box-primary',
    accent: 'icon-box-accent',
  }
  const iconColor = {
    primary: 'text-primary-600',
    accent: 'text-accent-500',
  }
  const arrowHover = {
    primary: 'group-hover:text-primary-600',
    accent: 'group-hover:text-accent-500',
  }

  if (tool.disabled) {
    return (
      <div className="relative p-5 bg-gray-50 border border-gray-200 rounded-xl cursor-not-allowed">
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 bg-gray-100 text-gray-400 text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200 font-mono">
          <Clock className="w-3 h-3" />
          Em breve
        </div>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-gray-100 border border-gray-200">
          {IconComponent && (
            <IconComponent className="w-5 h-5 text-gray-400" />
          )}
        </div>
        <h3 className="text-sm font-semibold text-gray-400 mb-1.5">
          {tool.name}
        </h3>
        <p className="text-xs text-gray-400 leading-relaxed">
          {tool.description}
        </p>
      </div>
    )
  }

  return (
    <a
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative block p-5 tech-card ${accentColor === 'accent' ? 'tech-card-accent' : ''}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBoxClass[accentColor]} transition-transform duration-300 group-hover:scale-110`}>
          {IconComponent && (
            <IconComponent className={`w-5 h-5 ${iconColor[accentColor]}`} />
          )}
        </div>
        <ArrowUpRight className={`w-4 h-4 text-gray-300 transition-colors duration-300 ${arrowHover[accentColor]}`} />
      </div>

      <h3 className="text-sm font-semibold text-gray-900 mb-1.5">
        {tool.name}
      </h3>
      <p className="text-xs text-gray-500 leading-relaxed">
        {tool.description}
      </p>
    </a>
  )
}
