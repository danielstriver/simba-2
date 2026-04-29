const KEY = "simba-inventory";
const DEFAULT_STOCK = 50;

type Inv = Record<string, Record<string, number>>;

function readInv(): Inv {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
  catch { return {}; }
}

function writeInv(inv: Inv): void {
  localStorage.setItem(KEY, JSON.stringify(inv));
}

export function getStock(branchId: string, productId: number): number {
  const inv = readInv();
  return inv[branchId]?.[String(productId)] ?? DEFAULT_STOCK;
}

export function isInStock(branchId: string, productId: number): boolean {
  return getStock(branchId, productId) > 0;
}

export function deductStock(
  branchId: string,
  items: Array<{ productId: number; quantity: number }>
): void {
  const inv = readInv();
  if (!inv[branchId]) inv[branchId] = {};
  for (const { productId, quantity } of items) {
    const cur = inv[branchId][String(productId)] ?? DEFAULT_STOCK;
    inv[branchId][String(productId)] = Math.max(0, cur - quantity);
  }
  writeInv(inv);
}

export function markOutOfStock(branchId: string, productId: number): void {
  const inv = readInv();
  if (!inv[branchId]) inv[branchId] = {};
  inv[branchId][String(productId)] = 0;
  writeInv(inv);
}

export function getBranchInventoryEntries(branchId: string): Record<string, number> {
  return readInv()[branchId] ?? {};
}

export function setStock(branchId: string, productId: number, quantity: number): void {
  const inv = readInv();
  if (!inv[branchId]) inv[branchId] = {};
  inv[branchId][String(productId)] = Math.max(0, Math.round(quantity));
  writeInv(inv);
}

export function restoreStock(branchId: string, productId: number, amount = DEFAULT_STOCK): void {
  const inv = readInv();
  if (!inv[branchId]) inv[branchId] = {};
  inv[branchId][String(productId)] = amount;
  writeInv(inv);
}
