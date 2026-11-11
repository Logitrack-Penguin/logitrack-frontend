import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { sessionStore } from '../../shared/auth/sessionStore';
import { crearToken } from '../../test/jwt';
import { enviosRoutes } from './routes';
import userEvent from '@testing-library/user-event';
import { enviosApi } from './api/enviosApi';
import { envioDePrueba, iniciarSesionComo, ponerDniEnElToken } from './test/datos';
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
    ponerDniEnElToken();
    renderizar('/envios/nuevo');

    expect(await screen.findByRole('heading', { name: 'Nuevo envío' })).toBeInTheDocument();
  });

  it('REPARTIDOR no puede abrir /envios/nuevo', async () => {
    iniciarSesionComo('REPARTIDOR');
    renderizar('/envios/nuevo');

    expect(await screen.findByText('Sin permiso')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Nuevo envío' })).not.toBeInTheDocument();
  });

  it('un CLIENTE con el DNI en el token ve solo sus envíos', async () => {
    sessionStore.set(crearToken({ roles: ['CLIENTE'], dni: '30111222' }));
    vi.spyOn(enviosApi, 'listar').mockResolvedValue([
      envioDePrueba(),
      envioDePrueba({
        idEnvio: 'e-otro',
        codigoSeguimiento: 'LT-9999',
        remitente: 'Nombre: Gómez, María - DNI: 38987654',
      }),
    ]);
    renderizar('/envios');

    expect(await screen.findByText('LT-0001')).toBeInTheDocument();
    expect(screen.queryByText('LT-9999')).not.toBeInTheDocument();
    expect(screen.getByText('Tus envíos (DNI 30111222)')).toBeInTheDocument();
    vi.restoreAllMocks();
  });

  describe('CLIENTE sin DNI en el token', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('no pide envíos y le explica que vuelva a iniciar sesión', async () => {
      iniciarSesionComo('CLIENTE');
      const listar = vi.spyOn(enviosApi, 'listar');
      const user = userEvent.setup();
      renderizar('/envios');

      expect(
        await screen.findByText(/Tu cuenta todavía no está vinculada a tus datos de cliente/),
      ).toBeInTheDocument();
      expect(listar).not.toHaveBeenCalled();

      await user.click(screen.getByRole('button', { name: 'Volver a iniciar sesión' }));
      expect(sessionStore.get()).toBeNull();
    });

    it.each(['ADMIN', 'REPARTIDOR'] as const)(
      '%s pasa directo aunque no tenga DNI',
      async (rol) => {
        iniciarSesionComo(rol);
        vi.spyOn(enviosApi, 'listar').mockResolvedValue([]);
        renderizar('/envios');

        expect(await screen.findByRole('heading', { name: 'Envíos' })).toBeInTheDocument();
      },
    );
  });
});
