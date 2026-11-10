// src/features/envios/routes.tsx
import type { RouteObject } from 'react-router';
import { EnvioDetailPage } from './pages/EnvioDetailPage';
import { EnvioListPage } from './pages/EnvioListPage';
import { EnvioSeguimientoPage } from './pages/EnvioSeguimientoPage';

// Los tres roles ven envíos ('envios.ver'), así que estas rutas no llevan RequireRole.
// PENDIENTE LT4-12: { element: <RequireRole permiso="envios.crear" />,
//   children: [{ path: '/envios/nuevo', element: <EnvioCreatePage /> }] }
// /envios/nuevo y /envios/seguimiento van antes de /envios/:id por claridad
// (React Router prioriza las rutas estáticas de todas formas).
export const enviosRoutes: RouteObject[] = [
  { path: '/envios', element: <EnvioListPage /> },
  { path: '/envios/seguimiento', element: <EnvioSeguimientoPage /> },
  { path: '/envios/:id', element: <EnvioDetailPage /> },
];
