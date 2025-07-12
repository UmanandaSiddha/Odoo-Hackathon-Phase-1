import { createContext, useContext, ReactNode } from 'react';
import { useToast as useToastHook } from './use-toast';
import { Toaster } from './toast';

const ToastContext = createContext<ReturnType<typeof useToastHook> | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const toast = useToastHook();

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
} 