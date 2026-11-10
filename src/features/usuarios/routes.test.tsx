import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { crearToken } from '../../test/jwt';
import { AuthProvider } from '../../shared/auth/AuthProvider';
import type { Rol } from '../../shared/auth/permissions';
import { sessionStore } from '../../shared/auth/sessionStore';
import { ToastProvider } from '../../shared/notifications/ToastProvider';
import { usuariosApi } from './api/usuariosApi';
import { usuariosRoutes } from './routes';

const USUARIO = { id: '1', username: 'agus', email: 'agus@mail.com', roles: ['ADMIN' as const] };

function renderEn(ruta: string) {
  const router = createMemoryRouter(
    [...usuariosRoutes, { path: '/sin-permiso', element: <p>Sin permiso</p> }],
    { initialEntries: [ruta] },
  );
  render(
    <ToastProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ToastProvider>,
  );
  return router;
}

const loguearComo = (rol: Rol) => sessionStore.set(crearToken({ roles: [rol] }));

beforeEach(() => {
  sessionStore.clear();
  sessionStorage.clear();
  vi.spyOn(usuariosApi, 'listar').mockResolvedValue([USUARIO]);
  vi.spyOn(usuariosApi, 'me').mockResolvedValue(USUARIO);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('rutas de usuarios', () => {
  it('un CLIENTE en /usuarios va a /sin-permiso sin llamar al backend ni cerrar la sesión', () => {
    loguearComo('CLIENTE');
    const router = renderEn('/usuarios');
    expect(screen.getByText('Sin permiso')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/sin-permiso');
    expect(usuariosApi.listar).not.toHaveBeenCalled();
    expect(sessionStore.get()).not.toBeNull();
  });

  it('un REPARTIDOR en /usuarios/nuevo va a /sin-permiso', () => {
    loguearComo('REPARTIDOR');
    const router = renderEn('/usuarios/nuevo');
    expect(router.state.location.pathname).toBe('/sin-permiso');
  });

  it('un ADMIN en /usuarios ve el listado', async () => {
    loguearComo('ADMIN');
    renderEn('/usuarios');
    expect(await screen.findByText('agus@mail.com')).toBeInTheDocument();
  });

  it('un CLIENTE puede entrar a /perfil', async () => {
    loguearComo('CLIENTE');
    renderEn('/perfil');
    expect(screen.getByRole('heading', { name: 'Mi perfil' })).toBeInTheDocument();
    expect(await screen.findByText('agus@mail.com')).toBeInTheDocument();
  });
});
