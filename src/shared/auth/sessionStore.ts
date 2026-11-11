import { decodeJwt, estaVencido } from './jwt';
import type { Rol } from './permissions';

export interface Sesion {
  token: string;
  userId: string; // claim "userId"
  username: string; // claim "sub"
  roles: Rol[]; // claim "roles"
  dni?: string; // claim "dni": vincula el usuario con su repartidor o cliente
  exp: number; // claim "exp", en segundos
}

// Se guarda solo el token: la sesión se deriva de sus claims.
const KEY = 'logitrack.session';

function desdeToken(token: string): Sesion | null {
  const c = decodeJwt(token);
  const esValido =
    c !== null &&
    typeof c.sub === 'string' &&
    typeof c.userId === 'string' &&
    Array.isArray(c.roles) &&
    typeof c.exp === 'number';
  if (!esValido || estaVencido(c)) return null;
  const sesion: Sesion = { token, userId: c.userId, username: c.sub, roles: c.roles, exp: c.exp };
  if (typeof c.dni === 'string') sesion.dni = c.dni;
  return sesion;
}

function leer(): Sesion | null {
  try {
    const token = sessionStorage.getItem(KEY);
    const sesion = token ? desdeToken(token) : null;
    if (token && !sesion) sessionStorage.removeItem(KEY); // vencido o corrupto: se descarta
    return sesion;
  } catch {
    return null; // sessionStorage bloqueado (modo privado)
  }
}

let actual: Sesion | null = leer();
const oyentes = new Set<() => void>();

function emitir(): void {
  oyentes.forEach((fn) => fn());
}

// La sesión vive fuera de React para que httpClient pueda leerla.
// Las pantallas no la usan directo: usan useAuth().
export const sessionStore = {
  get: (): Sesion | null => actual,

  set(token: string): void {
    const sesion = desdeToken(token);
    if (!sesion) {
      sessionStore.clear();
      return;
    }
    try {
      sessionStorage.setItem(KEY, token);
    } catch {
      // sessionStorage bloqueado: la sesión queda solo en memoria.
    }
    actual = sesion;
    emitir();
  },

  clear(): void {
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      // sessionStorage bloqueado: no hay nada que borrar.
    }
    actual = null;
    emitir();
  },

  subscribe(fn: () => void): () => void {
    oyentes.add(fn);
    return () => {
      oyentes.delete(fn);
    };
  },
};
