import { useState, useEffect, useCallback, createContext, useContext } from "react";

const ToastContext = createContext(null);

const TOAST_ICONS = {
  success: "✓",
  error: "✕",
  info: "ℹ",
  warning: "⚠️",
};

const TOAST_COLORS = {
  success: "bg-emerald-600 text-white border-emerald-500",
  error: "bg-red-600 text-white border-red-500",
  info: "bg-neutral-900 dark:bg-neutral-800 text-white border-neutral-700",
  warning: "bg-amber-600 text-white border-amber-500",
};

let toastCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = "info", duration = 4000) => {
    const id = ++toastCounter;
    setToasts((prev) => [...prev.slice(-3), { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }
    return id;
  }, [dismiss]);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {/* Toast floating container */}
      <div
        aria-live="polite"
        className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => {
          const icon = TOAST_ICONS[toast.type] || "ℹ";
          const color = TOAST_COLORS[toast.type] || TOAST_COLORS.info;
          return (
            <div
              key={toast.id}
              onClick={() => dismiss(toast.id)}
              className={`pointer-events-auto p-4 rounded-2xl border shadow-xl flex items-center justify-between gap-3 text-xs font-semibold cursor-pointer animate-fade-in transition-all ${color}`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold shrink-0">
                  {icon}
                </span>
                <span className="leading-snug">{toast.message}</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  dismiss(toast.id);
                }}
                className="opacity-60 hover:opacity-100 text-sm ml-2"
                aria-label="Dismiss toast"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return (msg) => console.log("[Toast fallback]:", msg);
  }
  return ctx;
}

