"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { useLang } from "@/lib/LanguageContext";
import { formatPrice } from "@/lib/products";
import Link from "next/link";
import AuthModal from "@/components/AuthModal";
import {
  Check, Phone, User, CreditCard, Banknote,
  ChevronRight, ShoppingBag, Loader2,
  Clock, Calendar, Store, ArrowRight, MapPin, Package, AlertCircle,
} from "lucide-react";

const PACKAGING_FEE = 500;

type PaymentMethod = "momo" | "card" | "cash";
type MomoStatus = "idle" | "awaiting" | "failed";

function MtnLogo() {
  return (
    <svg viewBox="0 0 60 24" className="h-6 w-auto" aria-label="MTN MoMo">
      <rect width="60" height="24" rx="4" fill="#FFCB00" />
      <text x="30" y="17" fontSize="13" fontWeight="900" fontFamily="Arial,sans-serif" fill="#000" textAnchor="middle">MTN</text>
    </svg>
  );
}
function VisaLogo() {
  return (
    <svg viewBox="0 0 60 24" className="h-5 w-auto" aria-label="Visa">
      <rect width="60" height="24" rx="4" fill="#1A1F71" />
      <text x="8" y="17" fontSize="13" fontWeight="900" fontFamily="Arial,sans-serif" fill="#FFFFFF" fontStyle="italic">VISA</text>
    </svg>
  );
}
function MastercardLogo() {
  return (
    <svg viewBox="0 0 40 24" className="h-5 w-auto" aria-label="Mastercard">
      <circle cx="14" cy="12" r="10" fill="#EB001B" />
      <circle cx="26" cy="12" r="10" fill="#F79E1B" />
      <path d="M20 5.6a10 10 0 0 1 0 12.8A10 10 0 0 1 20 5.6z" fill="#FF5F00" />
    </svg>
  );
}

export default function CheckoutPage() {
  const { t } = useLang();
  const items = useStore((s) => s.items);
  const clearCart = useStore((s) => s.clearCart);
  const user = useStore((s) => s.user);
  const subtotal = useStore((s) => s.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0));

  const [step, setStep] = useState<"details" | "payment" | "success">("details");
  const [loading, setLoading] = useState(false);
  const [momoStatus, setMomoStatus] = useState<MomoStatus>("idle");
  const [momoError, setMomoError] = useState("");

  const branches = [
    { id: "UTC", label: t.kigaliCityCenter, addr: "Union Trade Centre, 1 KN 4 Ave" },
    { id: "KN5", label: t.kicukiro, addr: "KN 5 Rd, Kigali" },
    { id: "KG541", label: t.kimihurura, addr: "KG 541 St, Kigali" },
    { id: "24Q5", label: t.nyamirambo, addr: "24Q5+R2R, Kigali" },
    { id: "342F", label: t.kimironko, addr: "342F+3V5, Kimironko" },
    { id: "KG192", label: t.nyarutarama, addr: "KG 192 St, Kigali" },
    { id: "23H4", label: t.nyamiramboCosmos, addr: "23H4+26V, Kigali" },
    { id: "KK35", label: t.kicukiroKK35, addr: "KK 35 Ave, Kigali" },
    { id: "24G3", label: t.remera, addr: "24G3+MCV, Kigali" },
    { id: "Gisenyi", label: t.gisenyi, addr: "8754+P7W, Gisenyi" },
  ];

  const [form, setForm] = useState(() => ({
    name: useStore.getState().user?.name || "",
    phone: useStore.getState().user?.phone || "",
    branch: useStore.getState().selectedBranch || "UTC",
    date: new Date().toISOString().split("T")[0],
    time: "12:00",
    notes: "",
  }));

  const currentBranch = branches.find((b) => b.id === form.branch) || branches[0];

  const [payMethod, setPayMethod] = useState<PaymentMethod>("momo");
  const [momoPhone, setMomoPhone] = useState(() => useStore.getState().user?.phone || "");
  const [cardNum, setCardNum] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Auth gate ────────────────────────────────────────────────────────────────
  if (!user && step !== "success") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <AuthModal
          isOpen={true}
          onClose={() => window.history.back()}
          onSuccess={() => {
            setForm((f) => ({
              ...f,
              name: useStore.getState().user?.name || f.name,
              phone: useStore.getState().user?.phone || f.phone,
            }));
          }}
        />
        <div className="text-center space-y-3 opacity-0 pointer-events-none" aria-hidden>
          <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto" />
        </div>
      </div>
    );
  }

  // ── Empty cart ───────────────────────────────────────────────────────────────
  if (items.length === 0 && step !== "success") {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">{t.cartEmpty}</h2>
        <Link href="/products" className="text-red-600 font-bold hover:underline">{t.continueShopping}</Link>
      </div>
    );
  }

  // ── Success ──────────────────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-950 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">{t.orderPlaced}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed text-sm">{t.pickupInstructions}</p>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 mb-6 text-left space-y-3 border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Customer:</span>
            <span className="font-bold text-gray-900 dark:text-white">{user?.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Phone:</span>
            <span className="font-bold text-gray-900 dark:text-white">{user?.phone}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Pickup Location:</span>
            <span className="font-bold text-gray-900 dark:text-white text-right">{currentBranch.label}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Pickup Time:</span>
            <span className="font-bold text-gray-900 dark:text-white">{form.date} at {form.time}</span>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3 space-y-2">
            <div className="flex justify-between text-sm text-green-600 dark:text-green-400 font-bold">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> {t.packagingFeePaid}
              </span>
              <span>{formatPrice(PACKAGING_FEE)}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-gray-900 dark:text-white">
              <span>{t.remainingAtCounter}</span>
              <span className="text-red-600">{formatPrice(subtotal)}</span>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 mb-8 text-left">
          <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
            <strong>Important:</strong> Please arrive at your selected branch by <strong>{form.date} at {form.time}</strong>.
            Your order will be held for <strong>24 hours</strong>. After that, the packaging fee is forfeited and the order is cancelled.
          </p>
        </div>

        <Link
          href="/"
          className="inline-block bg-red-600 hover:bg-red-700 text-white font-black px-8 py-3.5 rounded-full transition-colors shadow-lg"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  // ── Form validation ──────────────────────────────────────────────────────────
  function validateDetails() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    if (!form.branch) e.branch = "Please select a branch";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (validateDetails()) setStep("payment");
  }

  async function handlePlaceOrder() {
    const e: Record<string, string> = {};
    if (payMethod === "momo") {
      if (!momoPhone.trim() || momoPhone.replace(/\D/g, "").length < 9) {
        e.momo = "Enter a valid MoMo phone number";
      }
    }
    if (payMethod === "card") {
      if (!cardNum.trim()) e.cardNum = "Card number required";
      if (!cardExp.trim()) e.cardExp = "Expiry required";
      if (!cardCvv.trim()) e.cardCvv = "CVV required";
    }
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setMomoError("");
    setLoading(true);

    if (payMethod === "momo") {
      setMomoStatus("awaiting");
      await new Promise((r) => setTimeout(r, 3000));
      setMomoStatus("idle");
    } else {
      await new Promise((r) => setTimeout(r, 1500));
    }

    setStep("success");
    clearCart();
    setLoading(false);
  }

  // ── Main render ──────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-8">{t.checkout}</h1>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {[
          { id: "details", label: t.pickupDetails },
          { id: "payment", label: t.paymentMethod },
        ].map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 shrink-0">
            {i > 0 && <ChevronRight className="w-4 h-4 text-gray-300" />}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
              step === s.id ? "bg-red-600 text-white shadow-md" : "bg-gray-100 dark:bg-gray-800 text-gray-500"
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === s.id ? "bg-white text-red-600" : "bg-gray-300 dark:bg-gray-700 text-white"}`}>{i + 1}</span>
              <span>{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* ── Left column ── */}
        <div className="lg:col-span-2">

          {/* Details step */}
          {step === "details" && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
              <h2 className="font-black text-xl text-gray-900 dark:text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-red-600" /> {t.pickupDetails}
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">{t.fullName} *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className={`w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border ${errors.name ? "border-red-500" : "border-gray-200 dark:border-gray-700"} rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm`}
                    />
                  </div>
                  {errors.name && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">{t.phone} *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className={`w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border ${errors.phone ? "border-red-500" : "border-gray-200 dark:border-gray-700"} rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm`}
                    />
                  </div>
                  {errors.phone && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.phone}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">{t.selectBranch} *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {branches.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setForm({ ...form, branch: b.id })}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                        form.branch === b.id ? "border-red-600 bg-red-50 dark:bg-red-950" : "border-gray-100 dark:border-gray-700 hover:border-gray-200"
                      }`}
                    >
                      <MapPin className={`w-5 h-5 shrink-0 mt-0.5 ${form.branch === b.id ? "text-red-600" : "text-gray-400"}`} />
                      <div>
                        <p className={`text-sm font-bold ${form.branch === b.id ? "text-red-700 dark:text-red-400" : "text-gray-600 dark:text-gray-400"}`}>{b.label}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{b.addr}</p>
                      </div>
                    </button>
                  ))}
                </div>
                {errors.branch && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.branch}</p>}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">{t.pickupDate} *</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">{t.pickupTime} *</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="time"
                      value={form.time}
                      onChange={(e) => setForm({ ...form, time: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-black transition-all shadow-lg flex items-center justify-center gap-2"
              >
                Continue to Payment <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Payment step */}
          {step === "payment" && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
              <h2 className="font-black text-xl text-gray-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-red-600" /> {t.paymentMethod}
              </h2>

              {/* Packaging fee callout */}
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex gap-3">
                <Package className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-black text-amber-900 dark:text-amber-300">
                    {t.packagingFee}: {formatPrice(PACKAGING_FEE)}
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">{t.packagingFeeNote}</p>
                  <p className="text-[11px] text-amber-600 dark:text-amber-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {t.noShowNote}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setPayMethod("momo")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${payMethod === "momo" ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-950" : "border-gray-100 dark:border-gray-700 hover:border-gray-200"}`}
                >
                  <MtnLogo />
                  <span className="font-bold text-xs text-gray-700 dark:text-gray-300 uppercase">MoMo</span>
                </button>
                <button
                  onClick={() => setPayMethod("card")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${payMethod === "card" ? "border-blue-400 bg-blue-50 dark:bg-blue-950" : "border-gray-100 dark:border-gray-700 hover:border-gray-200"}`}
                >
                  <div className="flex gap-1"><VisaLogo /><MastercardLogo /></div>
                  <span className="font-bold text-xs text-gray-700 dark:text-gray-300 uppercase">Card</span>
                </button>
                <button
                  onClick={() => setPayMethod("cash")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${payMethod === "cash" ? "border-green-400 bg-green-50 dark:bg-green-950" : "border-gray-100 dark:border-gray-700 hover:border-gray-200"}`}
                >
                  <Banknote className="w-6 h-6 text-green-600" />
                  <span className="font-bold text-xs text-gray-700 dark:text-gray-300 uppercase whitespace-nowrap">At Counter</span>
                </button>
              </div>

              {payMethod === "momo" && (
                <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-900 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-2"><MtnLogo /><span className="font-bold">MTN Mobile Money</span></div>
                  <div>
                    <label className="block text-xs font-bold text-yellow-800 dark:text-yellow-300 mb-1.5 ml-1 uppercase">MoMo Phone Number</label>
                    <input
                      value={momoPhone}
                      onChange={(e) => setMomoPhone(e.target.value)}
                      placeholder="078 XXX XXXX"
                      className={`w-full px-4 py-3 rounded-xl border ${errors.momo ? "border-red-500" : "border-yellow-300 dark:border-yellow-800"} bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                    />
                    {errors.momo && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.momo}</p>}
                  </div>
                  {momoStatus === "awaiting" ? (
                    <div className="flex items-center gap-3 py-2 text-yellow-800 dark:text-yellow-300">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm font-bold">Check your phone for the PIN prompt...</span>
                    </div>
                  ) : (
                    <p className="text-xs text-yellow-700 dark:text-yellow-400 italic">
                      💡 You will receive a MoMo prompt to pay <strong>{formatPrice(PACKAGING_FEE)}</strong> after clicking Place Order.
                    </p>
                  )}
                  {momoError && <p className="text-sm text-red-600 font-bold bg-red-50 p-2 rounded-lg">{momoError}</p>}
                </div>
              )}

              {payMethod === "card" && (
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-2"><VisaLogo /><MastercardLogo /><span className="font-bold ml-2">Secure Card Payment</span></div>
                  <div>
                    <label className="block text-xs font-bold text-blue-800 dark:text-blue-300 mb-1.5 ml-1 uppercase">Card Number</label>
                    <input
                      value={cardNum}
                      onChange={(e) => setCardNum(e.target.value)}
                      placeholder="0000 0000 0000 0000"
                      className={`w-full px-4 py-3 rounded-xl border ${errors.cardNum ? "border-red-500" : "border-blue-300 dark:border-blue-800"} bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-blue-800 dark:text-blue-300 mb-1.5 ml-1 uppercase">Expiry</label>
                      <input
                        value={cardExp}
                        onChange={(e) => setCardExp(e.target.value)}
                        placeholder="MM/YY"
                        className={`w-full px-4 py-3 rounded-xl border ${errors.cardExp ? "border-red-500" : "border-blue-300 dark:border-blue-800"} bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-blue-800 dark:text-blue-300 mb-1.5 ml-1 uppercase">CVV</label>
                      <input
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="123"
                        className={`w-full px-4 py-3 rounded-xl border ${errors.cardCvv ? "border-red-500" : "border-blue-300 dark:border-blue-800"} bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {payMethod === "cash" && (
                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-green-800 dark:text-green-300 mb-2">
                    <Banknote className="w-5 h-5" />
                    <span className="font-bold">Pay Packaging Fee at Counter</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Pay <strong>{formatPrice(PACKAGING_FEE)}</strong> packaging fee in cash when you arrive at the Online Pickup counter. Your order will then be handed to you.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep("details")} className="px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-4 rounded-xl font-black text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                    : <><Package className="w-4 h-4" /> {t.payNow} — {formatPrice(PACKAGING_FEE)}</>
                  }
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Order summary sidebar ── */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 sticky top-24 shadow-sm">
            <h3 className="font-black text-gray-900 dark:text-white mb-4 uppercase tracking-wider text-sm">{t.orderSummary}</h3>
            <div className="space-y-4 mb-5 max-h-[35vh] overflow-y-auto pr-2 scrollbar-thin">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-3">
                  <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden shrink-0">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight">{product.name}</p>
                    <p className="text-[10px] text-gray-500 font-medium">Qty: {quantity} × {formatPrice(product.price)}</p>
                  </div>
                  <p className="text-xs font-black text-gray-900 dark:text-white whitespace-nowrap">{formatPrice(product.price * quantity)}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-2">
              <div className="flex justify-between text-xs text-gray-500 font-medium">
                <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-amber-600 dark:text-amber-400 font-bold">
                <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {t.packagingFee}</span>
                <span>{formatPrice(PACKAGING_FEE)}</span>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-700 pt-3 mt-1 space-y-2">
                <div className="flex justify-between text-xs font-black text-amber-700 dark:text-amber-400">
                  <span>{t.payNow}</span><span>{formatPrice(PACKAGING_FEE)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 font-medium">
                  <span>{t.payAtCounter}</span><span>{formatPrice(subtotal)}</span>
                </div>
              </div>
            </div>

            {/* Why this fee */}
            <div className="mt-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed italic">
                <strong>Why a packaging fee?</strong> We pack your order before you arrive. This small fee confirms you're committed to picking it up.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
