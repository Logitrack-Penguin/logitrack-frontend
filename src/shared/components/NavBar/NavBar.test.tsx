import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { crearToken } from '../../../test/jwt';
import { AuthProvider } from '../../auth/AuthProvider';
import type { Rol } from '../../auth/permissions';
import { sessionStore } from '../../auth/sessionStore';
import { NavBar } from './NavBar';

// Ítems fijos, para no depender de los nav.ts de las otras features.
vi.mock('../../../app/navigation', () => ({
  NAV_ITEMS: [
    { label: 'Envíos', to: '/envios', permiso: 'envios.ver' },
    { label: 'Clientes', to: '/clientes', permiso: 'clientes.gestionar' },
    { label: 'Mi perfil', to: '/perfil' },
  ],
}));

function renderComo(rol: Rol) {
  sessionStore.set(crearToken({ sub: `usuario_${rol.toLowerCase()}`, roles: [rol] }));
  const router = createMemoryRouter(
    [
      { path: '/envios', element: <NavBar /> },
      { path: '/login', element: <p>Login</p> },
    ],
    { initialEntries: ['/envios'] },
  );
  render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>,
  );
  return router;
}

const etiquetas = () => screen.getAllByRole('link').map((a) => a.textContent);

beforeEach(() => {
  sessionStore.clear();
  sessionStorage.clear();
});

describe('NavBar', () => {
  it('ADMIN ve todos los ítems', () => {
    renderComo('ADMIN');
    expect(etiquetas()).toEqual(['Envíos', 'Clientes', 'Mi perfil']);
  });

  it('CLIENTE no ve los ítems para los que no tiene permiso', () => {
    renderComo('CLIENTE');
    expect(etiquetas()).toEqual(['Envíos', 'Mi perfil']);
  });

  it('marca el ítem activo', () => {
    renderComo('ADMIN');
    expect(screen.getByRole('link', { name: 'Envíos' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Clientes' })).not.toHaveAttribute('aria-current');
  });

  it('muestra el usuario y sus roles', () => {
    renderComo('CLIENTE');
    expect(screen.getByText('usuario_cliente')).toBeInTheDocument();
    expect(screen.getByText('CLIENTE')).toBeInTheDocument();
  });

  it('"Salir" vuelve al login y vacía sessionStorage', async () => {
    const router = renderComo('ADMIN');
    expect(sessionStorage.length).toBe(1);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Salir' }));

    expect(await screen.findByText('Login')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
    expect(sessionStorage.length).toBe(0);
    expect(sessionStore.get()).toBeNull();
  });
});
