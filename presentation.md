# Simba Supermarket — Presentation Guide

> A click-and-collect e-commerce platform for a Kigali supermarket chain.
> Built with Next.js, React, Zustand, Tailwind CSS, and real third-party integrations.

---

## 1. Opening Hook (30 seconds)

Start with the problem statement:

> "Most supermarkets in Kigali require you to walk in, find items yourself, queue, and pay.
> Simba Supermarket solves this — customers shop online, reserve a pickup slot, pay a deposit,
> and walk in to a pre-packed order waiting for them."

Then open the live site and let the homepage speak for itself.

---

## 2. Customer Journey — Live Demo Flow

Walk through this exact sequence. Each step is a talking point.

### Step 1 — Homepage
- Point out the **hero section**: MTN MoMo badge (top right), product categories, featured items
- Mention the **AI assistant** (bottom right) — powered by Groq LLM, falls back to local NLP if API is unavailable
- Show the **language switcher** (English / French / Kinyarwanda)
- Show **dark mode** toggle

### Step 2 — Browse & Search
- Navigate to **Products**
- Type a search query (e.g., "rice" or "milk")
- Show **instant results** with scoring: exact match → synonym → word-level fallback
- Apply a **category filter** and a **sort** (price, name)

### Step 3 — Add to Cart
- Add 2–3 products to the cart
- Open the **cart drawer** (slides in from the right)
- Show quantity controls and running total in RWF

### Step 4 — Authentication
- Click **Checkout** → auth gate appears
- Show the **sign-up flow** (name, phone, email, password)
- Or show **Google Sign-In** (one click, no form)
- Point out the **forgot password** flow — reset code is emailed, not shown in UI

### Step 5 — Checkout
- Select a **branch** (9 Kigali locations across 3 districts)
- Choose a **pickup date and time**
- Choose payment method — select **MTN MoMo**
- Show the **packaging fee** logic:
  - 0 no-shows → 500 RWF
  - 1–2 no-shows → 1,000 RWF
  - 3+ no-shows → 2,000 RWF (incentive to show up)
- Click **Place Order** → success screen with order ID

---

## 3. Email Notification — Order Placed

> This is a real email, sent in real time.

After placing the order, open your inbox and show the email arriving.

**What the email contains:**
- Order ID, customer name and phone, branch, pickup time
- Full item list with quantities and prices
- Order total
- "Open Staff Dashboard →" call-to-action button

**Expected question: "Does this work for any email address?"**

Honest, confident answer:

> "We use **Resend**, a transactional email service. On the **free tier**, Resend restricts
> outgoing mail to only the email address used to create the account — so right now,
> all manager notifications go to my registered email regardless of which branch the
> order is placed at. For a production deployment, you verify your own domain
> (e.g. `notifications@simbakigali.rw`) and the service sends to any recipient
> with no restrictions. The architecture — API route, HTML email templates, fire-and-forget
> delivery — is already production-ready. It is purely a billing tier constraint."

---

## 4. Staff Portal — Live Demo Flow

Navigate to `/staff/login`.

### Step 1 — Role Selector
- Show the **two-card login screen**: Branch Manager (orange) vs Staff Member (blue)
- Click **Branch Manager** → form appears with orange branding
- Log in with manager credentials

### Step 2 — Dashboard: Manager View
- Point out the **stats bar**: total orders, pending, preparing, ready
- Show the order that was just placed — status **Pending**
- Accept it → status moves to **Accepted**
- Advance it to **Preparing**, then **Ready**

### Step 3 — Email Notification: Order Ready
When you mark an order **Ready**, the customer receives a "Your order is ready!" email automatically.

Show that email arriving — it contains:
- Branch location and pickup deadline
- Full item list
- Order ID to show at the counter

### Step 4 — Inventory Tab
- Switch to the **Inventory** tab
- Show stock levels updating after the order was placed
- Demonstrate **Mark Out of Stock** / **Restore Stock** controls

### Step 5 — Sign Out
- Click the **Sign Out** button (top right of dashboard)
- Returns to the role selector login screen

---

## 5. Key Technical Highlights

These are worth mentioning if asked about the build.

| Feature | What to say |
|---|---|
| **No database** | All state lives in `localStorage` — orders, users, inventory, sessions. Zero backend infrastructure. Perfect for a prototype. |
| **Next.js App Router** | Server-rendered pages, API routes (`/api/notify`, `/api/payments/momo`) sit alongside client pages in one repo. |
| **Zustand** | Lightweight global state for cart, user session, language, and selected branch — all persisted across page reloads. |
| **MTN MoMo API** | Real Request-to-Pay integration. Sandbox credentials active; flipping `MOMO_ENVIRONMENT=production` switches it live. |
| **Resend Email** | HTML email templates with inline styles (required for Gmail/Outlook compatibility). Three types: order placed, order ready, password reset/changed. |
| **AI Assistant** | Groq `llama-3.3-70b-versatile` via a Next.js API proxy. Falls back to a local rule-based NLP pipeline if the API key is absent. |
| **i18n** | English, French, Kinyarwanda — switched live with no page reload via React Context. |
| **Role-based auth** | Three roles: `customer`, `staff`, `manager`. Staff sessions stored separately from customer sessions so both can be active in the same browser. |

---

## 6. Architecture Overview (if asked)

```
Browser (localStorage)
  ├── Customer session   → Zustand store ("simba-store")
  ├── Staff session      → staffAuth ("simba-staff-session")
  ├── Orders             → orders.ts ("simba-orders")
  ├── Inventory          → inventory.ts ("simba-inventory")
  └── Users/Auth         → auth.ts ("simba-users")

Next.js API Routes (server-side, Vercel Edge)
  ├── POST /api/notify      → Resend email delivery
  ├── POST /api/groq         → Groq LLM proxy
  └── POST /api/payments/momo → MTN MoMo Request-to-Pay

External Services
  ├── Resend       — transactional email
  ├── Groq         — LLM inference
  ├── MTN MoMo     — mobile payments
  ├── Firebase     — Google Sign-In
  └── Vercel       — hosting + CI/CD
```

---

## 7. Anticipated Questions & Answers

**Q: What happens if a customer doesn't show up?**
> Their no-show count increments. On the next order their deposit doubles (500 → 1,000 → 2,000 RWF), creating a financial incentive to honour reservations.

**Q: How does the inventory update?**
> Stock is deducted at checkout via `deductStock()`. Staff can manually mark items out of stock or restore them from the Inventory tab. Default stock is 50 units per product per branch.

**Q: Can this scale to a real backend?**
> Yes. Every data-access function (`createOrder`, `readOrders`, `patchOrder`, etc.) is isolated behind a clean interface in `src/lib/`. Swapping localStorage for a real database (Postgres, Firestore) means only touching those files — no component changes needed.

**Q: Why no real payment processing yet?**
> MTN MoMo sandbox is wired up. Going live is a credentials swap (`MOMO_ENVIRONMENT=production`) and MTN approval. Card payments show the UI flow but are simulated — a Stripe integration would follow the same pattern as the MoMo route.

**Q: How secure is the auth?**
> For a prototype, passwords are hashed with a simple base64 + salt scheme. A production version would use bcrypt server-side and JWTs or sessions — the auth interface is already isolated so that upgrade is straightforward.

---

## 8. Closing Line

> "Everything you saw — the customer flow, the staff dashboard, the real emails, the inventory updates —
> runs with zero servers and zero databases. It is a fully functional product prototype
> deployable to production with a domain verification and a few API credential upgrades."

---

*Built by Daniel · Simba Supermarket · Kigali, Rwanda*
