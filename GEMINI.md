# GEMINI.md

## Project Overview
**Simba Supermarket** is a modern, high-performance e-commerce prototype for Rwanda's online shopping market. It is built as a reimagining of [simbaonlineshopping.com](https://simbaonlineshopping.com), focusing on speed, searchability, and an integrated AI assistant.

### Key Technologies
- **Framework:** Next.js 15+ (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (with `@custom-variant dark` for next-themes compatibility)
- **State Management:** Zustand (with `persist` middleware for cart/language persistence)
- **Icons:** Lucide React
- **Theming:** `next-themes` (Dark/Light mode support)
- **Localization:** Custom i18n support for English (en), French (fr), and Kinyarwanda (rw).
- **AI Assistant:** Rule-based NLP with Web Speech API integration (Voice-to-Text and TTS).
- **Authentication:** Low-friction sign-up/sign-in system using name and phone number, triggered at checkout to prevent friction.
- **Pickup System:** Replaced delivery with a store pickup model. Users select a branch and pickup time; staff packs items in advance.

### Architecture
- **App Router:** Utilizes Next.js App Router for routing and layouts (`src/app/`).
- **Feature-Driven Components:** Core UI logic resides in `src/components/` (e.g., `SimbaAssistant`, `AuthModal`, `CartDrawer`, `Navbar`).
- **Logic & Libs:** Centralized business logic in `src/lib/`:
    - `products.ts`: Product types, category metadata, and data loading with cleanup/overrides.
    - `search.ts`: "Smart Search" engine with synonym expansion and multi-tier relevance scoring.
    - `store.ts`: Global Zustand store for cart items, user profile, language, and UI state.
    - `i18n.ts`: Translation strings and language configuration including pickup-specific text.
- **Data Source:** Primary product data is stored in `public/simba_products.json`.

---

## Building and Running

### Prerequisites
- Node.js 18+
- npm

### Key Commands
- `npm install`: Install dependencies.
- `npm run dev`: Start the development server (Next.js with Turbopack).
- `npm run build`: Build the application for production.
- `npm run start`: Run the production build.
- `npm run lint`: Run ESLint for code quality checks.

---

## Development Conventions

### Styling & Theming
- **Tailwind v4:** Uses the latest Tailwind version. Prefer utility classes.
- **Dark Mode:** Implemented via the `.dark` class on the `<html>` element. Custom variant defined in `src/app/globals.css`.
- **Colors:** Primary brand color is typically red (`bg-red-600`, `text-red-600`).

### State & Persistence
- **Zustand:** All cart-related logic, user profiles, and language preferences should go into `src/lib/store.ts`.
- **Persistence:** The `simba-store` key in `localStorage` persists the cart, user, and language across sessions.

### Search & NLP
- **Search Scoring:** Modify `src/lib/search.ts` to adjust relevance scores or add synonyms.
- **Assistant Intents:** New conversational patterns should be added to `detectIntent()` and `buildResponse()` in `src/components/SimbaAssistant.tsx`.

### Pickup & Authentication
- **Authentication Flow:** Users are prompted to sign up/in ONLY when clicking "Checkout" in the cart or manually via the Navbar icon. "Continue as Guest" is provided for maximum low-friction.
- **Pickup Selection:** Managed in `src/app/checkout/page.tsx`. Current branches include City Center, Kicukiro, Kimironko, and Gishushu.

### Data Management
- **Category Overrides:** The source data in `simba_products.json` may have miscategorized items. Use `SUBCATEGORY_CATEGORY` in `src/lib/products.ts` to fix these at runtime.
- **Image Fallbacks:** Keyword-to-Unsplash mapping is handled in `src/lib/imageMap.ts` (if applicable) and `getProductImage` utility.

### Code Quality
- **TypeScript:** Strict typing is encouraged. Interfaces for `Product`, `CartItem`, `User`, and `Message` are defined in their respective lib/component files.
- **Localization:** Always use the `useLang()` hook and `translations` object from `src/lib/i18n.ts` for user-facing text.
