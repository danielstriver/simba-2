"use client";
import { Product, formatPrice } from "@/lib/products";
import { getProductImage } from "@/lib/imageMap";
import { useStore } from "@/lib/store";
import { useLang } from "@/lib/LanguageContext";
import { useToast } from "@/components/Toast";
import { ShoppingCart, Check, Eye } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Props {
  product: Product;
  compact?: boolean;
}

export default function ProductCard({ product, compact }: Props) {
  const { t } = useLang();
  const addItem = useStore((s) => s.addItem);
  const items = useStore((s) => s.items);
  const { toast } = useToast();
  const [imgErr, setImgErr] = useState(false);

  const inCart = items.some((i) => i.product.id === product.id);
  const imgSrc = imgErr
    ? getProductImage(product.id, product.name, product.category)
    : product.image.includes("placehold.co")
    ? getProductImage(product.id, product.name, product.category)
    : product.image;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    addItem(product);
    toast(`Added to cart`, "cart", product.name);
  }

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 border border-gray-100 dark:border-gray-700 group-hover:border-red-200 dark:group-hover:border-red-900 h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-square bg-gray-50 dark:bg-gray-700 overflow-hidden">
          <img
            src={imgSrc}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgErr(true)}
            loading="lazy"
          />
          {/* Out of stock overlay */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 flex items-center justify-center">
              <span className="bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
                {t.outOfStock}
              </span>
            </div>
          )}
          {/* In-cart badge */}
          {inCart && (
            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow">
              <Check className="w-3.5 h-3.5" />
            </div>
          )}
          {/* Quick view hover */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs font-medium py-2 text-center opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
            <Eye className="w-3.5 h-3.5" /> View Details
          </div>
        </div>

        {/* Info */}
        <div className={`flex flex-col flex-1 ${compact ? "p-2.5" : "p-3.5"}`}>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium truncate mb-0.5">
            {product.category}
          </p>
          <h3 className={`font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug mb-auto group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors ${compact ? "text-xs" : "text-sm"}`}>
            {product.name}
          </h3>
          <div className="flex items-end justify-between gap-2 mt-3">
            <div>
              <p className={`text-red-600 font-black leading-none ${compact ? "text-sm" : "text-base"}`}>
                {formatPrice(product.price)}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">per {product.unit}</p>
            </div>
            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              title={product.inStock ? t.addToCart : t.outOfStock}
              className={`shrink-0 flex items-center gap-1.5 rounded-xl font-bold transition-all active:scale-95 ${compact ? "p-2 text-xs" : "px-3 py-2 text-xs"} ${
                product.inStock
                  ? "bg-red-600 hover:bg-red-700 text-white hover:scale-105"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {!compact && <span className="hidden sm:inline">{t.addToCart}</span>}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
