"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getProducts, Product, CATEGORIES, CATEGORY_META } from "@/lib/products";
import { useLang } from "@/lib/LanguageContext";
import { useStore } from "@/lib/store";
import { getBranch, DEFAULT_BRANCH_ID } from "@/lib/branches";
import ProductCard from "@/components/ProductCard";
import Image from "next/image";
import { ArrowRight, Search, Truck, Shield, Clock, ChevronRight, Zap, MapPin, ChevronDown, CheckCircle } from "lucide-react";
import MtnBadge from "@/components/MtnBadge";

export default function HomePage() {
  const { t } = useLang();
  const router = useRouter();
  const { selectedBranch, setSelectedBranch, setShowBranchModal } = useStore();
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

  function handleStartShopping() {
    if (!selectedBranch) setSelectedBranch(DEFAULT_BRANCH_ID);
    router.push("/products");
  }

  const topCosmetics = useMemo(() => products.filter((p) => p.category === "Cosmetics & Personal Care").slice(0, 4), [products]);
  const topDrinks = useMemo(() => products
    .filter((p) => p.category === "Alcoholic Drinks")
    .filter((p) => ["wine", "beer", "whisky", "gin", "cognac", "amarula"].some(k => p.name.toLowerCase().includes(k)))
    .slice(0, 4), [products]);
  const foodProducts = useMemo(() => products.filter((p) => p.category === "Food Products").slice(0, 4), [products]);
  const kitchenProducts = useMemo(() => products.filter((p) => p.category === "Kitchenware & Electronics").slice(0, 4), [products]);
  const cleaningProducts = useMemo(() => products.filter((p) => p.category === "Cleaning & Sanitary").slice(0, 4), [products]);
  const featured = useMemo(() => [...topCosmetics, ...topDrinks].slice(0, 8), [topCosmetics, topDrinks]);

  return (
    <div>
      {/* ─── HERO — split layout (Getir/Glovo inspired) ─── */}
      <section className="relative bg-white dark:bg-gray-950 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute right-0 top-0 w-[700px] h-[700px] bg-orange-50 dark:bg-orange-950/10 rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="absolute left-0 bottom-0 w-[300px] h-[300px] bg-orange-50 dark:bg-orange-950/10 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16 py-8 sm:py-14 lg:py-20 min-h-[560px]">

            {/* Mobile-only: hero image at top */}
            <div className="lg:hidden w-full relative">
              <div className="relative w-full h-52 rounded-3xl overflow-hidden">
                <Image
                  src="/images/bg-suggested.jpg"
                  alt="Fresh groceries at Simba"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                {/* Badge over image on mobile */}
                <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2 shadow">
                  <span className="text-base">🛒</span>
                  <div>
                    <p className="text-[11px] font-black text-gray-900 dark:text-white">789 products</p>
                    <p className="text-[10px] text-gray-500">{t.trustSameDay}</p>
                  </div>
                </div>
                <div className="absolute bottom-3 right-3">
                  <MtnBadge size="md" />
                </div>
              </div>
            </div>

            {/* Left: Text + CTA */}
            <div className="flex-1 max-w-xl lg:max-w-none lg:pr-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-xs font-bold px-4 py-1.5 rounded-full mb-4 border border-green-200 dark:border-green-900">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                🇷🇼 11 branches across Kigali
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-[3.75rem] font-black text-gray-900 dark:text-white leading-[1.05] tracking-tight mb-3">
                {t.heroTitle}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg leading-relaxed mb-6 max-w-lg mx-auto lg:mx-0">
                {t.heroSubtitle}
              </p>

              {/* Branch picker + CTA */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6 max-w-lg mx-auto lg:mx-0">
                <button
                  type="button"
                  onClick={() => setShowBranchModal(true)}
                  className="relative flex-1 flex items-center gap-3 pl-4 pr-4 py-3.5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-orange-400 dark:hover:border-orange-600 transition-all group text-left cursor-pointer shadow-sm hover:shadow-md"
                >
                  <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/50 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider leading-none mb-0.5">{t.pickupBranch}</p>
                    <p className="text-sm font-black text-gray-900 dark:text-white truncate">{getBranch(selectedBranch).label}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-orange-600 transition-colors shrink-0" />
                </button>
                <button
                  onClick={handleStartShopping}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-black px-8 py-4 rounded-2xl text-sm whitespace-nowrap transition-colors shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2"
                >
                  {t.shopNow} <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Mini trust badges */}
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  {t.trustAuthentic}
                </span>
                <MtnBadge size="sm" />
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                  {t.trustSameDay}
                </span>
              </div>
            </div>

            {/* Right: Visual — desktop only */}
            <div className="hidden lg:flex flex-1 items-center justify-center">
              <div className="relative w-full max-w-[420px] aspect-square">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-950/20 rounded-[2.5rem]" />
                <Image
                  src="/images/bg-suggested.jpg"
                  alt="Fresh groceries at Simba"
                  fill
                  className="object-cover rounded-[2.5rem] shadow-2xl"
                  priority
                />
                <div className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl px-4 py-3 border border-gray-100 dark:border-gray-800 flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-950 rounded-xl flex items-center justify-center text-xl">🛒</div>
                  <div>
                    <p className="text-xs font-black text-gray-900 dark:text-white">789 products</p>
                    <p className="text-[11px] text-gray-400">Ready for pickup</p>
                  </div>
                </div>
                <MtnBadge size="lg" className="absolute -top-4 -right-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SEARCH BAR (below hero) ─── */}
      <section className="bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <form onSubmit={handleHeroSearch} className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-3 rounded-xl text-sm transition-colors shadow-sm whitespace-nowrap"
            >
              {t.shopNow}
            </button>
          </form>
        </div>
      </section>

      {/* ─── TRUST STRIP ─── */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center flex-wrap gap-x-8 gap-y-2 text-sm">
            {[
              { icon: <Truck className="w-4 h-4 text-green-600" />, text: t.trustFreePickup },
              { icon: <Shield className="w-4 h-4 text-blue-600" />, text: t.trustAuthentic },
              { icon: <Clock className="w-4 h-4 text-purple-600" />, text: t.trustSameDay },
              { icon: <Zap className="w-4 h-4 text-orange-600" />, text: t.trustProducts },
            ].map((b) => (
              <div key={b.text} className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 font-medium">
                {b.icon}
                <span>{b.text}</span>
              </div>
            ))}
            {/* MTN MoMo — rendered as branded badge, not plain text */}
            <MtnBadge size="sm" />
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">{t.shopByCategory}</h2>
          <Link href="/products" className="text-orange-600 hover:text-orange-700 font-semibold text-sm flex items-center gap-1">
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
                className="group flex flex-col items-center gap-2 p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-800 hover:shadow-md transition-all"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform`}>
                  {meta.icon}
                </div>
                <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400 text-center leading-tight group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
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
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{t.featuredProductsSubtitle}</p>
            </div>
            <Link href="/products" className="text-orange-600 hover:text-orange-700 font-semibold text-sm flex items-center gap-1">
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
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-500 via-rose-500 to-orange-600 p-8 md:p-12">
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
              className="shrink-0 inline-flex items-center gap-2 bg-white text-orange-700 font-bold px-6 py-3 rounded-full hover:bg-orange-50 transition-colors shadow-lg"
            >
              {t.shopNow} <ArrowRight className="w-4 h-4" />
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
              {t.shopNow} <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
          <Link href="/products?category=Cleaning+%26+Sanitary" className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 p-6 min-h-[140px] flex flex-col justify-between hover:shadow-xl transition-shadow">
            <div>
              <span className="text-3xl">🧴</span>
              <h4 className="text-xl font-black text-white mt-2">Cleaning & Sanitary</h4>
              <p className="text-teal-100 text-sm">Keep your home spotless</p>
            </div>
            <span className="inline-flex items-center gap-1 text-white font-bold text-sm group-hover:gap-2 transition-all">
              {t.shopNow} <ArrowRight className="w-4 h-4" />
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

      {/* ─── BOTTOM CTA ─── */}
      <section className="bg-gray-900 dark:bg-gray-950 py-14">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
            {t.bottomCtaTitle}
          </h2>
          <p className="text-gray-400 mb-8">
            {t.bottomCtaSubtitle}
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-3.5 rounded-full transition-colors shadow-lg"
          >
            {t.browseAll} <ArrowRight className="w-4 h-4" />
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
      <Link href={`/products?category=${encodeURIComponent(cat)}`} className="text-orange-600 hover:text-orange-700 font-semibold text-sm flex items-center gap-1">
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
