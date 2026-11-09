// Esqueleto (LT4-01). Se completa en el issue de autenticación.
export type Rol = 'ADMIN' | 'CLIENTE' | 'REPARTIDOR';

export const PERMISOS = {} as const satisfies Record<string, readonly Rol[]>;

export type Permiso = keyof typeof PERMISOS;
