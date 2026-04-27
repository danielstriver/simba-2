"use client";
import { useEffect } from "react";
import { useLang } from "@/lib/LanguageContext";
import { translations } from "@/lib/i18n";
import Link from "next/link";
import { ArrowRight, MapPin, ShoppingCart, Package, Truck, Shield } from "lucide-react";

export default function RwPage() {
  const { setLang } = useLang();
  useEffect(() => { setLang("rw"); }, [setLang]);

  const t = translations.rw;

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 overflow-hidden py-16 sm:py-24 px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-orange-100/50 dark:bg-orange-950/10 rounded-full -translate-y-1/3 translate-x-1/3" />
          <div className="absolute left-0 bottom-0 w-[300px] h-[300px] bg-orange-100/50 dark:bg-orange-950/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 text-xs font-bold px-3 py-1.5 rounded-full mb-6">
            <MapPin className="w-3.5 h-3.5" /> Kigali, Rwanda · Amashami 11
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-gray-900 dark:text-white mb-5 leading-tight tracking-tight">
            {t.heroTitle}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
            {t.heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 bg-orange-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-orange-700 active:scale-95 transition-all text-base shadow-lg shadow-orange-200 dark:shadow-orange-950"
            >
              <ShoppingCart className="w-5 h-5" /> {t.shopNow}
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 border-2 border-orange-600 text-orange-600 dark:text-orange-400 font-bold px-8 py-3.5 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors text-base"
            >
              {t.home} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-orange-600 py-4 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-white">
          {[
            { icon: <Package className="w-4 h-4" />, val: "789", label: t.products },
            { icon: <MapPin className="w-4 h-4" />, val: "11", label: "Amashami i Kigali" },
            { icon: <Truck className="w-4 h-4" />, val: t.free, label: t.trustFreePickup },
            { icon: <Shield className="w-4 h-4" />, val: "100%", label: t.trustAuthentic },
          ].map(({ icon, val, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5 text-orange-200">{icon}<span className="font-black text-white text-lg">{val}</span></div>
              <p className="text-orange-200 text-[11px] leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-14 px-4 max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-2 text-center">
          {t.shopByCategory}
        </h2>
        <p className="text-gray-400 text-center text-sm mb-8">{t.products} 789 · {t.categories} 10</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: t.catFood, icon: "🥗", desc: t.footer.shopCategories[2], href: "/products?cat=Food+Products" },
            { label: t.catCosmetics, icon: "✨", desc: t.footer.shopCategories[0], href: "/products?cat=Cosmetics+%26+Personal+Care" },
            { label: t.catAlcohol, icon: "🍷", desc: t.footer.shopCategories[1], href: "/products?cat=Alcoholic+Drinks" },
            { label: t.catCleaning, icon: "🧴", desc: t.footer.shopCategories[3], href: "/products?cat=Cleaning+%26+Sanitary" },
            { label: t.catBaby, icon: "👶", desc: t.footer.shopCategories[4], href: "/products?cat=Baby+Products" },
            { label: "Igikoni", icon: "🍳", desc: "Kitchenware & Electronics", href: "/products?cat=Kitchenware+%26+Electronics" },
            { label: "Siporo", icon: "⚽", desc: "Sports & Wellness", href: "/products?cat=Sports+%26+Wellness" },
            { label: "Ibindi", icon: "🛒", desc: "General", href: "/products?cat=General" },
          ].map((cat) => (
            <Link
              key={cat.label}
              href={cat.href}
              className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 text-center border border-gray-100 dark:border-gray-700 hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-lg transition-all group"
            >
              <span className="text-3xl sm:text-4xl block mb-2 group-hover:scale-110 transition-transform">{cat.icon}</span>
              <p className="font-black text-gray-900 dark:text-white text-sm">{cat.label}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8">{t.bottomCtaTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {[
              { step: "1", title: t.allProducts, desc: t.searchPlaceholder.replace("...", "") },
              { step: "2", title: t.checkout, desc: t.selectBranch + " + " + t.pickupDate },
              { step: "3", title: t.orderPlaced + "!", desc: t.pickupInstructions.slice(0, 60) + "…" },
            ].map(({ step, title, desc }) => (
              <div key={step} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                <div className="w-10 h-10 rounded-full bg-orange-600 text-white font-black text-lg flex items-center justify-center mx-auto mb-3">
                  {step}
                </div>
                <p className="font-black text-gray-900 dark:text-white mb-1">{title}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-orange-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-orange-700 transition-colors"
          >
            {t.browseAll} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
