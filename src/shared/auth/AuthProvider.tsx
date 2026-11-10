import { useEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { authApi } from '../../features/auth/api/authApi';
import { AuthContext, type AuthContextValue } from './AuthContext';
import { rolesTienenPermiso, type Permiso } from './permissions';
import { sessionStore } from './sessionStore';

// setTimeout no admite demoras mayores a ~24,8 días.
const MAX_TIMEOUT_MS = 2_147_483_647;

export function AuthProvider({ children }: { children: ReactNode }) {
  const sesion = useSyncExternalStore(sessionStore.subscribe, sessionStore.get);

  // Logout automático al vencer el token.
  useEffect(() => {
    if (!sesion) return;
    const ms = Math.min(Math.max(sesion.exp * 1000 - Date.now(), 0), MAX_TIMEOUT_MS);
    const id = setTimeout(() => sessionStore.clear(), ms);
    return () => clearTimeout(id);
  }, [sesion]);

  const value = useMemo<AuthContextValue>(
    () => ({
      sesion,
      async login(username: string, password: string) {
        const data = await authApi.login({ username, password });
        sessionStore.set(data.token);
      },
      logout: () => sessionStore.clear(),
      tienePermiso: (p: Permiso) => !!sesion && rolesTienenPermiso(sesion.roles, p),
    }),
    [sesion],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
