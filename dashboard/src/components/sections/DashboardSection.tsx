import { Code, Briefcase } from 'lucide-react'
import type { Tool } from '../../types'
import { ToolCard } from '../ui/ToolCard'
import logo from '../../assets/Imagem9.png'

interface DashboardSectionProps {
  developerTools: Tool[]
  managerTools: Tool[]
}

export function DashboardSection({ developerTools, managerTools }: DashboardSectionProps) {
  return (
    <section className="relative min-h-screen flex flex-col pt-8 pb-8 px-4 sm:px-6">
      <div className="relative z-10 max-w-5xl mx-auto w-full flex-1 flex flex-col justify-center">
        {/* Compact header */}
        <div className="flex flex-col items-center text-center mb-3 animate-fade-in-up">
          <img
            src={logo}
            alt="GRAEST"
            className="h-14 md:h-[72px] drop-shadow-sm mb-3"
          />
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            Portal de Membros
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Ferramentas de desenvolvimento e gestão do laboratório
          </p>
        </div>

        <div className="tech-divider my-5 animate-fade-in-up-delay-1" />

        {/* Developer tools */}
        <div className="mb-8 animate-fade-in-up-delay-1">
          <div className="flex items-center gap-3 mb-4">
            <Code className="w-4 h-4 text-primary-600" />
            <span className="group-label text-primary-700">Desenvolvimento</span>
            <div className="flex-1 h-px bg-primary-200" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {developerTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} accentColor="primary" />
            ))}
          </div>
        </div>

        {/* Manager tools */}
        <div className="animate-fade-in-up-delay-2">
          <div className="flex items-center gap-3 mb-4">
            <Briefcase className="w-4 h-4 text-accent-500" />
            <span className="group-label text-accent-600">Gestão</span>
            <div className="flex-1 h-px bg-accent-200" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {managerTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} accentColor="accent" />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
