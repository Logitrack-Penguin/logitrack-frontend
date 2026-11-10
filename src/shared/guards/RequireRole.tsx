import { Navigate, Outlet } from 'react-router';
import type { Permiso } from '../auth/permissions';
import { useAuth } from '../auth/useAuth';

// Ruta "padre" que exige un permiso. Sin permiso va a /sin-permiso, sin cerrar la sesión:
// no hubo ningún pedido al backend (un 403 del backend sí la cierra, desde httpClient).
export function RequireRole({ permiso }: { permiso: Permiso }) {
  const { tienePermiso } = useAuth();
  return tienePermiso(permiso) ? <Outlet /> : <Navigate to="/sin-permiso" replace />;
}
