// src/features/repartidores/routes.tsx (LT4-21)
import type { RouteObject } from 'react-router';
import { RequireRole } from '../../shared/guards/RequireRole';
import { RepartidorCreatePage } from './pages/RepartidorCreatePage';
import { RepartidorDetailPage } from './pages/RepartidorDetailPage';
import { RepartidorEditPage } from './pages/RepartidorEditPage';
import { RepartidorListPage } from './pages/RepartidorListPage';

export const repartidoresRoutes: RouteObject[] = [
  {
    element: <RequireRole permiso="repartidores.ver" />,
    children: [
      { path: '/repartidores', element: <RepartidorListPage /> },
      { path: '/repartidores/:dni', element: <RepartidorDetailPage /> },
    ],
  },
  {
    element: <RequireRole permiso="repartidores.gestionar" />,
    children: [
      { path: '/repartidores/nuevo', element: <RepartidorCreatePage /> },
      { path: '/repartidores/:dni/editar', element: <RepartidorEditPage /> },
    ],
  },
];
