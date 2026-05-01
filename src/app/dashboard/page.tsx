"use client";
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BRANCHES } from "@/lib/branches";
import { readOrders, patchOrder, Order, OrderStatus, getBranchStats } from "@/lib/orders";
import { markOutOfStock, restoreStock, getStock, setStock, getBranchInventoryEntries } from "@/lib/inventory";
import { useLang } from "@/lib/LanguageContext";
import { useStaffUser } from "@/lib/staffAuth";
import { formatPrice } from "@/lib/products";
import {
  Store, ChevronDown, Check, Clock, Package, User,
  AlertTriangle, RotateCcw, Loader2, Star, Boxes, LogOut, LogIn, ShoppingBag, XCircle,
} from "lucide-react";
import { ProductsPanel } from "./ProductsPanel";
import { useToast } from "@/components/Toast";

const DEMO_STAFF = [
  { id: "staff-1", name: "Alice Uwimana" },
  { id: "staff-2", name: "Bob Nkurunziza" },
  { id: "staff-3", name: "Carol Mukandayisenga" },
  { id: "staff-4", name: "David Habimana" },
];

const DEMO_MANAGER_USER = {
  id: "demo-manager",
  name: "Demo Manager",
  email: "manager@simba.rw",
  phone: "+250 788 000 000",
  role: "manager" as const,
  branchId: "centenary",
};

function seedDemoOrders(): void {
  if (typeof window === "undefined") return;
  try {
    const KEY = "simba-orders";
    if (JSON.parse(localStorage.getItem(KEY) || "[]").length > 0) return;
    const now = new Date();
    const fmt = (d: Date) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const iso = (d: Date) => d.toISOString();
    const ago = (ms: number) => new Date(now.getTime() - ms);
    const demo: Order[] = [
      {
        id: "ORD-DEMO01", userId: "demo-1", userName: "Alice Uwimana",
        userPhone: "+250 788 111 222", userEmail: "alice@demo.rw",
        items: [
          { productId: 101, productName: "Basso Extra Virgin Olive Oil 250ml", price: 4500, quantity: 2, image: "", unit: "bottle" },
          { productId: 102, productName: "Simba Mbili Curry Powder 100g", price: 950, quantity: 3, image: "", unit: "pack" },
        ],
        branch: "centenary", branchLabel: "Simba Centenary",
        pickupDate: fmt(now), pickupTime: "14:00",
        paymentMethod: "momo", subtotal: 11850, depositPaid: 500,
        status: "pending", createdAt: iso(ago(1800000)), updatedAt: iso(ago(1800000)),
      },
      {
        id: "ORD-DEMO02", userId: "demo-2", userName: "Bob Nkurunziza",
        userPhone: "+250 788 333 444", userEmail: "bob@demo.rw",
        items: [
          { productId: 103, productName: "American Light Meat Tuna 185g", price: 2200, quantity: 4, image: "", unit: "can" },
          { productId: 104, productName: "Gold Band Margarine 500g", price: 2100, quantity: 2, image: "", unit: "tub" },
        ],
        branch: "centenary", branchLabel: "Simba Centenary",
        pickupDate: fmt(now), pickupTime: "15:30",
        paymentMethod: "cash", subtotal: 13000, depositPaid: 500,
        status: "accepted", assignedStaffId: "staff-1", assignedStaffName: "Alice Uwimana",
        createdAt: iso(ago(3600000)), updatedAt: iso(ago(1200000)),
      },
      {
        id: "ORD-DEMO03", userId: "demo-3", userName: "Carol Mukandayisenga",
        userPhone: "+250 788 555 666", userEmail: "carol@demo.rw",
        items: [
          { productId: 105, productName: "Ayin Toilet Paper 500 Sheets", price: 3800, quantity: 3, image: "", unit: "pack" },
          { productId: 106, productName: "Belle France Whisky 700ml", price: 12000, quantity: 1, image: "", unit: "bottle" },
        ],
        branch: "centenary", branchLabel: "Simba Centenary",
        pickupDate: fmt(new Date(now.getTime() + 3600000)), pickupTime: "11:00",
        paymentMethod: "momo", subtotal: 23400, depositPaid: 1000,
        status: "preparing", assignedStaffId: "staff-2", assignedStaffName: "Bob Nkurunziza",
        createdAt: iso(ago(7200000)), updatedAt: iso(ago(3600000)),
      },
      {
        id: "ORD-DEMO04", userId: "demo-4", userName: "David Habimana",
        userPhone: "+250 788 777 888", userEmail: "david@demo.rw",
        items: [
          { productId: 107, productName: "Amarula 1lt", price: 15000, quantity: 1, image: "", unit: "bottle" },
          { productId: 108, productName: "Azam HBF Wheat Flour 2kg", price: 1800, quantity: 3, image: "", unit: "bag" },
        ],
        branch: "centenary", branchLabel: "Simba Centenary",
        pickupDate: fmt(new Date(now.getTime() + 7200000)), pickupTime: "16:00",
        paymentMethod: "momo", subtotal: 20400, depositPaid: 1000,
        status: "ready", assignedStaffId: "staff-3", assignedStaffName: "Carol Mukandayisenga",
        createdAt: iso(ago(14400000)), updatedAt: iso(ago(1800000)),
      },
    ];
    localStorage.setItem(KEY, JSON.stringify(demo));
  } catch { /* ignore */ }
}

type Role = "manager" | "staff";

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  accepted: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  preparing: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
  ready: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  picked_up: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  cancelled: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
};

import type { Translations } from "@/lib/i18n";

function getStatusLabels(t: Translations): Record<OrderStatus, string> {
  return {
    pending: t.statusPending,
    accepted: t.statusAccepted,
    preparing: t.statusPreparing,
    ready: t.statusReady,
    picked_up: t.statusPickedUp,
    cancelled: t.statusCancelled,
  };
}

function timeAgo(iso: string, t: Translations): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t.timeJustNow;
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

async function sendNotification(
  type: string,
  to: string,
  data: Record<string, unknown>
): Promise<void> {
  try {
    await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, to, data }),
    });
  } catch {
    // fire-and-forget — don't block UI on email failure
  }
}

export default function DashboardPage() {
  const { t } = useLang();
  const router = useRouter();
  const { toast } = useToast();
  const { staffUser, signOut } = useStaffUser();

  const [role, setRole] = useState<Role>("manager");
  const [branchId, setBranchId] = useState(BRANCHES[0].id);
  const [staffId, setStaffId] = useState(DEMO_STAFF[0].id);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<"orders" | "inventory" | "products">("orders");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [refresh, setRefresh] = useState(0);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isDemoMode = !staffUser || (staffUser.role !== "manager" && staffUser.role !== "staff");
  const effectiveUser = isDemoMode ? DEMO_MANAGER_USER : staffUser!;

  useEffect(() => {
    if (isDemoMode) {
      seedDemoOrders();
    } else {
      if (staffUser!.role === "staff") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRole("staff");
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (staffUser!.id) setStaffId(staffUser!.id);
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (staffUser!.branchId) setBranchId(staffUser!.branchId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoMode]);

  const reload = useCallback(() => {
    if (isDemoMode) seedDemoOrders();
    const all = readOrders().filter((o) => o.branch === branchId);
    setOrders(all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, [branchId, isDemoMode]);

  useEffect(() => {
    reload();
  }, [reload, refresh]);

  const stats = getBranchStats(branchId);

  // Re-derive inventory items when the tab opens or branch/refresh changes
  const inventoryItems = useMemo(() => {
    // Collect products from orders
    const seen = new Map<number, { productId: number; productName: string; image: string }>();
    readOrders()
      .filter((o) => o.branch === branchId)
      .forEach((o) =>
        o.items.forEach((item) => {
          if (!seen.has(item.productId)) {
            seen.set(item.productId, { productId: item.productId, productName: item.productName, image: item.image });
          }
        })
      );

    // Also surface products that have an explicit inventory entry (e.g., deducted at checkout)
    // We can only show them if we have their name from an order
    const invEntries = getBranchInventoryEntries(branchId);
    for (const pid of Object.keys(invEntries)) {
      const id = Number(pid);
      if (!seen.has(id)) {
        // No name available from orders — skip (we can't display a nameless product)
      }
    }

    return Array.from(seen.values());
    // activeTab included so the panel refreshes when the user switches to it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId, refresh, activeTab]);

  const filtered =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  const visibleOrders =
    role === "staff"
      ? filtered.filter((o) => o.assignedStaffId === staffId || (statusFilter === "pending" && !o.assignedStaffId))
      : filtered;

  async function doAction(orderId: string, fn: () => void, message?: string) {
    setActionLoading(orderId);
    await new Promise((r) => setTimeout(r, 400));
    fn();
    setRefresh((n) => n + 1);
    setActionLoading(null);
    if (message) toast(message);
  }

  async function doCancel(orderId: string) {
    await doAction(orderId, () => patchOrder(orderId, { status: "cancelled" }), "Order cancelled");
  }

  async function doDelete(orderId: string) {
    await doAction(orderId, () => {
      const { deleteOrder } = require("@/lib/orders");
      deleteOrder(orderId);
    }, "Order deleted permanently");
  }

  async function doReady(order: Order) {
    await doAction(order.id, () => patchOrder(order.id, { status: "ready" }), "Order ready for pickup — customer notified");
    if (order.userEmail) {
      sendNotification("order_ready", order.userEmail, {
        orderId: order.id,
        userName: order.userName,
        branchLabel: order.branchLabel,
        pickupDate: order.pickupDate,
        pickupTime: order.pickupTime,
        items: order.items.map((i) => ({ productName: i.productName, quantity: i.quantity })),
        amountDue: Math.max(0, order.subtotal - order.depositPaid),
      });
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <Store className="w-7 h-7 text-orange-600" /> {t.dashboard}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 flex items-center gap-2 flex-wrap">
              {effectiveUser.name} · {effectiveUser.role === "manager" ? t.managerView : t.staffView}
              {isDemoMode && (
                <span className="inline-block text-[10px] font-black bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Demo
                </span>
              )}
            </p>
          </div>

          {/* Sign out / Login */}
          {isDemoMode ? (
            <Link
              href="/staff/login"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/50 text-xs font-bold text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" /> {t.staffLogin}
            </Link>
          ) : (
            <button
              onClick={() => { signOut(); router.replace("/staff/login"); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" /> {t.signOut}
            </button>
          )}
        </div>

        {/* Controls row */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {/* Role selector — hidden for authenticated staff (they can't switch to manager) */}
          {(isDemoMode || effectiveUser.role === "manager") && (
            <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              {(["manager", "staff"] as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold transition-colors ${
                    role === r
                      ? "bg-orange-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {r === "manager" ? t.managerView : t.staffView}
                </button>
              ))}
            </div>
          )}

          {/* Branch selector */}
          <BranchSelect value={branchId} onChange={setBranchId} />

          {/* Staff selector (staff mode only) */}
          {role === "staff" && (
            <StaffSelect value={staffId} onChange={setStaffId} />
          )}
        </div>
      </div>

      {/* Stats bar (manager only) */}
      {role === "manager" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {[
            { label: t.totalOrders, value: stats.total, color: "text-gray-900 dark:text-white" },
            { label: t.statusPending, value: stats.pending, color: "text-amber-600" },
            { label: t.statusPreparing, value: stats.preparing, color: "text-orange-600" },
            { label: t.statusReady, value: stats.ready, color: "text-green-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 text-center">
              <p className={`text-3xl font-black ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab navigation */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit overflow-x-auto">
        {(
          [
            { id: "orders", icon: <Package className="w-4 h-4" />, label: t.ordersTab },
            { id: "inventory", icon: <Boxes className="w-4 h-4" />, label: t.inventoryTab },
            ...(role === "manager" ? [{ id: "products" as const, icon: <ShoppingBag className="w-4 h-4" />, label: t.productsTab }] : []),
          ] as { id: "orders" | "inventory" | "products"; icon: React.ReactNode; label: string }[]
        ).map(({ id, icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
              activeTab === id
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Rating (if reviews exist) */}
      {activeTab === "orders" && role === "manager" && stats.reviewCount > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/40 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          <span className="font-bold text-yellow-800 dark:text-yellow-300">
            Branch Rating: {stats.avgRating.toFixed(1)} / 5
          </span>
          <span className="text-sm text-yellow-700 dark:text-yellow-400">
            ({stats.reviewCount} {stats.reviewCount === 1 ? "review" : "reviews"})
          </span>
        </div>
      )}

      {/* ── Orders tab ── */}
      {activeTab === "orders" && (
        <>
          {/* Status filter tabs (manager only) */}
          {role === "manager" && (
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
              {(["all", "pending", "accepted", "preparing", "ready", "picked_up", "cancelled"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition-colors ${
                    statusFilter === s
                      ? "bg-orange-600 border-orange-600 text-white"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-orange-300"
                  }`}
                >
                  {s === "all" ? t.allOrders : getStatusLabels(t)[s]}
                </button>
              ))}
            </div>
          )}

          {/* Staff view header */}
          {role === "staff" && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-2xl p-4 mb-6">
              <p className="font-bold text-blue-800 dark:text-blue-300 text-sm">
                {t.showingOrdersFor}: <span className="text-blue-600">{DEMO_STAFF.find(s => s.id === staffId)?.name}</span>
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {visibleOrders.length} {visibleOrders.length !== 1 ? t.items : t.item}
              </p>
            </div>
          )}

          {/* Orders list */}
          {visibleOrders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="font-bold text-gray-500 dark:text-gray-400">
                {role === "staff" ? t.noOrdersAssigned : t.noOrdersFound}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {visibleOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  role={role}
                  branchId={branchId}
                  expanded={expandedOrder === order.id}
                  onToggle={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  loading={actionLoading === order.id}
                  onAccept={() => doAction(order.id, () => patchOrder(order.id, { status: "accepted" }), "Order accepted")}
                  onAssign={(staffMemberId, name) =>
                    doAction(order.id, () =>
                      patchOrder(order.id, { status: "accepted", assignedStaffId: staffMemberId, assignedStaffName: name }),
                      `Order assigned to ${name}`
                    )
                  }
                  onPreparing={() => doAction(order.id, () => patchOrder(order.id, { status: "preparing" }), "Order is being prepared")}
                  onReady={() => doReady(order)}
                  onPickedUp={() => doAction(order.id, () => patchOrder(order.id, { status: "picked_up" }), "Order marked as collected")}
                  onCancel={() => doCancel(order.id)}
                  onDelete={() => doDelete(order.id)}
                  onOutOfStock={(productId) =>
                    doAction(order.id, () => markOutOfStock(branchId, productId), "Product marked out of stock")
                  }
                  onRestoreStock={(productId) =>
                    doAction(order.id, () => restoreStock(branchId, productId), "Stock restored")
                  }
                  getStock={(productId) => getStock(branchId, productId)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Inventory tab ── */}
      {activeTab === "inventory" && (
        <InventoryPanel
          branchId={branchId}
          items={inventoryItems}
          onMarkOutOfStock={(productId) => { markOutOfStock(branchId, productId); setRefresh((n) => n + 1); toast("Product marked out of stock"); }}
          onRestoreStock={(productId) => { restoreStock(branchId, productId); setRefresh((n) => n + 1); toast("Stock restored"); }}
          onSetStock={(productId, qty) => { setStock(branchId, productId, qty); setRefresh((n) => n + 1); toast(`Stock updated to ${qty} units`); }}
          getStock={(productId) => getStock(branchId, productId)}
        />
      )}

      {/* ── Products tab ── */}
      {activeTab === "products" && <ProductsPanel />}
    </div>
  );
}

// ── Inventory panel ──────────────────────────────────────────────────────────

interface InventoryItem {
  productId: number;
  productName: string;
  image: string;
}

function InventoryPanel({
  branchId,
  items,
  onMarkOutOfStock,
  onRestoreStock,
  onSetStock,
  getStock: getStockFn,
}: {
  branchId: string;
  items: InventoryItem[];
  onMarkOutOfStock: (productId: number) => void;
  onRestoreStock: (productId: number) => void;
  onSetStock: (productId: number, qty: number) => void;
  getStock: (productId: number) => number;
}) {
  const [filter, setFilter] = useState<"all" | "in_stock" | "out_of_stock">("all");
  const [editingQty, setEditingQty] = useState<Record<number, string>>({});
  const { t } = useLang();

  const annotated = items
    .map((item) => ({ ...item, stock: getStockFn(item.productId) }))
    .sort((a, b) => a.stock - b.stock);

  const inStockCount = annotated.filter((i) => i.stock > 0).length;
  const outOfStockCount = annotated.filter((i) => i.stock === 0).length;

  const filteredItems =
    filter === "all" ? annotated
    : filter === "out_of_stock" ? annotated.filter((i) => i.stock === 0)
    : annotated.filter((i) => i.stock > 0);

  function commitQty(productId: number) {
    const raw = editingQty[productId];
    if (raw === undefined) return;
    const qty = parseInt(raw, 10);
    if (!isNaN(qty) && qty >= 0) onSetStock(productId, qty);
    setEditingQty((prev) => { const n = { ...prev }; delete n[productId]; return n; });
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        {[
          { label: t.trackedProducts, value: annotated.length, color: "text-gray-900 dark:text-white" },
          { label: t.inStockLabel, value: inStockCount, color: "text-green-600" },
          { label: t.outOfStock, value: outOfStockCount, color: "text-orange-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-3 sm:p-4 text-center">
            <p className={`text-2xl sm:text-3xl font-black ${color}`}>{value}</p>
            <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {(["all", "in_stock", "out_of_stock"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition-colors ${
              filter === f
                ? "bg-orange-600 border-orange-600 text-white"
                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-orange-300"
            }`}
          >
            {f === "all" ? t.allProducts : f === "in_stock" ? t.inStockLabel : t.outOfStock}
          </button>
        ))}
      </div>

      {/* Product list */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16">
          <Boxes className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="font-bold text-gray-500 dark:text-gray-400">
            {items.length === 0 ? t.inventoryEmpty : t.noOrdersFound}
          </p>
          {items.length === 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{t.inventoryEmptyHint}</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => {
            const isEditingThis = editingQty[item.productId] !== undefined;
            return (
              <div
                key={item.productId}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 flex items-center gap-3 sm:gap-4"
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0">
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{item.productName}</p>
                  <p className={`text-xs font-medium ${item.stock === 0 ? "text-orange-600" : "text-green-600"}`}>
                    {item.stock === 0 ? t.outOfStock : `${item.stock} ${t.stockQtyLabel.toLowerCase()}`}
                  </p>
                </div>
                {/* Qty input (shown when editing) */}
                {isEditingThis ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <input
                      type="number"
                      min="0"
                      value={editingQty[item.productId]}
                      onChange={(e) => setEditingQty((prev) => ({ ...prev, [item.productId]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === "Enter") commitQty(item.productId); if (e.key === "Escape") setEditingQty((prev) => { const n = { ...prev }; delete n[item.productId]; return n; }); }}
                      className="w-16 px-2 py-1 rounded-lg border border-orange-400 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      autoFocus
                    />
                    <button
                      onClick={() => commitQty(item.productId)}
                      aria-label={t.updateStock}
                      className="p-1.5 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingQty((prev) => { const n = { ...prev }; delete n[item.productId]; return n; })}
                      aria-label="Cancel"
                      className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-1.5 shrink-0">
                    {/* Set quantity button */}
                    <button
                      onClick={() => setEditingQty((prev) => ({ ...prev, [item.productId]: String(item.stock) }))}
                      aria-label={t.updateStock}
                      title={t.updateStock}
                      className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </button>
                    {item.stock > 0 ? (
                      <button
                        onClick={() => onMarkOutOfStock(item.productId)}
                        aria-label={t.outOfStockMark}
                        className="inline-flex items-center gap-1 sm:gap-1.5 text-xs font-bold px-2 sm:px-3 py-1.5 bg-orange-50 dark:bg-orange-950 text-orange-600 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors"
                      >
                        <AlertTriangle className="w-3 h-3" />
                        <span className="hidden sm:inline">{t.outOfStockMark}</span>
                        <span className="sm:hidden">Out</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onRestoreStock(item.productId)}
                        aria-label={t.restoreStock}
                        className="inline-flex items-center gap-1 sm:gap-1.5 text-xs font-bold px-2 sm:px-3 py-1.5 bg-green-50 dark:bg-green-950 text-green-600 rounded-lg hover:bg-green-100 dark:hover:bg-green-900 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span className="hidden sm:inline">{t.restoreStock}</span>
                        <span className="sm:hidden">{t.restore}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Custom dropdown components ────────────────────────────────────────────────

const DISTRICT_STYLE = {
  Nyarugenge: { dot: "bg-orange-500", header: "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300", stripe: "bg-orange-500" },
  Gasabo:     { dot: "bg-emerald-500", header: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300", stripe: "bg-emerald-500" },
  Kicukiro:   { dot: "bg-blue-500", header: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300", stripe: "bg-blue-500" },
} as const;

const STAFF_COLORS = ["bg-purple-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500"];

function shortBranch(label: string) {
  return label.replace("Simba Supermarket ", "").replace("Simba ", "");
}

function staffInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function BranchSelect({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useLang();
  const selected = BRANCHES.find(b => b.id === value);

  const districts = ["Nyarugenge", "Gasabo", "Kicukiro"] as const;
  const flatOptions = BRANCHES;

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  useEffect(() => {
    if (!open) setHighlightedIndex(0);
  }, [open]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    switch (e.key) {
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(i => (i + 1) % flatOptions.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(i => (i - 1 + flatOptions.length) % flatOptions.length);
        break;
      case "Enter":
        e.preventDefault();
        if (flatOptions[highlightedIndex]) {
          onChange(flatOptions[highlightedIndex].id);
          setOpen(false);
        }
        break;
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        onKeyDown={handleKeyDown}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t.selectBranch}
        className="flex items-center gap-2 pl-3 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-bold text-gray-700 dark:text-gray-300 hover:border-orange-300 dark:hover:border-orange-700 transition-all"
      >
        {selected && <div className={`w-2 h-2 rounded-full shrink-0 ${DISTRICT_STYLE[selected.district].dot}`} />}
        <span className="truncate max-w-[120px] sm:max-w-[140px]">{selected ? shortBranch(selected.label) : t.selectBranch}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div 
          role="listbox" 
          aria-label={t.selectBranch}
          className="absolute right-0 top-full mt-2 z-50 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-y-auto animate-in slide-in-from-top-2 fade-in duration-200 min-w-[220px] max-h-[320px]"
        >
          {districts.map(district => {
            const style = DISTRICT_STYLE[district];
            return (
              <div key={district}>
                <div className={`flex items-center gap-2 px-3 py-1.5 ${style.header}`}>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
                  <span className="text-[10px] font-black uppercase tracking-wider">{district}</span>
                </div>
                {BRANCHES.filter(b => b.district === district).map((b, idx) => {
                  const flatIdx = flatOptions.findIndex(o => o.id === b.id);
                  return (
                    <button
                      key={b.id}
                      role="option"
                      aria-selected={value === b.id}
                      onClick={() => { onChange(b.id); setOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors ${
                        value === b.id
                          ? "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 font-bold"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 font-medium"
                      } ${highlightedIndex === flatIdx ? "ring-2 ring-orange-500 ring-inset" : ""}`}
                    >
                      <div className={`w-1 h-4 rounded-full shrink-0 ${value === b.id ? style.stripe : "bg-gray-200 dark:bg-gray-700"}`} />
                      <span className="flex-1 truncate">{shortBranch(b.label)}</span>
                      {value === b.id && <Check className="w-3.5 h-3.5 shrink-0 text-orange-600" />}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StaffSelect({
  value,
  onChange,
  compact = false,
  menuLeft = false,
}: {
  value: string;
  onChange: (id: string) => void;
  compact?: boolean;
  menuLeft?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useLang();
  const selectedIdx = DEMO_STAFF.findIndex(s => s.id === value);
  const selected = DEMO_STAFF[selectedIdx];

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  useEffect(() => {
    if (!open) setHighlightedIndex(0);
  }, [open]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    switch (e.key) {
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(i => (i + 1) % DEMO_STAFF.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(i => (i - 1 + DEMO_STAFF.length) % DEMO_STAFF.length);
        break;
      case "Enter":
        e.preventDefault();
        if (DEMO_STAFF[highlightedIndex]) {
          onChange(DEMO_STAFF[highlightedIndex].id);
          setOpen(false);
        }
        break;
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        onKeyDown={handleKeyDown}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t.selectStaff}
        className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-bold text-gray-700 dark:text-gray-300 hover:border-orange-300 dark:hover:border-orange-700 transition-all ${compact ? "w-full" : ""}`}
      >
        {selected && (
          <div className={`w-6 h-6 rounded-full ${STAFF_COLORS[selectedIdx % STAFF_COLORS.length]} flex items-center justify-center shrink-0`}>
            <span className="text-[9px] font-black text-white">{staffInitials(selected.name)}</span>
          </div>
        )}
        <span className={`truncate font-bold flex-1 ${compact ? "" : "max-w-[110px]"}`}>
          {selected ? (compact ? selected.name.split(" ")[0] : selected.name) : t.selectStaff}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div 
          role="listbox" 
          aria-label={t.selectStaff}
          className={`absolute ${menuLeft ? "left-0" : "left-0 sm:left-auto sm:right-0"} top-full mt-2 z-50 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 animate-in slide-in-from-top-2 fade-in duration-200 min-w-[200px]`}
        >
          <div className="p-1.5 space-y-0.5">
            {DEMO_STAFF.map((s, i) => (
              <button
                role="option"
                aria-selected={value === s.id}
                key={s.id}
                onClick={() => { onChange(s.id); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-colors ${
                  value === s.id
                    ? "bg-orange-50 dark:bg-orange-950/30"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/60"
                } ${highlightedIndex === i ? "ring-2 ring-orange-500 ring-inset" : ""}`}
              >
                <div className={`w-8 h-8 rounded-full ${STAFF_COLORS[i % STAFF_COLORS.length]} flex items-center justify-center shrink-0`}>
                  <span className="text-[10px] font-black text-white">{staffInitials(s.name)}</span>
                </div>
                <span className={`flex-1 font-bold truncate ${value === s.id ? "text-orange-700 dark:text-orange-400" : "text-gray-900 dark:text-white"}`}>
                  {s.name}
                </span>
                {value === s.id && <Check className="w-3.5 h-3.5 shrink-0 text-orange-600" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface OrderCardProps {
  order: Order;
  role: Role;
  branchId: string;
  expanded: boolean;
  loading: boolean;
  onToggle: () => void;
  onAccept: () => void;
  onAssign: (staffId: string, name: string) => void;
  onPreparing: () => void;
  onReady: () => void;
  onPickedUp: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onOutOfStock: (productId: number) => void;
  onRestoreStock: (productId: number) => void;
  getStock: (productId: number) => number;
}

function OrderCard({
  order, role, expanded, loading, onToggle,
  onAccept, onAssign, onPreparing, onReady, onPickedUp, onCancel, onDelete,
  onOutOfStock, onRestoreStock, getStock,
}: OrderCardProps) {
  const { t } = useLang();
  const statusLabels = getStatusLabels(t);
  const [assignStaff, setAssignStaff] = useState(DEMO_STAFF[0].id);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const detailsId = `order-details-${order.id}`;

  const canCancel = role === "manager" && (order.status === "pending" || order.status === "accepted");
  const canDelete = role === "manager" && (order.status === "cancelled" || order.status === "picked_up");

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Summary row */}
      <button
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={detailsId}
        className="w-full flex items-center gap-3 sm:gap-4 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-t-2xl"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-sm text-gray-900 dark:text-white font-mono">{order.id}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>
              {statusLabels[order.status]}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <User className="w-3 h-3" /> {order.userName}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Package className="w-3 h-3" /> {order.items.length} item{order.items.length !== 1 ? "s" : ""}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {timeAgo(order.createdAt, t)}
            </span>
            {order.assignedStaffName && (
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                <User className="w-3 h-3" /> {order.assignedStaffName}
              </span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="font-black text-gray-900 dark:text-white text-sm">{formatPrice(order.subtotal)}</p>
          <p className="text-[10px] text-gray-400">Pickup: {order.pickupDate} {order.pickupTime}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${expanded ? "rotate-180" : ""}`} />
      </button>

      {/* Expanded details */}
      {expanded && (
        <div id={detailsId} className="border-t border-gray-100 dark:border-gray-700 p-4 space-y-4">
          {/* Items */}
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t.items}</p>
            <div className="space-y-2">
              {order.items.map((item) => {
                const stock = getStock(item.productId);
                return (
                  <div key={item.productId} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.productName}</p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity} × {formatPrice(item.price)} · {t.inStockLabel}: {stock > 0 ? stock : t.outOfStock}
                      </p>
                    </div>
                    {role === "staff" && (
                      <div className="flex gap-1.5 shrink-0">
                        {stock > 0 ? (
                          <button
                            onClick={() => onOutOfStock(item.productId)}
                            className="text-[10px] font-bold px-2 py-1 bg-orange-50 dark:bg-orange-950 text-orange-600 rounded-lg hover:bg-orange-100 flex items-center gap-1"
                          >
                            <AlertTriangle className="w-2.5 h-2.5" /> {t.outOfStockMark}
                          </button>
                        ) : (
                          <button
                            onClick={() => onRestoreStock(item.productId)}
                            className="text-[10px] font-bold px-2 py-1 bg-green-50 dark:bg-green-950 text-green-600 rounded-lg hover:bg-green-100 flex items-center gap-1"
                          >
                            <RotateCcw className="w-2.5 h-2.5" /> {t.restore}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer info */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-xs space-y-1">
            <p><span className="text-gray-500">{t.customerLabel}:</span> <span className="font-bold text-gray-900 dark:text-white">{order.userName}</span></p>
            <p><span className="text-gray-500">{t.phone}:</span> <span className="font-bold text-gray-900 dark:text-white">{order.userPhone}</span></p>
            <p><span className="text-gray-500">{t.pickupAt}:</span> <span className="font-bold text-gray-900 dark:text-white">{order.pickupDate} {t.atLabel} {order.pickupTime}</span></p>
            <p><span className="text-gray-500">{t.paymentMethod}:</span> <span className="font-bold text-gray-900 dark:text-white capitalize">{order.paymentMethod}</span></p>
            <p><span className="text-gray-500">{t.deposit}:</span> <span className="font-bold text-green-600">{formatPrice(order.depositPaid)}</span></p>
            {order.assignedStaffName && (
              <p><span className="text-gray-500">{t.assignedTo}:</span> <span className="font-bold text-blue-600">{order.assignedStaffName}</span></p>
            )}
          </div>

          {/* Review */}
          {order.review && (
            <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-xl p-3 text-xs">
              <div className="flex items-center gap-1 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < order.review!.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />
                ))}
                <span className="text-gray-500 ml-1">{order.review.rating}/5</span>
              </div>
              {order.review.comment && <p className="text-gray-700 dark:text-gray-300 italic">&ldquo;{order.review.comment}&rdquo;</p>}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {loading ? (
              <span className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" /> {t.processing}
              </span>
            ) : (
              <>
                {role === "manager" && order.status === "pending" && (
                  <>
                    <button onClick={onAccept} className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg transition-colors bg-blue-600 text-white hover:bg-blue-700">
                      <Check className="w-3.5 h-3.5" /> {t.accept}
                    </button>
                    {/* Assign row — full-width on mobile so the dropdown doesn't overflow */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="flex-1 sm:flex-none sm:w-auto">
                        <StaffSelect value={assignStaff} onChange={setAssignStaff} compact menuLeft />
                      </div>
                      <button
                        onClick={() => {
                          const s = DEMO_STAFF.find(s => s.id === assignStaff)!;
                          onAssign(s.id, s.name);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg transition-colors bg-purple-600 text-white hover:bg-purple-700 shrink-0"
                      >
                        {t.assignToStaff}
                      </button>
                    </div>
                  </>
                )}
                {role === "manager" && order.status === "accepted" && (
                  <button onClick={onPreparing} className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg transition-colors bg-orange-600 text-white hover:bg-orange-700">
                    {t.markPreparing}
                  </button>
                )}
                {(role === "manager" || role === "staff") && order.status === "preparing" && (
                  <button onClick={onReady} className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg transition-colors bg-green-600 text-white hover:bg-green-700">
                    <Check className="w-3.5 h-3.5" /> {t.markReady}
                  </button>
                )}
                {role === "manager" && order.status === "ready" && (
                  <button onClick={onPickedUp} className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg transition-colors bg-gray-600 text-white hover:bg-gray-700">
                    <Check className="w-3.5 h-3.5" /> {t.markPickedUp}
                  </button>
                )}
                {/* Cancel order — manager only, pending or accepted */}
                {canCancel && !cancelConfirm && (
                  <button
                    onClick={() => setCancelConfirm(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg transition-colors bg-red-50 dark:bg-red-950/40 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800"
                  >
                    <XCircle className="w-3.5 h-3.5" /> {t.cancelOrder}
                  </button>
                )}
                {canCancel && cancelConfirm && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-red-600">{t.confirmCancelOrder}</span>
                    <button
                      onClick={() => { onCancel(); setCancelConfirm(false); }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                    >
                      <Check className="w-3 h-3" /> Yes
                    </button>
                    <button
                      onClick={() => setCancelConfirm(false)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-colors"
                    >
                      No
                    </button>
                  </div>
                )}
                {/* Delete order — manager only, cancelled or picked up */}
                {canDelete && !deleteConfirm && (
                  <button
                    onClick={() => setDeleteConfirm(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg transition-colors bg-gray-50 dark:bg-gray-900 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 border border-gray-200 dark:border-gray-800"
                  >
                    {t.deletePermanently}
                  </button>
                )}
                {canDelete && deleteConfirm && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-red-600">{t.confirmDeleteRecord}</span>
                    <button
                      onClick={() => { onDelete(); setDeleteConfirm(false); }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                    >
                      <Check className="w-3 h-3" /> {t.yesDelete}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(false)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-colors"
                    >
                      {t.cancel}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
