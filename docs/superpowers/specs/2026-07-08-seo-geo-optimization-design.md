# SEO & GEO Optimization Design — 自由简历

**Date:** 2026-07-08
**Project:** 自由简历 (ziyou-resume)
**Status:** Approved

## Overview

Optimize 自由简历 for both traditional search engines (SEO) and generative AI engines (GEO) to increase organic visibility and AI-assisted discovery.

## Scope (方案 B)

1. Site infrastructure config fix
2. JSON-LD structured data (Schema.org)
3. OG image generation
4. 4 individual template SEO pages
5. 404 page + landing page enhancements

## Part 1: Site Infrastructure

### Changes

- `nuxt.config.ts` `site.url` → `https://resume.toolsetlink.com`
- Enhance `app.head`: richer description, og:image, Google site verification meta
- robots.txt: allow `/templates/`, disallow `/dashboard/` and `/workbench/`
- Add `/templates/**` to route rules as SSR-enabled
- Register `/templates/**` in sitemap (allow listing in sitemap)

## Part 2: JSON-LD Structured Data

### Implementation

New component: `app/components/home/JsonLd.vue`

Schemas injected via `useHead` `<script type="application/ld+json">`:

1. **Organization** — entity identification
2. **WebSite** — search action support
3. **FAQ** — per-locale FAQ content mapped to schema
4. **BreadcrumbList** — on landing page

### Content Strategy

- FAQ Schema dynamically reads from i18n (zh/en), making both languages GEO-friendly
- Organization uses the real domain
- All IDs reference the site root URL

## Part 3: OG Image

### Approach

Create OG image as static PNG (1200×630px) via script, placed at `public/og-image.png`.

- Brand colors + app name + tagline
- Also create a per-template OG image directory for template pages
- Both zh and en variants: `og-image.png` (zh default), `og-image-en.png`

## Part 4: Template SEO Pages

### Route Structure

```
app/pages/templates/
  [slug].vue           # Dynamic route: professional-resume, modern-resume, etc.
```

### Template Config Mapping

| Slug | Template ID | Target Keywords |
|------|-------------|----------------|
| `professional-resume` | professional | 专业简历模板, professional resume |
| `modern-resume` | modern | 现代简历模板, modern resume template |
| `elegant-resume` | elegant | 优雅简历模板, elegant CV design |
| `creative-resume` | creative | 创意简历模板, creative resume |

All routes are SSR-enabled (`routeRules` in nuxt.config).

### Each Page Includes

- `useSeoMeta` — unique title, description, og tags per locale
- `useHead` — canonical, hreflang (zh-CN / en-US)
- Template screenshot with alt text
- Template feature highlights (localized)
- CTA button → click creates resume with this template → navigates to workbench
- Per-page JSON-LD (Product schema or individual WebPage schema)

## Part 5: 404 Page & Landing Enhancements

### 404 Page (`app/error.vue`)

- Friendly error message
- Navigation links to home, templates
- `useSeoMeta` with `robots: noindex`

### Landing Page Enhancements

1. **Social Proof section** — trust indicators (free, no registration, privacy-focused, local storage)
2. **Heading hierarchy fix** — ensure proper h1→h2→h3 structure
3. **Alt text for template preview images** — descriptive alt attributes
4. **Internal links** — link to /templates/* from the landing page template section

## Implementation Order

1. Part 1: Config & infrastructure (foundation)
2. Part 5: 404 page + landing enhancements (visible improvement)
3. Part 2: JSON-LD structured data (GEO core)
4. Part 4: Template SEO pages (content expansion)
5. Part 3: OG image (last, since used by others)
