import { render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { ApiError } from '../../../shared/api/apiError';
import { sessionStore } from '../../../shared/auth/sessionStore';
import { enviosApi } from '../api/enviosApi';
import { envioDePrueba, iniciarSesionComo } from '../test/datos';
import { Proveedores } from '../test/Proveedores';
import { EnvioDetailPage } from './EnvioDetailPage';

const ID = '3f2b8c1e-0000-4000-8000-000000000001';

function renderizar() {
  const router = createMemoryRouter([{ path: '/envios/:id', element: <EnvioDetailPage /> }], {
    initialEntries: [`/envios/${ID}`],
  });
  render(
    <Proveedores>
      <RouterProvider router={router} />
    </Proveedores>,
  );
}

describe('EnvioDetailPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    sessionStore.clear();
  });

  it('muestra los datos del envío y el historial ordenado', async () => {
    iniciarSesionComo('ADMIN');
    const obtener = vi.spyOn(enviosApi, 'obtener').mockResolvedValue(envioDePrueba());
    vi.spyOn(enviosApi, 'historial').mockResolvedValue([
      {
        estadoEnvioAnterior: 'REPARTIDOR_ASIGNADO',
        estadoEnvioNuevo: 'EN_RUTA',
        fechaCambioEstado: '2026-11-11 10:00:00',
      },
      {
        estadoEnvioAnterior: 'PENDIENTE_ASIGNACION',
        estadoEnvioNuevo: 'REPARTIDOR_ASIGNADO',
        fechaCambioEstado: '2026-11-10 12:00:00',
      },
    ]);
    renderizar();

    expect(await screen.findByRole('heading', { name: 'Envío LT-0001' })).toBeInTheDocument();
    expect(obtener).toHaveBeenCalledWith(ID);
    expect(screen.getByText('Belgrano 450, San Salvador de Jujuy (CP 4600)')).toBeInTheDocument();
    expect(screen.getByText('Timbre B')).toBeInTheDocument();
    expect(screen.getByText('20 × 10 × 30 cm')).toBeInTheDocument();

    const pasos = within(await screen.findByRole('list', { name: 'Historial de estados' }))
      .getAllByRole('listitem')
      .map((li) => li.textContent);
    expect(pasos[0]).toContain('10/11/2026 12:00');
    expect(pasos[1]).toContain('11/11/2026 10:00');
  });

  it.each(['ADMIN', 'CLIENTE'] as const)('%s ve el código de recepción', async (rol) => {
    iniciarSesionComo(rol);
    vi.spyOn(enviosApi, 'obtener').mockResolvedValue(envioDePrueba());
    vi.spyOn(enviosApi, 'historial').mockResolvedValue([]);
    renderizar();

    expect(await screen.findByText('4821')).toBeInTheDocument();
  });

  it('REPARTIDOR no ve el código de recepción', async () => {
    iniciarSesionComo('REPARTIDOR');
    vi.spyOn(enviosApi, 'obtener').mockResolvedValue(envioDePrueba());
    vi.spyOn(enviosApi, 'historial').mockResolvedValue([]);
    renderizar();

    await screen.findByRole('heading', { name: 'Envío LT-0001' });
    expect(screen.queryByText('4821')).not.toBeInTheDocument();
    expect(screen.queryByText('Código de recepción')).not.toBeInTheDocument();
  });

  it('muestra "Envío no encontrado" si el backend responde 404', async () => {
    iniciarSesionComo('ADMIN');
    vi.spyOn(enviosApi, 'obtener').mockRejectedValue(new ApiError(404, 'Envío no encontrado'));
    vi.spyOn(enviosApi, 'historial').mockRejectedValue(new ApiError(404, 'Envío no encontrado'));
    renderizar();

    expect(await screen.findByText('Envío no encontrado.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Volver al listado' })).toBeInTheDocument();
  });

  it('si falla el historial, el resto del detalle se muestra igual', async () => {
    iniciarSesionComo('ADMIN');
    vi.spyOn(enviosApi, 'obtener').mockResolvedValue(envioDePrueba());
    vi.spyOn(enviosApi, 'historial').mockRejectedValue(new ApiError(500, 'Error'));
    renderizar();

    expect(await screen.findByText('No se pudo cargar el historial.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Envío LT-0001' })).toBeInTheDocument();
  });
});
