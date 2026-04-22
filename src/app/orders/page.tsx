"use client";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { useLang } from "@/lib/LanguageContext";
import { getUserOrders, patchOrder, Order, OrderStatus } from "@/lib/orders";
import type { Translations } from "@/lib/i18n";
import { formatPrice } from "@/lib/products";
import Link from "next/link";
import AuthModal from "@/components/AuthModal";
import {
  Package, Star, ChevronDown, Check, Clock,
  MapPin, ShoppingBag, ArrowRight,
} from "lucide-react";

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  accepted: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  preparing: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
  ready: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  picked_up: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  preparing: "Preparing",
  ready: "Ready for Pickup",
  picked_up: "Picked Up",
  cancelled: "Cancelled",
};

export default function OrdersPage() {
  const { t } = useLang();
  const user = useStore((s) => s.user);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (user) setOrders(getUserOrders(user.id));
  }, [user, refresh]);

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <ShoppingBag className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">{t.authRequired}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{t.authRequiredDesc}</p>
          <button
            onClick={() => setShowAuth(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-black px-6 py-3 rounded-full transition-colors"
          >
            {t.signIn}
          </button>
          <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
            {t.myOrders}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {t.orderHistory} · {orders.length} order{orders.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-700 transition-colors"
        >
          {t.continueShopping} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <p className="font-bold text-gray-500 dark:text-gray-400">{t.noOrders}</p>
          <Link href="/products" className="mt-4 inline-block text-red-600 font-bold hover:underline">
            {t.shopNow}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              t={t}
              expanded={expanded === order.id}
              onToggle={() => setExpanded(expanded === order.id ? null : order.id)}
              onReviewed={() => setRefresh((n) => n + 1)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderRow({
  order, t, expanded, onToggle, onReviewed,
}: {
  order: Order;
  t: Translations;
  expanded: boolean;
  onToggle: () => void;
  onReviewed: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(!!order.review);

  async function submitReview() {
    if (!rating) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    patchOrder(order.id, {
      review: { rating, comment, createdAt: new Date().toISOString() },
      status: "picked_up",
    });
    setSubmitted(true);
    setSubmitting(false);
    onReviewed();
  }

  const canReview = order.status === "ready" || order.status === "picked_up";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      {/* Summary */}
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
            {order.review && (
              <span className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < order.review!.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-200"}`}
                  />
                ))}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {order.branchLabel.replace("Simba Supermarket ", "")}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {order.pickupDate}
            </span>
            <span className="text-xs text-gray-500">
              {order.items.length} item{order.items.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="font-black text-gray-900 dark:text-white text-sm">{formatPrice(order.subtotal + order.depositPaid)}</p>
          <p className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-700 p-4 space-y-4">
          {/* Items */}
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden shrink-0">
                  <img src={item.image} alt={item.productName} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.productName}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                </div>
                <p className="text-sm font-black text-gray-900 dark:text-white whitespace-nowrap">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-bold text-gray-900 dark:text-white">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Deposit paid</span>
              <span className="font-bold">{formatPrice(order.depositPaid)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Pickup at</span>
              <span className="font-bold text-gray-900 dark:text-white">{order.branchLabel}</span>
            </div>
          </div>

          {/* Review section */}
          {canReview && !submitted && !order.review && (
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/40 rounded-xl p-4">
              <p className="font-bold text-yellow-800 dark:text-yellow-300 text-sm mb-3">
                {t.reviewPrompt}
              </p>
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    onMouseEnter={() => setHover(i + 1)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(i + 1)}
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        i < (hover || rating)
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-sm font-bold text-yellow-700 dark:text-yellow-400">
                    {rating}/5
                  </span>
                )}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t.reviewPrompt}
                rows={2}
                className="w-full text-sm bg-white dark:bg-gray-800 border border-yellow-300 dark:border-yellow-900 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none mb-3"
              />
              <button
                onClick={submitReview}
                disabled={!rating || submitting}
                className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-200 dark:disabled:bg-gray-700 text-white disabled:text-gray-400 font-black text-sm px-5 py-2.5 rounded-xl transition-colors"
              >
                {submitting ? "Submitting..." : t.submitReview}
              </button>
            </div>
          )}

          {(submitted || order.review) && (
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 rounded-xl p-3 text-sm">
              <p className="font-bold text-green-700 dark:text-green-300 flex items-center gap-2">
                <Check className="w-4 h-4" /> {t.reviewThankYou}
              </p>
              {order.review?.comment && (
                <p className="text-gray-600 dark:text-gray-400 text-xs mt-1 italic">&ldquo;{order.review.comment}&rdquo;</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
