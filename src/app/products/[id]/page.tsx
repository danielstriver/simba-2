"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProducts, Product, CATEGORY_META, formatPrice } from "@/lib/products";
import { getProductImage } from "@/lib/imageMap";
import { useStore } from "@/lib/store";
import { useLang } from "@/lib/LanguageContext";
import { useToast } from "@/components/Toast";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Check, Truck, Shield, ChevronRight, Minus, Plus } from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLang();
  const addItem = useStore((s) => s.addItem);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const items = useStore((s) => s.items);
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    getProducts().then((data) => {
      const found = data.products.find((p) => p.id === Number(params.id));
      if (!found) { router.push("/products"); return; }
      setProduct(found);
      // Related = same category, sorted by proximity of ID
      const rel = data.products
        .filter((p) => p.category === found.category && p.id !== found.id)
        .slice(0, 4);
      setRelated(rel);
      setLoading(false);
    });
  }, [params.id]);

  function handleAdd() {
    if (!product?.inStock) return;
    for (let i = 0; i < qty; i++) addItem(product);
    toast(`${qty > 1 ? qty + "×" : ""} Added to cart`, "cart", product.name);
  }

  function handleBuyNow() {
    if (!product?.inStock) return;
    handleAdd();
    setTimeout(() => setCartOpen(true), 300);
  }

  const inCart = items.find((i) => i.product.id === product?.id);
  const meta = product ? CATEGORY_META[product.category] : null;
  const imgSrc = product
    ? (product.image.includes("placehold.co")
        ? getProductImage(product.id, product.name, product.category)
        : product.image)
    : "";

  if (loading || !product) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6 flex-wrap">
        <Link href="/" className="hover:text-red-600 transition-colors">{t.home}</Link>
        <ChevronRight className="w-3 h-3 shrink-0" />
        <Link href="/products" className="hover:text-red-600 transition-colors">{t.allProducts}</Link>
        <ChevronRight className="w-3 h-3 shrink-0" />
        <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-red-600 transition-colors">
          {product.category}
        </Link>
        <ChevronRight className="w-3 h-3 shrink-0" />
        <span className="text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 font-medium mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> {t.backToShop}
      </button>

      <div className="grid md:grid-cols-2 gap-10 mb-14">
        {/* ─── IMAGE ─── */}
        <div>
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-gray-50 dark:bg-gray-800 shadow-sm">
            {imgFailed ? (
              <div className={`w-full h-full bg-gradient-to-br ${meta?.color || "from-gray-200 to-gray-400"} flex flex-col items-center justify-center gap-3`}>
                <span className="text-7xl">{meta?.icon || "🛒"}</span>
                <p className="text-white font-bold text-center px-6 leading-snug opacity-90">{product.name}</p>
              </div>
            ) : (
              <img
                src={imgSrc}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={() => setImgFailed(true)}
              />
            )}
            {!product.inStock && (
              <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 flex items-center justify-center rounded-3xl">
                <span className="bg-gray-900 text-white font-bold px-6 py-2.5 rounded-full text-base">
                  {t.outOfStock}
                </span>
              </div>
            )}
            {inCart && (
              <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                <Check className="w-3.5 h-3.5" /> In cart ({inCart.quantity})
              </div>
            )}
          </div>

          {/* Product metadata chips */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${product.inStock ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400" : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400"}`}>
              {product.inStock ? "✓ In Stock" : "✗ Out of Stock"}
            </span>
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              SKU #{product.id}
            </span>
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              Unit: {product.unit}
            </span>
          </div>
        </div>

        {/* ─── PRODUCT INFO ─── */}
        <div className="flex flex-col">
          {/* Category */}
          <Link
            href={`/products?category=${encodeURIComponent(product.category)}`}
            className={`inline-flex items-center gap-1.5 w-fit bg-gradient-to-r ${meta?.color || "from-gray-400 to-gray-500"} text-white text-xs font-bold px-3 py-1 rounded-full mb-4 hover:opacity-90 transition-opacity`}
          >
            <span>{meta?.icon}</span> {product.category}
          </Link>

          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight mb-4">
            {product.name}
          </h1>

          {/* Price — clear, prominent */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-black text-red-600">{formatPrice(product.price)}</span>
            <span className="text-sm text-gray-400">per {product.unit}</span>
          </div>

          {/* Trust signals inline */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/50 rounded-xl px-3 py-2.5">
              <Truck className="w-4 h-4 text-green-600 shrink-0" />
              <span className="text-xs font-medium text-green-800 dark:text-green-300">Free delivery in Kigali</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/50 rounded-xl px-3 py-2.5">
              <Shield className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-xs font-medium text-blue-800 dark:text-blue-300">100% authentic</span>
            </div>
          </div>

          {/* Quantity selector */}
          {product.inStock && (
            <div className="mb-5">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.quantity}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300 font-bold"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-5 py-2.5 font-black text-gray-900 dark:text-white text-base min-w-[3rem] text-center border-x border-gray-200 dark:border-gray-700">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300 font-bold"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {qty > 1 && (
                  <p className="text-sm text-gray-500">
                    Total: <strong className="text-gray-900 dark:text-white">{formatPrice(product.price * qty)}</strong>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* CTAs — primary then secondary */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all text-sm ${
                product.inStock
                  ? "bg-red-600 hover:bg-red-700 text-white active:scale-[0.98]"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              <ShoppingCart className="w-5 h-5" /> {t.addToCart}
            </button>
            {product.inStock && (
              <button
                onClick={handleBuyNow}
                className="flex-1 border-2 border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 py-3.5 rounded-xl font-bold transition-colors text-sm"
              >
                Buy Now →
              </button>
            )}
          </div>

          {/* Product details table */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {[
                { label: "Category", value: product.category },
                { label: "Unit", value: product.unit },
                { label: "Availability", value: product.inStock ? "In Stock" : "Out of Stock" },
                { label: "Product ID", value: `#${product.id}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center px-4 py-2.5 text-sm">
                  <span className="w-32 text-gray-500 dark:text-gray-400 font-medium shrink-0">{label}</span>
                  <span className={`font-semibold ${label === "Availability" && product.inStock ? "text-green-600" : "text-gray-900 dark:text-white"}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── RELATED PRODUCTS ─── */}
      {related.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black text-gray-900 dark:text-white">{t.relatedProducts}</h2>
            <Link
              href={`/products?category=${encodeURIComponent(product.category)}`}
              className="text-red-600 hover:text-red-700 text-sm font-semibold flex items-center gap-1"
            >
              {t.viewAll} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
