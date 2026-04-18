"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getProducts, Product, CATEGORIES, CATEGORY_META, formatPrice } from "@/lib/products";
import { useLang } from "@/lib/LanguageContext";
import ProductCard from "@/components/ProductCard";
import { ArrowRight, Star, Truck, Shield, Clock, ChevronRight } from "lucide-react";

export default function HomePage() {
  const { t } = useLang();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts().then((d) => {
      setProducts(d.products);
      setLoading(false);
    });
  }, []);

  const featured = products.slice(0, 8);
  const foodProducts = products.filter((p) => p.category === "Food Products").slice(0, 4);
  const cleaningProducts = products.filter((p) => p.category === "Cleaning & Sanitary").slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-rose-800">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white" />
          <div className="absolute bottom-10 right-20 w-48 h-48 rounded-full bg-white" />
          <div className="absolute top-1/2 left-1/3 w-20 h-20 rounded-full bg-white" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left">
            <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 backdrop-blur-sm">
              🇷🇼 Rwanda&apos;s #1 Online Supermarket
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4">
              {t.heroTitle}
            </h1>
            <p className="text-red-100 text-lg mb-8 max-w-md">
              {t.heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-white text-red-700 hover:bg-red-50 font-bold px-6 py-3 rounded-full shadow-lg transition-all hover:scale-105"
              >
                {t.shopNow}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-red-800/50 hover:bg-red-800 text-white font-bold px-6 py-3 rounded-full backdrop-blur-sm transition-all"
              >
                {t.viewAll}
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 shrink-0">
            {[
              { value: "552+", label: "Products" },
              { value: "9", label: "Categories" },
              { value: "RWF", label: "Currency" },
              { value: "Fast", label: "Delivery" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/15 backdrop-blur-sm rounded-2xl px-6 py-4 text-center border border-white/20">
                <p className="text-3xl font-black text-white">{stat.value}</p>
                <p className="text-red-200 text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Truck className="w-5 h-5 text-red-600" />, text: "Free delivery in Kigali" },
            { icon: <Shield className="w-5 h-5 text-red-600" />, text: "Secure payments" },
            { icon: <Clock className="w-5 h-5 text-red-600" />, text: "Same-day delivery" },
            { icon: <Star className="w-5 h-5 text-red-600" />, text: "Top quality products" },
          ].map((b) => (
            <div key={b.text} className="flex items-center gap-2">
              {b.icon}
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{b.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">{t.categories}</h2>
          <Link href="/products" className="text-red-600 hover:text-red-700 font-semibold text-sm flex items-center gap-1">
            {t.viewAll} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat];
            return (
              <Link
                key={cat}
                href={`/products?category=${encodeURIComponent(cat)}`}
                className="group relative rounded-2xl overflow-hidden aspect-square shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.03]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${meta.image})` }}
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${meta.color} opacity-80 group-hover:opacity-90 transition-opacity`} />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
                  <span className="text-3xl mb-1">{meta.icon}</span>
                  <p className="text-white font-bold text-sm leading-tight">{cat}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">{t.featuredProducts}</h2>
            <Link href="/products" className="text-red-600 hover:text-red-700 font-semibold text-sm flex items-center gap-1">
              {t.viewAll} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-gray-200 dark:bg-gray-800 rounded-2xl aspect-[3/4] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {featured.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 to-red-600 p-8 md:p-12">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute -left-8 -bottom-8 w-48 h-48 bg-white/5 rounded-full" />
          <div className="relative">
            <span className="text-4xl">✨</span>
            <h3 className="text-2xl md:text-3xl font-black text-white mb-2 mt-2">Cosmetics & Personal Care</h3>
            <p className="text-orange-100 mb-6">214 products to keep you looking your best — all at great RWF prices</p>
            <Link
              href="/products?category=Cosmetics+%26+Personal+Care"
              className="inline-flex items-center gap-2 bg-white text-red-700 font-bold px-5 py-2.5 rounded-full hover:bg-red-50 transition-colors shadow-md"
            >
              Shop Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Food Products */}
      {!loading && foodProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🥗</span>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">Food Products</h2>
            </div>
            <Link href="/products?category=Food+Products" className="text-red-600 hover:text-red-700 font-semibold text-sm flex items-center gap-1">
              {t.viewAll} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {foodProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Cleaning Products */}
      {!loading && cleaningProducts.length > 0 && (
        <section className="bg-gray-50 dark:bg-gray-900/50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🧴</span>
                <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">Cleaning & Sanitary</h2>
              </div>
              <Link href="/products?category=Cleaning+%26+Sanitary" className="text-red-600 hover:text-red-700 font-semibold text-sm flex items-center gap-1">
                {t.viewAll} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {cleaningProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
