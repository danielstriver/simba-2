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

The app has four real API routes:
- `POST /api/claude` — primary AI assistant route; uses Anthropic SDK (`claude-haiku-4-5-20251001`) with a `respond_to_customer` tool call to return structured `{ text, productIds }` responses
- `POST /api/groq` — fallback AI assistant route; proxies to Groq's LLM API (llama-3.3-70b-versatile)
- `POST /api/notify` — sends transactional emails via Resend (order_placed, order_ready, password_reset, password_changed); `order_placed` emails always go to `MANAGER_EMAIL` env var if set
- `POST/GET /api/payments/momo` — integrates MTN Mobile Money Request-to-Pay

### Key patterns

**State** — `src/lib/store.ts` exports a single Zustand store (`useStore`) holding cart items, logged-in `user`, `language`, `cartOpen`, `selectedBranch`, and `showBranchModal`. The `items`, `language`, `user`, and `selectedBranch` fields are persisted to localStorage under `"simba-store"`.

**Auth** — `src/lib/auth.ts` implements localStorage-based auth (register/login/reset) with three roles: `customer`, `staff`, `manager`. Google Sign-In is also available via `src/lib/firebase.ts` (Firebase Auth + `signInWithPopup`); the `AuthModal` component shows the Google button only when `isGoogleAuthConfigured()` returns true (requires `NEXT_PUBLIC_FIREBASE_*` env vars). Passwords are hashed with `btoa(pw + ":simba2025salt")` — intentionally simple (demo app). Staff accounts are seeded via `seedStaffAccounts()` called on app init; demo credentials are `manager@simba.rw / Simba2025!` and `{alice,bob,carol,david}@simba.rw / Staff2025!`. Deposit amounts for checkout scale with the user's no-show count: 0 no-shows → 500 RWF, 1–2 → 1000 RWF, 3+ → 2000 RWF.

**Orders** — `src/lib/orders.ts` stores orders in localStorage under `"simba-orders"`. The order lifecycle is: `pending → accepted → preparing → ready → picked_up` (or `cancelled`). Orders carry branch, pickup date/time, assigned staff, deposit amount, and an optional post-pickup review. Use `createOrder()`, `patchOrder()`, and the read helpers; never write to localStorage directly.

**Inventory** — `src/lib/inventory.ts` tracks per-branch stock in localStorage under `"simba-inventory"`. Default stock is 50 units when no record exists. `deductStock()` is called when an order is placed; staff can call `markOutOfStock()` / `restoreStock()` from the dashboard.

**Staff session** — `src/lib/staffAuth.ts` manages a separate staff session in localStorage under `"simba-staff-session"` (independent of the main Zustand store). The `/staff/login` page uses the `useStaffUser()` hook (`{ staffUser, signIn, signOut }`) from this module rather than the shared auth store.

**Branches** — `src/lib/branches.ts` exports `BRANCHES` (11 Kigali locations) and `getBranch()`. The default branch is `"centenary"`.

**Data loading** — `src/lib/products.ts` exports `getProducts()`, which fetches the JSON, applies category remapping (`SUBCATEGORY_CATEGORY` map fixes miscategorized products from the source data), and caches the result in memory. Always call `getProducts()` to access products.

**Search** — `src/lib/search.ts` implements a multi-tier scoring algorithm (exact match → substring → synonym → word-level, minimum threshold 20pts). Synonym groups live in the same file.

**AI Assistant** — `src/components/SimbaAssistant.tsx` uses a three-tier fallback: (1) `POST /api/claude` (Anthropic SDK, Claude Haiku) → (2) `POST /api/groq` (Groq) → (3) local rule-based NLP pipeline. The Claude route returns structured JSON via forced tool use; the fallback pipeline uses the search scorer directly. Supports voice input via Web Speech API and TTS via SpeechSynthesis.

**Product catalog management** — `src/lib/productCatalog.ts` allows managers to add/edit/delete products. Custom products are stored in `"simba-custom-products"` and field overrides for catalog products in `"simba-product-overrides"`. Always call `clearProductCache()` after any mutation (the helpers do this automatically). The dashboard's product management tab lives in `src/app/dashboard/ProductsPanel.tsx`. Visibility (hide/show) for catalog products is managed separately via `src/lib/catalogFlags.ts`, which stores hidden product IDs in localStorage under `"simba-hidden-products"`.

**Email notifications** — `src/lib/emails.ts` exports pure HTML template functions. `POST /api/notify` calls these and delivers via Resend. Triggered client-side at order placement (→ manager), order status change to `ready` (→ customer), and auth flows. For `order_placed`, the server always sends to `MANAGER_EMAIL` env var if set, ignoring the client-supplied address.

**i18n** — Three languages (en/fr/rw) via `src/lib/LanguageContext.tsx` and `src/lib/i18n.ts`. Use the `useLang()` hook (returns `{ lang, t, setLang }`) for all translated strings. Never hardcode UI text.

**Dark mode** — Uses `next-themes` with class-based toggling. Tailwind v4 requires a custom variant in `globals.css` (`@custom-variant dark (&:where(.dark, .dark *))`) instead of the default media-query approach. All dark styles use `dark:` prefix.

**Images** — `src/lib/imageMap.ts` exports `getProductImage()`, which maps product names/categories to Unsplash fallbacks when Cloudinary URLs are broken. Always use `getProductImage()` rather than the raw `image` field.

**UI feedback** — `src/components/Toast.tsx` provides a context-based toast system with three types (`"success"` | `"error"` | `"cart"`), 5-second auto-dismiss, and an optional `sub` subtitle field. Use the `useToast()` hook (from `src/lib/hooks.ts`) to show toasts; `ToastProvider` is already mounted in `src/app/Providers.tsx`. The same file exports `useFocusTrap(isOpen, onClose)` — attach the returned `containerRef` to any modal element to get keyboard focus trapping and Escape-to-close.

**Providers hierarchy** — `src/app/Providers.tsx` wraps the app in: `NextThemesProvider` (class-based, `disableTransitionOnChange`) → `LanguageProvider` → `ToastProvider`. `seedStaffAccounts()` runs inside `LanguageProvider`'s mount effect, so staff accounts are always seeded before any component renders. `HtmlLang.tsx` auto-syncs the `<html lang>` attribute with the active language via `useEffect`.

**Hydration / theme safety** — Components that render theme-dependent UI (colors, icons) must guard against SSR/hydration mismatches. The pattern used throughout: `const [mounted, setMounted] = useState(false); useEffect(() => setMounted(true), []);` — return `null` or a neutral skeleton until `mounted` is true. Do not skip this for any component that reads from `next-themes`.

### Route structure

| Route | File | Purpose |
|---|---|---|
| `/` | `src/app/page.tsx` | Homepage: hero, category grid, featured products |
| `/en` | `src/app/en/page.tsx` | Sets language to English, renders localized landing |
| `/rw` | `src/app/rw/page.tsx` | Sets language to Kinyarwanda, renders localized landing |
| `/products` | `src/app/products/page.tsx` | Listing with search, filter, sort |
| `/products/[id]` | `src/app/products/[id]/page.tsx` | Product detail, related products |
| `/checkout` | `src/app/checkout/page.tsx` | Branch + pickup time selection, deposit payment, order creation |
| `/orders` | `src/app/orders/page.tsx` | Customer order history and review submission |
| `/dashboard` | `src/app/dashboard/page.tsx` | Staff/manager order management, inventory controls |
| `/staff/login` | `src/app/staff/login/page.tsx` | Staff-only login portal |

`CartDrawer` and `SimbaAssistant` are mounted in the root layout (`src/app/layout.tsx`) and available on every page.

### Environment variables

```
# AI Assistant (three-tier — configure at least one for LLM responses)
ANTHROPIC_API_KEY      # Primary: Claude Haiku via Anthropic SDK (claude-haiku-4-5-20251001)
GROQ_API_KEY           # Fallback: llama-3.3-70b-versatile via Groq

# Email notifications (Resend)
RESEND_API_KEY         # Enables transactional emails
NOTIFY_FROM_EMAIL      # Sender address (default: "SIMBA Supermarket <onboarding@resend.dev>")
MANAGER_EMAIL          # Override recipient for order_placed emails (server-side)

# Payments
MOMO_SUBSCRIPTION_KEY  # MTN MoMo API subscription key
MOMO_API_USER          # MTN MoMo API user UUID
MOMO_API_KEY           # MTN MoMo API key
MOMO_ENVIRONMENT       # "sandbox" (default) or "production"
MOMO_BASE_URL          # MoMo base URL (defaults to MTN sandbox)

# Google Sign-In (Firebase)
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

All are optional for local dev — the app degrades gracefully without them.

### Next.js 16 notes

This is Next.js 16 with React 19 — APIs and conventions differ from older versions. Before adding or modifying any Next.js feature, read the relevant guide in `node_modules/next/dist/docs/`. Heed deprecation notices.

- Path alias `@/*` maps to `src/*`.
- Allowed image hosts: `res.cloudinary.com`, `images.unsplash.com`, `placehold.co`, `flagcdn.com`, `lh3.googleusercontent.com` (configured in `next.config.ts`).
- ESLint uses flat config (`eslint.config.mjs`) — ESLint 9 syntax, not `.eslintrc`.
