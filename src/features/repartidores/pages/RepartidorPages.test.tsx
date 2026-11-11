import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { AuthContext, type AuthContextValue } from '../../../shared/auth/AuthContext';
import { type Rol, rolesTienenPermiso } from '../../../shared/auth/permissions';
import { ToastProvider } from '../../../shared/notifications/ToastProvider';
import { repartidoresApi } from '../api/repartidoresApi';
import { repartidoresRoutes } from '../routes';
import type { RepartidorResponse } from '../types';

const REPARTIDOR: RepartidorResponse = {
  idRepartidor: 'r1',
  dni: '28111222',
  nombreCompleto: 'Quito, Esteban',
  telefono: '3881112222',
  tipoVehiculo: 'MOTO',
  estadoRepartidor: 'ACTIVO',
  fechaCreacion: '2026-11-10T10:00:00',
};

function renderComo(rol: Rol, ruta: string) {
  const auth: AuthContextValue = {
    sesion: {
      token: 't',
      userId: 'u',
      username: 'test',
      roles: [rol],
      exp: Date.now() / 1000 + 3600,
    },
    login: vi.fn(),
    logout: vi.fn(),
    tienePermiso: (p) => rolesTienenPermiso([rol], p),
  };
  const router = createMemoryRouter(
    [
      ...repartidoresRoutes,
      { path: '/sin-permiso', element: <p>Sin permiso</p> },
      { path: '/usuarios/nuevo', element: <p>Alta unificada</p> },
    ],
    { initialEntries: [ruta] },
  );
  return render(
    <AuthContext.Provider value={auth}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </AuthContext.Provider>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('RepartidorListPage', () => {
  it('muestra los repartidores y ADMIN ve "Nuevo repartidor"', async () => {
    vi.spyOn(repartidoresApi, 'listar').mockResolvedValue([REPARTIDOR]);
    renderComo('ADMIN', '/repartidores');
    expect(await screen.findByText('Quito, Esteban')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /nuevo repartidor/i })).toBeInTheDocument();
  });

  it('REPARTIDOR ve el listado pero no puede crear', async () => {
    vi.spyOn(repartidoresApi, 'listar').mockResolvedValue([REPARTIDOR]);
    renderComo('REPARTIDOR', '/repartidores');
    expect(await screen.findByText('Quito, Esteban')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /nuevo repartidor/i })).not.toBeInTheDocument();
  });

  it('el filtro pide solo los del estado elegido', async () => {
    const listar = vi.spyOn(repartidoresApi, 'listar').mockResolvedValue([]);
    renderComo('ADMIN', '/repartidores');
    await screen.findByText(/no hay repartidores/i);
    await userEvent.click(screen.getByRole('radio', { name: 'Inactivos' }));
    expect(listar).toHaveBeenLastCalledWith('INACTIVO');
  });
});

describe('RepartidorDetailPage', () => {
  it('ADMIN ve Editar, Eliminar y Desactivar', async () => {
    vi.spyOn(repartidoresApi, 'obtener').mockResolvedValue(REPARTIDOR);
    renderComo('ADMIN', '/repartidores/28111222');
    expect(await screen.findByRole('button', { name: /desactivar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /eliminar/i })).toBeInTheDocument();
  });

  it('REPARTIDOR puede cambiar el estado pero no editar ni eliminar', async () => {
    vi.spyOn(repartidoresApi, 'obtener').mockResolvedValue(REPARTIDOR);
    renderComo('REPARTIDOR', '/repartidores/28111222');
    expect(await screen.findByRole('button', { name: /desactivar/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /editar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /eliminar/i })).not.toBeInTheDocument();
  });

  it('alternar estado llama a /estado y actualiza el botón', async () => {
    vi.spyOn(repartidoresApi, 'obtener').mockResolvedValue(REPARTIDOR);
    const cambiar = vi
      .spyOn(repartidoresApi, 'cambiarEstado')
      .mockResolvedValue({ ...REPARTIDOR, estadoRepartidor: 'INACTIVO' });
    renderComo('REPARTIDOR', '/repartidores/28111222');
    await userEvent.click(await screen.findByRole('button', { name: /desactivar/i }));
    expect(cambiar).toHaveBeenCalledWith('28111222');
    expect(await screen.findByRole('button', { name: /^activar/i })).toBeInTheDocument();
  });

  it('verificar disponibilidad muestra el resultado', async () => {
    vi.spyOn(repartidoresApi, 'obtener').mockResolvedValue(REPARTIDOR);
    vi.spyOn(repartidoresApi, 'estaDisponible').mockResolvedValue(false);
    renderComo('ADMIN', '/repartidores/28111222');
    await userEvent.click(await screen.findByRole('button', { name: /verificar disponibilidad/i }));
    expect(await screen.findByText('No disponible')).toBeInTheDocument();
  });
});

describe('rutas de gestión', () => {
  it('"Nuevo repartidor" lleva al alta unificada de /usuarios/nuevo (LT4-40)', async () => {
    vi.spyOn(repartidoresApi, 'listar').mockResolvedValue([]);
    renderComo('ADMIN', '/repartidores');
    await userEvent.click(await screen.findByRole('button', { name: /nuevo repartidor/i }));
    expect(await screen.findByText('Alta unificada')).toBeInTheDocument();
  });

  it('ADMIN que entra a /repartidores/nuevo va al alta unificada', async () => {
    renderComo('ADMIN', '/repartidores/nuevo');
    expect(await screen.findByText('Alta unificada')).toBeInTheDocument();
  });

  it('REPARTIDOR que entra a /repartidores/nuevo va a sin-permiso', async () => {
    renderComo('REPARTIDOR', '/repartidores/nuevo');
    expect(await screen.findByText('Sin permiso')).toBeInTheDocument();
  });
});
