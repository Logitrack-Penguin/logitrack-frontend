// src/features/clientes/nav.ts (LT4-20)
import type { NavItem } from '../../app/navigation';

export const clientesNav: NavItem[] = [
  { label: 'Clientes', to: '/clientes', permiso: 'clientes.gestionar' },
  // Pensado para CLIENTE; con el modelo actual de permisos ADMIN también lo ve (es inofensivo).
  { label: 'Mis datos', to: '/clientes/mis-datos', permiso: 'clientes.ver' },
];
