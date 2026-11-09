import { Outlet } from 'react-router';

// Esqueleto (LT4-01): todavía no exige sesión. Se implementa en el issue de guardias.
export function RequireAuth() {
  return <Outlet />;
}
