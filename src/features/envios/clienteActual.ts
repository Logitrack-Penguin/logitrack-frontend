// src/features/envios/clienteActual.ts — qué cliente de shipment es el usuario CLIENTE logueado.
//
// El token no trae el DNI del cliente, y el backend devuelve todos los envíos a cualquier CLIENTE.
// Mientras eso no se resuelva en el backend, el front pide el DNI una vez, lo verifica comparando
// el email del usuario (/auth/me) con el del cliente (/clientes/{dni}) y filtra por ese DNI.
// Es una protección de interfaz: los datos igual llegan en la respuesta del backend.
import { toApiError } from '../../shared/api/apiError';
import type { Rol } from '../../shared/auth/permissions';
import { clientesApi } from '../clientes/api/clientesApi';
import { usuariosApi } from '../usuarios/api/usuariosApi';

/** El backend arma el remitente como "Nombre: Apellido, Nombre - DNI: 35123456". */
export function dniDeRemitente(remitente: string): string | null {
  return /DNI:\s*(\d+)/.exec(remitente)?.[1] ?? null;
}

/** Solo se filtra al CLIENTE "puro": un ADMIN ve todos los envíos aunque también sea CLIENTE. */
export function esSoloCliente(roles: readonly Rol[]): boolean {
  return roles.includes('CLIENTE') && !roles.includes('ADMIN');
}

// ---------- DNI vinculado, por usuario ----------
// Vive fuera de React (como sessionStore) para que la guardia de rutas y las pantallas
// vean el mismo valor al instante cuando se vincula o se cambia.

const clave = (userId: string) => `logitrack.envios.dniCliente.${userId}`;
const oyentes = new Set<() => void>();

export const dniVinculado = {
  get(userId: string): string | null {
    try {
      return localStorage.getItem(clave(userId));
    } catch {
      return null; // localStorage bloqueado (modo privado)
    }
  },

  set(userId: string, dni: string): void {
    try {
      localStorage.setItem(clave(userId), dni);
    } catch {
      // Sin localStorage no se puede recordar: se volverá a pedir.
    }
    oyentes.forEach((fn) => fn());
  },

  clear(userId: string): void {
    try {
      localStorage.removeItem(clave(userId));
    } catch {
      // Nada que borrar.
    }
    oyentes.forEach((fn) => fn());
  },

  subscribe(fn: () => void): () => void {
    oyentes.add(fn);
    return () => {
      oyentes.delete(fn);
    };
  },
};

const normalizar = (email: string) => email.trim().toLowerCase();

/**
 * Verifica que el DNI sea del usuario logueado (mismo email en su usuario y en el cliente) y lo
 * guarda. Rechaza con un Error cuyo message se puede mostrar tal cual.
 */
export async function vincularDni(userId: string, dni: string): Promise<string> {
  let emailUsuario: string;
  let emailCliente: string;
  try {
    const [usuario, cliente] = await Promise.all([usuariosApi.me(), clientesApi.obtener(dni)]);
    emailUsuario = usuario.email;
    emailCliente = cliente.email;
  } catch (e) {
    const error = toApiError(e);
    if (error.status === 404) throw new Error('No hay un cliente registrado con ese DNI.');
    throw error;
  }
  if (normalizar(emailUsuario) !== normalizar(emailCliente)) {
    throw new Error('Ese DNI no corresponde a tu usuario.');
  }
  dniVinculado.set(userId, dni);
  return dni;
}
