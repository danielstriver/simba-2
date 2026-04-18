# Simba Supermarket — Rwanda's Online Supermarket

A modern, full-featured e-commerce web application built as a reimagining of [simbaonlineshopping.com](https://simbaonlineshopping.com). Built for the A2SV × University of Rwanda hackathon.

---

## Live Features

| Feature | Details |
|---|---|
| **Product catalogue** | 789 products across 10 categories |
| **Smart search** | Synonym expansion, word-level relevance scoring, real-time filtering |
| **SIMBA Assistant** | AI chat + voice input, intent detection, honest not-found responses |
| **Shopping cart** | Persistent across sessions via Zustand + localStorage |
| **MoMo checkout** | Mobile Money payment flow with order summary |
| **3 languages** | English · Français · Kinyarwanda |
| **Dark mode** | System-independent class-based toggle |
| **Product detail pages** | Related products, quantity picker, add to cart |
| **Responsive design** | Mobile-first, works on all screen sizes |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| State | Zustand with `persist` middleware |
| Icons | Lucide React |
| Dark mode | next-themes |
| Images | Cloudinary (product photos) · Unsplash (category banners) |
| Voice | Web Speech API (`SpeechRecognition` + `SpeechSynthesis`) |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Homepage — hero, category grid, featured products
│   ├── layout.tsx                # Root layout — providers, navbar, footer, assistant
│   ├── globals.css               # Tailwind v4 import + dark mode variant override
│   ├── products/
│   │   ├── page.tsx              # Product listing — search, filter, sort, category pills
│   │   └── [id]/page.tsx         # Product detail — images, quantity, related products
│   └── checkout/page.tsx         # Checkout — order summary, MoMo payment form
│
├── components/
│   ├── Navbar.tsx                # Sticky nav — search, cart button, lang/theme toggles
│   ├── Footer.tsx                # Footer — links, social, store info
│   ├── CartDrawer.tsx            # Slide-in cart — items, quantities, totals, checkout CTA
│   ├── ProductCard.tsx           # Product card — image, price, add to cart
│   ├── SimbaAssistant.tsx        # AI chat assistant — NLP, voice input, TTS
│   └── Toast.tsx                 # Toast notification system
│
└── lib/
    ├── products.ts               # Product types, category metadata, data loader + cleanup
    ├── search.ts                 # Smart search — synonym expansion, relevance scoring
    ├── store.ts                  # Zustand cart store with localStorage persistence
    ├── i18n.ts                   # Translation strings (EN / FR / RW)
    ├── LanguageContext.tsx        # Language provider + useLang() hook
    └── imageMap.ts               # Keyword → Unsplash image mapping for fallbacks

public/
└── simba_products.json           # Full product dataset (789 products, Cloudinary images)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/danielstriver/simba-2.git
cd simba-2
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## Key Engineering Decisions

### Smart Search (`src/lib/search.ts`)

Search uses a multi-tier relevance scoring system instead of simple string matching:

```
Exact full name match   → 1000 pts
Exact substring in name → 100 pts
Exact substring in cat  → 50 pts
Synonym match in name   → 30 pts  (e.g. "soap" finds "glycerin", "handwash")
Word-level match        → 20 pts  (minimum threshold — filters out bigram noise)
Category match          → 8–15 pts
Starts-with bonus       → 25 pts
Bigram fuzzy bonus      → 2 pts/bigram (tie-breaker only, below threshold alone)
```

Minimum score of **20** is enforced — this prevents unrelated products from passing through on bigram coincidences alone (e.g. "headsets" would otherwise match "Heden Petroleum Jelly" via shared bigrams "he" and "et").

Over 30 synonym groups cover common search patterns: searching "soap" expands to handwash, glycerin, bar soap, savon; "shampoo" expands to conditioner, hair care; "wine" expands to sauvignon, merlot, champagne.

### SIMBA Assistant (`src/components/SimbaAssistant.tsx`)

The assistant uses rule-based NLP with a structured pipeline:

1. **`extractQuery()`** — strips all conversational filler before searching:
   - "Got headsets in your store?" → "headsets"
   - "Do you carry olive oil?" → "olive oil"
   - "How much is Amarula?" → "Amarula"

2. **`detectIntent()`** — classifies the request into: `greeting`, `help`, `cart`, `cheapest`, `expensive`, `price`, `category`, `categories`, `search`

3. **`buildResponse()`** — generates honest, contextual responses:
   - Found → confirms with count: *"Yes! Found 8 results for shampoo"*
   - Partial match → `broadSearch()` tries individual words, labels as "related"
   - Not found → `notFoundMessage()` clearly states the product isn't carried and explains what Simba does stock
   - Voice input → TTS reads the response aloud; typed input → silent

### Dark Mode (`src/app/globals.css`)

Tailwind v4 uses `@media (prefers-color-scheme: dark)` by default, which conflicts with `next-themes` (which sets a `.dark` class on `<html>`). Fixed with:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

### Category Data Cleanup (`src/lib/products.ts`)

The source dataset has subcategories miscategorised due to a scraping error (e.g. olive oil, flour, toilet paper filed under "Alcoholic Drinks"). Fixed at load time via a subcategory → correct category override map:

```ts
const SUBCATEGORY_CATEGORY: Record<number, string> = {
  65: "Food Products",            // olive oil
  67: "Food Products",            // flour
  246: "Cleaning & Sanitary",     // toilet paper
  379: "Cosmetics & Personal Care", // petroleum jelly
  // ...
};
```

---

## Product Categories

| Category | Products |
|---|---|
| Cosmetics & Personal Care | 162 |
| General | 159 |
| Alcoholic Drinks | 143 |
| Food Products | 124 |
| Kitchenware & Electronics | 62 |
| Cleaning & Sanitary | 55 |
| Baby Products | 25 |
| Pet Care | 16 |
| Kitchen Storage | 9 |
| Sports & Wellness | 1 |

---

## Author

**Daniel NIYOMUGENGA**  
Full-stack developer based in Kigali, Rwanda.
