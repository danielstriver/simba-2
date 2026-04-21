"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { useLang } from "@/lib/LanguageContext";
import { formatPrice } from "@/lib/products";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Phone, MapPin, User, CreditCard, Banknote, ChevronRight, ShoppingBag, Loader2, AlertCircle, Smartphone } from "lucide-react";

type PaymentMethod = "momo" | "card" | "cash";
type MomoStatus = "idle" | "awaiting" | "failed" | "timeout";

// ── SVG Logos ────────────────────────────────────────────────────────────────
function MtnLogo() {
  return (
    <svg viewBox="0 0 60 24" className="h-6 w-auto" aria-label="MTN MoMo">
      <rect width="60" height="24" rx="4" fill="#FFCB00" />
      <text x="5" y="17" fontSize="13" fontWeight="900" fontFamily="Arial,sans-serif" fill="#000">MTN</text>
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
  const router = useRouter();
  const items = useStore((s) => s.items);
  const clearCart = useStore((s) => s.clearCart);
  const total = useStore((s) => s.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0));
  const [step, setStep] = useState<"details" | "payment" | "success">("details");
  const [loading, setLoading] = useState(false);
  const [momoStatus, setMomoStatus] = useState<MomoStatus>("idle");
  const [momoError, setMomoError] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "Kigali",
    notes: "",
  });
  const [payMethod, setPayMethod] = useState<PaymentMethod>("momo");
  const [momoPhone, setMomoPhone] = useState("");
  const [cardNum, setCardNum] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validateDetails() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    if (!form.address.trim()) e.address = "Address is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (validateDetails()) setStep("payment");
  }

  async function validatePayment(): Promise<boolean> {
    if (payMethod === "momo") {
      if (!momoPhone.trim() || momoPhone.replace(/\D/g, "").length < 9) {
        setMomoError("Enter a valid MoMo phone number (e.g. 078 XXX XXXX)");
        return false;
      }
    }
    if (payMethod === "card") {
      if (!cardNum.trim() || !cardExp.trim() || !cardCvv.trim()) {
        setErrors({ card: "Please fill in all card details" });
        return false;
      }
    }
    return true;
  }

  async function handlePlaceOrder() {
    if (!(await validatePayment())) return;
    setMomoError("");
    setErrors({});
    setLoading(true);

    if (payMethod === "momo") {
      try {
        setMomoStatus("awaiting");
        const orderId = `SIMBA-${Date.now()}`;
        const initRes = await fetch("/api/payments/momo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: momoPhone, amount: total, orderId }),
        });
        const initData = await initRes.json() as { referenceId?: string; error?: string };
        if (!initRes.ok || !initData.referenceId) {
          setMomoStatus("failed");
          setMomoError(initData.error ?? "Failed to initiate payment. Check your MoMo number.");
          setLoading(false);
          return;
        }

        // Poll for status — max 60s
        const referenceId = initData.referenceId;
        const deadline = Date.now() + 60_000;
        while (Date.now() < deadline) {
          await new Promise((r) => setTimeout(r, 2500));
          const pollRes = await fetch(`/api/payments/momo?id=${referenceId}`);
          const pollData = await pollRes.json() as { status?: string; error?: string };
          if (pollData.status === "SUCCESSFUL") {
            setStep("success");
            clearCart();
            setLoading(false);
            return;
          }
          if (pollData.status === "FAILED" || pollData.status === "REJECTED") {
            setMomoStatus("failed");
            setMomoError("Payment was declined. Please try again or use a different method.");
            setLoading(false);
            return;
          }
          // PENDING — keep polling
        }
        setMomoStatus("timeout");
        setMomoError("Payment timed out. Please check your MoMo app and try again.");
        setLoading(false);
      } catch {
        setMomoStatus("failed");
        setMomoError("Network error. Please check your connection and try again.");
        setLoading(false);
      }
      return;
    }

    // Card or Cash — simulate processing
    await new Promise((r) => setTimeout(r, 1500));
    setStep("success");
    clearCart();
    setLoading(false);
  }

  if (items.length === 0 && step !== "success") {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">{t.cartEmpty}</h2>
        <Link href="/products" className="text-red-600 font-bold hover:underline">{t.continueShopping}</Link>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-950 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">{t.orderPlaced}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">{t.orderSuccess}</p>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 mb-8 text-left space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Order for:</span>
            <span className="font-bold text-gray-900 dark:text-white">{form.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Delivery to:</span>
            <span className="font-bold text-gray-900 dark:text-white">{form.address}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Payment:</span>
            <span className="font-bold text-gray-900 dark:text-white capitalize">{payMethod === "momo" ? "Mobile Money" : payMethod === "card" ? "Card" : "Cash on Delivery"}</span>
          </div>
        </div>
        <Link
          href="/"
          className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-full transition-colors"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-8">{t.checkout}</h1>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { id: "details", label: "Details" },
          { id: "payment", label: "Payment" },
        ].map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            {i > 0 && <ChevronRight className="w-4 h-4 text-gray-300" />}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
              step === s.id ? "bg-red-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500"
            }`}>
              <span>{i + 1}</span>
              <span>{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          {step === "details" && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
              <h2 className="font-black text-lg text-gray-900 dark:text-white">Delivery Details</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <User className="w-4 h-4 inline mr-1" />{t.fullName} *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jean-Pierre Mugisha"
                  className={`w-full px-4 py-3 rounded-xl border ${errors.name ? "border-red-400" : "border-gray-200 dark:border-gray-700"} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <Phone className="w-4 h-4 inline mr-1" />{t.phone} *
                </label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+250 7XX XXX XXX"
                  type="tel"
                  className={`w-full px-4 py-3 rounded-xl border ${errors.phone ? "border-red-400" : "border-gray-200 dark:border-gray-700"} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <MapPin className="w-4 h-4 inline mr-1" />{t.address} *
                </label>
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="KG 100 St, Gasabo District"
                  className={`w-full px-4 py-3 rounded-xl border ${errors.address ? "border-red-400" : "border-gray-200 dark:border-gray-700"} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">City</label>
                <select
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option>Kigali</option>
                  <option>Huye</option>
                  <option>Rubavu</option>
                  <option>Musanze</option>
                  <option>Muhanga</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Special delivery instructions..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
              >
                Continue to Payment <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === "payment" && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
              <h2 className="font-black text-lg text-gray-900 dark:text-white">{t.paymentMethod}</h2>

              {/* Payment method tabs */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => { setPayMethod("momo"); setMomoStatus("idle"); setMomoError(""); }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${payMethod === "momo" ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-950" : "border-gray-200 dark:border-gray-700 hover:border-gray-300"}`}
                >
                  <MtnLogo />
                  <span className="font-bold text-sm text-gray-700 dark:text-gray-300">MoMo</span>
                  <span className="text-xs text-gray-400">Mobile Money</span>
                </button>
                <button
                  onClick={() => setPayMethod("card")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${payMethod === "card" ? "border-blue-400 bg-blue-50 dark:bg-blue-950" : "border-gray-200 dark:border-gray-700 hover:border-gray-300"}`}
                >
                  <div className="flex items-center gap-1">
                    <VisaLogo />
                    <MastercardLogo />
                  </div>
                  <span className="font-bold text-sm text-gray-700 dark:text-gray-300">Card</span>
                  <span className="text-xs text-gray-400">Credit/Debit</span>
                </button>
                <button
                  onClick={() => setPayMethod("cash")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${payMethod === "cash" ? "border-green-400 bg-green-50 dark:bg-green-950" : "border-gray-200 dark:border-gray-700 hover:border-gray-300"}`}
                >
                  <Banknote className="w-7 h-7 text-green-600" />
                  <span className="font-bold text-sm text-gray-700 dark:text-gray-300">Cash</span>
                  <span className="text-xs text-gray-400">On Delivery</span>
                </button>
              </div>

              {payMethod === "momo" && (
                <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-900 rounded-xl p-5 space-y-4">
                  {momoStatus === "awaiting" ? (
                    <div className="text-center py-4 space-y-3">
                      <div className="text-4xl">📱</div>
                      <p className="font-bold text-yellow-900 dark:text-yellow-200">Check your phone!</p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-400">
                        A payment prompt was sent to <strong>{momoPhone}</strong>.<br />
                        Open MTN MoMo and enter your PIN to confirm.
                      </p>
                      <div className="flex items-center justify-center gap-2 text-yellow-600">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm font-medium">Waiting for approval…</span>
                      </div>
                      <button
                        onClick={() => { setMomoStatus("idle"); setLoading(false); }}
                        className="text-xs text-yellow-700 dark:text-yellow-400 underline hover:no-underline"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
                        <MtnLogo />
                        <span className="font-bold">MTN Mobile Money</span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-yellow-900 dark:text-yellow-200 mb-1.5">
                          MoMo Phone Number
                        </label>
                        <input
                          value={momoPhone}
                          onChange={(e) => { setMomoPhone(e.target.value); setMomoError(""); }}
                          placeholder="078 XXX XXXX"
                          type="tel"
                          aria-required="true"
                          className={`w-full px-4 py-3 rounded-xl border ${momoError ? "border-red-400" : "border-yellow-300 dark:border-yellow-800"} bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                        />
                        {momoError && (
                          <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5">
                            <AlertCircle className="w-3.5 h-3.5" /> {momoError}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-yellow-700 dark:text-yellow-400">
                        💡 You will receive a payment prompt on your phone. Enter your MoMo PIN to confirm.
                      </p>
                      {(momoStatus === "failed" || momoStatus === "timeout") && !momoError && (
                        <p className="flex items-center gap-1 text-red-500 text-xs">
                          <AlertCircle className="w-3.5 h-3.5" /> Payment unsuccessful. Please try again.
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}

              {payMethod === "card" && (
                <div className="space-y-4">
                  {errors.card && (
                    <p className="flex items-center gap-1 text-red-500 text-sm">
                      <AlertCircle className="w-4 h-4" /> {errors.card}
                    </p>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Card Number</label>
                    <input
                      value={cardNum}
                      onChange={(e) => setCardNum(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Expiry</label>
                      <input
                        value={cardExp}
                        onChange={(e) => setCardExp(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">CVV</label>
                      <input
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="123"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {payMethod === "cash" && (
                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-green-800 dark:text-green-300 mb-2">
                    <Banknote className="w-5 h-5" />
                    <span className="font-bold">Pay on Delivery</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Have <strong>{formatPrice(total)}</strong> ready when our delivery partner arrives.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("details")}
                  className="px-5 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading || momoStatus === "awaiting"}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                >
                  {loading && momoStatus !== "awaiting" ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                  ) : momoStatus === "awaiting" ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Waiting for MoMo approval…</>
                  ) : (
                    <><Check className="w-4 h-4" /> {t.placeOrder} — {formatPrice(total)}</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 sticky top-24">
            <h3 className="font-black text-gray-900 dark:text-white mb-4">{t.orderSummary}</h3>
            <div className="space-y-3 mb-4 max-h-72 overflow-y-auto">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center gap-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://placehold.co/48x48/fee2e2/dc2626?text=${encodeURIComponent(product.name[0])}`;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-white line-clamp-2 leading-snug">{product.name}</p>
                    <p className="text-xs text-gray-500">× {quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white shrink-0">{formatPrice(product.price * quantity)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{t.shipping}</span>
                <span className="text-green-600 font-bold">{t.free}</span>
              </div>
              <div className="flex justify-between font-black text-lg text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                <span>{t.cartTotal}</span>
                <span className="text-red-600">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
