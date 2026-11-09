import type { Permiso } from '../shared/auth/permissions';
import { enviosNav } from '../features/envios/nav';
import { clientesNav } from '../features/clientes/nav';
import { repartidoresNav } from '../features/repartidores/nav';
import { usuariosNav } from '../features/usuarios/nav';

export interface NavItem {
  label: string;
  to: string;
  permiso?: Permiso;
}

export const NAV_ITEMS: NavItem[] = [
  ...enviosNav,
  ...clientesNav,
  ...repartidoresNav,
  ...usuariosNav,
];
