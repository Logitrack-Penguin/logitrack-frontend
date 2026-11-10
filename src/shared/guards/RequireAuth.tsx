import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../auth/useAuth';

// Ruta "padre" que exige sesión. Sin sesión va a /login y guarda en state.from
// la ruta pedida, para volver ahí después de loguearse.
export function RequireAuth() {
  const { sesion } = useAuth();
  const location = useLocation();
  if (!sesion) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}
