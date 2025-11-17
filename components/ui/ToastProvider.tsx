'use client';

import React from 'react';
import { ToastProvider, Toaster } from '@/components/ui/Toast';

export default function ToastRoot({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <Toaster />
    </ToastProvider>
  );
}
