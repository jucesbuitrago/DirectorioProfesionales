import { useContext } from 'react';
import { ToastContext } from './toastContext.js';

/**
 * Hook to access Toast API (show, dismiss)
 * Must be used under <ToastProvider>.
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}