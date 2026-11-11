import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider, useParams } from 'react-router';
import { ApiError } from '../../../shared/api/apiError';
import { sessionStore } from '../../../shared/auth/sessionStore';
import { enviosApi } from '../api/enviosApi';
import { envioDePrueba, iniciarSesionComo, iniciarSesionComoRepartidor } from '../test/datos';
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
    vi.spyOn(enviosApi, 'listar').mockResolvedValue([envioDePrueba()]);
    renderizar();

    await userEvent.click(await screen.findByText('LT-0001'));

    expect(
      await screen.findByText('Detalle de 3f2b8c1e-0000-4000-8000-000000000001'),
    ).toBeInTheDocument();
  });

  it('el botón "Nuevo envío" solo aparece con el permiso envios.crear', async () => {
    iniciarSesionComoRepartidor('28111222');
    vi.spyOn(enviosApi, 'listar').mockResolvedValue([
      envioDePrueba({ estadoEnvio: 'REPARTIDOR_ASIGNADO', repartidorAsignado: 'DNI: 28111222' }),
    ]);
    renderizar();

    await screen.findByText('LT-0001');
    expect(screen.queryByRole('button', { name: 'Nuevo envío' })).not.toBeInTheDocument();
  });

  it('REPARTIDOR solo ve los envíos asignados a él', async () => {
    iniciarSesionComoRepartidor('28111222');
    vi.spyOn(enviosApi, 'listar').mockResolvedValue([
      envioDePrueba(),
      envioDePrueba({
        idEnvio: 'e2',
        codigoSeguimiento: 'LT-0002',
        estadoEnvio: 'EN_RUTA',
        repartidorAsignado: 'DNI: 28111222',
      }),
      envioDePrueba({
        idEnvio: 'e3',
        codigoSeguimiento: 'LT-0003',
        estadoEnvio: 'REPARTIDOR_ASIGNADO',
        repartidorAsignado: 'DNI: 30222333',
      }),
    ]);
    renderizar();

    expect(await screen.findByText('LT-0002')).toBeInTheDocument();
    expect(screen.queryByText('LT-0001')).not.toBeInTheDocument();
    expect(screen.queryByText('LT-0003')).not.toBeInTheDocument();
    expect(screen.getByText('1 envío')).toBeInTheDocument();
  });

  it('si al REPARTIDOR no le queda ningún envío visible, muestra el estado vacío', async () => {
    iniciarSesionComoRepartidor('28111222');
    vi.spyOn(enviosApi, 'listar').mockResolvedValue([
      envioDePrueba(),
      envioDePrueba({ idEnvio: 'e2', estadoEnvio: 'EN_RUTA', repartidorAsignado: 'DNI: 30222333' }),
    ]);
    renderizar();

    expect(await screen.findByText('No hay envíos.')).toBeInTheDocument();
  });

  it('muestra el error del backend en un toast', async () => {
    iniciarSesionComo('ADMIN');
    vi.spyOn(enviosApi, 'listar').mockRejectedValue(new ApiError(503, 'Servicio caído.'));
    renderizar();

    expect(await screen.findByText('Servicio caído.')).toBeInTheDocument();
    expect(screen.getByText('No hay envíos.')).toBeInTheDocument();
  });
});
