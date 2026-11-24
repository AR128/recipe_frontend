import { useState, useCallback, createContext, useContext } from "react";

const ToastContext = createContext(null);

const TOAST_STYLES = {
  success: {
    icon: "✓",
    container:
      "bg-[#1c1c18]/95 text-[#F5F0E8] border-emerald-500/40 shadow-black/50",
    badge: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  },
  error: {
    icon: "✕",
    container:
      "bg-[#1c1c18]/95 text-[#F5F0E8] border-red-500/40 shadow-black/50",
    badge: "bg-red-500/20 text-red-400 border border-red-500/30",
  },
  info: {
    icon: "ℹ",
    container:
      "bg-[#1c1c18]/95 text-[#F5F0E8] border-[#C9A96E]/40 shadow-black/50",
    badge: "bg-[#C9A96E]/20 text-[#E7CA8D] border border-[#C9A96E]/30",
  },
  warning: {
    icon: "!",
    container:
      "bg-[#1c1c18]/95 text-[#F5F0E8] border-amber-500/40 shadow-black/50",
    badge: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  },
};

let toastCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = "info", duration = 2800) => {
      const id = ++toastCounter;
      setToasts((prev) => [...prev.slice(-2), { id, message, type }]);

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }
      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <style>{`
        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .toast-enter {
          animation: toastSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Toast floating container */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-9999 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0 font-sans"
      >
        {toasts.map((toast) => {
          const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
          return (
            <div
              key={toast.id}
              onClick={() => dismiss(toast.id)}
              className={`toast-enter pointer-events-auto px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl flex items-center justify-between gap-3 text-xs font-medium cursor-pointer hover:brightness-110 transition-all duration-150 ${style.container}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${style.badge}`}
                >
                  {style.icon}
                </span>
                <span className="leading-snug truncate">{toast.message}</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  dismiss(toast.id);
                }}
                className="text-[#F5F0E8]/45 hover:text-white text-xs ml-2 p-0.5 transition-colors shrink-0"
                aria-label="Dismiss notification"
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

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return (msg) => console.log("[Toast fallback]:", msg);
  }
  return ctx;
}