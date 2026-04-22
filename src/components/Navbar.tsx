"use client";
import Link from "next/link";
import { useTheme } from "next-themes";
import { ShoppingCart, Sun, Moon, Search, Menu, X, User as UserIcon, LogOut, Store, MapPin, ChevronDown, Check, Package, LayoutDashboard } from "lucide-react";
import { useStore } from "@/lib/store";
import { useLang } from "@/lib/LanguageContext";
import { Language } from "@/lib/i18n";
import { useToast } from "@/components/Toast";
import { BRANCHES, getBranch } from "@/lib/branches";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import AuthModal from "./AuthModal";

const LANG_OPTIONS: { code: Language; flagSrc: string; label: string }[] = [
  { code: "en", flagSrc: "https://flagcdn.com/w40/gb.png", label: "English" },
  { code: "fr", flagSrc: "https://flagcdn.com/w40/fr.png", label: "Français" },
  { code: "rw", flagSrc: "https://flagcdn.com/w40/rw.png", label: "Kinyarwanda" },
];

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { t, lang, setLang } = useLang();
  const totalItems = useStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const { setCartOpen, user, setUser, selectedBranch, setSelectedBranch } = useStore();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showBranches, setShowBranches] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const branches = BRANCHES;
  const currentBranch = getBranch(selectedBranch);
  const currentLang = LANG_OPTIONS.find(l => l.code === lang) ?? LANG_OPTIONS[0];
  const isStaff = user?.role === "manager" || user?.role === "staff";

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/products?q=${encodeURIComponent(search.trim())}`);
      setSearch("");
      setMobileOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />

      {/* Branch Selector Modal */}
      {showBranches && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowBranches(false)} />
          <div className="relative bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-black text-xl flex items-center gap-2">
                <Store className="w-5 h-5 text-red-600" /> {t.selectBranch}
              </h3>
              <button onClick={() => setShowBranches(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
              {branches.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setSelectedBranch(b.id);
                    setShowBranches(false);
                    toast(`Switched to ${b.label}`, "success", "Stock availability updated.");
                  }}
                  className={`w-full flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                    (selectedBranch || "remera") === b.id
                      ? "border-red-600 bg-red-50 dark:bg-red-950"
                      : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
                  }`}
                >
                  <MapPin className={`w-5 h-5 shrink-0 mt-0.5 ${(selectedBranch || "remera") === b.id ? "text-red-600" : "text-gray-400"}`} />
                  <div>
                    <p className={`font-bold text-sm ${(selectedBranch || "remera") === b.id ? "text-red-700 dark:text-red-400" : "text-gray-900 dark:text-white"}`}>{b.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{b.addr}</p>
                  </div>
                  {(selectedBranch || "remera") === b.id && <div className="ml-auto w-5 h-5 bg-red-600 rounded-full flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
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

            {/* Branch Indicator */}
            {mounted && (
              <button
                onClick={() => setShowBranches(true)}
                className="hidden lg:flex flex-col items-start px-3 py-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-all group text-left"
              >
                <div className="flex items-center gap-1.5 text-[10px] font-black text-red-600 uppercase tracking-wider">
                  <MapPin className="w-3 h-3" /> Pickup Branch
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{currentBranch.label}</span>
                  <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-red-600 transition-colors" />
                </div>
              </button>
            )}
          </div>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-4">
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
            {/* Language dropdown */}
            <div className="relative hidden lg:block mr-1" ref={langRef}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Select language"
              >
                <img
                  src={currentLang.flagSrc}
                  alt={currentLang.label}
                  width={20}
                  height={14}
                  className="rounded-sm object-cover"
                  style={{ width: 20, height: 14 }}
                />
                <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${langOpen ? "rotate-180" : ""}`} />
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 py-2 min-w-[180px] z-50 animate-in fade-in zoom-in-95 duration-150">
                  {LANG_OPTIONS.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setLangOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left ${lang === l.code ? "text-red-600 font-bold" : "text-gray-700 dark:text-gray-300 font-medium"}`}
                    >
                      <img
                        src={l.flagSrc}
                        alt={l.label}
                        width={24}
                        height={17}
                        className="rounded-sm object-cover shrink-0"
                        style={{ width: 24, height: 17 }}
                      />
                      <span className="flex-1">{l.label}</span>
                      {lang === l.code && <Check className="w-3.5 h-3.5 shrink-0 text-red-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User / Login */}
            {mounted && (
              user ? (
                <div className="flex items-center gap-1">
                  {isStaff ? (
                    <Link
                      href="/dashboard"
                      className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs font-bold text-red-600 hover:bg-red-100 transition-all"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" /> {t.dashboard}
                    </Link>
                  ) : (
                    <Link
                      href="/orders"
                      className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-red-600 hover:border-red-200 transition-all"
                    >
                      <Package className="w-3.5 h-3.5" /> {t.myOrders}
                    </Link>
                  )}
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
            {isStaff && (
              <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="text-red-600 font-bold">{t.dashboard}</Link>
            )}
          </div>
          {/* Language switcher — mobile */}
          <div className="flex items-center gap-2">
            {LANG_OPTIONS.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 font-medium text-sm transition-all ${
                  lang === l.code
                    ? "border-red-600 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300"
                }`}
              >
                <img
                  src={l.flagSrc}
                  alt={l.label}
                  width={22}
                  height={16}
                  className="rounded-sm object-cover"
                  style={{ width: 22, height: 16 }}
                />
                <span className="text-xs">{l.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
