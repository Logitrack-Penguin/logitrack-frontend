// src/features/envios/useDniCliente.ts — DNI del CLIENTE logueado, para filtrar sus envíos.
import { useCallback, useSyncExternalStore } from 'react';
import { useAuth } from '../../shared/auth/useAuth';
import { dniVinculado, esSoloCliente, vincularDni } from './clienteActual';

export interface DniCliente {
  /** true si el usuario es CLIENTE (sin ADMIN): solo puede ver sus propios envíos. */
  debeFiltrar: boolean;
  /** DNI verificado del cliente, o null si todavía no lo vinculó. */
  dni: string | null;
  /** true si el DNI se vinculó a mano (cuenta vieja): se puede cambiar. El del token, no. */
  puedeCambiarDni: boolean;
  vincular(dni: string): Promise<string>;
  desvincular(): void;
}

export function useDniCliente(): DniCliente {
  const { sesion } = useAuth();
  const userId = sesion?.userId ?? '';
  const debeFiltrar = esSoloCliente(sesion?.roles ?? []);
  const vinculado = useSyncExternalStore(dniVinculado.subscribe, () =>
    userId ? dniVinculado.get(userId) : null,
  );
  // Las cuentas registradas con sus datos de cliente traen el DNI en el token. El DNI vinculado a
  // mano queda como respaldo para cuentas creadas antes de ese cambio.
  const dni = sesion?.dni ?? vinculado;

  const vincular = useCallback((valor: string) => vincularDni(userId, valor), [userId]);
  const desvincular = useCallback(() => dniVinculado.clear(userId), [userId]);

  return {
    debeFiltrar,
    dni: debeFiltrar ? dni : null,
    puedeCambiarDni: debeFiltrar && !sesion?.dni,
    vincular,
    desvincular,
  };
}

/** true si el envío se puede mostrar: siempre, salvo para un CLIENTE y un envío de otro DNI. */
export function esVisible(
  { debeFiltrar, dni }: Pick<DniCliente, 'debeFiltrar' | 'dni'>,
  dniDelEnvio: string | null,
): boolean {
  return !debeFiltrar || (dni !== null && dniDelEnvio === dni);
}
