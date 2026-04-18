"use client";
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle, X, ShoppingCart, AlertCircle } from "lucide-react";

type ToastType = "success" | "error" | "cart";
interface ToastItem { id: number; message: string; type: ToastType; sub?: string }

interface ToastCtx { toast: (message: string, type?: ToastType, sub?: string) => void }
const ToastContext = createContext<ToastCtx>({ toast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  let counter = 0;

  const toast = useCallback((message: string, type: ToastType = "success", sub?: string) => {
    const id = ++counter;
    setToasts((prev) => [...prev, { id, message, type, sub }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  const remove = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 items-center pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-white text-sm font-medium pointer-events-auto animate-in slide-in-from-bottom-4 duration-300 max-w-xs ${
              t.type === "cart"
                ? "bg-gray-900 dark:bg-gray-100 dark:text-gray-900"
                : t.type === "error"
                ? "bg-red-600"
                : "bg-green-600"
            }`}
          >
            {t.type === "cart" ? (
              <ShoppingCart className="w-4 h-4 shrink-0 text-green-400 dark:text-green-600" />
            ) : t.type === "error" ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="leading-snug truncate">{t.message}</p>
              {t.sub && <p className="text-xs opacity-70 truncate">{t.sub}</p>}
            </div>
            <button onClick={() => remove(t.id)} className="shrink-0 opacity-60 hover:opacity-100">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
