import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider, useLocation, type Location } from 'react-router';
import { crearToken } from '../../test/jwt';
import { AuthProvider } from '../auth/AuthProvider';
import type { Rol } from '../auth/permissions';
import { sessionStore } from '../auth/sessionStore';
import { Can } from './Can';
import { RequireAuth } from './RequireAuth';
import { RequireRole } from './RequireRole';

function LoginFalso() {
  const state = useLocation().state as { from?: Location } | null;
  return <p>Login (desde {state?.from?.pathname ?? 'ninguna'})</p>;
}

function renderEn(ruta: string) {
  const router = createMemoryRouter(
    [
      { path: '/login', element: <LoginFalso /> },
      {
        element: <RequireAuth />,
        children: [
          { path: '/privada', element: <p>Página privada</p> },
          { path: '/sin-permiso', element: <p>Sin permiso</p> },
          {
            element: <RequireRole permiso="clientes.gestionar" />,
            children: [{ path: '/clientes', element: <p>Clientes</p> }],
          },
          {
            path: '/acciones',
            element: (
              <>
                <p>Acciones</p>
                <Can permiso="envios.cancelar">
                  <button>Cancelar envío</button>
                </Can>
              </>
            ),
          },
        ],
      },
    ],
    { initialEntries: [ruta] },
  );
  render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>,
  );
  return router;
}

const loguearComo = (rol: Rol) => sessionStore.set(crearToken({ roles: [rol] }));

beforeEach(() => {
  sessionStore.clear();
  sessionStorage.clear();
});

describe('RequireAuth', () => {
  it('sin sesión lleva a /login y recuerda la ruta pedida', () => {
    const router = renderEn('/privada');
    expect(screen.getByText('Login (desde /privada)')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
  });

  it('con sesión muestra la página privada', () => {
    loguearComo('CLIENTE');
    renderEn('/privada');
    expect(screen.getByText('Página privada')).toBeInTheDocument();
  });
});

describe('RequireRole', () => {
  it('con un rol insuficiente lleva a /sin-permiso sin cerrar la sesión', () => {
    loguearComo('CLIENTE');
    const router = renderEn('/clientes');
    expect(screen.getByText('Sin permiso')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/sin-permiso');
    expect(sessionStore.get()).not.toBeNull();
  });

  it('con el permiso muestra la página', () => {
    loguearComo('ADMIN');
    renderEn('/clientes');
    expect(screen.getByText('Clientes')).toBeInTheDocument();
  });
});

describe('Can', () => {
  it('muestra el contenido si tiene el permiso', () => {
    loguearComo('ADMIN');
    renderEn('/acciones');
    expect(screen.getByRole('button', { name: 'Cancelar envío' })).toBeInTheDocument();
  });

  it('oculta el contenido si no tiene el permiso', () => {
    loguearComo('CLIENTE');
    renderEn('/acciones');
    expect(screen.getByText('Acciones')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cancelar envío' })).not.toBeInTheDocument();
  });
});
