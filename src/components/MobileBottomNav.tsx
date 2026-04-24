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

  const navBase = "flex flex-col items-center justify-center gap-1 flex-1 transition-colors min-w-0 py-1";
  const active = "text-orange-600";
  const inactive = "text-gray-400 dark:text-gray-500";

  return (
    <>
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      {/* Nav bar — fixed height 64px flush at the bottom edge */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center h-16 px-1">

          <Link href="/" className={`${navBase} ${isActive("/") ? active : inactive}`}>
            <Home className="w-[22px] h-[22px]" strokeWidth={isActive("/") ? 2.5 : 1.75} />
            <span className="text-[10px] font-semibold leading-none text-center">{t.home}</span>
          </Link>

          <Link href="/products" className={`${navBase} ${isActive("/products") ? active : inactive}`}>
            <ShoppingBag className="w-[22px] h-[22px]" strokeWidth={isActive("/products") ? 2.5 : 1.75} />
            <span className="text-[10px] font-semibold leading-none text-center">{t.allProducts}</span>
          </Link>

          {/* Cart — prominent accent pill, same row as siblings */}
          <button
            onClick={() => setCartOpen(true)}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-1"
          >
            <div className="relative w-11 h-9 bg-orange-600 rounded-xl flex items-center justify-center shadow-md shadow-orange-600/30">
              <ShoppingCart className="w-[18px] h-[18px] text-white" strokeWidth={2.25} />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-white text-orange-600 text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center border border-orange-200 shadow">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold text-orange-600 leading-none">{t.cart}</span>
          </button>

          <Link
            href={user ? "/orders" : "#"}
            onClick={!user ? (e) => { e.preventDefault(); setShowAuth(true); } : undefined}
            className={`${navBase} ${isActive("/orders") ? active : inactive}`}
          >
            <Package className="w-[22px] h-[22px]" strokeWidth={isActive("/orders") ? 2.5 : 1.75} />
            <span className="text-[10px] font-semibold leading-none text-center">{t.myOrders}</span>
          </Link>

          <button
            onClick={() => { if (!user) setShowAuth(true); }}
            className={`${navBase} ${user ? active : inactive}`}
          >
            {user ? (
              <>
                <div className="w-7 h-7 rounded-full overflow-hidden bg-orange-100 dark:bg-orange-950 flex items-center justify-center shrink-0">
                  {user.photoUrl ? (
                    <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <UserIcon className="w-4 h-4 text-orange-600" />
                  )}
                </div>
                <span className="text-[10px] font-semibold text-orange-600 leading-none truncate max-w-[56px]">
                  {user.name.split(" ")[0]}
                </span>
              </>
            ) : (
              <>
                <UserIcon className="w-[22px] h-[22px]" strokeWidth={1.75} />
                <span className="text-[10px] font-semibold leading-none">{t.signIn}</span>
              </>
            )}
          </button>

        </div>
        {/* Extends the nav background into the iPhone home-bar safe area */}
        <div className="pb-safe bg-white dark:bg-gray-900" />
      </nav>
    </>
  );
}
