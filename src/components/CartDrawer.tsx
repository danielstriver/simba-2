"use client";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { useLang } from "@/lib/LanguageContext";
import { getProductImage } from "@/lib/imageMap";
import { CATEGORY_META, Product, formatPrice } from "@/lib/products";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthModal from "./AuthModal";

function CartItemImg({ imgSrc, product }: { imgSrc: string; product: Product }) {
  const [failed, setFailed] = useState(false);
  const meta = CATEGORY_META[product.category];
  if (failed) {
    return (
      <div className={`w-full h-full bg-gradient-to-br ${meta?.color || "from-gray-200 to-gray-400"} flex items-center justify-center`}>
        <span className="text-2xl">{meta?.icon || "🛒"}</span>
      </div>
    );
  }
  return <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" onError={() => setFailed(true)} />;
}

export default function CartDrawer() {
  const { items, cartOpen, setCartOpen, removeItem, updateQuantity, user } = useStore();
  const { t } = useLang();
  const total = useStore((s) => s.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0));
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (!cartOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setCartOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [cartOpen, setCartOpen]);

  const handleCheckout = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      setCartOpen(false);
      router.push("/checkout");
    } else {
      setShowAuth(true);
    }
  };

  if (!cartOpen && !showAuth) return null;

  return (
    <>
      <AuthModal 
        isOpen={showAuth} 
        onClose={() => setShowAuth(false)} 
        onSuccess={() => {
          setCartOpen(false);
          router.push("/checkout");
        }}
        showGuestOption
      />
      {cartOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm cursor-pointer" onClick={() => setCartOpen(false)} />
          <div role="dialog" aria-modal="true" aria-label="Shopping cart" className="fixed right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-gray-900 z-50 shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-red-600" />
                <h2 className="font-black text-lg dark:text-white">{t.cart}</h2>
                {items.length > 0 && (
                  <span className="bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">
                    {totalQty} {t.items}
                  </span>
                )}
              </div>
              <button onClick={() => setCartOpen(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-gray-200 dark:text-gray-700" />
                  <p className="font-bold text-gray-500 dark:text-gray-400">{t.cartEmpty}</p>
                  <p className="text-sm text-gray-400">Add items from our 789 products</p>
                  <button onClick={() => setCartOpen(false)} className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-full text-sm transition-colors">
                    {t.continueShopping}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map(({ product, quantity }) => {
                    const imgSrc = product.image.includes("placehold.co")
                      ? getProductImage(product.id, product.name, product.category)
                      : product.image;
                    return (
                      <div key={product.id} className="flex gap-3 items-start">
                        <Link href={`/products/${product.id}`} onClick={() => setCartOpen(false)}
                          className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 hover:opacity-80 transition-opacity"
                        >
                          <CartItemImg imgSrc={imgSrc} product={product} />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link href={`/products/${product.id}`} onClick={() => setCartOpen(false)}
                            className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug hover:text-red-600 transition-colors block"
                          >
                            {product.name}
                          </Link>
                          <p className="text-red-600 font-black text-sm mt-0.5">{formatPrice(product.price)}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateQuantity(product.id, quantity - 1)}
                              aria-label="Decrease quantity"
                              className="w-7 h-7 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-sm font-black">{quantity}</span>
                            <button
                              onClick={() => updateQuantity(product.id, quantity + 1)}
                              aria-label="Increase quantity"
                              className="w-7 h-7 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <p className="text-xs text-gray-400 ml-1">{formatPrice(product.price * quantity)}</p>
                            <button onClick={() => removeItem(product.id)} aria-label="Remove item" className="ml-auto text-gray-300 hover:text-red-500 transition-colors p-1">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-5 bg-gray-50 dark:bg-gray-900/80 space-y-4">
                {/* Subtotal */}
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-500 dark:text-gray-400">
                    <span>Subtotal ({totalQty} items)</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-green-600 dark:text-green-400 font-medium">
                    <span>{t.shipping}</span>
                    <span>{t.free} 🎉</span>
                  </div>
                  <div className="flex justify-between font-black text-lg text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                    <span>{t.cartTotal}</span>
                    <span className="text-red-600">{formatPrice(total)}</span>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-black text-sm transition-colors shadow-lg"
                >
                  {t.checkout} <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={() => setCartOpen(false)} className="w-full text-center text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  {t.continueShopping}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
