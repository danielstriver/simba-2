export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  subcategoryId: number;
  inStock: boolean;
  image: string;
  unit: string;
}

export interface StoreInfo {
  name: string;
  tagline: string;
  location: string;
  currency: string;
}

export interface ProductsData {
  store: StoreInfo;
  products: Product[];
}

// ─── Subcategory → correct category overrides ─────────────────────────────────
// The source data has some subcategories miscategorised (e.g. olive oil, flour,
// toilet paper filed under "Alcoholic Drinks"). We remap them here.
const SUBCATEGORY_CATEGORY: Record<number, string> = {
  // Real alcoholic drink subcategories — keep as-is (27, 234-238)

  // Oils, flours, spices, syrups, butter, vinegar, canned → Food Products
  65: "Food Products",
  67: "Food Products",
  72: "Food Products",
  76: "Food Products",
  259: "Food Products",
  372: "Food Products",
  671: "Food Products",
  672: "Food Products",

  // Toilet paper, kitchen towels → Cleaning & Sanitary
  246: "Cleaning & Sanitary",
  247: "Cleaning & Sanitary",

  // Petroleum jelly / Vaseline → Cosmetics & Personal Care
  379: "Cosmetics & Personal Care",
};

export const CATEGORIES = [
  "Cosmetics & Personal Care",
  "Alcoholic Drinks",
  "Food Products",
  "Kitchenware & Electronics",
  "General",
  "Cleaning & Sanitary",
  "Sports & Wellness",
  "Baby Products",
  "Kitchen Storage",
  "Pet Care",
];

export const CATEGORY_META: Record<string, { icon: string; image: string; color: string }> = {
  "Cosmetics & Personal Care": {
    icon: "✨",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80",
    color: "from-pink-400 to-rose-500",
  },
  "Alcoholic Drinks": {
    icon: "🍷",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80",
    color: "from-purple-500 to-indigo-600",
  },
  "Food Products": {
    icon: "🥗",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80",
    color: "from-green-400 to-emerald-500",
  },
  "Kitchenware & Electronics": {
    icon: "🍳",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
    color: "from-orange-400 to-amber-500",
  },
  "General": {
    icon: "🛒",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80",
    color: "from-blue-400 to-cyan-500",
  },
  "Cleaning & Sanitary": {
    icon: "🧴",
    image: "https://images.unsplash.com/photo-1585351923806-3b4f8a4de8c6?w=600&q=80",
    color: "from-teal-400 to-cyan-500",
  },
  "Sports & Wellness": {
    icon: "⚽",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80",
    color: "from-yellow-400 to-orange-500",
  },
  "Baby Products": {
    icon: "👶",
    image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&q=80",
    color: "from-pink-300 to-purple-400",
  },
  "Kitchen Storage": {
    icon: "🗄️",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
    color: "from-amber-400 to-yellow-500",
  },
  "Pet Care": {
    icon: "🐾",
    image: "https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=600&q=80",
    color: "from-lime-400 to-green-500",
  },
  // Legacy alias kept for any stale references
  "Sports & Fitness": {
    icon: "⚽",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80",
    color: "from-yellow-400 to-orange-500",
  },
};

// ─── Name cleanup ─────────────────────────────────────────────────────────────
// Fixes obvious capitalisation errors without touching brand codes/measurements.
const NAME_FIXES: [RegExp, string][] = [
  [/\bBUIlding\b/g, "Building"],
  [/\bScoth\b/gi, "Scotch"],
  [/\bSyurp\b/gi, "Syrup"],
  [/\bFreshner\b/gi, "Freshener"],
  [/\bForeign\b/gi, "Foreign"],
  [/\bForeing\b/gi, "Foreign"],
  [/\bSoftner\b/gi, "Softener"],
  [/\bGingembre\b/gi, "Ginger"],
  [/\bMoulu\b/gi, "Ground"],
  [/\bSafran\b/gi, "Saffron"],
  [/\bMais Doux\b/gi, "Sweet Corn"],
];

function cleanName(raw: string): string {
  let name = raw.trim();
  for (const [pattern, replacement] of NAME_FIXES) {
    name = name.replace(pattern, replacement);
  }
  return name;
}

export function formatPrice(price: number): string {
  return `RWF ${price.toLocaleString()}`;
}

let cachedData: ProductsData | null = null;

export async function getProducts(): Promise<ProductsData> {
  if (cachedData) return cachedData;
  const res = await fetch("/simba_products.json");
  const raw: ProductsData = await res.json();

  // Apply category overrides and name cleanup
  const products: Product[] = raw.products.map((p) => ({
    ...p,
    name: cleanName(p.name),
    category: SUBCATEGORY_CATEGORY[p.subcategoryId] ?? p.category,
  }));

  cachedData = { store: raw.store, products };
  return cachedData;
}
