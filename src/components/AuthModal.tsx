"use client";
import { useState } from "react";
import { useStore, User } from "@/lib/store";
import { useLang } from "@/lib/LanguageContext";
import { X, User as UserIcon, Phone, ArrowRight, LogIn, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  showGuestOption?: boolean;
}

export default function AuthModal({ isOpen, onClose, onSuccess, showGuestOption = false }: AuthModalProps) {
  const { t } = useLang();
  const setUser = useStore((s) => s.setUser);
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [form, setForm] = useState({ name: "", phone: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone || (mode === "signup" && !form.name)) {
      setError("Please fill in all fields");
      return;
    }

    // Simulate Auth
    const mockUser: User = {
      id: Math.random().toString(36).substring(7),
      name: mode === "signup" ? form.name : "Returning User",
      phone: form.phone,
    };

    setUser(mockUser);
    onSuccess?.();
    onClose();
  };

  const handleGuest = () => {
    onSuccess?.();
    onClose();
    router.push("/checkout");
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-900 z-[101] shadow-2xl rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800">
        {/* Header */}
        <div className="relative px-6 pt-8 pb-4 text-center">
          <button onClick={onClose} className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">
            {mode === "signup" ? t.signUp : t.signIn}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.authSubtitle}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                {t.fullName}
              </label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jean-Pierre Mugisha"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
              {t.phone}
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="078 XXX XXXX"
                type="tel"
                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-black text-sm transition-colors shadow-lg flex items-center justify-center gap-2 mt-2"
          >
            {mode === "signup" ? <><UserPlus className="w-4 h-4" /> {t.signUp}</> : <><LogIn className="w-4 h-4" /> {t.signIn}</>}
          </button>
        </form>

        {/* Footer */}
        <div className="px-6 pb-8 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100 dark:border-gray-800"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-gray-900 px-2 text-gray-400">or</span></div>
          </div>

          {showGuestOption && (
            <button
              onClick={handleGuest}
              className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-3.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              {t.guestCheckout} <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            className="w-full text-center text-sm font-bold text-red-600 hover:text-red-700 transition-colors"
          >
            {mode === "signup" ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </>
  );
}
