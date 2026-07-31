"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Sits above the bottom nav so it never covers navigation. */}
      <div
        className="fixed left-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none sm:left-auto sm:right-6 sm:w-96"
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 7rem)" }}
      >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              role={toast.type === "error" ? "alert" : "status"}
              className={cn(
                "toast-enter pointer-events-auto w-full max-w-full p-4 rounded-2xl shadow-2xl border flex items-center gap-3 bg-white/90 backdrop-blur-xl",
                toast.type === "success" && "border-green-100 text-green-900",
                toast.type === "error" && "border-red-100 text-red-900",
                toast.type === "info" && "border-blue-100 text-blue-900"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl",
                toast.type === "success" && "bg-green-100 text-green-600",
                toast.type === "error" && "bg-red-100 text-red-600",
                toast.type === "info" && "bg-blue-100 text-blue-600"
              )}>
                {toast.type === "success" && <CheckCircle2 className="w-5 h-5" />}
                {toast.type === "error" && <AlertCircle className="w-5 h-5" />}
                {toast.type === "info" && <Info className="w-5 h-5" />}
              </div>
              <p className="text-sm font-bold flex-1 min-w-0 break-words">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                aria-label="Dismiss"
                className="shrink-0 min-w-11 min-h-11 flex items-center justify-center hover:bg-black/5 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 opacity-50" />
              </button>
            </div>
          ))}
      </div>
    </ToastContext.Provider>
  );
}
