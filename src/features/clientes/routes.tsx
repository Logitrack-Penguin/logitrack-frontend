// src/features/clientes/routes.tsx (LT4-20)
import type { RouteObject } from 'react-router';
import { RequireRole } from '../../shared/guards/RequireRole';
import { ClienteCreatePage } from './pages/ClienteCreatePage';
import { ClienteDetailPage } from './pages/ClienteDetailPage';
import { ClienteEditPage } from './pages/ClienteEditPage';
import { ClienteListPage } from './pages/ClienteListPage';
import { MisDatosPage } from './pages/MisDatosPage';

export const clientesRoutes: RouteObject[] = [
  {
    element: <RequireRole permiso="clientes.gestionar" />,
    children: [
      { path: '/clientes', element: <ClienteListPage /> },
      { path: '/clientes/nuevo', element: <ClienteCreatePage /> },
      { path: '/clientes/:dni/editar', element: <ClienteEditPage /> },
    ],
  },
  {
    // El gateway permite a CLIENTE ver un cliente por DNI.
    element: <RequireRole permiso="clientes.ver" />,
    children: [
      { path: '/clientes/mis-datos', element: <MisDatosPage /> },
      { path: '/clientes/:dni', element: <ClienteDetailPage /> },
    ],
  },
];
