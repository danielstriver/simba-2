# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server (Next.js with Turbopack)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test suite is configured. There is no database — the app is fully static.

## Architecture

**Simba Supermarket** is a fully client-side e-commerce SPA built with Next.js 16 (App Router), React 19, Zustand, and Tailwind CSS 4. All product data comes from `/public/simba_products.json` (789 products). There are no API routes, no backend, and no database.

### Key patterns

**State** — `src/lib/store.ts` exports a single Zustand store (`useStore`) holding cart items, language, and cart-open state. Items and language are persisted to localStorage under `"simba-store"`.

**Data loading** — `src/lib/products.ts` exports `getProducts()`, which fetches the JSON, applies category remapping (`SUBCATEGORY_CATEGORY` map fixes miscategorized products from the source data), and caches the result in memory. Always call `getProducts()` to access products.

**Search** — `src/lib/search.ts` implements a multi-tier scoring algorithm (exact match → substring → synonym → word-level, minimum threshold 20pts). Synonym groups live in the same file. The minimum threshold prevents false positives from bigram overlap alone.

**AI Assistant** — `src/components/SimbaAssistant.tsx` is a rule-based NLP pipeline (no external AI API). Pipeline: query extraction → intent detection → response building. Supports voice input via Web Speech API and TTS via SpeechSynthesis.

**i18n** — Three languages (en/fr/rw) via `src/lib/LanguageContext.tsx` and `src/lib/i18n.ts`. Use the `useLang()` hook (returns `{ lang, t, setLang }`) for all translated strings. Never hardcode UI text.

**Dark mode** — Uses `next-themes` with class-based toggling. Tailwind v4 requires a custom variant in `globals.css` (`@custom-variant dark (&:where(.dark, .dark *))`) instead of the default media-query approach. All dark styles use `dark:` prefix.

**Images** — `src/lib/imageMap.ts` exports `getProductImage()`, which maps product names/categories to Unsplash fallbacks when Cloudinary URLs are broken. Always use `getProductImage()` rather than the raw `image` field.

### Route structure

| Route | File | Purpose |
|---|---|---|
| `/` | `src/app/page.tsx` | Homepage: hero, category grid, featured products |
| `/products` | `src/app/products/page.tsx` | Listing with search, filter, sort |
| `/products/[id]` | `src/app/products/[id]/page.tsx` | Product detail, related products |
| `/checkout` | `src/app/checkout/page.tsx` | Order summary + MoMo/card/cash form |

`CartDrawer` and `SimbaAssistant` are mounted in the root layout (`src/app/layout.tsx`) and available on every page.

### Next.js 16 notes

This is Next.js 16 with React 19 — APIs and conventions differ from older versions. Before adding or modifying any Next.js feature, read the relevant guide in `node_modules/next/dist/docs/`. Heed deprecation notices.

- Path alias `@/*` maps to `src/*`.
- Allowed image hosts: `res.cloudinary.com`, `images.unsplash.com`, `placehold.co` (configured in `next.config.ts`).
- ESLint uses flat config (`eslint.config.mjs`) — ESLint 9 syntax, not `.eslintrc`.
