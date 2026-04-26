"use client";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { ShoppingCart, Sun, Moon, Search, Menu, X, User as UserIcon, LogOut, MapPin, ChevronDown, ChevronRight, Check, Package, LayoutDashboard } from "lucide-react";
import { useStore } from "@/lib/store";
import { useLang } from "@/lib/LanguageContext";
import { Language } from "@/lib/i18n";
import { getBranch } from "@/lib/branches";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useStaffUser } from "@/lib/staffAuth";
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
  const { setCartOpen, user, setUser, selectedBranch, setShowBranchModal } = useStore();
  const { staffUser, signOut: staffSignOut } = useStaffUser();
  const pathname = usePathname();
  const isStaffRoute = !!pathname?.startsWith("/dashboard") || !!pathname?.startsWith("/staff");
  const activeUser = isStaffRoute ? staffUser : user;
  const handleSignOut = isStaffRoute
    ? () => { staffSignOut(); router.replace("/staff/login"); }
    : () => setUser(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const userBtnRef = useRef<HTMLButtonElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
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
      if (
        userMenuRef.current && !userMenuRef.current.contains(e.target as Node) &&
        userBtnRef.current && !userBtnRef.current.contains(e.target as Node)
      ) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentBranch = getBranch(selectedBranch);
  const currentLang = LANG_OPTIONS.find(l => l.code === lang) ?? LANG_OPTIONS[0];
  const isStaff = activeUser?.role === "manager" || activeUser?.role === "staff";

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 bg-white shrink-0">
                <Image src="/images/simba-logo.jpeg" alt="Simba Supermarket" width={36} height={36} className="w-full h-full object-cover" />
              </div>
              <div className="hidden sm:block">
                <span className="font-black text-xl text-gray-900 dark:text-white tracking-tight">Simba</span>
                <span className="block text-[10px] text-orange-600 font-medium -mt-1 leading-none">SUPERMARKET</span>
              </div>
            </Link>

            {/* Branch Indicator — hidden on staff routes */}
            {mounted && !isStaffRoute && (
              <button
                onClick={() => setShowBranchModal(true)}
                className="hidden lg:flex flex-col items-start px-3 py-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-all group text-left"
              >
                <div className="flex items-center gap-1.5 text-[10px] font-black text-orange-600 uppercase tracking-wider">
                  <MapPin className="w-3 h-3" /> {t.pickupBranch}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{currentBranch.label}</span>
                  <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-orange-600 transition-colors" />
                </div>
              </button>
            )}
          </div>

          {/* Desktop Search — hidden on staff routes */}
          {!isStaffRoute && (
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-10 pr-12 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-medium hover:bg-orange-700 transition-colors">
                  Go
                </button>
              </div>
            </form>
          )}

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
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left ${lang === l.code ? "text-orange-600 font-bold" : "text-gray-700 dark:text-gray-300 font-medium"}`}
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
                      {lang === l.code && <Check className="w-3.5 h-3.5 shrink-0 text-orange-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User / Login — hidden on mobile; MobileBottomNav owns auth on mobile */}
            {/* On staff routes, never show the customer login button */}
            {mounted && (!isStaffRoute || activeUser) && (
              <div className="hidden md:block">
              {activeUser ? (
                <div className="relative">
                  {/* Avatar button */}
                  <button
                    ref={userBtnRef}
                    onClick={() => setShowUserMenu((v) => !v)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 active:bg-gray-100 transition-all"
                    aria-label="Account menu"
                  >
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-orange-100 dark:bg-orange-950 flex items-center justify-center shrink-0">
                      {activeUser.photoUrl ? (
                        <img src={activeUser.photoUrl} alt={activeUser.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <UserIcon className="w-3.5 h-3.5 text-orange-600" />
                      )}
                    </div>
                    <span className="hidden sm:block text-xs font-bold text-gray-700 dark:text-gray-300 truncate max-w-[72px]">
                      {activeUser.name.split(" ")[0]}
                    </span>
                    <ChevronDown className={`hidden sm:block w-3 h-3 text-gray-400 transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""}`} />
                  </button>

                  {/* Dropdown popover */}
                  {showUserMenu && (
                    <div
                      ref={userMenuRef}
                      className="absolute right-0 top-full mt-2 z-[200] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in slide-in-from-top-3 fade-in duration-200"
                      style={{ minWidth: 230 }}
                    >
                      {/* Profile header */}
                      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-gray-800">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-orange-100 dark:bg-orange-950 flex items-center justify-center shrink-0 ring-2 ring-orange-200 dark:ring-orange-900">
                          {activeUser.photoUrl ? (
                            <img src={activeUser.photoUrl} alt={activeUser.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <UserIcon className="w-5 h-5 text-orange-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-gray-900 dark:text-white truncate">{activeUser.name}</p>
                          <p className="text-[11px] text-gray-400 truncate">{activeUser.email}</p>
                        </div>
                      </div>
                      {/* Dashboard or My Orders */}
                      {isStaff ? (
                        <Link
                          href="/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <span className="flex items-center gap-2"><LayoutDashboard className="w-4 h-4 text-orange-600" />{t.dashboard}</span>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </Link>
                      ) : (
                        <Link
                          href="/orders"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <span className="flex items-center gap-2"><Package className="w-4 h-4 text-orange-600" />{t.myOrders}</span>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </Link>
                      )}
                      {/* Sign out */}
                      <button
                        onClick={() => { handleSignOut(); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors border-t border-gray-100 dark:border-gray-800"
                      >
                        <LogOut className="w-4 h-4 shrink-0" />
                        {t.signOut}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
                  aria-label="Login"
                >
                  <UserIcon className="w-5 h-5" />
                </button>
              )}
              </div>
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

            {/* Cart button — hidden on staff routes */}
            {!isStaffRoute && (
              <button
                onClick={() => setCartOpen(true)}
                className="relative flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-3 py-2.5 rounded-full text-sm font-black transition-colors shadow-sm"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden md:inline">{t.cart}</span>
                {totalItems > 0 && (
                  <span className="bg-white text-orange-600 text-xs font-black rounded-full w-4 h-4 flex items-center justify-center">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </button>
            )}

            {/* Mobile menu — hidden on staff routes */}
            {!isStaffRoute && (
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-expanded={mobileOpen}
                aria-label="Toggle menu"
                className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Desktop nav links — hidden on staff routes */}
        {!isStaffRoute && <nav className="hidden md:flex justify-center items-center gap-2 pb-2 border-t border-gray-100 dark:border-gray-800 pt-2">
          <Link href="/" className="px-3 py-1.5 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-950 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
            {t.home}
          </Link>
          <Link href="/products" className="px-3 py-1.5 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-950 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
            {t.allProducts}
          </Link>
          {([
            ["Cosmetics & Personal Care", t.catCosmetics],
            ["Alcoholic Drinks", t.catAlcohol],
            ["Food Products", t.catFood],
            ["Cleaning & Sanitary", t.catCleaning],
            ["Baby Products", t.catBaby],
          ] as [string, string][]).map(([cat, label]) => (
            <Link
              key={cat}
              href={`/products?category=${encodeURIComponent(cat)}`}
              className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-orange-100 dark:hover:bg-orange-950 hover:text-orange-600 dark:hover:text-orange-400 transition-colors whitespace-nowrap"
            >
              {label}
            </Link>
          ))}
        </nav>}
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
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </form>
          <div className="flex gap-4 text-sm font-medium">
            <Link href="/" onClick={() => setMobileOpen(false)} className="text-gray-700 dark:text-gray-300">{t.home}</Link>
            <Link href="/products" onClick={() => setMobileOpen(false)} className="text-gray-700 dark:text-gray-300">{t.allProducts}</Link>
            {user && !isStaff && (
              <Link href="/orders" onClick={() => setMobileOpen(false)} className="text-gray-700 dark:text-gray-300">{t.myOrders}</Link>
            )}
            {isStaff && (
              <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="text-orange-600 font-bold">{t.dashboard}</Link>
            )}
          </div>
          <button
            onClick={() => { setMobileOpen(false); setShowBranchModal(true); }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 transition-all text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/50 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider leading-none mb-0.5">{t.pickupBranch}</p>
              <p className="text-sm font-black text-gray-900 dark:text-white truncate">{currentBranch.label}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
          </button>
          {/* Language switcher — mobile */}
          <div className="flex items-center gap-2">
            {LANG_OPTIONS.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 font-medium text-sm transition-all ${
                  lang === l.code
                    ? "border-orange-600 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400"
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
                <span className="text-[10px] font-bold uppercase tracking-wide">{l.code}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
