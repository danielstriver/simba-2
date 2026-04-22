export type OrderStatus = "pending" | "accepted" | "preparing" | "ready" | "picked_up" | "cancelled";

export interface OrderItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  image: string;
  unit: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  items: OrderItem[];
  branch: string;
  branchLabel: string;
  pickupDate: string;
  pickupTime: string;
  paymentMethod: "momo" | "card" | "cash";
  subtotal: number;
  depositPaid: number;
  status: OrderStatus;
  assignedStaffId?: string;
  assignedStaffName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  review?: { rating: number; comment: string; createdAt: string };
}

const KEY = "simba-orders";

export function readOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
}

function writeOrders(orders: Order[]): void {
  localStorage.setItem(KEY, JSON.stringify(orders));
}

export function createOrder(data: Omit<Order, "id" | "status" | "createdAt" | "updatedAt">): Order {
  const order: Order = {
    ...data,
    id: "ORD-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  writeOrders([...readOrders(), order]);
  return order;
}

export function patchOrder(id: string, patch: Partial<Order>): Order | null {
  const all = readOrders();
  const updated = all.map(o =>
    o.id === id ? { ...o, ...patch, updatedAt: new Date().toISOString() } : o
  );
  writeOrders(updated);
  return updated.find(o => o.id === id) ?? null;
}

export function getOrderById(id: string): Order | null {
  return readOrders().find(o => o.id === id) ?? null;
}

export function getUserOrders(userId: string): Order[] {
  return readOrders()
    .filter(o => o.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getBranchOrders(branchId: string): Order[] {
  return readOrders()
    .filter(o => o.branch === branchId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getBranchStats(branchId: string) {
  const orders = readOrders().filter(o => o.branch === branchId);
  const reviewed = orders.filter(o => o.review);
  return {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    preparing: orders.filter(o => o.status === "accepted" || o.status === "preparing").length,
    ready: orders.filter(o => o.status === "ready").length,
    avgRating: reviewed.length
      ? reviewed.reduce((s, o) => s + (o.review?.rating ?? 0), 0) / reviewed.length
      : 0,
    reviewCount: reviewed.length,
  };
}
