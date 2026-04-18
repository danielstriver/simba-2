"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProducts, Product, CATEGORY_META, formatPrice } from "@/lib/products";
import { useStore } from "@/lib/store";
import { useLang } from "@/lib/LanguageContext";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Check, Package, Tag, BarChart3, ChevronRight } from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLang();
  const addItem = useStore((s) => s.addItem);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const items = useStore((s) => s.items);

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    getProducts().then((data) => {
      const found = data.products.find((p) => p.id === Number(params.id));
      if (!found) { router.push("/products"); return; }
      setProduct(found);
      const rel = data.products.filter((p) => p.category === found.category && p.id !== found.id).slice(0, 4);
      setRelated(rel);
      setLoading(false);
    });
  }, [params.id, router]);

  function handleAdd() {
    if (!product || !product.inStock) return;
    for (let i = 0; i < qty; i++) addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    if (!product || !product.inStock) return;
    for (let i = 0; i < qty; i++) addItem(product);
    setCartOpen(true);
  }

  const inCart = items.find((i) => i.product.id === product?.id);
  const meta = product ? CATEGORY_META[product.category] : null;

  if (loading || !product) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-red-600 transition-colors">{t.home}</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/products" className="hover:text-red-600 transition-colors">{t.allProducts}</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-red-600 transition-colors">
          {product.category}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-600 dark:text-gray-300 truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10 mb-16">
        {/* Image */}
        <div className="relative">
          <div className={`aspect-square rounded-3xl overflow-hidden bg-gradient-to-br ${meta?.color || "from-gray-100 to-gray-200"}`}>
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover mix-blend-multiply"
              onError={(e) => {
                const initials = product.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
                (e.target as HTMLImageElement).src = `https://placehold.co/400x400/fee2e2/dc2626?text=${encodeURIComponent(initials)}`;
              }}
            />
          </div>
          {!product.inStock && (
            <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 rounded-3xl flex items-center justify-center">
              <span className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-bold px-6 py-3 rounded-full text-lg">
                {t.outOfStock}
              </span>
            </div>
          )}
          {inCart && (
            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-lg">
              <Check className="w-4 h-4" />
              In Cart ({inCart.quantity})
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {/* Category badge */}
          <Link
            href={`/products?category=${encodeURIComponent(product.category)}`}
            className={`inline-flex items-center gap-1.5 w-fit bg-gradient-to-r ${meta?.color || "from-gray-400 to-gray-500"} text-white text-xs font-bold px-3 py-1 rounded-full mb-4`}
          >
            <span>{meta?.icon}</span>
            {product.category}
          </Link>

          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight mb-4">
            {product.name}
          </h1>

          <div className="text-4xl font-black text-red-600 mb-2">{formatPrice(product.price)}</div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{t.unit}: {product.unit}</p>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { icon: <Package className="w-4 h-4 text-red-600" />, label: "Status", value: product.inStock ? "In Stock ✓" : "Out of Stock" },
              { icon: <Tag className="w-4 h-4 text-red-600" />, label: "Unit", value: product.unit },
              { icon: <BarChart3 className="w-4 h-4 text-red-600" />, label: "Category ID", value: `#${product.subcategoryId}` },
              { icon: <Tag className="w-4 h-4 text-red-600" />, label: "Product ID", value: `#${product.id}` },
            ].map((detail) => (
              <div key={detail.label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  {detail.icon}
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{detail.label}</span>
                </div>
                <p className={`font-bold text-sm ${detail.label === "Status" && product.inStock ? "text-green-600" : "text-gray-900 dark:text-white"}`}>
                  {detail.value}
                </p>
              </div>
            ))}
          </div>

          {/* Quantity + CTA */}
          {product.inStock && (
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-bold text-gray-600 dark:text-gray-300"
                >
                  −
                </button>
                <span className="px-4 py-3 font-black text-gray-900 dark:text-white min-w-[3rem] text-center">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-bold text-gray-600 dark:text-gray-300"
                >
                  +
                </button>
              </div>
              <p className="text-gray-500 text-sm">× {formatPrice(product.price)} = <strong className="text-gray-900 dark:text-white">{formatPrice(product.price * qty)}</strong></p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all ${
                added
                  ? "bg-green-500 text-white"
                  : product.inStock
                  ? "bg-red-600 hover:bg-red-700 text-white hover:scale-[1.02]"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              {added ? (
                <><Check className="w-5 h-5" /> Added!</>
              ) : (
                <><ShoppingCart className="w-5 h-5" /> {t.addToCart}</>
              )}
            </button>
            {product.inStock && (
              <button
                onClick={handleBuyNow}
                className="flex-1 border-2 border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 py-3.5 rounded-xl font-bold transition-colors"
              >
                {t.checkout} →
              </button>
            )}
          </div>

          {/* Delivery note */}
          <div className="mt-6 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900 rounded-xl p-4 text-sm text-green-700 dark:text-green-400">
            🚚 Free delivery in Kigali for orders above RWF 5,000
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section>
          <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-6">{t.relatedProducts}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
