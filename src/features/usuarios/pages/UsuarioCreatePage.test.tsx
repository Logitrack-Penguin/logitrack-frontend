import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { ApiError } from '../../../shared/api/apiError';
import { ToastProvider } from '../../../shared/notifications/ToastProvider';
import { repartidoresApi } from '../../repartidores/api/repartidoresApi';
import type { RepartidorResponse } from '../../repartidores/types';
import { usuariosApi } from '../api/usuariosApi';
import { UsuarioCreatePage } from './UsuarioCreatePage';

const FICHA: RepartidorResponse = {
  idRepartidor: 'r-1',
  dni: '30111222',
  nombreCompleto: 'Perez, Juan',
  telefono: '3881112222',
  tipoVehiculo: 'MOTO',
  estadoRepartidor: 'ACTIVO',
  fechaCreacion: '2026-11-11T10:00:00',
};

function renderizar() {
  const router = createMemoryRouter(
    [
      { path: '/usuarios/nuevo', element: <UsuarioCreatePage /> },
      { path: '/usuarios', element: <p>Listado de usuarios</p> },
    ],
    { initialEntries: ['/usuarios/nuevo'] },
  );
  render(
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>,
  );
}

// fireEvent en lugar de userEvent.type: son 9 campos y tipear letra por letra hace que el test
// pase los 5 s cuando corre toda la suite. El tipeado real ya lo cubre UsuarioForm.test.tsx.
async function completarRepartidorYEnviar() {
  const valores: [string, string][] = [
    ['Usuario', 'jperez'],
    ['Email', 'jperez@mail.com'],
    ['Contraseña', '12345678'],
    ['Repetir contraseña', '12345678'],
    ['DNI', '30111222'],
    ['Nombre', 'Juan'],
    ['Apellido', 'Perez'],
    ['Teléfono', '3881112222'],
    ['Vehículo', 'MOTO'],
  ];
  for (const [label, valor] of valores) {
    fireEvent.change(screen.getByLabelText(label), { target: { value: valor } });
  }
  await userEvent.setup().click(screen.getByRole('button', { name: 'Crear usuario' }));
}

describe('UsuarioCreatePage (alta unificada de repartidor)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('crea primero la ficha en courier y después el usuario con el mismo DNI', async () => {
    const crear = vi.spyOn(repartidoresApi, 'crear').mockResolvedValue(FICHA);
    const registrar = vi.spyOn(usuariosApi, 'registrar').mockResolvedValue({
      id: 'u-1',
      username: 'jperez',
      email: 'jperez@mail.com',
      roles: ['REPARTIDOR'],
      dni: '30111222',
    });
    renderizar();

    await completarRepartidorYEnviar();

    expect(await screen.findByText('Listado de usuarios')).toBeInTheDocument();
    expect(crear).toHaveBeenCalledWith(expect.objectContaining({ dni: '30111222' }));
    expect(registrar).toHaveBeenCalledWith(
      expect.objectContaining({ roles: ['REPARTIDOR'], dni: '30111222' }),
    );
    expect(crear.mock.invocationCallOrder[0]).toBeLessThan(registrar.mock.invocationCallOrder[0]);
  });

  it('si courier rechaza la ficha, no crea el usuario', async () => {
    vi.spyOn(repartidoresApi, 'crear').mockRejectedValue(
      new ApiError(409, 'Ya existe un repartidor registrado con el DNI: 30111222'),
    );
    const registrar = vi.spyOn(usuariosApi, 'registrar');
    renderizar();

    await completarRepartidorYEnviar();

    expect(
      await screen.findByText('Ya existe un repartidor registrado con el DNI: 30111222'),
    ).toBeInTheDocument();
    expect(registrar).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Crear usuario' })).toBeEnabled();
  });

  it('si el usuario falla, borra la ficha creada para no dejar un repartidor huérfano', async () => {
    vi.spyOn(repartidoresApi, 'crear').mockResolvedValue(FICHA);
    vi.spyOn(usuariosApi, 'registrar').mockRejectedValue(
      new ApiError(409, 'El nombre de usuario ya está en uso'),
    );
    const eliminar = vi.spyOn(repartidoresApi, 'eliminar').mockResolvedValue(undefined);
    renderizar();

    await completarRepartidorYEnviar();

    expect(await screen.findByText('El nombre de usuario ya está en uso')).toBeInTheDocument();
    expect(eliminar).toHaveBeenCalledWith('30111222');
    expect(screen.queryByText('Listado de usuarios')).not.toBeInTheDocument();
  });
});
