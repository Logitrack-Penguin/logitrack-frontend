import { createBrowserRouter, Navigate } from 'react-router';
import { RequireAuth } from '../shared/guards/RequireAuth';
import { Layout } from '../shared/components/Layout/Layout';
import { authPublicRoutes } from '../features/auth/routes';
import { usuariosPublicRoutes, usuariosRoutes } from '../features/usuarios/routes';
import { enviosRoutes } from '../features/envios/routes';
import { clientesRoutes } from '../features/clientes/routes';
import { repartidoresRoutes } from '../features/repartidores/routes';
import { NotFoundPage } from '../pages/NotFoundPage';
import { SinPermisoPage } from '../pages/SinPermisoPage';

export const router = createBrowserRouter([
  ...authPublicRoutes, // /login
  ...usuariosPublicRoutes, // /registro
  {
    element: <RequireAuth />, // todo lo de adentro exige sesión
    children: [
      {
        element: <Layout />, // barra de navegación + <Outlet />
        children: [
          { index: true, element: <Navigate to="/envios" replace /> },
          ...enviosRoutes,
          ...clientesRoutes,
          ...repartidoresRoutes,
          ...usuariosRoutes,
          { path: '/sin-permiso', element: <SinPermisoPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
