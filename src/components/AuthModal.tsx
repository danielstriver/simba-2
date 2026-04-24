"use client";
import { useState } from "react";
import Image from "next/image";
import { useStore } from "@/lib/store";
import { useLang } from "@/lib/LanguageContext";
import { register, login, requestReset, confirmReset, loginOrCreateGoogleUser } from "@/lib/auth";
import { signInWithGoogle, isGoogleAuthConfigured } from "@/lib/firebase";
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

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
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
  const [googleLoading, setGoogleLoading] = useState(false);
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

  async function handleGoogleSignIn() {
    if (!isGoogleAuthConfigured()) {
      setError("Google Sign-In is not configured yet. Add Firebase credentials to .env.local to enable it.");
      return;
    }
    setGoogleLoading(true);
    setError("");
    try {
      const result = await signInWithGoogle();
      const gUser = result.user;
      const email = gUser.email ?? "";
      const name = gUser.displayName ?? "";
      const uid = gUser.uid;

      if (!email) {
        setError("Google did not return an email address. Please try a different sign-in method.");
        setGoogleLoading(false);
        return;
      }

      const res = loginOrCreateGoogleUser(uid, email, name);
      if (!res.ok) {
        setError(res.error);
        setGoogleLoading(false);
        return;
      }
      setUser({
        id: res.data.id,
        name: res.data.name,
        phone: res.data.phone,
        email: res.data.email,
        role: res.data.role,
        branchId: res.data.branchId,
        photoUrl: gUser.photoURL ?? undefined,
      });
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        // User dismissed — no error needed
      } else if (code === "auth/popup-blocked") {
        setError("Pop-up was blocked by your browser. Please allow pop-ups for this site and try again.");
      } else {
        setError("Google Sign-In failed. Please try again or use email instead.");
      }
    } finally {
      setGoogleLoading(false);
    }
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

  const showGoogleButton = mode === "signin" || mode === "signup";

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
          <div className="mx-auto mb-4 flex justify-center">
            {mode === "forgot" || mode === "reset" ? (
              <div className="w-16 h-16 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center">
                <KeyRound className="w-8 h-8 text-red-600" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-800 bg-white">
                <Image src="/images/simba-logo.jpeg" alt="Simba Supermarket" width={64} height={64} className="w-full h-full object-cover" />
              </div>
            )}
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

        {/* Footer */}
        <div className="px-6 pb-8 space-y-3">

          {/* ── Google Sign-In ─────────────────────────────────── */}
          {showGoogleButton && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100 dark:border-gray-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-900 px-3 text-gray-400 tracking-widest font-medium">
                    or continue with
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800/60 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 dark:text-gray-100 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-[0_4px_20px_rgba(66,133,244,0.18)] hover:border-[#4285F4]/40 dark:hover:border-[#4285F4]/40 hover:-translate-y-px active:translate-y-0 active:shadow-sm"
              >
                {googleLoading ? (
                  <span className="inline-block w-5 h-5 border-2 border-gray-300 border-t-[#4285F4] rounded-full animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                <span>{t.continueWithGoogle}</span>
              </button>
            </>
          )}

          {/* ── Divider (only when no Google button) ──────────── */}
          {!showGoogleButton && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100 dark:border-gray-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-900 px-2 text-gray-400">or</span>
              </div>
            </div>
          )}

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
