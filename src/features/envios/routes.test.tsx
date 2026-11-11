import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { sessionStore } from '../../shared/auth/sessionStore';
import { crearToken } from '../../test/jwt';
import { enviosRoutes } from './routes';
import userEvent from '@testing-library/user-event';
import { clientesApi } from '../clientes/api/clientesApi';
import { usuariosApi } from '../usuarios/api/usuariosApi';
import { enviosApi } from './api/enviosApi';
import { envioDePrueba, iniciarSesionComo, vincularDniDePrueba } from './test/datos';
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
    vincularDniDePrueba();
    renderizar('/envios/nuevo');

    expect(await screen.findByRole('heading', { name: 'Nuevo envío' })).toBeInTheDocument();
  });

  it('REPARTIDOR no puede abrir /envios/nuevo', async () => {
    iniciarSesionComo('REPARTIDOR');
    renderizar('/envios/nuevo');

    expect(await screen.findByText('Sin permiso')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Nuevo envío' })).not.toBeInTheDocument();
  });

  it('un CLIENTE con el DNI en el token ve sus envíos sin vincular nada', async () => {
    localStorage.clear();
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
    expect(screen.queryByRole('button', { name: 'Cambiar DNI' })).not.toBeInTheDocument();
    vi.restoreAllMocks();
  });

  describe('CLIENTE sin DNI vinculado', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('antes de ver sus envíos le pide el DNI y lo verifica con su email', async () => {
      iniciarSesionComo('CLIENTE');
      vi.spyOn(usuariosApi, 'me').mockResolvedValue({
        id: 'u',
        username: 'ana',
        email: 'ana@email.com',
        roles: ['CLIENTE'],
      });
      vi.spyOn(clientesApi, 'obtener').mockResolvedValue({
        idCliente: 'c',
        dni: '30111222',
        nombreCompleto: 'Pérez, Ana',
        email: 'ana@email.com',
        telefono: '3880000000',
        fechaCreacion: '2026-11-01T10:00:00',
      });
      const listar = vi.spyOn(enviosApi, 'listar').mockResolvedValue([envioDePrueba()]);
      const user = userEvent.setup();
      renderizar('/envios');

      expect(await screen.findByRole('heading', { name: 'Tus envíos' })).toBeInTheDocument();
      expect(listar).not.toHaveBeenCalled();

      await user.type(screen.getByLabelText('Tu DNI'), '30111222');
      await user.click(screen.getByRole('button', { name: 'Continuar' }));

      expect(await screen.findByText('LT-0001')).toBeInTheDocument();
    });

    it('si el DNI no es suyo, no lo deja pasar', async () => {
      iniciarSesionComo('CLIENTE');
      vi.spyOn(usuariosApi, 'me').mockResolvedValue({
        id: 'u',
        username: 'ana',
        email: 'ana@email.com',
        roles: ['CLIENTE'],
      });
      vi.spyOn(clientesApi, 'obtener').mockResolvedValue({
        idCliente: 'c',
        dni: '38987654',
        nombreCompleto: 'Gómez, María',
        email: 'maria@email.com',
        telefono: '3880000000',
        fechaCreacion: '2026-11-01T10:00:00',
      });
      const listar = vi.spyOn(enviosApi, 'listar');
      const user = userEvent.setup();
      renderizar('/envios');

      await user.type(await screen.findByLabelText('Tu DNI'), '38987654');
      await user.click(screen.getByRole('button', { name: 'Continuar' }));

      expect(await screen.findByText('Ese DNI no corresponde a tu usuario.')).toBeInTheDocument();
      expect(listar).not.toHaveBeenCalled();
    });

    it.each(['ADMIN', 'REPARTIDOR'] as const)('%s no tiene que vincular nada', async (rol) => {
      iniciarSesionComo(rol);
      vi.spyOn(enviosApi, 'listar').mockResolvedValue([]);
      renderizar('/envios');

      expect(await screen.findByRole('heading', { name: 'Envíos' })).toBeInTheDocument();
    });
  });
});
