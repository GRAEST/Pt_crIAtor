import type { Tool } from '../types'

export const tools: Tool[] = [
  {
    id: 'gitlab',
    name: 'GitLab',
    description: 'Repositórios de código, pipelines CI/CD e code reviews.',
    url: 'https://gitlab.grauea.com.br/',
    icon: 'GitBranch',
    role: 'developer',
  },
  {
    id: 'monday',
    name: 'Monday',
    description: 'Gestão de tarefas, sprints e acompanhamento de projetos de desenvolvimento.',
    url: 'https://graest.monday.com',
    icon: 'Calendar',
    role: 'developer',
  },
  {
    id: 'monday-manager',
    name: 'Monday',
    description: 'Planejamento de projetos, cronogramas e acompanhamento de entregas para gestores.',
    url: 'https://graest.monday.com',
    icon: 'Calendar',
    role: 'manager',
  },
  {
    id: 'hr-manager',
    name: 'HR Manager',
    description: 'Gestão de recursos humanos, férias e registros de pessoal.',
    url: 'https://rh-manager.grauea.com.br',
    icon: 'Users',
    role: 'manager',
  },
  {
    id: 'project-manager',
    name: 'Project Manager',
    description: 'Acompanhamento de milestones, tarefas e progresso dos projetos.',
    url: 'https://project-manager.grauea.com.br',
    icon: 'KanbanSquare',
    role: 'manager',
  },
  {
    id: 'work-plan',
    name: 'Plano de Trabalho',
    description: 'Criação e gestão de planos de trabalho para projetos de pesquisa.',
    url: '#',
    icon: 'FileSpreadsheet',
    role: 'manager',
    disabled: true,
  },
]

export const developerTools = tools.filter((t) => t.role === 'developer')
export const managerTools = tools.filter((t) => t.role === 'manager')
