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

export const CATEGORIES = [
  "Cosmetics & Personal Care",
  "Alcoholic Drinks",
  "Food Products",
  "Kitchenware & Electronics",
  "General",
  "Cleaning & Sanitary",
  "Sports & Fitness",
  "Stationery",
  "Baby Products",
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
  "Sports & Fitness": {
    icon: "⚽",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80",
    color: "from-yellow-400 to-orange-500",
  },
  "Stationery": {
    icon: "📚",
    image: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=600&q=80",
    color: "from-indigo-400 to-blue-500",
  },
  "Baby Products": {
    icon: "👶",
    image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&q=80",
    color: "from-pink-300 to-purple-400",
  },
};

export function formatPrice(price: number): string {
  return `RWF ${price.toLocaleString()}`;
}

let cachedData: ProductsData | null = null;

export async function getProducts(): Promise<ProductsData> {
  if (cachedData) return cachedData;
  const res = await fetch("/simba_products.json");
  cachedData = await res.json();
  return cachedData!;
}
