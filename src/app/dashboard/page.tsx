"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BRANCHES } from "@/lib/branches";
import { readOrders, patchOrder, Order, OrderStatus, getBranchStats } from "@/lib/orders";
import { markOutOfStock, restoreStock, getStock } from "@/lib/inventory";
import { useLang } from "@/lib/LanguageContext";
import { useStaffUser } from "@/lib/staffAuth";
import { formatPrice } from "@/lib/products";
import {
  Store, ChevronDown, Check, Clock, Package, User, LogOut,
  AlertTriangle, RotateCcw, Loader2, Star,
} from "lucide-react";

const DEMO_STAFF = [
  { id: "staff-1", name: "Alice Uwimana" },
  { id: "staff-2", name: "Bob Nkurunziza" },
  { id: "staff-3", name: "Carol Mukandayisenga" },
  { id: "staff-4", name: "David Habimana" },
];

type Role = "manager" | "staff";

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  accepted: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  preparing: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
  ready: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  picked_up: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  cancelled: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  preparing: "Preparing",
  ready: "Ready for Pickup",
  picked_up: "Picked Up",
  cancelled: "Cancelled",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DashboardPage() {
  const { t } = useLang();
  const router = useRouter();
  const { staffUser, signOut } = useStaffUser();
  const [role, setRole] = useState<Role>("manager");
  const [branchId, setBranchId] = useState(BRANCHES[0].id);

  useEffect(() => {
    if (staffUser === null || (staffUser.role !== "manager" && staffUser.role !== "staff")) {
      router.replace("/staff/login");
    } else if (staffUser.role === "staff") {
      setRole("staff");
      if (staffUser.branchId) setBranchId(staffUser.branchId);
    } else if (staffUser.role === "manager" && staffUser.branchId) {
      setBranchId(staffUser.branchId);
    }
  }, [staffUser, router]);
  const [staffId, setStaffId] = useState(DEMO_STAFF[0].id);
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [refresh, setRefresh] = useState(0);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const reload = useCallback(() => {
    const all = readOrders().filter((o) => o.branch === branchId);
    setOrders(all.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }, [branchId]);

  useEffect(() => {
    reload();
  }, [reload, refresh]);

  const stats = getBranchStats(branchId);

  const filtered =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  const visibleOrders =
    role === "staff"
      ? orders.filter((o) => o.status !== "picked_up" && o.status !== "cancelled")
      : filtered;

  async function doAction(orderId: string, fn: () => void) {
    setActionLoading(orderId);
    await new Promise((r) => setTimeout(r, 400));
    fn();
    setRefresh((n) => n + 1);
    setActionLoading(null);
  }

  if (!staffUser || (staffUser.role !== "manager" && staffUser.role !== "staff")) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <Store className="w-7 h-7 text-orange-600" /> {t.dashboard}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {staffUser.name} · {staffUser.role === "manager" ? t.managerView : t.staffView}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3">
          {/* Sign out */}
          <button
            onClick={() => { signOut(); router.replace("/staff/login"); }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-xl hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>

          {/* Role selector */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            {(["manager", "staff"] as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`px-4 py-2 text-sm font-bold transition-colors ${
                  role === r
                    ? "bg-orange-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                {r === "manager" ? t.managerView : t.staffView}
              </button>
            ))}
          </div>

          {/* Branch selector */}
          <div className="relative">
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {BRANCHES.map((b) => (
                <option key={b.id} value={b.id}>{b.label.replace("Simba Supermarket ", "")}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Staff selector (staff mode only) */}
          {role === "staff" && (
            <div className="relative">
              <select
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {DEMO_STAFF.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          )}
        </div>
      </div>

      {/* Stats bar (manager only) */}
      {role === "manager" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Orders", value: stats.total, color: "text-gray-900 dark:text-white" },
            { label: "Pending", value: stats.pending, color: "text-amber-600" },
            { label: "Preparing", value: stats.preparing, color: "text-orange-600" },
            { label: "Ready", value: stats.ready, color: "text-green-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 text-center">
              <p className={`text-3xl font-black ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Rating (if reviews exist) */}
      {role === "manager" && stats.reviewCount > 0 && (
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

      {/* Status filter tabs (manager only) */}
      {role === "manager" && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {(["all", "pending", "accepted", "preparing", "ready", "picked_up"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                statusFilter === s
                  ? "bg-orange-600 border-orange-600 text-white"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-orange-300"
              }`}
            >
              {s === "all" ? "All Orders" : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      )}

      {/* Staff view header */}
      {role === "staff" && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-2xl p-4 mb-6">
          <p className="font-bold text-blue-800 dark:text-blue-300 text-sm">
            Showing orders assigned to: <span className="text-blue-600">{DEMO_STAFF.find(s => s.id === staffId)?.name}</span>
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            {visibleOrders.length} active order{visibleOrders.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Orders list */}
      {visibleOrders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="font-bold text-gray-500 dark:text-gray-400">
            {role === "staff" ? "No orders assigned to you yet" : "No orders found"}
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
              onAccept={() => doAction(order.id, () => patchOrder(order.id, { status: "accepted" }))}
              onAssign={(staffMemberId, name) =>
                doAction(order.id, () =>
                  patchOrder(order.id, { status: "accepted", assignedStaffId: staffMemberId, assignedStaffName: name })
                )
              }
              onPreparing={() => doAction(order.id, () => patchOrder(order.id, { status: "preparing" }))}
              onReady={() => doAction(order.id, () => patchOrder(order.id, { status: "ready" }))}
              onPickedUp={() => doAction(order.id, () => patchOrder(order.id, { status: "picked_up" }))}
              onOutOfStock={(productId) =>
                doAction(order.id, () => markOutOfStock(branchId, productId))
              }
              onRestoreStock={(productId) =>
                doAction(order.id, () => restoreStock(branchId, productId))
              }
              getStock={(productId) => getStock(branchId, productId)}
            />
          ))}
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
  onOutOfStock: (productId: number) => void;
  onRestoreStock: (productId: number) => void;
  getStock: (productId: number) => number;
}

function OrderCard({
  order, role, expanded, loading, onToggle,
  onAccept, onAssign, onPreparing, onReady, onPickedUp,
  onOutOfStock, onRestoreStock, getStock,
}: OrderCardProps) {
  const [assignStaff, setAssignStaff] = useState(DEMO_STAFF[0].id);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      {/* Summary row */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-sm text-gray-900 dark:text-white font-mono">{order.id}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>
              {STATUS_LABELS[order.status]}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <User className="w-3 h-3" /> {order.userName}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Package className="w-3 h-3" /> {order.items.length} item{order.items.length !== 1 ? "s" : ""}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {timeAgo(order.createdAt)}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="font-black text-gray-900 dark:text-white text-sm">{formatPrice(order.subtotal)}</p>
          <p className="text-[10px] text-gray-400">Pickup: {order.pickupTime}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-700 p-4 space-y-4">
          {/* Items */}
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Items</p>
            <div className="space-y-2">
              {order.items.map((item) => {
                const stock = getStock(item.productId);
                return (
                  <div key={item.productId} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.productName}</p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity} × {formatPrice(item.price)} · Stock: {stock > 0 ? stock : "Out of stock"}
                      </p>
                    </div>
                    {role === "staff" && (
                      <div className="flex gap-1.5 shrink-0">
                        {stock > 0 ? (
                          <button
                            onClick={() => onOutOfStock(item.productId)}
                            className="text-[10px] font-bold px-2 py-1 bg-orange-50 dark:bg-orange-950 text-orange-600 rounded-lg hover:bg-orange-100 flex items-center gap-1"
                          >
                            <AlertTriangle className="w-2.5 h-2.5" /> Out of stock
                          </button>
                        ) : (
                          <button
                            onClick={() => onRestoreStock(item.productId)}
                            className="text-[10px] font-bold px-2 py-1 bg-green-50 dark:bg-green-950 text-green-600 rounded-lg hover:bg-green-100 flex items-center gap-1"
                          >
                            <RotateCcw className="w-2.5 h-2.5" /> Restore
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
            <p><span className="text-gray-500">Phone:</span> <span className="font-bold text-gray-900 dark:text-white">{order.userPhone}</span></p>
            <p><span className="text-gray-500">Pickup:</span> <span className="font-bold text-gray-900 dark:text-white">{order.pickupDate} at {order.pickupTime}</span></p>
            <p><span className="text-gray-500">Payment:</span> <span className="font-bold text-gray-900 dark:text-white capitalize">{order.paymentMethod}</span></p>
            <p><span className="text-gray-500">Deposit paid:</span> <span className="font-bold text-green-600">{formatPrice(order.depositPaid)}</span></p>
            {order.assignedStaffName && (
              <p><span className="text-gray-500">Assigned to:</span> <span className="font-bold text-blue-600">{order.assignedStaffName}</span></p>
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
                <Loader2 className="w-4 h-4 animate-spin" /> Processing...
              </span>
            ) : (
              <>
                {role === "manager" && order.status === "pending" && (
                  <>
                    <button onClick={onAccept} className="action-btn bg-blue-600 text-white hover:bg-blue-700">
                      <Check className="w-3.5 h-3.5" /> Accept
                    </button>
                    <div className="flex gap-2">
                      <select
                        value={assignStaff}
                        onChange={(e) => setAssignStaff(e.target.value)}
                        className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none"
                      >
                        {DEMO_STAFF.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                      <button
                        onClick={() => {
                          const s = DEMO_STAFF.find(s => s.id === assignStaff)!;
                          onAssign(s.id, s.name);
                        }}
                        className="action-btn bg-purple-600 text-white hover:bg-purple-700"
                      >
                        Assign
                      </button>
                    </div>
                  </>
                )}
                {role === "manager" && order.status === "accepted" && (
                  <button onClick={onPreparing} className="action-btn bg-orange-600 text-white hover:bg-orange-700">
                    Start Preparing
                  </button>
                )}
                {role === "staff" && order.status === "preparing" && (
                  <button onClick={onReady} className="action-btn bg-green-600 text-white hover:bg-green-700">
                    <Check className="w-3.5 h-3.5" /> Mark Ready for Pickup
                  </button>
                )}
                {role === "manager" && order.status === "ready" && (
                  <button onClick={onPickedUp} className="action-btn bg-gray-600 text-white hover:bg-gray-700">
                    <Check className="w-3.5 h-3.5" /> Confirm Picked Up
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.5rem 0.875rem;
          border-radius: 0.5rem;
          transition: background-color 0.15s;
        }
      `}</style>
    </div>
  );
}
