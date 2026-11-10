// src/features/envios/routes.tsx
import type { RouteObject } from 'react-router';
import { RequireRole } from '../../shared/guards/RequireRole';
import { EnvioCreatePage } from './pages/EnvioCreatePage';
import { EnvioDetailPage } from './pages/EnvioDetailPage';
import { EnvioListPage } from './pages/EnvioListPage';
import { EnvioSeguimientoPage } from './pages/EnvioSeguimientoPage';

// Los tres roles ven envíos ('envios.ver'); crear es solo de ADMIN y CLIENTE.
// /envios/nuevo y /envios/seguimiento van antes de /envios/:id por claridad
// (React Router prioriza las rutas estáticas de todas formas).
export const enviosRoutes: RouteObject[] = [
  { path: '/envios', element: <EnvioListPage /> },
  { path: '/envios/seguimiento', element: <EnvioSeguimientoPage /> },
  {
    element: <RequireRole permiso="envios.crear" />,
    children: [{ path: '/envios/nuevo', element: <EnvioCreatePage /> }],
  },
  { path: '/envios/:id', element: <EnvioDetailPage /> },
];
