"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { login } from "@/lib/auth";
import { useStaffUser } from "@/lib/staffAuth";
import { useLang } from "@/lib/LanguageContext";
import { Store, Shield, Users, Mail, Lock, LogIn, Eye, EyeOff, ChevronRight, Package, Clock, BarChart3, CheckCircle2 } from "lucide-react";

type LoginRole = "manager" | "staff" | null;

const MANAGER_DEMO = { name: "Daniel NIYOMUGENGA", email: "danielhustler.hacker@gmail.com", password: "Simba2025!" };
const STAFF_DEMOS = [
  { name: "Alice Uwimana", email: "alice@simba.rw", password: "Staff2025!" },
  { name: "Bob Nkurunziza", email: "bob@simba.rw", password: "Staff2025!" },
];

export default function StaffLoginPage() {
  const { t } = useLang();
  const router = useRouter();
  const { staffUser, signIn } = useStaffUser();
  const [selectedRole, setSelectedRole] = useState<LoginRole>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (staffUser?.role === "manager" || staffUser?.role === "staff") {
      router.replace("/dashboard");
    }
  }, [staffUser, router]);

  function selectRole(role: LoginRole) {
    setSelectedRole(role);
    setError("");
    setEmail("");
    setPassword("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    const res = login(email.trim().toLowerCase(), password);
    if (!res.ok) {
      setError(res.error);
      setLoading(false);
      return;
    }
    if (res.data.role !== selectedRole) {
      setError(
        selectedRole === "manager"
          ? "This account does not have manager access."
          : "This account is not a staff account."
      );
      setLoading(false);
      return;
    }
    signIn({
      id: res.data.id,
      name: res.data.name,
      phone: res.data.phone,
      email: res.data.email,
      role: res.data.role,
      branchId: res.data.branchId,
    });
    router.replace("/dashboard");
  }

  const isManager = selectedRole === "manager";

  return (
    <div className="min-h-screen bg-gray-950 flex items-stretch">
      {/* ── Left branding panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-[44%] xl:w-[42%] flex-col justify-between bg-gradient-to-br from-gray-900 via-gray-900 to-slate-900 p-10 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-orange-600/10 rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-orange-600/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        {/* Logo */}
        <div className="relative">
          <div className="flex items-center justify-end gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white shadow-lg shrink-0">
              <Image src="/images/simba-logo.jpeg" alt="Simba" width={48} height={48} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-black text-xl text-white leading-tight">Simba</p>
              <p className="text-[10px] text-orange-400 font-bold uppercase tracking-widest">SUPERMARKET</p>
            </div>
          </div>

          <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight mb-4">
            Staff<br />
            <span className="text-orange-400">Operations</span><br />
            Portal
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-10 max-w-xs">
            Manage click-and-collect orders across all 11 Kigali branches from one central dashboard.
          </p>

          <div className="space-y-4">
            {[
              { icon: <BarChart3 className="w-4 h-4" />, text: "Real-time order dashboard" },
              { icon: <Package className="w-4 h-4" />, text: "Manage order lifecycle" },
              { icon: <Clock className="w-4 h-4" />, text: "Pickup scheduling & tracking" },
              { icon: <CheckCircle2 className="w-4 h-4" />, text: "Branch inventory control" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-gray-300 text-sm">
                <div className="w-7 h-7 rounded-lg bg-orange-600/20 flex items-center justify-center text-orange-400 shrink-0">
                  {icon}
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span>11 branches · Kigali, Rwanda</span>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-sm">

          {/* Mobile logo (hidden on desktop) */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shrink-0">
              <Image src="/images/simba-logo.jpeg" alt="Simba" width={40} height={40} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-black text-white leading-tight">Simba Supermarket</p>
              <p className="text-[10px] text-orange-400 font-bold uppercase tracking-widest">Staff Portal</p>
            </div>
          </div>

          {/* Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/10">
            <div className="h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400" />

            <div className="px-6 pt-6 pb-5 sm:px-8 sm:pt-8 sm:pb-6">
              {/* Title */}
              <div className="mb-6 text-center">
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                  {selectedRole
                    ? (isManager ? "Branch Manager Login" : "Staff Member Login")
                    : t.staffLogin}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  {selectedRole
                    ? `Sign in with your ${isManager ? "manager" : "staff"} credentials`
                    : "Select your role to continue"}
                </p>
              </div>

              {/* ── Role selector ── */}
              {!selectedRole && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => selectRole("manager")}
                    className="group bg-gray-50 dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-950/30 rounded-xl border-2 border-gray-100 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 p-4 sm:p-5 text-center transition-all hover:shadow-md"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-950 group-hover:bg-orange-600 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 transition-colors">
                      <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 group-hover:text-white transition-colors" />
                    </div>
                    <p className="font-black text-gray-900 dark:text-white text-sm">Branch Manager</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 hidden sm:block">Full dashboard access</p>
                  </button>

                  <button
                    onClick={() => selectRole("staff")}
                    className="group bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-xl border-2 border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 p-4 sm:p-5 text-center transition-all hover:shadow-md"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-950 group-hover:bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 transition-colors">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <p className="font-black text-gray-900 dark:text-white text-sm">Staff Member</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 hidden sm:block">Order management</p>
                  </button>
                </div>
              )}

              {/* ── Login form ── */}
              {selectedRole && (
                <>
                  {/* Role banner */}
                  <div className={`flex items-center gap-3 p-3 rounded-xl mb-5 ${
                    isManager
                      ? "bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/40"
                      : "bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40"
                  }`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isManager ? "bg-orange-600" : "bg-blue-600"}`}>
                      {isManager ? <Shield className="w-4 h-4 text-white" /> : <Users className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-gray-900 dark:text-white text-xs">
                        {isManager ? "Branch Manager" : "Staff Member"}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {isManager ? "Full dashboard access" : "Order management"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => selectRole(null)}
                      className="text-[11px] font-bold text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-2 py-1 rounded-lg hover:bg-white/60 dark:hover:bg-gray-800 transition-colors"
                    >
                      Change
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
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
                          placeholder={isManager ? "manager@email.com" : "you@simba.rw"}
                          required
                          autoComplete="email"
                          className={`w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 dark:text-white focus:border-transparent ${
                            isManager ? "focus:ring-orange-500" : "focus:ring-blue-500"
                          }`}
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
                          autoComplete="current-password"
                          className={`w-full pl-11 pr-12 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 dark:text-white focus:border-transparent ${
                            isManager ? "focus:ring-orange-500" : "focus:ring-blue-500"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw(!showPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                        >
                          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <p className="text-xs text-orange-600 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-900 rounded-xl px-3 py-2.5">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full text-white py-3.5 rounded-xl font-black text-sm transition-all shadow-lg flex items-center justify-center gap-2 mt-1 ${
                        isManager
                          ? "bg-orange-600 hover:bg-orange-700 active:scale-[0.98] disabled:bg-orange-400"
                          : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:bg-blue-400"
                      }`}
                    >
                      {loading ? (
                        <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <><LogIn className="w-4 h-4" /> Sign In</>
                      )}
                    </button>
                  </form>

                  {/* Demo credentials */}
                  <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                      {t.demoCredentials}
                    </p>
                    <div className="space-y-2">
                      {isManager ? (
                        <button
                          onClick={() => { setEmail(MANAGER_DEMO.email); setPassword(MANAGER_DEMO.password); setError(""); }}
                          className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors text-left group"
                        >
                          <div>
                            <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{MANAGER_DEMO.name}</p>
                            <p className="text-[11px] text-gray-500 font-mono">{MANAGER_DEMO.email}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-orange-600 transition-colors" />
                        </button>
                      ) : (
                        STAFF_DEMOS.map((acc) => (
                          <button
                            key={acc.email}
                            onClick={() => { setEmail(acc.email); setPassword(acc.password); setError(""); }}
                            className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors text-left group"
                          >
                            <div>
                              <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{acc.name}</p>
                              <p className="text-[11px] text-gray-500 font-mono">{acc.email}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-gray-500 mt-5">
            Not staff?{" "}
            <a href="/" className="text-orange-400 hover:text-orange-300 hover:underline font-medium transition-colors">
              Return to store
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
