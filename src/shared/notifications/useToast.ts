import { useContext } from 'react';
import { ToastContext, type ToastApi } from './ToastContext';

/** Muestra notificaciones: toast.success('Guardado'), toast.error(e.message), toast.warning(...). */
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast debe usarse dentro de <ToastProvider>.');
  }
  return ctx;
}
