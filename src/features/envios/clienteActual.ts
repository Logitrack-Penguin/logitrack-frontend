// src/features/envios/clienteActual.ts — qué cliente de shipment es el usuario CLIENTE logueado.
//
// El DNI del cliente viaja en el token (claim "dni", Sesion.dni): security-service lo carga al
// registrar la cuenta y, en las cuentas anteriores, lo completa al iniciar sesión buscando el
// cliente con el mismo email. shipment-service filtra los envíos por ese mismo DNI.
import type { Rol } from '../../shared/auth/permissions';

/** El backend arma el remitente como "Nombre: Apellido, Nombre - DNI: 35123456". */
export function dniDeRemitente(remitente: string): string | null {
  return /DNI:\s*(\d+)/.exec(remitente)?.[1] ?? null;
}

/** Solo se filtra al CLIENTE "puro": un ADMIN ve todos los envíos aunque también sea CLIENTE. */
export function esSoloCliente(roles: readonly Rol[]): boolean {
  return roles.includes('CLIENTE') && !roles.includes('ADMIN');
}
