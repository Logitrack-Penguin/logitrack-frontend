import styles from './StatusBadge.module.css';

export type StatusBadgeProps = { estado: string };

/** Texto legible y clase de color para cada estado conocido (envíos y repartidores). */
const ESTADOS: Record<string, { texto: string; clase: string }> = {
  PENDIENTE_ASIGNACION: { texto: 'Pendiente de asignación', clase: 'pendiente' },
  REPARTIDOR_ASIGNADO: { texto: 'Repartidor asignado', clase: 'asignado' },
  EN_RUTA: { texto: 'En ruta', clase: 'enRuta' },
  ENTREGADO: { texto: 'Entregado', clase: 'entregado' },
  CANCELADO: { texto: 'Cancelado', clase: 'cancelado' },
  ACTIVO: { texto: 'Activo', clase: 'activo' },
  INACTIVO: { texto: 'Inactivo', clase: 'inactivo' },
};

export function StatusBadge({ estado }: StatusBadgeProps) {
  const info = ESTADOS[estado];
  const clase = [styles.badge, info ? styles[info.clase] : styles.desconocido].join(' ');
  return <span className={clase}>{info?.texto ?? estado}</span>;
}
