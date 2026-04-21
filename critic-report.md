# Simba Supermarket — Code Critique Report

**Reviewed:** Next.js 16 / React 19 / TypeScript / Tailwind CSS 4 / Zustand  
**Date:** 2026-04-21  
**Scope:** 19 files across app pages, components, and library modules

---

## Executive Summary

The codebase is well-structured for a static SPA and delivers a polished UI. However, it carries several bugs that affect correctness, a pattern of duplicated component logic that will become a maintenance burden, accessibility gaps that break keyboard-only and screen-reader use, and a few TypeScript weaknesses that mask real runtime risks. The issues below are ordered by severity within each file.

---

## 1. `src/lib/store.ts`

### Bug — `totalItems` and `totalPrice` are getter functions, not selectors

```ts
totalItems: () => get().items.reduce(...)
totalPrice: () => get().items.reduce(...)
```

These are stored as _functions_ in state. Every component that calls `useStore((s) => s.totalItems())` re-creates the selector result on every render regardless of whether `items` changed. Zustand's subscription model cannot diff a function call return value — it can only diff the slice. The result is more re-renders than necessary on every store write.

**Fix:** Remove them from the store definition entirely and replace call sites with inline selectors:
```ts
const totalItems = useStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
```
Or memoize them outside of Zustand with `useMemo`.

### Bug — `cartOpen` is persisted inadvertently

`partialize` is correctly filtering `cartOpen` out, but the initial persisted state is loaded before `cartOpen` is set, meaning if a user refreshes during an open-cart session the `cartOpen` default (`false`) wins. This is actually correct behaviour, but is worth noting — any future change to `partialize` that accidentally includes `cartOpen: true` would make the cart open on every refresh.

### Code Quality — `language` duplicated between Zustand and Context

`store.ts` holds `language: Language` and `setLanguage`, while `LanguageContext.tsx` reads it back and re-exposes it. This is a two-layer indirection where one would do. Either put the language in Zustand (and read from Zustand directly) or put it in React context (and drop it from Zustand). Having both means language changes trigger Zustand re-renders _and_ context re-renders.

---

## 2. `src/lib/products.ts`

### Bug — Module-level singleton cache breaks SSR / test isolation

```ts
let cachedData: ProductsData | null = null;
```

A module-level variable is shared across all requests in a Node.js server process. In a static export this is harmless, but if the app is ever run in server-rendering mode (or tests run in the same process), stale data will be served to all subsequent callers after the first fetch. The cache should be request-scoped or use `React.cache()` (available in React 19 / Next.js 16).

### Bug — No error handling on `fetch`

```ts
const res = await fetch("/simba_products.json");
const raw: ProductsData = await res.json();
```

If the JSON file is missing or the fetch fails (non-2xx), `res.json()` will throw or produce garbage. There is no `res.ok` check and no `.catch()` at the call site (only in `products/page.tsx`). The product detail page does not catch the rejection at all — a network failure there leaves the spinner spinning forever.

### TypeScript Issue — Unsafe cast on fetch response

`await res.json()` returns `any`, which is immediately cast to `ProductsData` without validation. If the JSON structure changes, runtime errors will silently corrupt `cachedData`.

### Code Quality — `CATEGORIES` array is manually maintained

`CATEGORIES` is a plain string array that must be kept in sync with the keys of `CATEGORY_META`. If a category is added to one but not the other, silent `undefined` access occurs in several places (e.g., `CATEGORY_META[cat].icon`). Derive `CATEGORIES` from `Object.keys(CATEGORY_META)` or use a `const` object pattern.

### Code Quality — `CATEGORY_META` includes a legacy alias key

`"Sports & Fitness"` is listed as a legacy alias, but `CATEGORIES` includes `"Sports & Wellness"`. If any product's category is still `"Sports & Fitness"` after the remapping step, `CATEGORY_META["Sports & Wellness"]` will be used for display but the category filter will not match. The legacy key should either be removed or covered by `SUBCATEGORY_CATEGORY`.

---

## 3. `src/lib/search.ts`

### Performance — `buildSynonymMap` runs at module load time, not lazily

```ts
const SYNONYM_MAP = buildSynonymMap();
```

This is a top-level call that executes during module evaluation. For 38 synonym groups it is trivial, but it blocks the module initialisation thread and cannot be tree-shaken. This is a minor issue but worth flagging as a pattern to avoid.

### Bug — `expandTerms` iterates the entire map for every query

```ts
SYNONYM_MAP.forEach((synonyms, term) => {
  if (q.includes(term)) extra.push(...synonyms);
});
```

Multi-word synonym keys like `"hand wash"` will match inside longer strings (e.g., `"handwashing"` contains `"hand"` but not `"hand wash"`). The check is a substring test, not a word-boundary test, which can produce spurious synonym expansion. A query for `"gin"` will also expand `"gin"` inside any longer word.

### Code Quality — `quickSearch` is a thin wrapper with no added value

```ts
export function quickSearch(query: string, products: Product[], limit = 5): Product[] {
  return smartSearch(query, products).slice(0, limit);
}
```

`smartSearch` already returns a sorted array. The only difference is `slice`. Callers could use `smartSearch` directly, or `quickSearch` should be documented as the canonical assistant-facing API.

---

## 4. `src/lib/i18n.ts`

### Code Quality — No type-safety guarantee across locales

`translations.fr` and `translations.rw` are typed as their own inferred types, not as `typeof translations.en`. If a key is added to `en` but forgotten in `fr` or `rw`, TypeScript will not catch it until a runtime access. Fix:

```ts
const translations: Record<Language, typeof translations.en> = { ... };
```

Or assert each locale: `fr: { ... } satisfies typeof translations.en`.

### Code Quality — Hardcoded `"552 products"` string

The hero subtitle in `en`, `fr`, and `rw` hardcodes the number 552. This will silently go stale when the product catalogue changes, and there is no cross-reference to the actual product count.

---

## 5. `src/lib/LanguageContext.tsx`

### Performance — Context value object is recreated on every render

```tsx
<LanguageContext.Provider value={{ lang: language, t, setLang: setLanguage }}>
```

A new object literal is created on every render of `LanguageProvider`. Because `useStore` triggers re-renders on any store write, this causes all consumers of `useLang()` to re-render whenever _any_ piece of Zustand state changes (cart additions, `cartOpen`, etc.), not just when `language` changes.

**Fix:** Wrap the value in `useMemo`:
```tsx
const value = useMemo(() => ({ lang: language, t, setLang: setLanguage }), [language, t, setLanguage]);
```

---

## 6. `src/lib/imageMap.ts`

### Bug — `CATEGORY_FALLBACKS` uses stale category names

`CATEGORY_FALLBACKS` contains `"Sports & Fitness"` and `"Stationery"` as keys. Neither of these appears in the canonical `CATEGORIES` array (`"Sports & Wellness"` and no Stationery category). Products in those categories will fall through to the generic Unsplash fallback URL.

### Performance — Linear scan through all keyword groups on every card render

`getProductImage` iterates through all 38 keyword groups for every call. With 552 products and multiple renders per card (image load, hover, etc.), this runs hundreds of times. Pre-building a trie or inverted index at module load time would make lookups O(1) after initialisation.

### Code Quality — Some keywords appear in multiple groups

`"lotion"` appears in the `body lotion` group and could partially match `"deodor"` via synonym expansion. `"paper"` is in stationery but also matches `"toilet paper"` keywords in the cleaning group. The ordering of groups therefore silently determines which image wins, making image assignment fragile.

---

## 7. `src/app/layout.tsx`

### Accessibility — Missing `lang` attribute reflects only English

```tsx
<html lang="en" suppressHydrationWarning>
```

The app supports English, French, and Kinyarwanda. The `lang` attribute is hardcoded to `"en"` and never updated when the user switches languages. Screen readers will mispronounce French and Kinyarwanda content.

**Fix:** Dynamically set `lang` from the store, or move language switching to a per-page `<html>` update via Next.js metadata.

### Accessibility — `suppressHydrationWarning` hides real bugs

This attribute is correctly required for `next-themes`, but it suppresses _all_ hydration warnings on `<html>`, not just the theme-related one. A server/client mismatch anywhere in the tree would be silently swallowed.

### Code Quality — No `viewport` meta tag

The layout exports `Metadata` but does not set `viewport`. Next.js 16 requires `viewport` to be exported separately as a `Viewport` object; relying on the default may produce suboptimal mobile rendering.

---

## 8. `src/app/page.tsx`

### Bug — `topDrinks` filter may return zero products silently

```ts
const topDrinks = products
  .filter((p) => p.category === "Alcoholic Drinks")
  .filter((p) => ["wine","beer","whisky","gin","cognac","amarula"].some(k => p.name.toLowerCase().includes(k)))
  .slice(0, 4);
```

If no Alcoholic Drinks products match those name keywords, `featured` will contain only `topCosmetics`. There is no fallback and no empty state — the Featured Products section silently shows fewer items than expected.

### Performance — All product filters run on every render

`topCosmetics`, `topDrinks`, `foodProducts`, etc. are plain variable declarations inside the component function body. They re-run on every render (language change, theme change, any state update). They should be `useMemo` expressions depending on `[products]`.

### Code Quality — Magic number `"552"` hardcoded in five places

The string `"552 products"` appears in `page.tsx` (three times), `layout.tsx` metadata, and `i18n.ts` (three locales). If the catalogue size changes, all of these need manual updates. Derive it from `products.length` after loading.

### Code Quality — `popularCats` is computed but never used

```ts
const popularCats = CATEGORIES.slice(0, 6);
```

This variable is declared at line 41 but never referenced in the JSX. Dead code.

### UX — Hero search form does nothing when field is empty

```ts
if (heroSearch.trim()) router.push(...)
```

Submitting with an empty field silently does nothing. Users who press Enter expecting to browse all products get no feedback and no navigation. At minimum the empty-submit should navigate to `/products`.

---

## 9. `src/app/products/page.tsx`

### Bug — `useEffect` dependency array uses illegal expression

```ts
useEffect(() => { ... }, [searchParams.get("q"), searchParams.get("category")]);
```

Calling a method inside a dependency array is not allowed by the Rules of Hooks linter and can produce stale closures. `searchParams.get()` is not a stable reference — `searchParams` itself should be the dependency, and the values should be read inside the effect body.

### Bug — Real-time filtering and commit-on-Enter are in conflict

The `onChange` handler sets both `inputValue` and `activeSearch` in real time (line 193), but there is also a `commitSearch` function that sets `activeSearch` from `inputValue.trim()`. The Search button calls `commitSearch`, but typing already updates `activeSearch`. The button therefore does nothing that typing hasn't already done — it is misleading UI.

### Performance — Category counts recomputed on every render

```ts
const count = allProducts.filter((p) => p.category === cat).length;
```

This runs inside the `.map()` over `CATEGORIES` on every render. With 552 products and 10 categories, that is 5520 array iterations per render. Memoize a `categoryCounts` map once when `allProducts` loads.

### Performance — `ProductImg` component is duplicated from `ProductCard`

`products/page.tsx` defines its own `ProductImg` and `Card` components (lines 16–105) that are functionally identical to `ProductCard.tsx`. Any bug fix in one will not be applied to the other. Use the shared `ProductCard` component.

### Accessibility — Filter sidebar is invisible to screen readers when closed

```tsx
<aside className={`${sidebarOpen ? "block" : "hidden"} sm:block ...`}>
```

`hidden` removes the element from layout but it remains in the DOM. Screen readers on mobile will still encounter and read the sidebar controls even when they are visually hidden. Use `aria-hidden={!sidebarOpen && isMobile}` or conditionally render the sidebar.

### Accessibility — Sort `<select>` has no `<label>`

The sort dropdown has no associated `<label>` element. Screen readers will announce it as an unlabelled control.

---

## 10. `src/app/products/[id]/page.tsx`

### Bug — `router.push("/products")` on unknown ID causes a flash

```ts
if (!found) { router.push("/products"); return; }
```

The push happens inside the `getProducts` promise, which resolves after the component mounts. During that time the spinner is shown, then navigation occurs. A 404 page or a proper not-found handler would be more correct and eliminate the loading-then-redirect flash.

### Bug — `handleBuyNow` calls `addItem` via `handleAdd`, which calls it once per loop iteration

```ts
function handleAdd() {
  for (let i = 0; i < qty; i++) addItem(product);
}
```

`addItem` increments quantity by 1 each call. Calling it `qty` times via a loop is correct in outcome but semantically wrong — it triggers `qty` separate Zustand state updates and `qty` separate re-renders. Use `updateQuantity(product.id, (existingQty ?? 0) + qty)` instead.

### Bug — `handleBuyNow` uses `setTimeout` to open the cart

```ts
setTimeout(() => setCartOpen(true), 300);
```

This is a race condition. If the user navigates away within 300 ms, `setCartOpen` will fire on an unmounted component (harmless in React 19 but still incorrect practice). Store the timeout ID and clear it on unmount.

### Accessibility — Quantity stepper buttons have no accessible labels

```tsx
<button onClick={() => setQty(Math.max(1, qty - 1))}>
  <Minus className="w-4 h-4" />
</button>
```

Icon-only buttons with no `aria-label` are invisible to screen readers. The same problem exists for the `+` button.

### Accessibility — Breadcrumb has no `aria-label`

The `<nav>` on line 73 contains a breadcrumb trail but has no `aria-label="Breadcrumb"`. Screen readers cannot distinguish it from other navigation landmarks.

### UX — "Buy Now" adds to cart instead of going to checkout directly

The button label says "Buy Now →" but `handleBuyNow` adds items to the cart, then opens the cart drawer after a 300 ms delay. A "Buy Now" pattern universally means go directly to checkout. Users expecting direct checkout will be confused by the cart drawer opening instead.

---

## 11. `src/app/checkout/page.tsx`

### Bug — Card payment fields have no validation

When `payMethod === "card"`, `handlePlaceOrder` is allowed to proceed even if `cardNum`, `cardExp`, and `cardCvv` are empty. The form simulates success regardless. While this is a demo, the card UI implies real input is expected. At minimum, the payment step should mirror the detail-step validation pattern.

### Bug — MoMo phone field has no validation

`momoPhone` is collected but never checked before `handlePlaceOrder` is called. An empty MoMo number will silently "succeed".

### Bug — Empty cart guard uses stale `items` reference

```ts
if (items.length === 0 && step !== "success") { return (...) }
```

After `clearCart()` is called inside `handlePlaceOrder`, `items` becomes `[]` synchronously. This triggers a re-render that shows the empty-cart screen _before_ `setStep("success")` is called on the next line, causing a flash of the empty state. Reorder: set step to `"success"` first, then clear the cart.

### TypeScript Issue — `errors` state is `Record<string, string>` but only three keys are ever set

The errors object could be typed more precisely as `Partial<{ name: string; phone: string; address: string }>` to prevent typo-based key mismatches.

### Accessibility — Form `<label>` elements contain inline icons that add noise

```tsx
<label>
  <User className="w-4 h-4 inline mr-1" />{t.fullName} *
</label>
```

Icons rendered inside a `<label>` are announced by screen readers as part of the label text (or skipped, depending on the reader). Use `aria-hidden="true"` on decorative inline icons.

### Accessibility — Required field indicators use only `*` character

The `*` after label text is a visual-only convention. Add `aria-required="true"` to the input elements, and optionally add a legend explaining what `*` means.

### UX — City dropdown contains only five Rwandan cities

"Butare," "Gisenyi," and "Ruhengeri" are colonial-era names; the current official names are Huye, Rubavu, and Musanze respectively. Using outdated names reduces credibility with local users.

---

## 12. `src/components/Navbar.tsx`

### Performance — `totalItems` is called as a getter function on every render

```ts
const totalItems = useStore((s) => s.totalItems());
```

As noted in the store critique, this cannot be memoized by Zustand's selector system. Replace with:
```ts
const totalItems = useStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
```

### Accessibility — Mobile menu toggle button has no `aria-expanded`

```tsx
<button onClick={() => setMobileOpen(!mobileOpen)}>
  {mobileOpen ? <X .../> : <Menu .../>}
</button>
```

The button should carry `aria-expanded={mobileOpen}` and `aria-controls` pointing to the mobile menu's `id` so that screen readers know the menu state.

### Accessibility — Theme toggle button has no accessible label

The sun/moon icon button has no `aria-label`. Screen readers will announce a nameless button. Add `aria-label={theme === "dark" ? t.lightMode : t.darkMode}`.

### Accessibility — Desktop search input has no `<label>`

The search input uses only a placeholder. Placeholders disappear on focus and are not reliably announced by all screen readers. Add a visually hidden `<label>` or `aria-label`.

### Bug — Navbar search does not clear after submission

After navigating to `/products?q=...`, the search field in the Navbar still shows the old query. The search input state is local to `Navbar` and is not reset on navigation. A user performing a second search sees the previous term pre-filled.

---

## 13. `src/components/CartDrawer.tsx`

### Accessibility — Drawer is not a focus trap

When the cart opens, keyboard focus is not moved into the drawer. A user pressing Tab will tab through the page content behind the overlay rather than through the cart. The drawer should implement a focus trap (move focus to the first interactive element on open; capture Tab/Shift+Tab; return focus to the trigger on close).

### Accessibility — Overlay click-to-close has no keyboard equivalent

```tsx
<div className="fixed inset-0 bg-black/40 ..." onClick={() => setCartOpen(false)} />
```

Clicking the backdrop closes the drawer, but pressing Escape does not. Add a `useEffect` that listens for `keydown` with `key === "Escape"` and calls `setCartOpen(false)`.

### Accessibility — Quantity buttons have no `aria-label`

The `+` and `-` buttons in the cart are icon-only with no accessible name. Same pattern as the product detail page.

### Accessibility — Drawer has no `role="dialog"` or `aria-modal`

Without `role="dialog"` and `aria-modal="true"`, screen readers do not know the cart is a modal context and will read the content behind the overlay.

### Code Quality — Item count computed twice

```tsx
items.reduce((s, i) => s + i.quantity, 0)
```

This runs in both the header badge (line 43) and the footer subtotal (line 115). Extract to a variable.

---

## 14. `src/components/ProductCard.tsx`

### Performance — `items` array subscribed wholesale

```ts
const items = useStore((s) => s.items);
const inCart = items.some((i) => i.product.id === product.id);
```

Every `ProductCard` subscribes to the entire `items` array. When any item is added or removed from the cart, _every_ `ProductCard` on the page re-renders (even those whose `inCart` status did not change). With 552 products per page this is expensive.

**Fix:** Subscribe to a derived boolean:
```ts
const inCart = useStore((s) => s.items.some((i) => i.product.id === product.id));
```

### Accessibility — "Add to cart" button has no accessible label

The button renders only a `<ShoppingCart>` icon. Screen readers will announce "button" with no context. Add `aria-label={t.addToCart}`.

### Accessibility — "View details" hover overlay is inaccessible

```tsx
<div className="absolute bottom-0 ... opacity-0 group-hover:opacity-100 ...">
  <Eye className="w-3 h-3" /> View details
</div>
```

This overlay is only revealed on hover, so keyboard and touch users never see it. It also has no semantic role. Because the entire card is already a `<Link>`, this overlay is redundant — remove it or make it a visible element.

### Code Quality — `ProductImg` is duplicated in three places

`ProductImg` exists in `ProductCard.tsx`, `products/page.tsx` (as a local `ProductImg`), and the logic is repeated inline in `products/[id]/page.tsx`. These should be a single exported component.

---

## 15. `src/components/SimbaAssistant.tsx`

### Bug — `msgId` is declared with `let` instead of `useRef` assignment

```ts
let msgId = useRef(1);
```

The variable name `msgId` is re-declared with `let` on every render. While `useRef` keeps the underlying object stable, the `let` declaration is misleading and triggers lint warnings. It should be:
```ts
const msgId = useRef(1);
```

### Bug — `send` closes over stale `totalItems` and `totalPrice`

```ts
const send = useCallback(async (text: string, fromVoice = false) => {
  ...
  buildResponse(intent, query, allProducts, totalItems, totalPrice)
  ...
}, [allProducts, totalItems, totalPrice, speak]);
```

`totalItems` and `totalPrice` are subscribed via `useStore((s) => s.totalItems())` — again, getter functions whose return values are not stable references. Each render creates a new value; the dependency array comparison works correctly, but the underlying getter pattern causes unnecessary `send` recreation on every cart change even when the user is not interacting with the assistant.

### Bug — Voice recognition result fires `send` before `setInput` completes

```ts
rec.onresult = (e) => {
  const transcript = e.results[0][0].transcript;
  setInput(transcript);   // state update — async
  send(transcript, true); // uses transcript directly — correct, but setInput hasn't rendered yet
};
```

This is actually safe because `transcript` is passed directly. However, `setInput` is called unnecessarily since the input is immediately cleared inside `send`. The `setInput(transcript)` call is dead — it sets the value, then `send` calls `setInput("")` 600 ms later. The user sees a brief flash of the transcript in the input box.

### Bug — "See all results" link uses category, not query

```tsx
<Link href={`/products?q=${encodeURIComponent(msg.products[0]?.category || "")}`}>
```

When the assistant shows 5+ results, the "See all results" link sends the _category_ of the first product as a search query (`q=`), not as a category filter (`category=`). A search for `"wine"` would produce a "See all results" link like `/products?q=Alcoholic+Drinks`, which searches for the string "Alcoholic Drinks" rather than filtering by that category.

**Fix:** Use `/products?category=...` for category results and `/products?q=...` for free-text searches.

### Performance — `allProducts` is fetched independently in the assistant

`SimbaAssistant` calls `getProducts()` in its own `useEffect`. Since `getProducts` caches in a module-level variable, this is not a network issue, but it duplicates the async fetch setup and state management that the page components also perform. Consider lifting product data to a shared context.

### Accessibility — Chat panel has no ARIA role or label

The assistant panel has no `role="dialog"`, `aria-label`, or `aria-live` region. Screen reader users will not be notified of new messages. Assistant responses should be placed in an `aria-live="polite"` region.

### Accessibility — Toggle button pulse animation can cause vestibular issues

The `pulse-ring` CSS animation runs continuously on the closed state of the button. Continuous animations should respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  .pulse-ring::before { animation: none; }
}
```

---

## 16. `src/components/Toast.tsx`

### Bug — `counter` is a closure variable that resets on re-render

```ts
export function ToastProvider({ children }: { children: React.ReactNode }) {
  let counter = 0;
```

`counter` is a local `let` variable inside the component function. It resets to `0` on every render. Under concurrent rendering or rapid state updates, two toasts can be assigned the same `id`, causing the wrong toast to be dismissed when `remove(id)` is called.

**Fix:** Use `useRef`:
```ts
const counter = useRef(0);
// inside toast: const id = ++counter.current;
```

### Accessibility — Toasts are not in an `aria-live` region

The toast container has no `role="status"` or `aria-live` attribute. Screen readers will not announce new toasts. Add `role="status" aria-live="polite" aria-atomic="false"` to the container `<div>`.

### Accessibility — Dismiss button has no accessible label

```tsx
<button onClick={() => remove(t.id)} className="shrink-0 opacity-60 hover:opacity-100">
  <X className="w-3.5 h-3.5" />
</button>
```

This button renders only an `X` icon with no `aria-label`. Add `aria-label="Dismiss notification"`.

### UX — Toasts overlap the floating assistant button

The toast container is positioned `bottom-5` at the horizontal center. The assistant button is `bottom-24, right-24`. On narrow viewports, toasts can cover the assistant button since the container width is `max-w-xs` centered, which on a 375 px wide phone extends from ~108 px to ~315 px — potentially obscuring the bottom-right area.

---

## 17. `src/app/globals.css`

### Accessibility — Custom scrollbar colour may fail contrast requirements

```css
::-webkit-scrollbar-thumb { background: #dc2626; }
```

A red (#dc2626) scrollbar thumb on a white track has a contrast ratio of approximately 3.5:1, below the WCAG 2.1 AA requirement of 4.5:1 for UI components. Use a darker red or add a border to the thumb to improve visibility.

### Code Quality — `sticky-below-nav` class is referenced in `page.tsx` but not defined

The trust strip section in `page.tsx` (line 111) has the class `sticky-below-nav`. This class does not appear anywhere in `globals.css` or as a Tailwind utility. It has no effect.

---

## 18. `next.config.ts`

### Security — `remotePatterns` allows all paths on `placehold.co` and `res.cloudinary.com`

No `pathname` or `port` restrictions are applied. Any URL from those hosts (including potentially malicious redirected paths) will be proxied through Next.js image optimisation. Add `pathname` constraints:
```ts
{ protocol: "https", hostname: "placehold.co", pathname: "/**" }
```
This is low-risk for a static export but is the correct pattern.

### Code Quality — `devIndicators: false` hides useful build information

Disabling the dev overlay removes the "Static" / "Dynamic" route indicators that are helpful during development. Unless there is a specific reason (e.g., screen recording), this should be removed or set conditionally.

---

## 19. `package.json`

### Bug — `lucide-react` version `^1.8.0` is a major version mismatch

The `lucide-react` ecosystem was at `^0.x` for years; the jump to `1.x` in the package.json is unusual and may refer to an unreleased or incorrect version. The current published stable series as of early 2026 is `0.4xx`. Verify the installed version matches what is intended and update the lock file accordingly.

### Code Quality — No `postinstall` or type-check script

There is no `"typecheck": "tsc --noEmit"` script. The only quality gate in CI would be `eslint`, which will not catch type errors. Add a typecheck script and run it in CI.

### Code Quality — `eslint` script has no target

```json
"lint": "eslint"
```

With no target path, `eslint` in v9 flat config mode will lint based on its config's `files` patterns. If no `eslint.config.*` file exists, this command may do nothing or error. Confirm an ESLint config file is present and specify the target explicitly: `"lint": "eslint src"`.

---

## Priority Summary

| Priority | Issue | File |
|----------|-------|------|
| P0 | Toast counter resets — wrong toasts dismissed | `Toast.tsx:13` |
| P0 | Cart empty-state flash before success screen | `checkout/page.tsx:57` |
| P0 | `getProducts` has no error handling | `products.ts:152` |
| P1 | `totalItems`/`totalPrice` as store functions — excess re-renders | `store.ts:22` |
| P1 | All `ProductCard` instances re-render on any cart change | `ProductCard.tsx:43` |
| P1 | All product filters recomputed on every render (no `useMemo`) | `page.tsx:30–38` |
| P1 | `LanguageContext` value object recreated on every Zustand write | `LanguageContext.tsx:22` |
| P1 | `useEffect` dep array calls method — breaks rules of hooks linter | `products/page.tsx:141` |
| P1 | Cart drawer not a focus trap; no Escape key handler | `CartDrawer.tsx` |
| P1 | `lang` attribute hardcoded to `"en"` despite multi-language support | `layout.tsx:19` |
| P2 | `popularCats` declared but never used | `page.tsx:41` |
| P2 | "Buy Now" opens cart drawer instead of going to checkout | `products/[id]/page.tsx:217` |
| P2 | "See all results" link uses category as search query | `SimbaAssistant.tsx:498` |
| P2 | `msgId` declared with `let` instead of `const` | `SimbaAssistant.tsx:325` |
| P2 | City dropdown uses colonial-era city names | `checkout/page.tsx:175–179` |
| P2 | Multiple icon-only buttons missing `aria-label` | multiple files |
| P3 | `sticky-below-nav` class referenced but never defined | `globals.css` / `page.tsx:111` |
| P3 | Hardcoded `"552"` product count in 8+ locations | multiple files |
| P3 | `CATEGORIES` array manually maintained, can desync from `CATEGORY_META` | `products.ts:48` |
| P3 | `pulse-ring` animation ignores `prefers-reduced-motion` | `globals.css:28` |
