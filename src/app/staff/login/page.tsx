"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { login } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { useLang } from "@/lib/LanguageContext";
import { Store, Mail, Lock, LogIn, Eye, EyeOff, ChevronRight } from "lucide-react";

const DEMO_ACCOUNTS = [
  { role: "Manager", email: "manager@simba.rw", password: "Simba2025!" },
  { role: "Staff · Alice", email: "alice@simba.rw", password: "Staff2025!" },
  { role: "Staff · Bob", email: "bob@simba.rw", password: "Staff2025!" },
];

export default function StaffLoginPage() {
  const { t } = useLang();
  const router = useRouter();
  const { user, setUser } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === "manager" || user?.role === "staff") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));

    const res = login(email.trim().toLowerCase(), password);
    if (!res.ok) {
      setError(res.error);
      setLoading(false);
      return;
    }
    if (res.data.role !== "manager" && res.data.role !== "staff") {
      setError(t.notStaffAccount);
      setLoading(false);
      return;
    }
    setUser({ id: res.data.id, name: res.data.name, phone: res.data.phone, email: res.data.email, role: res.data.role, branchId: res.data.branchId });
    router.replace("/dashboard");
  }

  function fillDemo(acc: typeof DEMO_ACCOUNTS[0]) {
    setEmail(acc.email);
    setPassword(acc.password);
    setError("");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg bg-white border border-gray-100 shrink-0">
              <Image src="/images/simba-logo.jpeg" alt="Simba Supermarket" width={56} height={56} className="w-full h-full object-cover" />
            </div>
            <div className="text-left">
              <p className="font-black text-xl text-gray-900 dark:text-white">Simba</p>
              <p className="text-[11px] text-red-600 font-medium uppercase tracking-widest -mt-0.5">SUPERMARKET</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 text-red-700 dark:text-red-400 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
            <Store className="w-3.5 h-3.5" /> Staff Portal
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">{t.staffLogin}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t.staffLoginSubtitle}</p>
        </div>

        {/* Login card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                {t.email}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="you@simba.rw"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                {t.password}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-12 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-xl px-3 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-3.5 rounded-xl font-black text-sm transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <><LogIn className="w-4 h-4" /> {t.staffLogin}</>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="px-8 pb-8">
            <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t.demoCredentials}</p>
              <div className="space-y-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => fillDemo(acc)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left group"
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{acc.role}</p>
                      <p className="text-[11px] text-gray-500 font-mono">{acc.email}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Not staff?{" "}
          <a href="/" className="text-red-600 hover:underline font-medium">Return to store</a>
        </p>
      </div>
    </div>
  );
}
