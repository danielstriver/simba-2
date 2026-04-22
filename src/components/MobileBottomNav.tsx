"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, ShoppingCart, Package, User as UserIcon } from "lucide-react";
import { useStore } from "@/lib/store";
import { useLang } from "@/lib/LanguageContext";
import { useState } from "react";
import AuthModal from "./AuthModal";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useLang();
  const { items, setCartOpen, user } = useStore();
  const [showAuth, setShowAuth] = useState(false);
  const totalItems = items.reduce((n, i) => n + i.quantity, 0);

  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/staff")) return null;

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  }

  const navBase = "flex flex-col items-center justify-center gap-0.5 py-2 px-3 rounded-xl flex-1 transition-colors";
  const active = "text-red-600";
  const inactive = "text-gray-400 dark:text-gray-500";

  return (
    <>
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 pb-safe">
        <div className="flex items-stretch px-2 py-1">

          <Link href="/" className={`${navBase} ${isActive("/") ? active : inactive}`}>
            <Home className={`w-5 h-5 ${isActive("/") ? "fill-red-100 stroke-red-600" : ""}`} />
            <span className="text-[10px] font-semibold">{t.home}</span>
          </Link>

          <Link href="/products" className={`${navBase} ${isActive("/products") ? active : inactive}`}>
            <ShoppingBag className={`w-5 h-5 ${isActive("/products") ? "stroke-red-600" : ""}`} />
            <span className="text-[10px] font-semibold">{t.allProducts}</span>
          </Link>

          {/* Cart — centred accent button */}
          <button
            onClick={() => setCartOpen(true)}
            className="flex flex-col items-center justify-center gap-0.5 py-1 px-4 flex-1"
          >
            <div className="relative -mt-5 bg-red-600 rounded-2xl w-12 h-12 flex items-center justify-center shadow-lg shadow-red-600/30">
              <ShoppingCart className="w-5 h-5 text-white" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-red-600 text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center border border-red-100 shadow">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold text-red-600 mt-0.5">{t.cart}</span>
          </button>

          <Link
            href={user ? "/orders" : "#"}
            onClick={!user ? (e) => { e.preventDefault(); setShowAuth(true); } : undefined}
            className={`${navBase} ${isActive("/orders") ? active : inactive}`}
          >
            <Package className={`w-5 h-5 ${isActive("/orders") ? "stroke-red-600" : ""}`} />
            <span className="text-[10px] font-semibold">{t.myOrders}</span>
          </Link>

          <button
            onClick={() => { if (!user) setShowAuth(true); }}
            className={`${navBase} ${user ? active : inactive}`}
          >
            {user ? (
              <>
                <div className="w-6 h-6 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center">
                  <UserIcon className="w-3.5 h-3.5 text-red-600" />
                </div>
                <span className="text-[10px] font-semibold text-red-600 truncate max-w-[52px]">
                  {user.name.split(" ")[0]}
                </span>
              </>
            ) : (
              <>
                <UserIcon className="w-5 h-5" />
                <span className="text-[10px] font-semibold">{t.signIn}</span>
              </>
            )}
          </button>

        </div>
      </nav>
    </>
  );
}
