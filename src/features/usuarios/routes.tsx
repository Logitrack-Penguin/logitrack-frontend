// src/features/usuarios/routes.tsx (LT4-33)
import type { RouteObject } from 'react-router';
import { RequireRole } from '../../shared/guards/RequireRole';
import { PerfilPage } from './pages/PerfilPage';
import { RegistroPage } from './pages/RegistroPage';
import { UsuarioCreatePage } from './pages/UsuarioCreatePage';
import { UsuarioListPage } from './pages/UsuarioListPage';

export const usuariosPublicRoutes: RouteObject[] = [
  { path: '/registro', element: <RegistroPage /> },
];

export const usuariosRoutes: RouteObject[] = [
  { path: '/perfil', element: <PerfilPage /> }, // cualquier usuario logueado
  {
    // Solo ADMIN. Sin el permiso, RequireRole lleva a /sin-permiso sin llamar al backend.
    element: <RequireRole permiso="usuarios.gestionar" />,
    children: [
      { path: '/usuarios', element: <UsuarioListPage /> },
      { path: '/usuarios/nuevo', element: <UsuarioCreatePage /> },
    ],
  },
];
