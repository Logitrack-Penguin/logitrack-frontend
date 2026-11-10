import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { sessionStore } from '../../shared/auth/sessionStore';
import { enviosRoutes } from './routes';
import { iniciarSesionComo } from './test/datos';
import { Proveedores } from './test/Proveedores';

function renderizar(ruta: string) {
  const router = createMemoryRouter(
    [...enviosRoutes, { path: '/sin-permiso', element: <p>Sin permiso</p> }],
    { initialEntries: [ruta] },
  );
  render(
    <Proveedores>
      <RouterProvider router={router} />
    </Proveedores>,
  );
}

describe('enviosRoutes', () => {
  afterEach(() => {
    sessionStore.clear();
  });

  it.each(['ADMIN', 'CLIENTE'] as const)('%s puede abrir /envios/nuevo', async (rol) => {
    iniciarSesionComo(rol);
    renderizar('/envios/nuevo');

    expect(await screen.findByRole('heading', { name: 'Nuevo envío' })).toBeInTheDocument();
  });

  it('REPARTIDOR no puede abrir /envios/nuevo', async () => {
    iniciarSesionComo('REPARTIDOR');
    renderizar('/envios/nuevo');

    expect(await screen.findByText('Sin permiso')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Nuevo envío' })).not.toBeInTheDocument();
  });
});
