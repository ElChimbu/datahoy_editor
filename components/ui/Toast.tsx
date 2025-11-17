'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';

type ToastVariant = 'success' | 'error' | 'info';

export interface ToastOptions {
  title?: string;
  durationMs?: number;
  action?: { label: string; onClick: () => void };
}

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  title?: string;
  action?: { label: string; onClick: () => void };
  dismissAt?: number;
}

interface ToastContextValue {
  show: (variant: ToastVariant, message: string, options?: ToastOptions) => void;
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
  remove: (id: string) => void;
  items: ToastItem[];
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = (id: string) => setItems((prev) => prev.filter((t) => t.id !== id));

  const showBase = (variant: ToastVariant, message: string, options?: ToastOptions) => {
    const id = Math.random().toString(36).slice(2);
    const duration = options?.durationMs ?? 3000;
    const dismissAt = Date.now() + duration;
    const item: ToastItem = {
      id,
      message,
      variant,
      title: options?.title,
      action: options?.action,
      dismissAt,
    };
    setItems((prev) => [...prev, item]);
    // auto-dismiss
    setTimeout(() => remove(id), duration);
  };

  const value = useMemo<ToastContextValue>(() => ({
    show: showBase,
    success: (m, o) => showBase('success', m, o),
    error: (m, o) => showBase('error', m, o),
    info: (m, o) => showBase('info', m, o),
    remove,
    items,
  }), [items]);

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export const Toaster: React.FC = () => {
  const { items, remove } = useToast();
  return (
    <div className="fixed top-4 right-4 z-[1000] space-y-2">
      {items.map((t) => (
        <div
          key={t.id}
          className={`min-w-[260px] max-w-[360px] rounded shadow-lg border bg-white p-3 ${
            t.variant === 'success' ? 'border-green-200' : t.variant === 'error' ? 'border-red-200' : 'border-gray-200'
          }`}
        >
          {t.title && <div className="text-sm font-semibold mb-1">{t.title}</div>}
          <div className="text-sm text-gray-800">{t.message}</div>
          <div className="mt-2 flex gap-2 justify-end">
            {t.action && (
              <button
                className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                onClick={() => { t.action?.onClick(); remove(t.id); }}
              >
                {t.action.label}
              </button>
            )}
            <button
              className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
              onClick={() => remove(t.id)}
            >
              Cerrar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
