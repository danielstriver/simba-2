"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, ShoppingCart, Package, User as UserIcon, LogOut, ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { useLang } from "@/lib/LanguageContext";
import { useState, useEffect, useRef } from "react";
import AuthModal from "./AuthModal";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useLang();
  const { items, setCartOpen, user, setUser } = useStore();
  const [showAuth, setShowAuth] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userBtnRef = useRef<HTMLButtonElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const totalItems = items.reduce((n, i) => n + i.quantity, 0);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (
        userMenuRef.current && !userMenuRef.current.contains(e.target as Node) &&
        userBtnRef.current && !userBtnRef.current.contains(e.target as Node)
      ) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

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

      {/* User account popover — slides up from avatar */}
      {showUserMenu && user && (
        <div
          ref={userMenuRef}
          className="md:hidden fixed bottom-[76px] right-2 z-[200] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in slide-in-from-bottom-3 fade-in duration-200"
          style={{ minWidth: 230 }}
        >
          {/* Profile header */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-gray-800">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-orange-100 dark:bg-orange-950 flex items-center justify-center shrink-0 ring-2 ring-orange-200 dark:ring-orange-900">
              {user.photoUrl ? (
                <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <UserIcon className="w-5 h-5 text-orange-600" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-gray-900 dark:text-white truncate">{user.name}</p>
              <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          {/* My Orders quick link */}
          <Link
            href="/orders"
            onClick={() => setShowUserMenu(false)}
            className="flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <span>{t.myOrders}</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
          {/* Sign out */}
          <button
            onClick={() => { setUser(null); setShowUserMenu(false); }}
            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors border-t border-gray-100 dark:border-gray-800"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {t.signOut}
          </button>
        </div>
      )}

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
            ref={userBtnRef}
            onClick={() => {
              if (!user) { setShowAuth(true); return; }
              setShowUserMenu((v) => !v);
            }}
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
