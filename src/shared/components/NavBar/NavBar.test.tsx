import { render, screen, within } from '@testing-library/react';
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
    { label: 'Seguimiento', to: '/envios/seguimiento', permiso: 'envios.ver' },
    { label: 'Clientes', to: '/clientes', permiso: 'clientes.gestionar' },
    { label: 'Mi perfil', to: '/perfil' },
  ],
}));

function renderComo(rol: Rol, ruta = '/envios') {
  sessionStore.set(crearToken({ sub: `usuario_${rol.toLowerCase()}`, roles: [rol] }));
  const router = createMemoryRouter(
    [
      { path: '/login', element: <p>Login</p> },
      { path: '*', element: <NavBar /> },
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

const etiquetas = () =>
  within(screen.getByRole('navigation', { name: 'Menú principal' }))
    .getAllByRole('link')
    .map((a) => a.textContent);

beforeEach(() => {
  sessionStore.clear();
  sessionStorage.clear();
});

describe('NavBar', () => {
  it('ADMIN ve todos los ítems', () => {
    renderComo('ADMIN');
    expect(etiquetas()).toEqual(['Envíos', 'Seguimiento', 'Clientes', 'Mi perfil']);
  });

  it('CLIENTE no ve los ítems para los que no tiene permiso', () => {
    renderComo('CLIENTE');
    expect(etiquetas()).toEqual(['Envíos', 'Seguimiento', 'Mi perfil']);
  });

  it('marca el ítem activo', () => {
    renderComo('ADMIN');
    expect(screen.getByRole('link', { name: 'Envíos' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Clientes' })).not.toHaveAttribute('aria-current');
  });

  it('en una subruta con ítem propio marca solo ese ítem', () => {
    renderComo('ADMIN', '/envios/seguimiento');
    expect(screen.getByRole('link', { name: 'Seguimiento' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Envíos' })).not.toHaveAttribute('aria-current');
  });

  it('en una subruta sin ítem propio marca el ítem padre', () => {
    renderComo('ADMIN', '/envios/123');
    expect(screen.getByRole('link', { name: 'Envíos' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Seguimiento' })).not.toHaveAttribute('aria-current');
  });

  it('muestra el usuario y sus roles', () => {
    renderComo('CLIENTE');
    expect(screen.getByText('usuario_cliente')).toBeInTheDocument();
    expect(screen.getByText('Cliente')).toBeInTheDocument();
  });

  it('el logo lleva a /envios', () => {
    renderComo('ADMIN', '/clientes');
    expect(screen.getByRole('link', { name: 'LogiTrack, ir a envíos' })).toHaveAttribute(
      'href',
      '/envios',
    );
  });

  it('el botón de menú abre y cierra el desplegable', async () => {
    const user = userEvent.setup();
    renderComo('ADMIN');
    const boton = screen.getByRole('button', { name: 'Abrir menú' });
    expect(boton).toHaveAttribute('aria-expanded', 'false');

    await user.click(boton);
    expect(screen.getByRole('button', { name: 'Cerrar menú' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );

    await user.click(screen.getByRole('link', { name: 'Clientes' }));
    expect(screen.getByRole('button', { name: 'Abrir menú' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('"Cerrar sesión" vuelve al login y vacía sessionStorage', async () => {
    const router = renderComo('ADMIN');
    expect(sessionStorage.length).toBe(1);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Cerrar sesión' }));

    expect(await screen.findByText('Login')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
    expect(sessionStorage.length).toBe(0);
    expect(sessionStore.get()).toBeNull();
  });
});
