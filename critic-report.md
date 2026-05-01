# Simba Supermarket - Codebase Critic Report

## Executive Summary
The Simba Supermarket prototype is a high-quality, modern Next.js 15 application. It successfully demonstrates a fast, search-first e-commerce experience tailored for the Rwandan market. The architecture is sound, utilizing Zustand for persistent state and Tailwind CSS v4 for efficient styling. The integration of a hybrid AI assistant (Claude + rule-based) and voice features provides a competitive edge in UX.

---

## 1. Architecture & Core Tech Stack
### Strengths
- **Next.js 15 & Turbopack:** Excellent choice for performance and developer velocity.
- **Zustand Persistence:** `src/lib/store.ts` effectively manages cart, user, and language state across sessions using `persist` middleware.
- **Tailwind CSS v4:** Clean implementation in `src/app/globals.css` with custom variants for dark mode, keeping the CSS bundle small and maintainable.

### Opportunities
- **State Granularity:** As the app grows, consider splitting the Zustand store or using `useShallow` to prevent unnecessary re-renders in components that only need a small slice of state.
- **Server Components:** While client-side state is handled well, more logic could be moved to Server Components (e.g., initial product loading) to improve Largest Contentful Paint (LCP).

---

## 2. Search & NLP Engine (`src/lib/search.ts`)
### Strengths
- **Synonym Expansion:** The `SYNONYM_GROUPS` approach is practical and effective for local context (e.g., "bread" -> "umutsima").
- **Tiered Scoring:** Multi-tier relevance scoring (name match vs. description vs. category) ensures accurate results.

### Opportunities
- **Fuzzy Matching:** Current search relies on exact substring or bigram matches. Integrating a lightweight fuzzy search (like `Fuse.js`) would significantly improve the experience for users with typos.
- **Query Extraction:** The logic for extracting search queries from the Assistant (`src/components/SimbaAssistant.tsx`) and the Search bar should be centralized in `search.ts` to ensure behavioral consistency.

---

## 3. AI Assistant & UX (`src/components/SimbaAssistant.tsx`)
### Strengths
- **Hybrid NLP:** Combining rule-based intent detection for common tasks (cart, search, navigation) with Claude API for complex queries is a resilient architecture.
- **Voice Integration:** Native Web Speech API integration for VTT and TTS is a high-signal feature for mobile users.

### Opportunities
- **Context Awareness:** The assistant currently has limited memory of previous turns in a conversation. Passing a summarized history to the Claude API would make it feel more "intelligent."
- **Accessibility:** The assistant panel and other modals (`AuthModal`, `BranchModal`) lack keyboard focus traps and full ARIA compliance (e.g., `aria-modal`, `role="dialog"`).
- **Loading States:** Transitions between AI responses can feel abrupt. Adding skeleton loaders or more fluid entry animations for message bubbles would polish the feel.

---

## 4. Checkout & Authentication Flow
### Strengths
- **Low-Friction Auth:** Postponing sign-up until checkout is a proven conversion-optimization strategy.
- **Branch Selection:** Clear and simple selection for the pickup model.

### Opportunities
- **Validation:** Phone number validation in `AuthModal` is currently basic. Implementing more rigorous formatting (e.g., Rwandan +250 prefixes) would improve data quality.
- **Payment Simulation:** The Momo payment flow is a great touch but could benefit from more detailed status updates (e.g., "Waiting for prompt...", "Payment confirmed").

---

## 5. Data Integrity & Management (`src/lib/products.ts`)
### Strengths
- **Runtime Cleaning:** Effective use of `cleanName` and `SUBCATEGORY_CATEGORY` overrides to fix messy source data from `simba_products.json`.

### Opportunities
- **Scalability:** Loading the entire `simba_products.json` (600+ items) into the client-side bundle is fine for a prototype but will become a bottleneck. Moving to a paginated API or a server-side DB (Supabase/PostgreSQL) is the logical next step.
- **Image Fallbacks:** The keyword-based image mapping is clever but occasionally produces mismatches. A dedicated image field in the JSON would be more robust.

---

## 6. Localisation (`src/lib/i18n.ts`)
### Strengths
- **Tri-lingual Support:** Excellent coverage for English, French, and Kinyarwanda.

### Opportunities
- **Consistency:** Some dashboard strings and newer features (like specific error messages) are still hardcoded in English. A "Localization Audit" is recommended to move all remaining strings into the `translations` object.

---

## 7. Strategic Recommendations (Action Plan)
1.  **Critical Bug Fixes:** Address the dashboard filtering and action-gate issues identified in the preliminary staff panel review.
2.  **Accessibility Sprint:** Add `focus-trap-react` (or a vanilla equivalent) to all modals and ensure proper ARIA roles are applied.
3.  **Search Enhancement:** Implement fuzzy matching in `smartSearch` to handle typos gracefully.
4.  **Assistant Polish:** Centralize `extractQuery` and add a "typing..." indicator to the AI responses.
5.  **Localization Audit:** Ensure the Dashboard and Inventory sections are fully translated into Kinyarwanda and French.
