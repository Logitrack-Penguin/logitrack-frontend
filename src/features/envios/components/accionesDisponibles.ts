// src/features/envios/components/accionesDisponibles.ts — qué botones mostrar en el detalle.
// Función pura: el estado del envío y los permisos del usuario deciden las acciones.
import type { Permiso } from '../../../shared/auth/permissions';
import type { EstadoEnvio } from '../types';

export type AccionEnvio = 'asignar' | 'cancelar' | 'marcarEnRuta' | 'marcarEntregado';

export function accionesDisponibles(
  estado: EstadoEnvio,
  tiene: (p: Permiso) => boolean,
): AccionEnvio[] {
  const acciones: AccionEnvio[] = [];
  switch (estado) {
    case 'PENDIENTE_ASIGNACION':
      if (tiene('envios.asignarRepartidor')) acciones.push('asignar');
      if (tiene('envios.cancelar')) acciones.push('cancelar');
      break;
    case 'REPARTIDOR_ASIGNADO':
      if (tiene('envios.cambiarEstado')) acciones.push('marcarEnRuta');
      // El backend permite cancelar mientras el envío no esté EN_RUTA.
      if (tiene('envios.cancelar')) acciones.push('cancelar');
      break;
    case 'EN_RUTA':
      if (tiene('envios.cambiarEstado')) acciones.push('marcarEntregado');
      break;
    case 'ENTREGADO':
    case 'CANCELADO':
      break; // estados finales
  }
  return acciones;
}
