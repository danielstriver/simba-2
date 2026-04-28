<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

Next.js 16.2 has breaking changes — APIs, conventions, and file structure may all differ from older versions. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Commands

```bash
npm run dev      # Start dev server (Next.js with Turbopack)
npm run build    # Production build
npm run start   # Start production server
npm run lint    # ESLint (flat config, ESLint 9 syntax)
```

No test suite configured.

## Architecture

**Simba Supermarket** is a click-and-collect e-commerce app. All data lives in **localStorage** — no database.

| Layer | Implementation |
|---|---|
| Products | `public/simba_products.json` (789 products, loaded via `getProducts()` in `src/lib/products.ts`) |
| Cart/Auth/Lang | Zustand store in `src/lib/store.ts`, persisted to localStorage key `"simba-store"` |
| Orders | `src/lib/orders.ts`, localStorage key `"simba-orders"` |
| Inventory | `src/lib/inventory.ts`, localStorage key `"simba-inventory"` |
| Staff session | `src/lib/staffAuth.ts`, localStorage key `"simba-staff-session"` |

### API routes

- `POST /api/claude` — Anthropic SDK (Claude Haiku), returns structured JSON
- `POST /api/groq` — Groq fallback (llama-3.3-70b-versatile)
- `POST /api/notify` — Resend emails
- `POST/GET /api/payments/momo` — MTN Mobile Money

## Toolchain quirks

- **Tailwind v4 dark mode**: Must use custom variant in `src/app/globals.css`:
  ```css
  @custom-variant dark (&:where(.dark, .dark *));
  ```
  Default `@media (prefers-color-scheme: dark)` conflicts with `next-themes`.

- **ESLint 9 flat config**: Uses `eslint.config.mjs` syntax (not `.eslintrc`).

- **Path alias**: `@/*` → `src/*` (configured in `tsconfig.json`).

- **Allowed images**: `res.cloudinary.com`, `images.unsplash.com`, `placehold.co`, `flagcdn.com`, `lh3.googleusercontent.com`.

## Critical conventions

- **Data loading**: Always use `getProducts()` from `src/lib/products.ts` — applies `SUBCATEGORY_CATEGORY` fix for miscategorized products (olive oil under Alcohol, etc.).

- **Search scoring**: Minimum 20pt threshold enforced in `src/lib/search.ts` — prevents bigram noise false positives.

- **i18n**: Use `useLang()` hook from `src/lib/LanguageContext.tsx`, never hardcode UI text.

- **Image fallbacks**: Use `getProductImage()` from `src/lib/imageMap.ts` — maps to Unsplash when Cloudinary URL broken.

- **Staff auth**: Separate from main auth store — uses `useStaffUser()` hook from `src/lib/staffAuth.ts`.

## Demo credentials

- Manager: `manager@simba.rw` / `Simba2025!`
- Staff: `{alice,bob,carol,david}@simba.rw` / `Staff2025!`

## See also

- `CLAUDE.md` — comprehensive architecture documentation
- `GEMINI.md` — alternative overview