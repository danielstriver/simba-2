"use client";
import { Product, formatPrice } from "@/lib/products";
import { useStore } from "@/lib/store";
import { useLang } from "@/lib/LanguageContext";
import { ShoppingCart, Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { t } = useLang();
  const addItem = useStore((s) => s.addItem);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const items = useStore((s) => s.items);
  const [added, setAdded] = useState(false);

  const inCart = items.some((i) => i.product.id === product.id);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 dark:border-gray-700 group-hover:border-red-200 dark:group-hover:border-red-900">
        {/* Image */}
        <div className="relative aspect-square bg-gray-50 dark:bg-gray-700 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const el = e.target as HTMLImageElement;
              const initials = product.name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
              el.src = `https://placehold.co/300x300/fee2e2/dc2626?text=${encodeURIComponent(initials)}`;
            }}
            loading="lazy"
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 flex items-center justify-center">
              <span className="bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
                {t.outOfStock}
              </span>
            </div>
          )}
          {inCart && (
            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm">
              <Check className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 font-medium truncate">{product.category}</p>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug mb-2 group-hover:text-red-600 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-red-600 font-black text-base leading-none">{formatPrice(product.price)}</p>
              <p className="text-xs text-gray-400 mt-0.5">{t.unit}: {product.unit}</p>
            </div>
            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                added
                  ? "bg-green-500 text-white scale-95"
                  : product.inStock
                  ? "bg-red-600 hover:bg-red-700 text-white hover:scale-105 active:scale-95"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Added</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.addToCart}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
