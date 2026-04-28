"use client";
import { useEffect, useState, useMemo, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getProducts, Product, CATEGORIES, CATEGORY_META, formatPrice } from "@/lib/products";
import { useLang } from "@/lib/LanguageContext";
import Link from "next/link";
import { Search, X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { smartSearch } from "@/lib/search";
import ProductCard from "@/components/ProductCard";

type SortOption = "default" | "price-asc" | "price-desc" | "name-asc";

// ─── Main content ─────────────────────────────────────────────────────────────
function ProductsContent() {
  const { t } = useLang();
  const searchParams = useSearchParams();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sort, setSort] = useState<SortOption>("default");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(800000);

  // Search & category — initialized from URL once, then local
  const initialQ = searchParams.get("q") || "";
  const initialCat = searchParams.get("category") || "";
  const [inputValue, setInputValue] = useState(initialQ);   // what's in the text box
  const [activeSearch, setActiveSearch] = useState(initialQ); // what's actually filtering
  const [selectedCat, setSelectedCat] = useState(initialCat);

  // Track previous URL params to detect external navigation (e.g., from nav search)
  const prevQ = useRef(initialQ);
  const prevCat = useRef(initialCat);
  useEffect(() => {
    const q = searchParams.get("q") || "";
    const cat = searchParams.get("category") || "";
    if (q !== prevQ.current) {
      setInputValue(q);
      setActiveSearch(q);
      prevQ.current = q;
    }
    if (cat !== prevCat.current) {
      setSelectedCat(cat);
      prevCat.current = cat;
    }
  }, [searchParams]);

  useEffect(() => {
    getProducts()
      .then((d) => { setAllProducts(d.products); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Commit the typed value as the active filter (called on Enter or button click)
  function commitSearch() {
    setActiveSearch(inputValue.trim());
  }

  // Filtered + sorted results using smart search
  const filtered = useMemo(() => {
    let result = activeSearch ? smartSearch(activeSearch, allProducts) : allProducts;
    if (selectedCat) result = result.filter((p) => p.category === selectedCat);
    if (inStockOnly) result = result.filter((p) => p.inStock);
    result = result.filter((p) => p.price <= maxPrice);
    // Only apply manual sort when not searching (search already sorts by relevance)
    if (!activeSearch) {
      if (sort === "price-asc") return [...result].sort((a, b) => a.price - b.price);
      if (sort === "price-desc") return [...result].sort((a, b) => b.price - a.price);
      if (sort === "name-asc") return [...result].sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  }, [allProducts, activeSearch, selectedCat, inStockOnly, sort, maxPrice]);

  function clearAll() {
    setInputValue("");
    setActiveSearch("");
    setSelectedCat("");
    setSort("default");
    setInStockOnly(false);
    setMaxPrice(800000);
  }

  const hasFilters = activeSearch || selectedCat || sort !== "default" || inStockOnly || maxPrice < 800000;

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of allProducts) map[p.category] = (map[p.category] ?? 0) + 1;
    return map;
  }, [allProducts]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

      {/* ── Search bar + sort ─────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Search input with explicit Search button */}
        <div className="relative flex flex-1 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              // Real-time filtering as you type
              setActiveSearch(e.target.value.trim());
            }}
            onKeyDown={(e) => e.key === "Enter" && commitSearch()}
            placeholder={t.searchPlaceholder}
            className="flex-1 pl-10 pr-3 py-2.5 text-sm bg-transparent focus:outline-none text-gray-900 dark:text-white placeholder-gray-400"
          />
          {inputValue && (
            <button
              onClick={() => { setInputValue(""); setActiveSearch(""); }}
              className="px-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={commitSearch}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm px-4 py-2.5 transition-colors"
          >
            Search
          </button>
        </div>

        {/* Sort */}
        <div className="relative shrink-0">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="appearance-none w-full sm:w-auto pl-4 pr-8 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer text-gray-900 dark:text-white"
          >
            <option value="default">Sort: Default</option>
            <option value="price-asc">{t.priceLowHigh}</option>
            <option value="price-desc">{t.priceHighLow}</option>
            <option value="name-asc">{t.nameAZ}</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Filter toggle (mobile) */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="sm:hidden flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {t.filters}
          {hasFilters && <span className="w-2 h-2 rounded-full bg-orange-600 shrink-0" />}
        </button>
      </div>

      {/* ── Active search tag ─────────────────── */}
      {activeSearch && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">Results for:</span>
          <span className="inline-flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-400 text-sm font-bold px-3 py-1 rounded-full border border-orange-200 dark:border-orange-900">
            &ldquo;{activeSearch}&rdquo;
            <button onClick={() => { setInputValue(""); setActiveSearch(""); }} className="hover:text-orange-900">
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
          {!loading && (
            <span className="text-sm text-gray-500">— {filtered.length} {filtered.length === 1 ? t.item : t.items} found</span>
          )}
        </div>
      )}

      {/* ── Category pills ─────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide pr-4">
        <button
          onClick={() => setSelectedCat("")}
          className={`shrink-0 text-xs px-3.5 py-1.5 rounded-full font-medium border transition-colors whitespace-nowrap ${
            !selectedCat ? "bg-orange-600 text-white border-orange-600" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 hover:border-orange-300"
          }`}
        >
          All ({allProducts.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = categoryCounts[cat] ?? 0;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat === selectedCat ? "" : cat)}
              className={`shrink-0 text-xs px-3.5 py-1.5 rounded-full font-medium border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                selectedCat === cat ? "bg-orange-600 text-white border-orange-600" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 hover:border-orange-300"
              }`}
            >
              <span>{CATEGORY_META[cat]?.icon}</span>
              <span>{cat.split(" & ")[0]}</span>
              <span className={selectedCat === cat ? "text-orange-200" : "text-gray-400"}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* ── Result header ─────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-black text-gray-900 dark:text-white">
            {selectedCat || t.allProducts}
          </h1>
          {!loading && !activeSearch && (
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{filtered.length} {t.products}</p>
          )}
        </div>
        {hasFilters && (
          <button onClick={clearAll} className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-bold">
            <X className="w-3.5 h-3.5" /> {t.clearFilters}
          </button>
        )}
      </div>

      <div className="flex gap-6">
        {/* ── Mobile sidebar backdrop ──────────── */}
        {sidebarOpen && (
          <div className="sm:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── Sidebar ──────────────────────────── */}
        <aside className={
          sidebarOpen
            ? "fixed inset-y-0 left-0 w-72 z-50 overflow-y-auto sm:static sm:w-52 sm:z-auto sm:overflow-visible shrink-0"
            : "hidden sm:block w-52 shrink-0"
        }>
          <div className="bg-white dark:bg-gray-800 rounded-r-2xl sm:rounded-2xl border-r border-gray-200 dark:border-gray-700 sm:border p-4 h-full sm:h-auto sm:sticky sm:top-24 space-y-5">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className="w-4 h-4 accent-orange-600 rounded" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.inStockOnly}</span>
            </label>

            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                Max price: <span className="text-orange-600">{formatPrice(maxPrice)}</span>
              </p>
              <input type="range" min={350} max={800000} step={5000} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-orange-600" />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>RWF 350</span><span>RWF 800K</span></div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t.categories}</p>
              <div className="space-y-0.5">
                <button onClick={() => setSelectedCat("")} className={`w-full text-left text-sm px-2.5 py-1.5 rounded-lg transition-colors ${!selectedCat ? "bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-400 font-bold" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>
                  All categories
                </button>
                {CATEGORIES.map((cat) => (
                  <button key={cat} onClick={() => setSelectedCat(cat === selectedCat ? "" : cat)}
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-2 ${selectedCat === cat ? "bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-400 font-bold" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                  >
                    <span>{CATEGORY_META[cat]?.icon}</span>
                    <span className="flex-1 leading-tight">{cat}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ── Grid ──────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-gray-200 dark:bg-gray-800 rounded-2xl aspect-[3/4] animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <span className="text-6xl">🔍</span>
              <p className="text-lg font-bold text-gray-700 dark:text-gray-300">{t.noProducts}</p>
              {activeSearch && (
                <p className="text-gray-500 text-sm">
                  No matches for &ldquo;<strong>{activeSearch}</strong>&rdquo;. Try a different word.
                </p>
              )}
              <button onClick={clearAll} className="mt-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-2.5 rounded-full text-sm transition-colors">
                {t.clearFilters}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
