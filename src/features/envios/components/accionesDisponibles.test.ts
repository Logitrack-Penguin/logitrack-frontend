import { rolesTienenPermiso, type Rol } from '../../../shared/auth/permissions';
import type { EstadoEnvio } from '../types';
import { accionesDisponibles, type AccionEnvio } from './accionesDisponibles';

const para = (rol: Rol) => (estado: EstadoEnvio) =>
  accionesDisponibles(estado, (p) => rolesTienenPermiso([rol], p));

// Estado × rol → acciones esperadas.
const ESPERADO: Record<EstadoEnvio, Record<Rol, AccionEnvio[]>> = {
  PENDIENTE_ASIGNACION: { ADMIN: ['asignar', 'cancelar'], CLIENTE: [], REPARTIDOR: [] },
  REPARTIDOR_ASIGNADO: {
    ADMIN: ['marcarEnRuta', 'cancelar'],
    CLIENTE: [],
    REPARTIDOR: ['marcarEnRuta'],
  },
  EN_RUTA: { ADMIN: ['marcarEntregado'], CLIENTE: [], REPARTIDOR: ['marcarEntregado'] },
  ENTREGADO: { ADMIN: [], CLIENTE: [], REPARTIDOR: [] },
  CANCELADO: { ADMIN: [], CLIENTE: [], REPARTIDOR: [] },
};

describe('accionesDisponibles', () => {
  const casos = Object.entries(ESPERADO).flatMap(([estado, porRol]) =>
    Object.entries(porRol).map(([rol, acciones]) => [estado, rol, acciones] as const),
  );

  it.each(casos)('%s con %s → %j', (estado, rol, acciones) => {
    expect(para(rol as Rol)(estado as EstadoEnvio)).toEqual(acciones);
  });
});
