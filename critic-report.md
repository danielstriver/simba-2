# Dashboard UI/UX Critique — Simba Supermarket

**Scope:** `src/app/dashboard/page.tsx` + `src/app/dashboard/ProductsPanel.tsx`  
**Date:** 2026-04-29

---

## Critical — Broken or Missing Core Functionality

### C1. Cannot delete or hide catalog products (`ProductsPanel.tsx:415`)
The Trash2 button is gated behind `isCustom === true`. All 789 catalog products can only be edited via override — there is no way to remove a spoiled, discontinued, or bad product from the customer-facing listing. A manager dealing with expired stock has no recourse.

**Fix:** Add a "hidden" flag to `ProductOverrides`. `setProductOverride(id, { hidden: true })` to disable, and filter hidden products out of `getProducts()`. Show a Hide/Unhide toggle button on all products, not just custom ones. Keep the hard-delete only for custom products.

### C2. Staff view does NOT filter by assigned staff (`page.tsx:227`)
```ts
const visibleOrders = role === "staff"
  ? orders.filter((o) => o.status !== "picked_up" && o.status !== "cancelled")
  : filtered;
```
The staff view shows every active order for the branch regardless of `assignedStaffId`. The "Showing orders for: Alice" header is a lie — it shows all staff's orders. The `staffId` selector is visually present but has zero effect on the list.

**Fix:** `orders.filter((o) => o.assignedStaffId === staffId && o.status !== "picked_up" && o.status !== "cancelled")`.

### C3. No cancel action for orders (`page.tsx:982–1020`)
Managers cannot cancel a `pending` or `accepted` order from the UI. If a customer calls to cancel or if payment fails, staff are stuck — the order stays `pending` forever. There is no cancel button anywhere in `OrderCard`.

**Fix:** Add a Cancel button (with confirmation) for manager on `pending` and `accepted` orders. Call `patchOrder(id, { status: "cancelled" })`.

### C4. `cancelled` orders missing from status filter (`page.tsx:378`)
The manager filter pills go: `all | pending | accepted | preparing | ready | picked_up`. The `cancelled` status exists in `STATUS_COLORS` and `OrderStatus` but has no filter pill. Managers cannot view or audit cancelled orders.

**Fix:** Add `cancelled` to the filter array at line 378.

---

## High — Significant Functionality Gaps

### H1. Inventory panel only tracks products that have appeared in orders (`page.tsx:194–218`)
```ts
readOrders().filter((o) => o.branch === branchId).forEach((o) =>
  o.items.forEach((item) => { seen.set(item.productId, ...) })
);
```
A new branch with no orders sees an empty inventory panel. Any product that hasn't been ordered yet — even if it's physically on the shelf — is invisible. The panel title says "Tracked Products" but there's no way to manually add a product to track.

**Fix:** Load the full product catalog and merge with existing inventory entries. Use `getBranchInventoryEntries()` as the base, then fall back to products from `getProducts()` for names. At minimum, products that have an inventory record (from prior stock operations) should always show.

### H2. No way to set a specific stock quantity (`page.tsx:572–591`, `InventoryPanel`)
Inventory only supports binary toggle: in-stock (50 default) or out-of-stock (0). There is no input to set the actual quantity (e.g., "we have 12 units left"). A real supermarket needs real stock numbers.

**Fix:** Add a quantity input field per row, with a save button. Wire to a `setStock(branchId, productId, quantity)` function in `inventory.ts`.

### H3. Products tab is only accessible in Demo/Manager mode (`page.tsx:338–357`)
The Products tab is shown for both manager and staff roles in the tab nav, but `ProductsPanel` performs no role check — any staff member can add/edit/delete products. This is a security gap for a real deployment.

**Fix:** Gate the Products tab rendering and visibility behind `role === "manager"`.

### H4. No order search or date filter (`page.tsx:372–445`)
With many orders, finding a specific one requires scrolling through everything. There is no search by customer name, order ID, or date range filter.

**Fix:** Add a search input above the order list that filters by `order.userName`, `order.id`, or `order.userPhone`.

---

## Medium — UX Friction

### M1. Inline `<style>` tag for `.action-btn` (`page.tsx:1026–1037`)
Each `OrderCard` injects a `<style>` tag into the DOM. With many orders expanded simultaneously, this duplicates the same CSS block N times.

**Fix:** Replace with a Tailwind `className` string or a top-level CSS class. Something like `className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg transition-colors"`.

### M2. No confirmation on destructive inventory actions (`page.tsx:454–455`)
Clicking "Mark Out of Stock" immediately fires without any confirmation. Accidental taps on mobile will wrongly zero out stock.

**Fix:** Require a second click to confirm, or use the existing two-step delete pattern from `ProductRow`.

### M3. Stats bar shows 0 for everything when switching branches (`page.tsx:190`)
`getBranchStats(branchId)` is called at render time but `orders` state lags one render behind. Stats display stale zeros until the next `reload()` settles.

**Fix:** Derive stats from the `orders` state array directly, not from `getBranchStats()`, or ensure stats update in the same tick as orders.

### M4. Empty inventory message is hardcoded English (`page.tsx:543–548`)
```ts
"No products tracked yet — stock updates when orders are placed."
"Stock is deducted automatically when customers place orders."
```
Two strings in `InventoryPanel` are not run through `t.*`. They will appear in English regardless of the user's language setting.

**Fix:** Add keys to `i18n.ts` and use `t.inventoryEmpty` / `t.inventoryEmptyHint`.

### M5. Cancel button label in ProductModal is hardcoded English (`ProductsPanel.tsx:598`)
```tsx
<button onClick={onClose}>Cancel</button>
```
This should use `t.cancel` or a close label from i18n.

### M6. ProductModal has no keyboard trap or `role="dialog"` (`ProductsPanel.tsx:475`)
Opening the add/edit modal does not move focus into it. Pressing Escape does not close it. Tab key escapes the modal and reaches the page beneath. This is both a UX and accessibility issue.

**Fix:** Add `role="dialog" aria-modal="true" aria-labelledby="modal-title"`. Add an `useEffect` that listens for `keydown.Escape` and calls `onClose`. Move focus to the first input on open.

### M7. No visual feedback for order status progression
The order timeline (pending → accepted → preparing → ready → picked_up) is not visualised. Managers looking at an order card can't immediately tell how far along it is in the workflow.

**Fix:** Add a small step-indicator or progress bar inside the expanded order card showing where in the lifecycle the order sits.

---

## Low — Polish & Minor Issues

### L1. Stats bar is always manager-only but Products tab also has stats
Stats bar (line 320) renders `role === "manager"` but staff mode also has a stats section inside `InventoryPanel`. The stat cards have slightly different styling between the two contexts. Unify into a shared `StatCard` component (already partially done in `ProductsPanel`).

### L2. Role selector should be hidden when `staffUser.role === "staff"` (`page.tsx:293–308`)
A logged-in staff member can switch to Manager view and accept/cancel orders they shouldn't. The role toggle should be hidden (or show as read-only) when the authenticated user is `role === "staff"`.

### L3. `timeAgo` shows `undefined` for orders without `createdAt` (`page.tsx:124`)
If an order somehow lacks `createdAt` (legacy data), `new Date(iso).getTime()` returns `NaN`, and `timeAgo` returns `NaN m ago`.

### L4. Pickup time shown as `order.pickupTime` without date context in the card header (`page.tsx:903`)
```tsx
<p className="text-[10px] text-gray-400">Pickup: {order.pickupTime}</p>
```
Only shows time, not date. For orders with future pickup dates, this is ambiguous.

**Fix:** Show `{order.pickupDate} {order.pickupTime}` or a relative date.

### L5. `assignedStaffName` shown in order details but not in collapsed card header
Staff assignment is only visible after expanding an order. A manager scanning the list can't see at a glance which orders are assigned vs unassigned.

**Fix:** Show the staff avatar/initials badge in the collapsed card summary row.

---

## Quick Wins (< 5 min each)

1. Add `cancelled` to the filter pills array (one-liner)
2. Fix staff view filter to use `assignedStaffId === staffId` (one-liner)
3. Replace hardcoded "Cancel" button with `t.cancel` in `ProductModal`
4. Hide Products tab when `role === "staff"`
5. Hide role toggle when `staffUser.role === "staff"` and not demo mode
6. Show `pickupDate + pickupTime` in collapsed card header instead of just time
7. Add `aria-label` to all icon-only action buttons in `OrderCard`

---

## Implementation Priority

| # | Fix | Impact | Effort |
|---|-----|--------|--------|
| 1 | C1: Hide/delete catalog products | Critical | Medium |
| 2 | C2: Fix staff view filter | Critical | Low |
| 3 | C3: Add cancel order action | Critical | Low |
| 4 | C4: Add cancelled filter pill | High | Low |
| 5 | H2: Stock quantity input | High | Medium |
| 6 | M6: ProductModal keyboard trap + dialog role | High | Low |
| 7 | M2: Confirmation on out-of-stock toggle | Medium | Low |
| 8 | H3: Gate Products tab to manager only | Medium | Low |
| 9 | L2: Hide role toggle for staff users | Low | Low |
| 10 | L5: Show assigned staff in collapsed card | Low | Low |
