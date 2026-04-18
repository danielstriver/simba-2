"use client";
import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getProducts, Product, CATEGORIES, CATEGORY_META, formatPrice } from "@/lib/products";
import { useLang } from "@/lib/LanguageContext";
import ProductCard from "@/components/ProductCard";
import { SlidersHorizontal, X, Search, ChevronDown } from "lucide-react";

type SortOption = "default" | "price-asc" | "price-desc" | "name-asc";

function ProductsContent() {
  const { t } = useLang();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Controlled filter state (derived from URL on mount)
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [selectedCat, setSelectedCat] = useState(searchParams.get("category") || "");
  const [sort, setSort] = useState<SortOption>((searchParams.get("sort") as SortOption) || "default");
  const [inStockOnly, setInStockOnly] = useState(searchParams.get("inStock") === "1");
  const [maxPrice, setMaxPrice] = useState(800000);

  useEffect(() => {
    getProducts().then((d) => { setAllProducts(d.products); setLoading(false); });
  }, []);

  // Re-sync if URL changes (e.g., navbar link)
  useEffect(() => {
    setSearch(searchParams.get("q") || "");
    setSelectedCat(searchParams.get("category") || "");
    setSort((searchParams.get("sort") as SortOption) || "default");
    setInStockOnly(searchParams.get("inStock") === "1");
  }, [searchParams.toString()]);

  const filtered = useMemo(() => {
    let result = allProducts;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    if (selectedCat) result = result.filter((p) => p.category === selectedCat);
    if (inStockOnly) result = result.filter((p) => p.inStock);
    result = result.filter((p) => p.price <= maxPrice);
    if (sort === "price-asc") return [...result].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...result].sort((a, b) => b.price - a.price);
    if (sort === "name-asc") return [...result].sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [allProducts, search, selectedCat, inStockOnly, sort, maxPrice]);

  const hasFilters = search || selectedCat || sort !== "default" || inStockOnly || maxPrice < 800000;

  function clearFilters() {
    setSearch(""); setSelectedCat(""); setSort("default"); setInStockOnly(false); setMaxPrice(800000);
    router.push("/products");
  }

  function pushSearch(q: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (selectedCat) params.set("category", selectedCat);
    router.push(`/products?${params.toString()}`);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

      {/* Top bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && pushSearch(search)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="appearance-none w-full sm:w-auto pl-4 pr-8 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
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
          className="sm:hidden flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium bg-white dark:bg-gray-800"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {t.filters}
          {hasFilters && <span className="w-2 h-2 rounded-full bg-red-600" />}
        </button>
      </div>

      {/* Category pills — quick filter, always visible */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-5 -mx-1 px-1 scrollbar-hide">
        <button
          onClick={() => setSelectedCat("")}
          className={`shrink-0 text-xs px-3.5 py-1.5 rounded-full font-medium border transition-colors ${
            !selectedCat ? "bg-red-600 text-white border-red-600" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 hover:border-red-300"
          }`}
        >
          All ({allProducts.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = allProducts.filter((p) => p.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat === selectedCat ? "" : cat)}
              className={`shrink-0 text-xs px-3.5 py-1.5 rounded-full font-medium border transition-colors flex items-center gap-1.5 ${
                selectedCat === cat ? "bg-red-600 text-white border-red-600" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 hover:border-red-300"
              }`}
            >
              <span>{CATEGORY_META[cat]?.icon}</span>
              <span>{cat.split(" & ")[0]}</span>
              <span className={`${selectedCat === cat ? "text-red-200" : "text-gray-400 dark:text-gray-600"}`}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Result header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-black text-gray-900 dark:text-white">
            {selectedCat || t.allProducts}
          </h1>
          {!loading && (
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
              {filtered.length} {t.products}
              {search && <> matching &quot;<strong className="text-gray-700 dark:text-gray-300">{search}</strong>&quot;</>}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium">
              <X className="w-3.5 h-3.5" /> {t.clearFilters}
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-6">
        {/* ─── SIDEBAR ─── */}
        <aside className={`${sidebarOpen ? "block" : "hidden"} sm:block w-56 shrink-0`}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sticky top-24 space-y-5">
            {/* In stock */}
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 accent-red-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.inStockOnly}</span>
            </label>

            {/* Price range */}
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                {t.price} ≤ <span className="text-red-600">{formatPrice(maxPrice)}</span>
              </p>
              <input
                type="range" min={350} max={800000} step={5000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-red-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>RWF 350</span><span>RWF 800K</span>
              </div>
            </div>

            {/* Categories */}
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t.categories}</p>
              <div className="space-y-0.5">
                <button
                  onClick={() => setSelectedCat("")}
                  className={`w-full text-left text-sm px-2.5 py-1.5 rounded-lg transition-colors ${!selectedCat ? "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 font-bold" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                >
                  All categories
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCat(cat === selectedCat ? "" : cat)}
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-2 ${selectedCat === cat ? "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 font-bold" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                  >
                    <span>{CATEGORY_META[cat]?.icon}</span>
                    <span className="flex-1 leading-tight">{cat}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ─── PRODUCT GRID ─── */}
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
              <p className="text-gray-500 text-sm">Try a different search or category</p>
              <button onClick={clearFilters} className="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-full text-sm transition-colors">
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
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
