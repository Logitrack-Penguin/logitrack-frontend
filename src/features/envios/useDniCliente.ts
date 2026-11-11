// src/features/envios/useDniCliente.ts — DNI del CLIENTE logueado, para filtrar sus envíos.
import { useAuth } from '../../shared/auth/useAuth';
import { esSoloCliente } from './clienteActual';

export interface DniCliente {
  /** true si el usuario es CLIENTE (sin ADMIN): solo puede ver sus propios envíos. */
  debeFiltrar: boolean;
  /** DNI del cliente, sacado del token; null si no es CLIENTE o si su cuenta no lo tiene. */
  dni: string | null;
}

export function useDniCliente(): DniCliente {
  const { sesion } = useAuth();
  const debeFiltrar = esSoloCliente(sesion?.roles ?? []);
  return { debeFiltrar, dni: debeFiltrar ? (sesion?.dni ?? null) : null };
}

/** true si el envío se puede mostrar: siempre, salvo para un CLIENTE y un envío de otro DNI. */
export function esVisible({ debeFiltrar, dni }: DniCliente, dniDelEnvio: string | null): boolean {
  return !debeFiltrar || (dni !== null && dniDelEnvio === dni);
}
