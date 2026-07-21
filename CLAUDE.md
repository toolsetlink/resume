# CLAUDE.md

自由简历 (ziyou-resume) — Privacy-first online resume editor with multi-template support and PDF export.

**Stack:** Next.js 16 + React 19 + TypeScript + Zustand + Ant Design + Tailwind CSS v4 + Vitest + Playwright + PNPM

## Commands

```bash
pnpm dev          # Start dev server (http://localhost:3000)
pnpm build        # Build static site to out/
pnpm check        # Lint + typecheck + unit tests
pnpm test:e2e     # Run E2E tests
pnpm test -- --coverage  # Unit tests with coverage
```

## Project Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout: AntdRegistry + ConfigProvider
│   ├── page.tsx            # Chinese landing page (SSR with generateMetadata)
│   ├── robots.ts / sitemap.ts
│   ├── dashboard/          # Client-only pages
│   └── workbench/          # Client-only editor
├── components/
│   ├── home/               # Landing page sections
│   ├── templates/          # 4 resume templates + registry
│   ├── preview/            # ResumePreview
│   ├── editor/             # SectionAccordion + 8 panel types
│   └── workbench/          # Header, TemplateSwitcher, etc.
├── hooks/                  # usePdfExport, useAutoSave
├── stores/resume-store.ts  # Zustand + Immer + persist (27 actions)
├── shared/                 # Pure TS types and config
├── i18n/config.ts          # Chinese locale placeholder (no runtime i18n)
└── styles/globals.css      # HSL design tokens + rich-content CSS
```

### Key Conventions

- **`@/`** → `src/`
- **State**: Zustand with Immer middleware. Persisted to localStorage key `resume-storage`.
- **Language**: Chinese-only. UI strings are imported directly from `messages/zh.json`; `src/i18n/config.ts` is a configuration placeholder only.
- **Templates pluggable**: Add at `src/components/templates/{name}/`, register in `registry.ts`.
- **Client-only**: Dashboard and Workbench use `'use client'`. Landing page fully SSR.
- **Dynamic components**: React component map pattern (`Record<string, ComponentType>`).
- **PDF export**: Client-only `window.print()` via `usePdfExport` hook.

### Testing

- **Unit**: Vitest + @testing-library/react + jsdom. Store tests use `useResumeStore.getState()`.
- **E2E**: Playwright with chromium.
- Coverage: lines 50%, branches 40%, functions 50%, statements 50%.
