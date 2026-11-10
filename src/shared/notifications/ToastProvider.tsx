import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { IconAlert, IconCheck, IconX } from '../components/icons/icons';
import { ToastContext, type ToastApi } from './ToastContext';
import styles from './ToastProvider.module.css';

type ToastTipo = 'success' | 'error' | 'warning';

interface Toast {
  id: number;
  tipo: ToastTipo;
  mensaje: string;
}

/** Tiempo que cada toast queda visible. */
export const TOAST_DURACION_MS = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const siguienteId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const cerrar = useCallback((id: number) => {
    setToasts((lista) => lista.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
  }, []);

  const mostrar = useCallback(
    (tipo: ToastTipo, mensaje: string) => {
      const id = siguienteId.current++;
      setToasts((lista) => [...lista, { id, tipo, mensaje }]);
      timers.current.set(
        id,
        setTimeout(() => cerrar(id), TOAST_DURACION_MS),
      );
    },
    [cerrar],
  );

  // Limpia los timers pendientes si el provider se desmonta.
  useEffect(() => {
    const pendientes = timers.current;
    return () => pendientes.forEach(clearTimeout);
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (msg) => mostrar('success', msg),
      error: (msg) => mostrar('error', msg),
      warning: (msg) => mostrar('warning', msg),
    }),
    [mostrar],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className={styles.contenedor} role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`${styles.toast} ${styles[t.tipo]}`}>
            <span className={styles.icono}>
              {t.tipo === 'success' ? <IconCheck size={20} /> : <IconAlert size={20} />}
            </span>
            <span className={styles.mensaje}>{t.mensaje}</span>
            <button
              type="button"
              className={styles.cerrar}
              onClick={() => cerrar(t.id)}
              aria-label="Cerrar notificación"
            >
              <IconX size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
