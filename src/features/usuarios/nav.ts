// src/features/usuarios/nav.ts (LT4-33)
import type { NavItem } from '../../app/navigation';

export const usuariosNav: NavItem[] = [
  { label: 'Usuarios', to: '/usuarios', permiso: 'usuarios.gestionar' },
  { label: 'Mi perfil', to: '/perfil' },
];
