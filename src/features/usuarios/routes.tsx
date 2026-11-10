// src/features/usuarios/routes.tsx (LT4-33)
import type { RouteObject } from 'react-router';
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
    // Solo ADMIN (permiso 'usuarios.gestionar').
    // PENDIENTE LT4-03: agregar element: <RequireRole permiso="usuarios.gestionar" /> cuando
    // Agus publique RequireRole. Mientras tanto, el gateway igual responde 403 a los demás roles.
    children: [
      { path: '/usuarios', element: <UsuarioListPage /> },
      { path: '/usuarios/nuevo', element: <UsuarioCreatePage /> },
    ],
  },
];
