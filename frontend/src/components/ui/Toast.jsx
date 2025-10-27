import { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { ToastContext } from './toastContext';

/**
 * Toast system
 * - Top-right stacked host
 * - aria-live="polite" announcements
 * - Variants: 'info' | 'error'
 *
 * Usage:
 *  Wrap your app with <ToastProvider> and use the hook from useToast.js
 */

export default function ToastProvider({ children, max = 4, defaultDuration = 4000 }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, leaving: true } : t))
    );

    // Match CSS toast-out ~140–200ms
    const removeAfter = 220;
    const timeout = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      const m = timersRef.current;
      const t = m.get(id);
      if (t) clearTimeout(t);
      m.delete(id);
    }, removeAfter);

    // Keep reference only to the leave timer (optional)
    timersRef.current.set(`leave:${id}`, timeout);
  }, []);

  const show = useCallback(
    ({ title, message, variant = 'info', duration } = {}) => {
      const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      setToasts((prev) => {
        const next = [...prev, { id, title, message, variant, leaving: false }];
        // Keep only last "max" toasts
        return next.slice(-max);
      });

      const ms = typeof duration === 'number' ? duration : defaultDuration;
      if (ms > 0) {
        const t = setTimeout(() => dismiss(id), ms);
        timersRef.current.set(id, t);
      }

      return id;
    },
    [defaultDuration, dismiss, max]
  );

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current.clear();
    };
  }, []);

  const value = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastHost toasts={toasts} onClose={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastHost({ toasts, onClose }) {
  return (
    <div
      className="toast-host"
      role="region"
      aria-live="polite"
      aria-label="Notificaciones"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={() => onClose(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }) {
  const { title, message, variant, leaving } = toast;
  const cls = ['toast', variant === 'error' ? 'toast--error' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cls}
      data-leaving={leaving ? 'true' : undefined}
      role={variant === 'error' ? 'alert' : 'status'}
      aria-atomic="true"
    >
      <div aria-hidden="true">
        {variant === 'error' ? <ErrorIcon /> : <InfoIcon />}
      </div>
      <div>
        {title ? <div className="toast-title">{title}</div> : null}
        {message ? <div className="toast-message">{message}</div> : null}
      </div>
      <button
        type="button"
        className="toast-close focus-ring"
        aria-label="Cerrar notificación"
        onClick={onClose}
        title="Cerrar"
      >
        <CloseIcon />
      </button>
    </div>
  );
}

function ErrorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M12 2a10 10 0 1 1-.001 20.001A10 10 0 0 1 12 2Zm0 4a1 1 0 0 0-1 1v7a1 1 0 1 0 2 0V7a1 1 0 0 0-1-1Zm0 12a1.3 1.3 0 1 0 0-2.6a1.3 1.3 0 0 0 0 2.6Z"/>
    </svg>
  );
}
function InfoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M12 2a10 10 0 1 1-.001 20.001A10 10 0 0 1 12 2Zm1 7a1 1 0 1 0-2 0a1 1 0 0 0 2 0Zm-1 3c-.55 0-1 .45-1 1v4a1 1 0 1 0 2 0v-4c0-.55-.45-1-1-1Z"/>
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="m12 10.586l4.95-4.95l1.414 1.414L13.414 12l4.95 4.95l-1.414 1.414L12 13.414l-4.95 4.95l-1.414-1.414L10.586 12l-4.95-4.95l1.414-1.414z"/>
    </svg>
  );
}