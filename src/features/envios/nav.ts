// src/features/envios/nav.ts
import type { NavItem } from '../../app/navigation';

export const enviosNav: NavItem[] = [
  { label: 'Envíos', to: '/envios', permiso: 'envios.ver' },
  { label: 'Seguimiento', to: '/envios/seguimiento', permiso: 'envios.ver' },
];
