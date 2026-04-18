"use client";
import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getProducts, Product, CATEGORIES, CATEGORY_META, formatPrice } from "@/lib/products";
import { useLang } from "@/lib/LanguageContext";
import ProductCard from "@/components/ProductCard";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";

type SortOption = "default" | "price-asc" | "price-desc" | "name-asc";

function ProductsContent() {
  const { t } = useLang();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const qParam = searchParams.get("q") || "";
  const catParam = searchParams.get("category") || "";
  const sortParam = (searchParams.get("sort") || "default") as SortOption;
  const stockParam = searchParams.get("inStock") === "1";

  const [searchQuery, setSearchQuery] = useState(qParam);
  const [selectedCategory, setSelectedCategory] = useState(catParam);
  const [sortBy, setSortBy] = useState<SortOption>(sortParam);
  const [inStockOnly, setInStockOnly] = useState(stockParam);
  const [priceMax, setPriceMax] = useState(800000);

  useEffect(() => {
    getProducts().then((d) => {
      setAllProducts(d.products);
      setLoading(false);
    });
  }, []);

  // Sync URL params
  useEffect(() => {
    setSearchQuery(qParam);
    setSelectedCategory(catParam);
    setSortBy(sortParam);
    setInStockOnly(stockParam);
  }, [qParam, catParam, sortParam, stockParam]);

  const filtered = useMemo(() => {
    let result = allProducts;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }
    if (inStockOnly) {
      result = result.filter((p) => p.inStock);
    }
    result = result.filter((p) => p.price <= priceMax);
    switch (sortBy) {
      case "price-asc": return [...result].sort((a, b) => a.price - b.price);
      case "price-desc": return [...result].sort((a, b) => b.price - a.price);
      case "name-asc": return [...result].sort((a, b) => a.name.localeCompare(b.name));
      default: return result;
    }
  }, [allProducts, searchQuery, selectedCategory, inStockOnly, sortBy, priceMax]);

  function applyFilters() {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedCategory) params.set("category", selectedCategory);
    if (sortBy !== "default") params.set("sort", sortBy);
    if (inStockOnly) params.set("inStock", "1");
    router.push(`/products?${params.toString()}`);
    setFiltersOpen(false);
  }

  function clearFilters() {
    setSearchQuery("");
    setSelectedCategory("");
    setSortBy("default");
    setInStockOnly(false);
    setPriceMax(800000);
    router.push("/products");
  }

  const hasFilters = searchQuery || selectedCategory || sortBy !== "default" || inStockOnly || priceMax < 800000;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
            {selectedCategory || t.allProducts}
          </h1>
          {!loading && (
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {filtered.length} {t.products}
              {searchQuery && <> for &quot;<strong>{searchQuery}</strong>&quot;</>}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {hasFilters && (
            <button onClick={clearFilters} className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1">
              <X className="w-4 h-4" /> {t.clearFilters}
            </button>
          )}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {t.filters}
            {hasFilters && <span className="bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">!</span>}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside className={`${filtersOpen ? "block" : "hidden"} lg:block w-full lg:w-64 shrink-0`}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-6 sticky top-24">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">{t.categories}</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory("")}
                  className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-colors ${
                    !selectedCategory ? "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 font-bold" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {t.allCategories}
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-colors flex items-center gap-2 ${
                      selectedCategory === cat ? "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 font-bold" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span>{CATEGORY_META[cat]?.icon}</span>
                    <span className="flex-1 leading-snug">{cat}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">{t.sortBy}</h3>
              <div className="space-y-2">
                {[
                  { value: "default", label: "Default" },
                  { value: "price-asc", label: t.priceLowHigh },
                  { value: "price-desc", label: t.priceHighLow },
                  { value: "name-asc", label: t.nameAZ },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value as SortOption)}
                    className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-colors ${
                      sortBy === opt.value ? "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 font-bold" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                {t.price} <span className="text-red-600 font-black">≤ {formatPrice(priceMax)}</span>
              </h3>
              <input
                type="range"
                min={350}
                max={800000}
                step={1000}
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full accent-red-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>RWF 350</span>
                <span>RWF 800K</span>
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 accent-red-600 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{t.inStockOnly}</span>
            </label>

            <button
              onClick={applyFilters}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-bold transition-colors text-sm"
            >
              Apply Filters
            </button>
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1 min-w-0">
          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory("")}
              className={`shrink-0 text-xs px-4 py-2 rounded-full font-medium border transition-colors ${
                !selectedCategory ? "bg-red-600 text-white border-red-600" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-red-300"
              }`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 text-xs px-4 py-2 rounded-full font-medium border transition-colors flex items-center gap-1 ${
                  selectedCategory === cat ? "bg-red-600 text-white border-red-600" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-red-300"
                }`}
              >
                <span>{CATEGORY_META[cat]?.icon}</span>
                <span>{cat}</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-gray-200 dark:bg-gray-800 rounded-2xl aspect-[3/4] animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <span className="text-6xl">🔍</span>
              <p className="text-gray-500 dark:text-gray-400 font-medium">{t.noProducts}</p>
              <button onClick={clearFilters} className="text-red-600 font-bold hover:underline">{t.clearFilters}</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
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
    <Suspense fallback={<div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <ProductsContent />
    </Suspense>
  );
}
