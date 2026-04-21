"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getProducts, Product, CATEGORIES, CATEGORY_META, formatPrice } from "@/lib/products";
import { useLang } from "@/lib/LanguageContext";
import ProductCard from "@/components/ProductCard";
import Image from "next/image";
import { ArrowRight, Search, Truck, Shield, Clock, ChevronRight, Zap, Phone } from "lucide-react";

export default function HomePage() {
  const { t } = useLang();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroSearch, setHeroSearch] = useState("");

  useEffect(() => {
    getProducts().then((d) => {
      setProducts(d.products);
      setLoading(false);
    });
  }, []);

  function handleHeroSearch(e: React.FormEvent) {
    e.preventDefault();
    if (heroSearch.trim()) router.push(`/products?q=${encodeURIComponent(heroSearch.trim())}`);
  }

  // Curated product sets
  const topCosmetics = products.filter((p) => p.category === "Cosmetics & Personal Care").slice(0, 4);
  const topDrinks = products
    .filter((p) => p.category === "Alcoholic Drinks")
    .filter((p) => ["wine", "beer", "whisky", "gin", "cognac", "amarula"].some(k => p.name.toLowerCase().includes(k)))
    .slice(0, 4);
  const foodProducts = products.filter((p) => p.category === "Food Products").slice(0, 4);
  const kitchenProducts = products.filter((p) => p.category === "Kitchenware & Electronics").slice(0, 4);
  const cleaningProducts = products.filter((p) => p.category === "Cleaning & Sanitary").slice(0, 4);
  const featured = [...topCosmetics, ...topDrinks].slice(0, 8);

  // Popular categories by product count
  const popularCats = CATEGORIES.slice(0, 6);

  return (
    <div>
      {/* ─── HERO — 10-second test: who, what, why ─── */}
      <section className="relative overflow-hidden">
        {/* Background store image */}
        <Image
          src="/images/bg-suggested.jpg"
          alt=""
          fill
          className="object-cover object-center"
          priority
        />
        {/* Dark overlay — keeps text readable over the photo */}
        <div className="absolute inset-0 bg-red-900/65" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-xs font-bold px-4 py-1.5 rounded-full mb-5 border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            🇷🇼 Rwanda&apos;s Most Popular Online Supermarket
          </div>

          {/* Headline — immediate value clarity */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-3">
            {t.heroTitle}
          </h1>
          <p className="text-red-100 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            552 real products · Delivered in Kigali · Pay with MoMo or Cash
          </p>

          {/* Search — primary action, prominently placed */}
          <form onSubmit={handleHeroSearch} className="max-w-xl mx-auto mb-6">
            <div className="relative flex items-center bg-white rounded-2xl shadow-2xl overflow-hidden">
              <Search className="absolute left-4 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="flex-1 pl-12 pr-4 py-4 text-gray-900 text-base bg-transparent focus:outline-none placeholder-gray-400"
              />
              <button
                type="submit"
                className="m-1.5 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
              >
                {t.shopNow}
              </button>
            </div>
          </form>

          {/* Quick category links — reduce friction to first useful moment */}
          <div className="flex flex-wrap justify-center gap-2">
            {["Cosmetics & Personal Care", "Food Products", "Cleaning & Sanitary", "Kitchenware & Electronics"].map((cat) => (
              <Link
                key={cat}
                href={`/products?category=${encodeURIComponent(cat)}`}
                className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-full transition-colors backdrop-blur-sm"
              >
                <span>{CATEGORY_META[cat].icon}</span>
                <span>{cat.split("&")[0].trim()}</span>
              </Link>
            ))}
            <Link
              href="/products"
              className="inline-flex items-center gap-1 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-full transition-colors backdrop-blur-sm"
            >
              {t.viewAll} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── TRUST STRIP — visible proof ─── */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky-below-nav">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center flex-wrap gap-x-8 gap-y-2 text-sm">
            {[
              { icon: <Truck className="w-4 h-4 text-green-600" />, text: "Free delivery in Kigali" },
              { icon: <Phone className="w-4 h-4 text-yellow-600" />, text: "Pay with MTN MoMo" },
              { icon: <Shield className="w-4 h-4 text-blue-600" />, text: "100% authentic products" },
              { icon: <Clock className="w-4 h-4 text-purple-600" />, text: "Same-day delivery" },
              { icon: <Zap className="w-4 h-4 text-red-600" />, text: "552 products in stock" },
            ].map((b) => (
              <div key={b.text} className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 font-medium">
                {b.icon}
                <span>{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES — clear navigation ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">{t.categories}</h2>
          <Link href="/products" className="text-red-600 hover:text-red-700 font-semibold text-sm flex items-center gap-1">
            {t.viewAll} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
          {CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat];
            return (
              <Link
                key={cat}
                href={`/products?category=${encodeURIComponent(cat)}`}
                className="group flex flex-col items-center gap-2 p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-800 hover:shadow-md transition-all"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform`}>
                  {meta.icon}
                </div>
                <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400 text-center leading-tight group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                  {cat.replace(" & ", " &\n")}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── FEATURED PRODUCTS ─── */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">{t.featuredProducts}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Our most-loved products this week</p>
            </div>
            <Link href="/products" className="text-red-600 hover:text-red-700 font-semibold text-sm flex items-center gap-1">
              {t.viewAll} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {featured.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ─── PROMO BANNER (Cosmetics) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-500 via-rose-500 to-red-600 p-8 md:p-12">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute -left-8 -bottom-8 w-48 h-48 bg-white/5 rounded-full pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <span className="text-4xl">✨</span>
              <h3 className="text-2xl md:text-3xl font-black text-white mb-1 mt-2">Cosmetics & Personal Care</h3>
              <p className="text-pink-100 text-base">214 products — skincare, fragrances, hair care & more</p>
            </div>
            <Link
              href="/products?category=Cosmetics+%26+Personal+Care"
              className="shrink-0 inline-flex items-center gap-2 bg-white text-red-700 font-bold px-6 py-3 rounded-full hover:bg-red-50 transition-colors shadow-lg"
            >
              Shop Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOD PRODUCTS ─── */}
      {!loading && foodProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <SectionHeader title="Food Products" icon="🥗" cat="Food Products" t={t} />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {foodProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* ─── TWO-COLUMN PROMO ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/products?category=Kitchenware+%26+Electronics" className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 p-6 min-h-[140px] flex flex-col justify-between hover:shadow-xl transition-shadow">
            <div>
              <span className="text-3xl">🍳</span>
              <h4 className="text-xl font-black text-white mt-2">Kitchenware & Electronics</h4>
              <p className="text-orange-100 text-sm">Irons, kettles, pots & more</p>
            </div>
            <span className="inline-flex items-center gap-1 text-white font-bold text-sm group-hover:gap-2 transition-all">
              Shop now <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
          <Link href="/products?category=Cleaning+%26+Sanitary" className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 p-6 min-h-[140px] flex flex-col justify-between hover:shadow-xl transition-shadow">
            <div>
              <span className="text-3xl">🧴</span>
              <h4 className="text-xl font-black text-white mt-2">Cleaning & Sanitary</h4>
              <p className="text-teal-100 text-sm">Keep your home spotless</p>
            </div>
            <span className="inline-flex items-center gap-1 text-white font-bold text-sm group-hover:gap-2 transition-all">
              Shop now <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </section>

      {/* ─── KITCHENWARE ─── */}
      {!loading && kitchenProducts.length > 0 && (
        <section className="bg-gray-50 dark:bg-gray-900/50 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader title="Kitchenware & Electronics" icon="🍳" cat="Kitchenware & Electronics" t={t} />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {kitchenProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ─── CLEANING ─── */}
      {!loading && cleaningProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <SectionHeader title="Cleaning & Sanitary" icon="🧴" cat="Cleaning & Sanitary" t={t} />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {cleaningProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* ─── BOTTOM CTA — return reason ─── */}
      <section className="bg-gray-900 dark:bg-gray-950 py-14">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
            Everything you need, delivered to your door
          </h2>
          <p className="text-gray-400 mb-8">
            From cosmetics to food to cleaning supplies — 552 products ready for delivery anywhere in Kigali.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3.5 rounded-full transition-colors shadow-lg"
          >
            Browse All Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ title, icon, cat, t }: { title: string; icon: string; cat: string; t: { viewAll: string } }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2.5">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">{title}</h2>
      </div>
      <Link href={`/products?category=${encodeURIComponent(cat)}`} className="text-red-600 hover:text-red-700 font-semibold text-sm flex items-center gap-1">
        {t.viewAll} <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-pulse">
      <div className="aspect-square bg-gray-200 dark:bg-gray-700" />
      <div className="p-3.5 space-y-2">
        <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        <div className="flex justify-between mt-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}
