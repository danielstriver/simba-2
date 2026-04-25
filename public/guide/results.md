# Fwd: Build Simba 2.0 — Final Checklist & Deadline Reminder

---

**Original Sender:** A2SV Program <noreply@a2sv.org>
**Original Date:** Sat, Apr 25, 2026 at 6:47 PM
**Recipient:** daniel.niyomugenga@a2sv.org
**Contest:** GenAI Contest #1: Build Simba 2.0

---

## Your Current Progress

Hi Daniel,

Your current score is **62/100**.

The submission has a well-designed buyer experience with a functional product catalogue, smart search, and shopping cart.

### Areas for Improvement

- **Missing Market Rep Dashboard:** This is missing entirely, resulting in a score of 0 for that category. This is the biggest opportunity for improvement and is worth **25 points**.
- **Multi-language Support:** Partially implemented. English and Kinyarwanda translations are included, but French is not fully supported.
- **UI/UX Quality:** Polished and consistent with a responsive design, but some minor layout issues were noticed.

---

## Timeline

| Event | Date & Time | Location |
| :--- | :--- | :--- |
| **Submission Deadline** (Last chance to submit) | Sunday, April 26 · 11:59 PM | N/A |
| **Demo Day** | Monday, April 27 · 9:30 AM | AUCA |
| **Demo Day** | Monday, April 27 · 5:30 PM | University of Rwanda |

---

## Final Checklist

### 🛒 Buyer Experience: What judges will click through

- **Landing page:** A proper homepage, including a hero section, headline, value propositions, and a clear "Shop Now" CTA (not just a product list).
- **Multi-language:** EN + Kinyarwanda at minimum. All UI strings must be translated (buttons, errors, empty states).
- **Auth:** Register, login, and forgot password must all work end-to-end.
- **Browse and search:** Users can browse categories and search for products, and results are accurate.
- **Product detail:** Each product page includes an image, price in RWF, description, and an add-to-cart function.
- **Cart:** The cart must persist, quantities can be updated, and the total is correct.
- **Checkout flow:** Includes branch selection, a MoMo payment step, and order confirmation (must reach confirmation).
- **Order history:** Logged-in users can see their past orders and current order status.
- **Mobile responsive:** Works on a phone. Test it on your own device before Monday.

### 🏪 Market Rep Dashboard: The other side of the story

- **Separate dashboard:** The market rep view is a separate page/URL and is not visible to customers.
- **Incoming orders:** Branch staff can see new orders as they arrive, along with the customer name and items.
- **Accept and assign:** The Branch manager can accept an order and assign it to a specific staff member.
- **Order status updates:** Staff can mark an order as "Preparing" or "Ready for Pick-up".
- **Branch inventory:** Staff can see stock per branch and mark items as out of stock.
- **Real Kigali branches:** Use real Simba branch names: Remera, Kimironko, Kacyiru, Nyamirambo, Gikondo, Kanombe.

---

## ⭐ Go the extra mile

- **Conversational AI search:** Let users type queries like "Do you have fresh milk?" — use Groq's free API (llama-3.3-70b). This can be done in one afternoon and will stand out.
- **MoMo deposit on checkout:** Charge a small deposit (500–1000 RWF) to confirm pick-up and prevent no-shows.
- **Customer reviews:** Allow customers to rate their branch experience after pick-up.

---

## Current Top 3

1. 🥇 **MUGISHA Joseph** (University of Rwanda): 82/100
2. 🥈 **Frank MBONYINKWIYE Burumbuke** (AUCA): 65/100
3. 🥈 **Ishimwe Crescent** (University of Rwanda): 65/100

---

## Final Advice

One rule: fewer features that work perfectly beat many features that are broken. Ship what works. Cut what doesn't. Own the stage on Monday.

> "It's not about ideas. It's about making ideas happen."
> — SCOTT BELSKY, Co-founder of Behance

© 2026 A2SV · Africa to Silicon Valley · a2sv.org
