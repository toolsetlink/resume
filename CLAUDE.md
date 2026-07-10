# CLAUDE.md

自由简历 (ziyou-resume) — Privacy-first online resume editor with multi-template support and PDF export.

**Stack:** Next.js 16 + React 19 + TypeScript + Zustand + Ant Design + Tailwind CSS v4 + next-intl + Vitest + Playwright + PNPM

## Commands

```bash
pnpm dev          # Start dev server (http://localhost:3000)
pnpm build        # Production build
pnpm start        # Start production server
pnpm vitest run   # Run unit tests
pnpm vitest run --coverage  # Tests with coverage
pnpm exec playwright test   # Run E2E tests
```

## Project Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (metadata)
│   ├── page.tsx            # Redirect to default locale
│   ├── robots.ts / sitemap.ts
│   └── [locale]/           # i18n routes
│       ├── layout.tsx      # Providers: NextIntlClientProvider + AntdRegistry + ThemeProvider
│       ├── page.tsx        # Landing page (SSR with generateMetadata)
│       ├── dashboard/      # Client-only pages
│       └── workbench/      # Client-only editor
├── components/
│   ├── home/               # Landing page sections
│   ├── templates/          # 4 resume templates + registry
│   ├── preview/            # ResumePreview
│   ├── editor/             # SectionAccordion + 8 panel types
│   └── workbench/          # Header, TemplateSwitcher, etc.
├── hooks/                  # usePdfExport, useAutoSave, useItemSaveStatus, useResumeCases
├── stores/resume-store.ts  # Zustand + Immer + persist (27 actions)
├── shared/                 # Pure TS types and config
├── i18n/                   # next-intl: routing, request, navigation
└── styles/globals.css      # HSL design tokens + rich-content CSS
```

### Key Conventions

- **`@/`** → `src/`
- **State**: Zustand with Immer middleware. Persisted to localStorage key `resume-storage`.
- **i18n**: next-intl with `localePrefix: 'as-needed'`. SSR-safe via `getTranslations()`.
- **Templates pluggable**: Add at `src/components/templates/{name}/`, register in `registry.ts`.
- **Client-only**: Dashboard and Workbench use `'use client'`. Landing page fully SSR.
- **Dynamic components**: React component map pattern (`Record<string, ComponentType>`).
- **PDF export**: Client-only `window.print()` via `usePdfExport` hook.

### Testing

- **Unit**: Vitest + @testing-library/react + jsdom. Store tests use `useResumeStore.getState()`.
- **E2E**: Playwright with chromium.
- Coverage: lines 50%, branches 40%, functions 50%, statements 50%.
