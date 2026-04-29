const HIDDEN_KEY = "simba-hidden-products";

export function getHiddenProductIds(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(HIDDEN_KEY);
    return new Set(raw ? (JSON.parse(raw) as number[]) : []);
  } catch { return new Set(); }
}

export function hideProduct(id: number): void {
  const ids = getHiddenProductIds();
  ids.add(id);
  localStorage.setItem(HIDDEN_KEY, JSON.stringify([...ids]));
}

export function unhideProduct(id: number): void {
  const ids = getHiddenProductIds();
  ids.delete(id);
  localStorage.setItem(HIDDEN_KEY, JSON.stringify([...ids]));
}
