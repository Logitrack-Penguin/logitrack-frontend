import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { router } from './app/router';
import { setSesionInvalidaHandler } from './shared/api/httpClient';
import { AuthProvider } from './shared/auth/AuthProvider';
import { sessionStore } from './shared/auth/sessionStore';
import { ToastProvider } from './shared/notifications/ToastProvider';
import './index.css';
import './shared/styles/global.css';

// Un 401/403 fuera del login cierra la sesión y lleva a /login.
// La pantalla de login lee state.motivo para explicar por qué.
setSesionInvalidaHandler((status) => {
  sessionStore.clear();
  void router.navigate('/login', {
    replace: true,
    state: { motivo: status === 401 ? 'expirada' : 'sin-permiso' },
  });
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ToastProvider>
  </StrictMode>,
);
