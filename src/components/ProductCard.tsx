"use client";
import { Product, formatPrice } from "@/lib/products";
import { getProductImage } from "@/lib/imageMap";
import { CATEGORY_META } from "@/lib/products";
import { useStore } from "@/lib/store";
import { useLang } from "@/lib/LanguageContext";
import { useToast } from "@/components/Toast";
import { ShoppingCart, Check, Eye } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

function ProductImg({ product }: { product: Product }) {
  const [failed, setFailed] = useState(false);
  const meta = CATEGORY_META[product.category];
  const src = product.image.includes("placehold.co")
    ? getProductImage(product.id, product.name, product.category)
    : product.image;

  if (failed) {
    return (
      <div className={`w-full h-full bg-gradient-to-br ${meta?.color || "from-gray-300 to-gray-400"} flex flex-col items-center justify-center gap-1 p-3`}>
        <span className="text-4xl">{meta?.icon || "🛒"}</span>
        <span className="text-white text-[10px] font-medium text-center leading-tight opacity-90 line-clamp-2">
          {product.name.split(" ").slice(0, 4).join(" ")}
        </span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={product.name}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}

export default function ProductCard({ product }: { product: Product }) {
  const { t } = useLang();
  const { addItem, selectedBranch, setShowBranchModal } = useStore();
  const inCart = useStore((s) => s.items.some((i) => i.product.id === product.id));
  const { toast } = useToast();

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    
    if (!selectedBranch) {
      setShowBranchModal(true);
      return;
    }

    addItem(product);
    toast("Added to cart", "cart", product.name);
  }

  return (
    <Link href={`/products/${product.id}`} className="group block h-full">
      <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 border border-gray-100 dark:border-gray-700 group-hover:border-red-200 dark:group-hover:border-red-900 h-full flex flex-col">
        <div className="relative aspect-square bg-gray-50 dark:bg-gray-700 overflow-hidden">
          <ProductImg product={product} />
          {!product.inStock && (
            <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 flex items-center justify-center">
              <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full">{t.outOfStock}</span>
            </div>
          )}
          {inCart && (
            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow">
              <Check className="w-3.5 h-3.5" />
            </div>
          )}
          {selectedBranch && product.inStock && (
            <div className="absolute top-2 left-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-[8px] font-black text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded border border-green-100 dark:border-green-900/50 uppercase tracking-tighter shadow-sm">
              In Stock at {selectedBranch}
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs font-medium py-1.5 text-center opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
            <Eye className="w-3 h-3" /> View details
          </div>
        </div>
        <div className="p-3 flex flex-col flex-1">
          <p className="text-[10px] text-gray-400 font-medium truncate mb-0.5">{product.category}</p>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug flex-1 group-hover:text-red-600 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-end justify-between gap-2 mt-3">
            <div>
              <p className="text-red-600 font-black text-sm leading-none">{formatPrice(product.price)}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">/{product.unit}</p>
            </div>
            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              className={`shrink-0 p-2 rounded-xl font-bold transition-all active:scale-95 ${
                product.inStock
                  ? "bg-red-600 hover:bg-red-700 text-white hover:scale-105"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
