"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { useLang } from "@/lib/LanguageContext";
import { register, login, requestReset, confirmReset } from "@/lib/auth";
import {
  X, User as UserIcon, Mail, Lock, Phone,
  ArrowRight, LogIn, UserPlus, KeyRound, Eye, EyeOff,
} from "lucide-react";

type Mode = "signin" | "signup" | "forgot" | "reset";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  showGuestOption?: boolean;
}

export default function AuthModal({
  isOpen, onClose, onSuccess, showGuestOption = false,
}: AuthModalProps) {
  const { t } = useLang();
  const setUser = useStore((s) => s.setUser);

  const [mode, setMode] = useState<Mode>("signin");
  const [form, setForm] = useState({
    name: "", phone: "", email: "", password: "", newPassword: "", code: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  if (!isOpen) return null;

  function update(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [k]: e.target.value }));
      setError("");
    };
  }

  function switchMode(m: Mode) {
    setMode(m);
    setError("");
    setInfo("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    if (mode === "signup") {
      const res = register(form.name, form.phone, form.email, form.password);
      if (!res.ok) { setError(res.error); setLoading(false); return; }
      setUser({ id: res.data.id, name: res.data.name, phone: res.data.phone, email: res.data.email, role: res.data.role, branchId: res.data.branchId });
      onSuccess?.();
      onClose();
    } else if (mode === "signin") {
      const res = login(form.email, form.password);
      if (!res.ok) { setError(res.error); setLoading(false); return; }
      setUser({ id: res.data.id, name: res.data.name, phone: res.data.phone, email: res.data.email, role: res.data.role, branchId: res.data.branchId });
      onSuccess?.();
      onClose();
    } else if (mode === "forgot") {
      const res = requestReset(form.email);
      if (!res.ok) { setError(res.error); setLoading(false); return; }
      setInfo(`${t.demoCodeNote} ${res.data}`);
      switchMode("reset");
    } else if (mode === "reset") {
      const res = confirmReset(form.email, form.code, form.newPassword);
      if (!res.ok) { setError(res.error); setLoading(false); return; }
      setInfo("Password reset! You can now sign in.");
      switchMode("signin");
    }

    setLoading(false);
  }

  const title: Record<Mode, string> = {
    signup: t.signUp,
    signin: t.signIn,
    forgot: t.forgotPassword,
    reset: t.resetPassword,
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-900 z-[101] shadow-2xl rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="relative px-6 pt-8 pb-4 text-center">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center mx-auto mb-4">
            {mode === "forgot" || mode === "reset"
              ? <KeyRound className="w-8 h-8 text-red-600" />
              : <UserIcon className="w-8 h-8 text-red-600" />
            }
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">{title[mode]}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.authSubtitle}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {mode === "signup" && (
            <Field label={t.fullName} icon={UserIcon}>
              <input
                value={form.name} onChange={update("name")} placeholder="Jean-Pierre Mugisha"
                className="field-input" required
              />
            </Field>
          )}
          {mode === "signup" && (
            <Field label={t.phone} icon={Phone}>
              <input
                value={form.phone} onChange={update("phone")} type="tel" placeholder="078 XXX XXXX"
                className="field-input"
              />
            </Field>
          )}
          {(mode !== "reset") && (
            <Field label={t.email} icon={Mail}>
              <input
                value={form.email} onChange={update("email")} type="email" placeholder="you@example.com"
                className="field-input" required
              />
            </Field>
          )}
          {(mode === "signin" || mode === "signup") && (
            <Field label={mode === "signup" ? t.createPassword : t.password} icon={Lock}>
              <input
                value={form.password} onChange={update("password")}
                type={showPw ? "text" : "password"} placeholder="Min. 6 characters"
                className="field-input pr-10" required
              />
              <button
                type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </Field>
          )}
          {mode === "reset" && (
            <>
              <Field label={t.resetCodeLabel} icon={KeyRound}>
                <input
                  value={form.code} onChange={update("code")} placeholder="6-digit code"
                  className="field-input" required
                />
              </Field>
              <Field label={t.setNewPassword} icon={Lock}>
                <input
                  value={form.newPassword} onChange={update("newPassword")}
                  type={showPw ? "text" : "password"} placeholder="Min. 6 characters"
                  className="field-input pr-10" required
                />
                <button
                  type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </Field>
            </>
          )}

          {error && (
            <p className="text-xs text-red-600 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
          {info && (
            <p className="text-xs text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900 rounded-xl px-3 py-2 font-mono">
              {info}
            </p>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-3.5 rounded-xl font-black text-sm transition-colors shadow-lg flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : mode === "signup" ? (
              <><UserPlus className="w-4 h-4" /> {t.signUp}</>
            ) : mode === "signin" ? (
              <><LogIn className="w-4 h-4" /> {t.signIn}</>
            ) : mode === "forgot" ? (
              t.sendResetCode
            ) : (
              t.setNewPassword
            )}
          </button>
        </form>

        {/* Footer links */}
        <div className="px-6 pb-8 space-y-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100 dark:border-gray-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-900 px-2 text-gray-400">or</span>
            </div>
          </div>

          {showGuestOption && (
            <button
              onClick={() => { onSuccess?.(); onClose(); }}
              className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              {t.guestCheckout} <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {mode === "signin" && (
            <button
              onClick={() => switchMode("forgot")}
              className="w-full text-center text-sm text-gray-500 hover:text-red-600 transition-colors"
            >
              {t.forgotPassword}
            </button>
          )}

          {(mode === "forgot" || mode === "reset") && (
            <button
              onClick={() => switchMode("signin")}
              className="w-full text-center text-sm font-bold text-red-600 hover:text-red-700 transition-colors"
            >
              {t.backToSignIn}
            </button>
          )}

          {(mode === "signin" || mode === "signup") && (
            <button
              onClick={() => switchMode(mode === "signup" ? "signin" : "signup")}
              className="w-full text-center text-sm font-bold text-red-600 hover:text-red-700 transition-colors"
            >
              {mode === "signup" ? t.alreadyAccount : t.noAccount}
            </button>
          )}
        </div>
      </div>

      <style>{`
        .field-input {
          width: 100%;
          padding-left: 2.75rem;
          padding-right: 1rem;
          padding-top: 0.75rem;
          padding-bottom: 0.75rem;
          background: rgb(249 250 251);
          border: 1px solid rgb(229 231 235);
          border-radius: 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .dark .field-input {
          background: rgb(31 41 55);
          border-color: rgb(55 65 81);
          color: white;
        }
        .field-input:focus {
          ring: 2px;
          ring-color: rgb(239 68 68);
          border-color: transparent;
        }
      `}</style>
    </>
  );
}

function Field({
  label, icon: Icon, children,
}: {
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        {children}
      </div>
    </div>
  );
}
