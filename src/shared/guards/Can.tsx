import type { ReactNode } from 'react';
import type { Permiso } from '../auth/permissions';
import { useAuth } from '../auth/useAuth';

// Muestra children solo si el usuario tiene el permiso: <Can permiso="envios.cancelar">…</Can>
export function Can({ permiso, children }: { permiso: Permiso; children: ReactNode }) {
  const { tienePermiso } = useAuth();
  return tienePermiso(permiso) ? <>{children}</> : null;
}
