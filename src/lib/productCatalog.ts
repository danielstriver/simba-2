import type { Product } from "./products";
import { clearProductCache } from "./products";

export interface ManagedProduct extends Product {
  isCustom?: boolean;
  description?: string;
}

const CUSTOM_KEY = "simba-custom-products";
const OVERRIDES_KEY = "simba-product-overrides";

export type ProductOverrides = Record<number, Partial<Omit<ManagedProduct, "id" | "subcategoryId" | "isCustom">>>;

function readCustom(): ManagedProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CUSTOM_KEY);
    return raw ? (JSON.parse(raw) as ManagedProduct[]) : [];
  } catch { return []; }
}

function writeCustom(products: ManagedProduct[]): void {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(products));
}

function nextCustomId(): number {
  const products = readCustom();
  const maxId = products.reduce((m, p) => Math.max(m, p.id), 9999);
  return maxId + 1;
}

export function getCustomProducts(): ManagedProduct[] {
  return readCustom();
}

export function addCustomProduct(data: {
  name: string;
  category: string;
  price: number;
  unit: string;
  image?: string;
  description?: string;
}): ManagedProduct {
  const products = readCustom();
  const product: ManagedProduct = {
    id: nextCustomId(),
    subcategoryId: 0,
    inStock: true,
    isCustom: true,
    image: data.image || "https://placehold.co/300x300",
    name: data.name,
    category: data.category,
    price: data.price,
    unit: data.unit,
    description: data.description,
  };
  writeCustom([...products, product]);
  clearProductCache();
  return product;
}

export function updateCustomProduct(
  id: number,
  data: Partial<Omit<ManagedProduct, "id" | "isCustom">>
): void {
  const products = readCustom();
  const idx = products.findIndex((p) => p.id === id);
  if (idx < 0) return;
  products[idx] = { ...products[idx], ...data };
  writeCustom(products);
  clearProductCache();
}

export function deleteCustomProduct(id: number): void {
  writeCustom(readCustom().filter((p) => p.id !== id));
  clearProductCache();
}

export function getProductOverrides(): ProductOverrides {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY);
    return raw ? (JSON.parse(raw) as ProductOverrides) : {};
  } catch { return {}; }
}

export function setProductOverride(
  id: number,
  data: Partial<Omit<ManagedProduct, "id" | "subcategoryId" | "isCustom">>
): void {
  const overrides = getProductOverrides();
  overrides[id] = { ...overrides[id], ...data };
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
  clearProductCache();
}
