import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "./products";
import { Language } from "./i18n";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role?: "customer" | "manager" | "staff";
  branchId?: string;
  photoUrl?: string;
}

export interface PickupDetails {
  branch: string;
  time: string;
  date: string;
}

interface CartStore {
  items: CartItem[];
  user: User | null;
  language: Language;
  cartOpen: boolean;
  selectedBranch: string | null;
  showBranchModal: boolean;
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  setUser: (user: User | null) => void;
  setLanguage: (lang: Language) => void;
  setCartOpen: (open: boolean) => void;
  setSelectedBranch: (branch: string | null) => void;
  setShowBranchModal: (show: boolean) => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      user: null,
      language: "en",
      cartOpen: false,
      selectedBranch: null,
      showBranchModal: false,
      addItem: (product) => {
        const items = get().items;
        const existing = items.find((i) => i.product.id === product.id);
        if (existing) {
          set({
            items: items.map((i) =>
              i.product.id === product.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({ items: [...items, { product, quantity: 1 }] });
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.product.id !== productId) });
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      setUser: (user) => set({ user }),
      setLanguage: (lang) => set({ language: lang }),
      setCartOpen: (open) => set({ cartOpen: open }),
      setSelectedBranch: (branch) => set({ selectedBranch: branch }),
      setShowBranchModal: (show) => set({ showBranchModal: show }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    }),
    {
      name: "simba-store",
      partialize: (state) => ({ 
        items: state.items, 
        language: state.language,
        user: state.user,
        selectedBranch: state.selectedBranch
      }),
    }
  )
);
