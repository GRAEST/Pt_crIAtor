# Pt crIAtor

Sistema web para criacao, gestao e exportacao de Planos de Trabalho voltados a projetos de PD&I (Pesquisa, Desenvolvimento e Inovacao). Desenvolvido para simplificar o processo de elaboracao de propostas, desde a concepcao ate a planilha financeira final.

## Visao Geral

O Pt crIAtor guia o usuario por um fluxo de wizard com 18 etapas, cobrindo desde a identificacao do projeto ate o detalhamento financeiro. Conta com sugestoes de conteudo via IA, editor de texto rico, gestao de equipe e exportacao em multiplos formatos.

## Funcionalidades

- **Wizard de 18 etapas** — formulario guiado para preenchimento completo do plano de trabalho
- **Editor de texto rico** — baseado em TipTap, com formatacao, tabelas e listas
- **Sugestoes por IA** — integracao com Gemini e Claude para gerar conteudo contextualizado por secao
- **Gestao de Recursos Humanos** — cadastro de equipe, categorias (professor, servidor, aluno), bolsas e valor/hora
- **Modulo Financeiro** — 10 abas cobrindo equipamentos, laboratorios, RH direto/indireto, servicos de terceiros, material de consumo, cronograma e resumo orcamentario
- **EAP (Estrutura Analitica do Projeto)** — visualizacao em arvore das atividades
- **Diagramas Mermaid** — geracao visual de diagramas de modulos
- **Exportacao** — DOCX, XLSX e PDF
- **Snippets** — blocos de texto reutilizaveis por secao
- **Upload de materiais** — documentos de referencia (PDF, DOCX, PPTX) com extracao de texto para contexto da IA
- **Auto-save** — salvamento automatico com debounce de 3 segundos
- **Dashboard** — painel com estatisticas, planos recentes e acesso rapido

## Stack Tecnica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript |
| Frontend | React 19, Tailwind CSS 4 |
| Estado | Zustand |
| Formularios | React Hook Form + Zod |
| Editor | TipTap (ProseMirror) |
| Planilha | Univerjs |
| Banco de dados | SQLite via Prisma ORM |
| IA | Google Generative AI (Gemini), Anthropic (Claude) |
| Exportacao | docx, exceljs, html-to-image |
| Icones | Lucide React |

## Estrutura do Projeto

```
Pt_crIAtor/
├── graest-app/                # Aplicacao principal (Next.js)
│   ├── src/
│   │   ├── app/               # Rotas e paginas (App Router)
│   │   │   ├── api/           # Endpoints REST
│   │   │   ├── plans/         # Gestao de planos
│   │   │   ├── staff/         # Gestao de equipe
│   │   │   └── snippets/      # Blocos reutilizaveis
│   │   ├── components/
│   │   │   ├── wizard/        # Wizard e steps (00-17)
│   │   │   ├── editor/        # Editor rico + IA
│   │   │   ├── financeiro/    # Modulo financeiro
│   │   │   ├── eap/           # Estrutura analitica
│   │   │   ├── mermaid/       # Diagramas
│   │   │   ├── export/        # Geradores DOCX/XLSX
│   │   │   └── ui/            # Componentes base
│   │   ├── types/             # Tipos TypeScript
│   │   ├── lib/               # Utilitarios e store
│   │   └── data/              # Dados estaticos
│   ├── prisma/                # Schema e seed do banco
│   └── public/                # Assets estaticos
├── dashboard/                 # Portal secundario (React + Vite)
└── webhook/                   # Servico de webhooks
```

## Pre-requisitos

- Node.js 18+
- npm

## Instalacao

```bash
# Clonar o repositorio
git clone https://github.com/GRAEST/Pt_crIAtor.git
cd Pt_crIAtor/graest-app

# Instalar dependencias
npm install

# Configurar variaveis de ambiente
cp .env.example .env
# Editar .env com suas chaves de API

# Gerar client do Prisma e criar banco
npx prisma generate
npx prisma db push

# (Opcional) Popular banco com dados iniciais
npx prisma db seed
```

## Variaveis de Ambiente

| Variavel | Descricao | Obrigatoria |
|---|---|---|
| `DATABASE_URL` | Caminho do banco SQLite (ex: `file:./data/pt-creator.db`) | Sim |
| `GEMINI_API_KEY` | Chave da API Google Gemini | Sim |
| `ANTHROPIC_API_KEY` | Chave da API Anthropic (Claude) | Nao |

## Uso

```bash
# Desenvolvimento
npm run dev

# Build de producao
npm run build
npm run start
```

Acesse `http://localhost:3000` no navegador.

### Comandos uteis

```bash
npm run db:push       # Sincronizar schema com o banco
npm run db:seed       # Popular banco com dados iniciais
npm run db:studio     # Abrir interface visual do Prisma
npm run db:generate   # Regenerar client do Prisma
```

## Docker

```bash
docker-compose up -d
```

O container expoe a porta 3001 e persiste dados via volumes Docker para o banco SQLite e uploads.

## API

| Rota | Metodo | Descricao |
|---|---|---|
| `/api/plans` | GET, POST | Listar e criar planos |
| `/api/plans/[planId]` | GET, PUT, DELETE | CRUD de plano individual |
| `/api/plans/[planId]/duplicate` | POST | Duplicar plano |
| `/api/ai/suggest` | POST | Obter sugestao de conteudo via IA |
| `/api/export/[planId]/docx` | GET | Exportar plano em DOCX |
| `/api/export/[planId]/xlsx` | GET | Exportar plano em XLSX |
| `/api/export/[planId]/pdf` | GET | Exportar plano em PDF |
| `/api/staff` | GET, POST | Listar e cadastrar membros da equipe |
| `/api/staff/[staffId]` | PUT, DELETE | Editar e remover membro |
| `/api/snippets` | GET, POST | Listar e criar snippets |
| `/api/snippets/[snippetId]` | PUT, DELETE | Editar e remover snippet |
| `/api/materials/[planId]` | GET | Listar materiais do plano |
| `/api/upload` | POST | Upload de arquivos |

## Licenca

Projeto interno GRAEST.
