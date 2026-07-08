# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

自由简历 (ziyou-resume) — Privacy-first online resume editor with multi-template support, AI-assisted content generation, and PDF export.

**Stack:** Nuxt 4 + Vue 3 + TypeScript + Pinia + TDesign Vue Next + Tailwind CSS v4 + Vitest + Playwright + PNPM

## Commands

```bash
pnpm dev          # Start dev server (http://localhost:3000)
pnpm build        # Production build
pnpm preview      # Preview production build
pnpm test         # Run unit tests (vitest run)
pnpm test:unit    # Run unit tests in watch mode
pnpm test:coverage  # Unit tests with coverage report
pnpm test:e2e     # Run Playwright E2E tests
pnpm test:ci      # Lint + coverage + E2E (CI pipeline)
pnpm snapshot     # Generate template thumbnail snapshots
```

### Running single test files

```bash
pnpm vitest run tests/unit/stores/resume.spec.ts
pnpm vitest run tests/unit/config/modules.spec.ts
pnpm exec playwright test tests/e2e/landing.spec.ts
```

## Project Architecture

### Monorepo-free Nuxt 4 structure (no packages/ directory)

```
ziyoujianli/
├── app/                    # Nuxt frontend (pages, components, stores, composables, layouts, plugins, assets)
│   ├── pages/              # File-based routing (Nuxt 4 convention)
│   │   ├── index.vue               # Landing page (SSR)
│   │   ├── [locale]/(app)/         # Locale-prefixed app routes (Nuxt 4 nested routing)
│   │   ├── dashboard/              # Dashboard: index.vue (resume list), templates.vue, ai.vue
│   │   └── workbench/[id].vue      # Resume editor workspace (client-only, ssr: false)
│   ├── components/
│   │   ├── editor/         # Editor panels by module: basic, experience, education, skills, projects, certificates, self-evaluation, custom
│   │   ├── templates/      # 4 resume templates: professional, modern, elegant, creative
│   │   │   ├── registry.ts # Template registration (config + component lookup)
│   │   │   └── {name}/     # Each template: config.ts + index.vue + sections/
│   │   ├── preview/        # ResumePreview.vue — renders active template component
│   │   ├── workbench/      # Workbench shell: header, template switcher, global settings
│   │   ├── home/           # Landing page sections: Hero, Features, Templates, FAQ, CTA, Footer
│   │   └── shared/         # Shared: AIPolishDialog.vue
│   ├── composables/        # useAutoSave, usePdfExport, useAIPolish, useGrammarCheck, useItemSaveStatus
│   ├── stores/             # Pinia stores: resume, aiConfig, grammar (all persist to localStorage)
│   ├── layouts/            # app.vue layout
│   └── plugins/            # tdesign.ts, pinia.ts
├── server/                 # Nitro server routes / utils
│   ├── api/ai/             # polish.post.ts, grammar.post.ts, import.post.ts
│   ├── api/proxy/          # image.get.ts
│   └── utils/ai/           # gemini.ts (Gemini adapter with proxy support)
├── shared/                 # Shared between app and server
│   ├── types/              # resume.ts, template.ts — core data model
│   └── config/             # modules.ts, constants.ts, initialResumeData.ts, ai.ts
├── tests/
│   ├── unit/               # Vitest unit tests (mirrors app/ and shared/ structure)
│   ├── e2e/                # Playwright tests (landing, workbench, i18n, PDF, AI, SEO, visual)
│   └── setup.ts            # localStorage + matchMedia mocks
├── i18n/locales/           # zh.json, en.json
└── public/templates/       # Template thumbnail images
```

### Key Conventions

- **`@/`** → `app/`, **`~shared/`** → `shared/`, **`~server/`** → `server/`
- **Auto-imported components**: `editor/`, `workbench/`, `shared/`, `preview/`, `home/` are flat-registered (no path prefix); `templates/` is path-prefix registered to avoid section name collisions
- **Templates pluggable**: Add a template by creating `app/components/templates/{name}/` with `config.ts` + `index.vue` + `sections/`, then register in `registry.ts`
- **Route rules**: `/workbench/**` and `/dashboard/**` are SSR-disabled — they depend on `localStorage` and client-only libraries
- **SSR landing page only**: root `/` and `/snapshot/[template]` are server-rendered for SEO
- **No server-side state**: all resume data lives in browser `localStorage` via `pinia-plugin-persistedstate`

### Resume Data Flow

```
User edits in EditorPanel → Pinia store (resume.ts) → persisted to localStorage
                                                        → ResumePreview displays active template with current data
```

Core data types in `shared/types/resume.ts`: `ResumeData` (top-level document), `BasicInfo`, `Education`, `Experience`, `Skill`, `Project`, `Certificate`, `GlobalSettings`, `MenuSection`.

### Module System

Modules (basic, skills, experience, projects, education, certificates, selfEvaluation, custom) are defined in `shared/config/modules.ts` with localized titles, icons, default visibility, and ordering. The Pinia store manages per-resume `menuSections[]` with enable/disable/reorder. Editor panels and template sections render based on which modules are enabled.

### AI Feature Architecture

- 4 providers: Doubao, DeepSeek, OpenAI-compatible, Google Gemini
- Config stored in `useAIConfigStore` (persisted to localStorage)
- AI operations (polish, grammar check, import) via `server/api/ai/*.post.ts`
- Client composables stream responses via `fetch` + `ReadableStream`
- All providers use OpenAI-compatible `/chat/completions` format; Gemini uses Google AI SDK server-side

### PDF Export

- Client-only `usePdfExport` composable
- Moves preview element off-screen → html2canvas renders full content → jsPDF splits into A4 pages
- Dynamic imports avoid SSR crashes

### Testing Strategy

- **Unit tests** (Vitest + happy-dom): test stores, config, types, composables, template components
- **E2E tests** (Playwright, chromium only): landing page, workbench CRUD, i18n, PDF export, AI, SEO, visual regression
- Coverage thresholds: lines 50%, branches 40%, functions 50%, statements 50%
- Coverage excludes pages, layouts, plugins, composables (covered by E2E), and editor panels (not yet unit-tested)
