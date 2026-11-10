import { createContext } from 'react';
import type { Permiso } from './permissions';
import type { Sesion } from './sessionStore';

export interface AuthContextValue {
  sesion: Sesion | null;
  login(username: string, password: string): Promise<void>; // lanza ApiError si falla
  logout(): void;
  tienePermiso(p: Permiso): boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
