"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { useLang } from "@/lib/LanguageContext";
import { formatPrice } from "@/lib/products";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Phone, MapPin, User, CreditCard, Smartphone, Banknote, ChevronRight, ShoppingBag, Loader2 } from "lucide-react";

type PaymentMethod = "momo" | "card" | "cash";

export default function CheckoutPage() {
  const { t } = useLang();
  const router = useRouter();
  const { items, totalPrice, clearCart } = useStore();
  const [step, setStep] = useState<"details" | "payment" | "success">("details");
  const [loading, setLoading] = useState(false);

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

  const total = totalPrice();

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

  async function handlePlaceOrder() {
    setLoading(true);
    // Simulate processing
    await new Promise((r) => setTimeout(r, 2000));
    clearCart();
    setStep("success");
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
                  <option>Butare</option>
                  <option>Gisenyi</option>
                  <option>Ruhengeri</option>
                  <option>Gitarama</option>
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
                {[
                  { id: "momo" as PaymentMethod, label: "MoMo", icon: <Smartphone className="w-5 h-5" />, desc: "Mobile Money" },
                  { id: "card" as PaymentMethod, label: "Card", icon: <CreditCard className="w-5 h-5" />, desc: "Credit/Debit" },
                  { id: "cash" as PaymentMethod, label: "Cash", icon: <Banknote className="w-5 h-5" />, desc: "On Delivery" },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPayMethod(method.id)}
                    className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all ${
                      payMethod === method.id
                        ? "border-red-600 bg-red-50 dark:bg-red-950 text-red-600"
                        : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {method.icon}
                    <span className="font-bold text-sm">{method.label}</span>
                    <span className="text-xs opacity-70">{method.desc}</span>
                  </button>
                ))}
              </div>

              {payMethod === "momo" && (
                <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-900 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
                    <Smartphone className="w-5 h-5" />
                    <span className="font-bold">MTN Mobile Money</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-yellow-900 dark:text-yellow-200 mb-1.5">
                      MoMo Phone Number
                    </label>
                    <input
                      value={momoPhone}
                      onChange={(e) => setMomoPhone(e.target.value)}
                      placeholder="+250 7XX XXX XXX"
                      type="tel"
                      className="w-full px-4 py-3 rounded-xl border border-yellow-300 dark:border-yellow-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  <p className="text-xs text-yellow-700 dark:text-yellow-400">
                    💡 You will receive a payment prompt on your phone. Enter your MoMo PIN to confirm.
                  </p>
                </div>
              )}

              {payMethod === "card" && (
                <div className="space-y-4">
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
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
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
