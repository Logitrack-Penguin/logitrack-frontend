import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider, useParams } from 'react-router';
import { ApiError } from '../../../shared/api/apiError';
import { sessionStore } from '../../../shared/auth/sessionStore';
import { enviosApi } from '../api/enviosApi';
import { envioDePrueba, iniciarSesionComo, vincularDniDePrueba } from '../test/datos';
import { Proveedores } from '../test/Proveedores';
import { EnvioListPage } from './EnvioListPage';

function DetalleFalso() {
  return <p>Detalle de {useParams().id}</p>;
}

function renderizar() {
  const router = createMemoryRouter(
    [
      { path: '/envios', element: <EnvioListPage /> },
      { path: '/envios/:id', element: <DetalleFalso /> },
    ],
    { initialEntries: ['/envios'] },
  );
  render(
    <Proveedores>
      <RouterProvider router={router} />
    </Proveedores>,
  );
}

describe('EnvioListPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    sessionStore.clear();
  });

  it('muestra los envíos en la tabla sin el código de recepción', async () => {
    iniciarSesionComo('ADMIN');
    vi.spyOn(enviosApi, 'listar').mockResolvedValue([envioDePrueba()]);
    renderizar();

    expect(await screen.findByText('LT-0001')).toBeInTheDocument();
    expect(screen.getByText('Pendiente de asignación', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByText('15/11/2026')).toBeInTheDocument();
    expect(screen.getByText('1 envío')).toBeInTheDocument();
    expect(screen.queryByText('4821')).not.toBeInTheDocument();
  });

  it('filtra por estado pidiéndolo al backend', async () => {
    iniciarSesionComo('ADMIN');
    const listar = vi
      .spyOn(enviosApi, 'listar')
      .mockResolvedValueOnce([envioDePrueba()])
      .mockResolvedValueOnce([
        envioDePrueba({ idEnvio: 'e2', codigoSeguimiento: 'LT-0002', estadoEnvio: 'EN_RUTA' }),
      ]);
    renderizar();
    await screen.findByText('LT-0001');

    await userEvent.selectOptions(screen.getByLabelText('Estado'), 'EN_RUTA');

    expect(await screen.findByText('LT-0002')).toBeInTheDocument();
    expect(screen.queryByText('LT-0001')).not.toBeInTheDocument();
    expect(listar).toHaveBeenNthCalledWith(1, undefined);
    expect(listar).toHaveBeenNthCalledWith(2, 'EN_RUTA');
  });

  it('muestra el estado vacío según el filtro', async () => {
    iniciarSesionComo('ADMIN');
    vi.spyOn(enviosApi, 'listar').mockResolvedValue([]);
    renderizar();

    expect(await screen.findByText('No hay envíos.')).toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText('Estado'), 'ENTREGADO');
    expect(await screen.findByText('No hay envíos en estado entregado.')).toBeInTheDocument();
  });

  it('al hacer clic en una fila abre el detalle', async () => {
    iniciarSesionComo('CLIENTE');
    vincularDniDePrueba();
    vi.spyOn(enviosApi, 'listar').mockResolvedValue([envioDePrueba()]);
    renderizar();

    await userEvent.click(await screen.findByText('LT-0001'));

    expect(
      await screen.findByText('Detalle de 3f2b8c1e-0000-4000-8000-000000000001'),
    ).toBeInTheDocument();
  });

  it('el botón "Nuevo envío" solo aparece con el permiso envios.crear', async () => {
    iniciarSesionComo('REPARTIDOR');
    vi.spyOn(enviosApi, 'listar').mockResolvedValue([envioDePrueba()]);
    renderizar();

    await screen.findByText('LT-0001');
    expect(screen.queryByRole('button', { name: 'Nuevo envío' })).not.toBeInTheDocument();
  });

  it('muestra el error del backend en un toast', async () => {
    iniciarSesionComo('ADMIN');
    vi.spyOn(enviosApi, 'listar').mockRejectedValue(new ApiError(503, 'Servicio caído.'));
    renderizar();

    expect(await screen.findByText('Servicio caído.')).toBeInTheDocument();
    expect(screen.getByText('No hay envíos.')).toBeInTheDocument();
  });

  describe('CLIENTE', () => {
    it('solo ve sus envíos, no los de otros clientes', async () => {
      iniciarSesionComo('CLIENTE');
      vincularDniDePrueba();
      vi.spyOn(enviosApi, 'listar').mockResolvedValue([
        envioDePrueba(),
        envioDePrueba({
          idEnvio: 'e-otro',
          codigoSeguimiento: 'LT-9999',
          remitente: 'Nombre: Gómez, María - DNI: 38987654',
        }),
      ]);
      renderizar();

      expect(await screen.findByText('LT-0001')).toBeInTheDocument();
      expect(screen.queryByText('LT-9999')).not.toBeInTheDocument();
      expect(screen.queryByText(/38987654/)).not.toBeInTheDocument();
      expect(screen.getByText('1 envío')).toBeInTheDocument();
    });

    it.each(['ADMIN', 'REPARTIDOR'] as const)('%s sigue viendo todos', async (rol) => {
      iniciarSesionComo(rol);
      vi.spyOn(enviosApi, 'listar').mockResolvedValue([
        envioDePrueba(),
        envioDePrueba({
          idEnvio: 'e-otro',
          codigoSeguimiento: 'LT-9999',
          remitente: 'Nombre: Gómez, María - DNI: 38987654',
        }),
      ]);
      renderizar();

      expect(await screen.findByText('LT-9999')).toBeInTheDocument();
      expect(screen.getByText('LT-0001')).toBeInTheDocument();
    });
  });
});
