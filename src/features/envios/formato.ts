// src/features/envios/formato.ts — cómo se muestran los datos de un envío en pantalla.
import type { Rol } from '../../shared/auth/permissions';
import type { Direccion, EstadoEnvio } from './types';

/** Mismo texto que usa StatusBadge, para el filtro del listado. */
export const ESTADOS_ENVIO: { value: EstadoEnvio; label: string }[] = [
  { value: 'PENDIENTE_ASIGNACION', label: 'Pendiente de asignación' },
  { value: 'REPARTIDOR_ASIGNADO', label: 'Repartidor asignado' },
  { value: 'EN_RUTA', label: 'En ruta' },
  { value: 'ENTREGADO', label: 'Entregado' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

// LocalDate ("2026-11-12"), LocalDateTime ("2026-11-12T09:30:00") o el
// "yyyy-MM-dd HH:mm:ss" del historial. Se arma a mano para no correr la fecha por zona horaria.
const FECHA = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/;

/** "2026-11-12" → "12/11/2026"; con hora → "12/11/2026 09:30". */
export function formatearFecha(valor: string): string {
  const m = FECHA.exec(valor);
  if (!m) return valor;
  const [, anio, mes, dia, hora, minutos] = m;
  const fecha = `${dia}/${mes}/${anio}`;
  return hora ? `${fecha} ${hora}:${minutos}` : fecha;
}

const PESOS = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

export function formatearTarifa(tarifa: number): string {
  return PESOS.format(tarifa);
}

export function formatearDireccion(d: Direccion): string {
  return `${d.calle} ${d.numero}, ${d.ciudad} (CP ${d.codigoPostal})`;
}

/**
 * El código de recepción es el "PIN" que el destinatario le da al repartidor para confirmar la
 * entrega: si el repartidor lo ve, la validación no sirve. Solo lo ven ADMIN y CLIENTE.
 */
export function puedeVerCodigoRecepcion(roles: readonly Rol[]): boolean {
  return roles.includes('ADMIN') || roles.includes('CLIENTE');
}
