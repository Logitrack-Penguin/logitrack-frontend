// IMPORTANTE: esta matriz debe coincidir EXACTAMENTE con las reglas de roles de
// config-ms/api-gateway-dev.yaml (logitrack.gateway.security.rules). Si cambia una, cambia la otra.
// Cada permiso se nombra <módulo>.<acción>. Solo sirve para mostrar u ocultar UI:
// la validación real la hace el gateway. Ver docs/CONTRATOS.md.

export type Rol = 'ADMIN' | 'CLIENTE' | 'REPARTIDOR';

export const PERMISOS = {
  'envios.ver': ['ADMIN', 'CLIENTE', 'REPARTIDOR'],
  'envios.crear': ['ADMIN', 'CLIENTE'],
  'envios.cancelar': ['ADMIN'],
  'envios.asignarRepartidor': ['ADMIN'],
  'envios.cambiarEstado': ['ADMIN', 'REPARTIDOR'],
  'clientes.ver': ['ADMIN', 'CLIENTE'],
  'clientes.gestionar': ['ADMIN'],
  'repartidores.ver': ['ADMIN', 'REPARTIDOR'],
  'repartidores.gestionar': ['ADMIN'],
  'repartidores.cambiarEstado': ['ADMIN', 'REPARTIDOR'],
  'usuarios.gestionar': ['ADMIN'],
} as const satisfies Record<string, readonly Rol[]>;

export type Permiso = keyof typeof PERMISOS;

export function rolesTienenPermiso(roles: readonly Rol[], permiso: Permiso): boolean {
  const permitidos: readonly Rol[] = PERMISOS[permiso];
  return roles.some((rol) => permitidos.includes(rol));
}
