# GRAEST - Portal de Membros

Portal de acesso centralizado para os membros do **GRAEST** (Núcleo de Robótica e Automação — Escola Superior de Tecnologia).

## Sobre

O portal serve como ponto de entrada unificado para as ferramentas utilizadas pelo laboratório, organizadas por perfil de acesso:

**Desenvolvimento**
- **GitLab** — Repositórios de código, pipelines CI/CD e code reviews
- **Monday** — Gestão de tarefas, sprints e acompanhamento de projetos

**Gestão**
- **Monday** — Planejamento de projetos, cronogramas e acompanhamento de entregas
- **HR Manager** — Gestão de recursos humanos, férias e registros de pessoal
- **Project Manager** — Acompanhamento de milestones, tarefas e progresso dos projetos
- **Plano de Trabalho** — Criação e gestão de planos de trabalho *(em breve)*

## Stack

- **React 19** + **TypeScript**
- **Vite** — Build tool
- **Tailwind CSS v4** — Estilização
- **Lucide React** — Ícones

## Instalação

```bash
# Clonar o repositório
git clone https://gitlab.grauea.com.br/graest-main/graest-main.git
cd graest-main

# Instalar dependências
npm install

# Rodar em modo de desenvolvimento
npm run dev
```

O projeto estará disponível em `http://localhost:5173`.

## Build

```bash
npm run build
```

Os arquivos de produção serão gerados na pasta `dist/`.

## Estrutura do Projeto

```
src/
├── assets/             # Logo e imagens
├── components/
│   ├── layout/         # Navbar, Footer
│   ├── sections/       # HeroSection, ToolSection, AnnouncementBanner
│   └── ui/             # ToolCard, SectionHeading, ScrollToTop
├── data/               # Dados das ferramentas e avisos
├── hooks/              # Custom hooks (useScrollSpy)
├── types.ts            # Interfaces TypeScript
├── index.css           # Estilos globais e tema Tailwind
├── App.tsx             # Componente raiz
└── main.tsx            # Entry point
```

## Configuração

### Ferramentas

Os links e informações das ferramentas podem ser editados em `src/data/tools.ts`.

### Avisos

Avisos e comunicados podem ser adicionados em `src/data/announcements.ts`.
