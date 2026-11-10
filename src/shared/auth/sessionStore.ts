import type { Rol } from './permissions';

export interface Sesion {
  token: string;
  userId: string;
  username: string;
  roles: Rol[];
  exp: number; // claim "exp" del JWT, en segundos
}

const CLAVE = 'logitrack.sesion';

// Copia en memoria; sessionStorage permite recuperarla al recargar la pestaña.
let enMemoria: Sesion | null = null;

const estaVencida = (sesion: Sesion): boolean => sesion.exp * 1000 <= Date.now();

function leerDeStorage(): Sesion | null {
  try {
    const guardada = sessionStorage.getItem(CLAVE);
    return guardada ? (JSON.parse(guardada) as Sesion) : null;
  } catch {
    return null;
  }
}

// Único lugar que lee y escribe la sesión. Las pantallas usan useAuth(), no este módulo.
export const sessionStore = {
  get(): Sesion | null {
    const sesion = enMemoria ?? leerDeStorage();
    if (!sesion || estaVencida(sesion)) {
      if (sesion) sessionStore.clear();
      return null;
    }
    enMemoria = sesion;
    return sesion;
  },

  set(sesion: Sesion): void {
    enMemoria = sesion;
    try {
      sessionStorage.setItem(CLAVE, JSON.stringify(sesion));
    } catch {
      // Sin acceso a sessionStorage (modo privado, cuota): queda solo en memoria.
    }
  },

  clear(): void {
    enMemoria = null;
    try {
      sessionStorage.removeItem(CLAVE);
    } catch {
      // Nada que limpiar.
    }
  },
};
