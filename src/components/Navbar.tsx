"use client";
import Link from "next/link";
import { useTheme } from "next-themes";
import { ShoppingCart, Sun, Moon, Globe, Search, Menu, X, User as UserIcon, LogOut } from "lucide-react";
import { useStore } from "@/lib/store";
import { useLang } from "@/lib/LanguageContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { t, lang, setLang } = useLang();
  const totalItems = useStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const { setCartOpen, user, setUser } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/products?q=${encodeURIComponent(search.trim())}`);
      setSearch("");
      setMobileOpen(false);
    }
  }

  const langs: { code: Language; label: string }[] = [
    { code: "en", label: "EN" },
    { code: "fr", label: "FR" },
    { code: "rw", label: "RW" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-base">S</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-black text-xl text-gray-900 dark:text-white tracking-tight">Simba</span>
              <span className="block text-[10px] text-red-600 font-medium -mt-1 leading-none">SUPERMARKET</span>
            </div>
          </Link>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-10 pr-12 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium hover:bg-red-700 transition-colors">
                Go
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Language switcher */}
            <div className="hidden lg:flex items-center gap-0.5 bg-gray-100 dark:bg-gray-800 rounded-full px-1.5 py-1 mr-1">
              {langs.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${
                    lang === l.code
                      ? "bg-red-600 text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* User Profile / Login */}
            {mounted && (
              user ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                  <div className="w-6 h-6 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center">
                    <UserIcon className="w-3.5 h-3.5 text-red-600" />
                  </div>
                  <span className="hidden sm:block text-xs font-bold text-gray-700 dark:text-gray-300 truncate max-w-[80px]">
                    {user.name.split(" ")[0]}
                  </span>
                  <button 
                    onClick={() => setUser(null)}
                    className="p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-950 text-gray-400 hover:text-red-600 transition-colors"
                    title={t.signOut}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
                  aria-label="Login"
                >
                  <UserIcon className="w-5 h-5" />
                </button>
              )
            )}

            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 text-yellow-400" />
                ) : (
                  <Moon className="w-4 h-4 text-gray-500" />
                )}
              </button>
            )}

            {/* Cart button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2.5 rounded-full text-sm font-black transition-colors shadow-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden md:inline">{t.cart}</span>
              {totalItems > 0 && (
                <span className="bg-white text-red-600 text-xs font-black rounded-full w-4 h-4 flex items-center justify-center">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </button>

            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-label="Toggle menu"
              className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop nav links */}
        <nav className="hidden md:flex justify-center items-center gap-2 pb-2 border-t border-gray-100 dark:border-gray-800 pt-2">
          <Link href="/" className="px-3 py-1.5 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400 transition-colors">
            {t.home}
          </Link>
          <Link href="/products" className="px-3 py-1.5 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400 transition-colors">
            {t.allProducts}
          </Link>
          {["Cosmetics & Personal Care","Alcoholic Drinks","Food Products","Cleaning & Sanitary","Baby Products"].map((cat) => (
            <Link
              key={cat}
              href={`/products?category=${encodeURIComponent(cat)}`}
              className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400 transition-colors whitespace-nowrap"
            >
              {cat.split(" & ")[0]}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-4 space-y-4 shadow-lg">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </form>
          <div className="flex gap-4 text-sm font-medium">
            <Link href="/" onClick={() => setMobileOpen(false)} className="text-gray-700 dark:text-gray-300">{t.home}</Link>
            <Link href="/products" onClick={() => setMobileOpen(false)} className="text-gray-700 dark:text-gray-300">{t.allProducts}</Link>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-400" />
            {langs.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
                  lang === l.code
                    ? "bg-red-600 text-white border-red-600"
                    : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
