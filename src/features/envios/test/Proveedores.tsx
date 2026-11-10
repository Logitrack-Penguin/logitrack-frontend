// Los providers que necesitan las pantallas de envíos en los tests (igual que en main.tsx).
import type { ReactNode } from 'react';
import { AuthProvider } from '../../../shared/auth/AuthProvider';
import { ToastProvider } from '../../../shared/notifications/ToastProvider';

export function Proveedores({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>{children}</AuthProvider>
    </ToastProvider>
  );
}
