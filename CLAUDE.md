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

No test suite is configured.

## Architecture

**Simba Supermarket** is a click-and-collect e-commerce app for a Kigali supermarket chain, built with Next.js 16 (App Router), React 19, Zustand, and Tailwind CSS 4. All product data comes from `/public/simba_products.json` (789 products). All user/order/inventory state lives in **localStorage** — there is no database or backend persistence layer.

The app has two real API routes (both are thin proxy routes to external services):
- `POST /api/groq` — proxies to Groq's LLM API for AI-powered assistant responses
- `POST/GET /api/payments/momo` — integrates MTN Mobile Money Request-to-Pay

### Key patterns

**State** — `src/lib/store.ts` exports a single Zustand store (`useStore`) holding cart items, logged-in `user`, `language`, `cartOpen`, `selectedBranch`, and `showBranchModal`. The `items`, `language`, `user`, and `selectedBranch` fields are persisted to localStorage under `"simba-store"`.

**Auth** — `src/lib/auth.ts` implements localStorage-based auth (register/login/reset) with three roles: `customer`, `staff`, `manager`. Passwords are hashed with `btoa(pw + ":simba2025salt")` — intentionally simple (demo app). Staff accounts are seeded via `seedStaffAccounts()` called on app init; demo credentials are `manager@simba.rw / Simba2025!` and `{alice,bob,carol,david}@simba.rw / Staff2025!`. Deposit amounts for checkout scale with the user's no-show count: 0 no-shows → 500 RWF, 1–2 → 1000 RWF, 3+ → 2000 RWF.

**Orders** — `src/lib/orders.ts` stores orders in localStorage under `"simba-orders"`. The order lifecycle is: `pending → accepted → preparing → ready → picked_up` (or `cancelled`). Orders carry branch, pickup date/time, assigned staff, deposit amount, and an optional post-pickup review. Use `createOrder()`, `patchOrder()`, and the read helpers; never write to localStorage directly.

**Inventory** — `src/lib/inventory.ts` tracks per-branch stock in localStorage under `"simba-inventory"`. Default stock is 50 units when no record exists. `deductStock()` is called when an order is placed; staff can call `markOutOfStock()` / `restoreStock()` from the dashboard.

**Branches** — `src/lib/branches.ts` exports `BRANCHES` (9 Kigali locations) and `getBranch()`. The default branch is `"remera"`.

**Data loading** — `src/lib/products.ts` exports `getProducts()`, which fetches the JSON, applies category remapping (`SUBCATEGORY_CATEGORY` map fixes miscategorized products from the source data), and caches the result in memory. Always call `getProducts()` to access products.

**Search** — `src/lib/search.ts` implements a multi-tier scoring algorithm (exact match → substring → synonym → word-level, minimum threshold 20pts). Synonym groups live in the same file.

**AI Assistant** — `src/components/SimbaAssistant.tsx` tries the Groq route first (`POST /api/groq` with a product catalog snippet); if `GROQ_API_KEY` is unset or the request fails, it falls back to a local rule-based NLP pipeline. Supports voice input via Web Speech API and TTS via SpeechSynthesis.

**i18n** — Three languages (en/fr/rw) via `src/lib/LanguageContext.tsx` and `src/lib/i18n.ts`. Use the `useLang()` hook (returns `{ lang, t, setLang }`) for all translated strings. Never hardcode UI text.

**Dark mode** — Uses `next-themes` with class-based toggling. Tailwind v4 requires a custom variant in `globals.css` (`@custom-variant dark (&:where(.dark, .dark *))`) instead of the default media-query approach. All dark styles use `dark:` prefix.

**Images** — `src/lib/imageMap.ts` exports `getProductImage()`, which maps product names/categories to Unsplash fallbacks when Cloudinary URLs are broken. Always use `getProductImage()` rather than the raw `image` field.

### Route structure

| Route | File | Purpose |
|---|---|---|
| `/` | `src/app/page.tsx` | Homepage: hero, category grid, featured products |
| `/products` | `src/app/products/page.tsx` | Listing with search, filter, sort |
| `/products/[id]` | `src/app/products/[id]/page.tsx` | Product detail, related products |
| `/checkout` | `src/app/checkout/page.tsx` | Branch + pickup time selection, deposit payment, order creation |
| `/orders` | `src/app/orders/page.tsx` | Customer order history and review submission |
| `/dashboard` | `src/app/dashboard/page.tsx` | Staff/manager order management, inventory controls |
| `/staff/login` | `src/app/staff/login/page.tsx` | Staff-only login portal |

`CartDrawer` and `SimbaAssistant` are mounted in the root layout (`src/app/layout.tsx`) and available on every page.

### Environment variables

```
GROQ_API_KEY           # Enables LLM-powered assistant (llama-3.3-70b-versatile via Groq)
MOMO_SUBSCRIPTION_KEY  # MTN MoMo API subscription key
MOMO_API_USER          # MTN MoMo API user UUID
MOMO_API_KEY           # MTN MoMo API key
MOMO_ENVIRONMENT       # "sandbox" (default) or "production"
MOMO_BASE_URL          # MoMo base URL (defaults to MTN sandbox)
```

All are optional for local dev — the app degrades gracefully without them.

### Next.js 16 notes

This is Next.js 16 with React 19 — APIs and conventions differ from older versions. Before adding or modifying any Next.js feature, read the relevant guide in `node_modules/next/dist/docs/`. Heed deprecation notices.

- Path alias `@/*` maps to `src/*`.
- Allowed image hosts: `res.cloudinary.com`, `images.unsplash.com`, `placehold.co` (configured in `next.config.ts`).
- ESLint uses flat config (`eslint.config.mjs`) — ESLint 9 syntax, not `.eslintrc`.
