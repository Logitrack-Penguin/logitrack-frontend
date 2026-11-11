// src/features/repartidores/routes.tsx (LT4-21)
import { Navigate, type RouteObject } from 'react-router';
import { RequireRole } from '../../shared/guards/RequireRole';
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
      // LT4-40: el alta de repartidor es una sola, en /usuarios/nuevo (crea el login y la ficha
      // con el mismo DNI). Esta ruta queda como atajo para no romper enlaces viejos.
      { path: '/repartidores/nuevo', element: <Navigate to="/usuarios/nuevo" replace /> },
      { path: '/repartidores/:dni/editar', element: <RepartidorEditPage /> },
    ],
  },
];
