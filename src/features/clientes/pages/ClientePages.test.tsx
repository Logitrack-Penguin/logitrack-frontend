import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { ApiError } from '../../../shared/api/apiError';
import { AuthContext, type AuthContextValue } from '../../../shared/auth/AuthContext';
import { type Rol, rolesTienenPermiso } from '../../../shared/auth/permissions';
import { ToastProvider } from '../../../shared/notifications/ToastProvider';
import { clientesApi } from '../api/clientesApi';
import { clientesRoutes } from '../routes';
import type { ClienteResponse } from '../types';

const ANA: ClienteResponse = {
  idCliente: 'c1',
  dni: '30111222',
  nombreCompleto: 'Pérez, Ana',
  email: 'ana@mail.com',
  telefono: '3884445555',
  fechaCreacion: '2026-11-10T10:00:00',
};
const JUAN: ClienteResponse = {
  ...ANA,
  idCliente: 'c2',
  dni: '25999888',
  nombreCompleto: 'Gómez, Juan',
  email: 'juan@mail.com',
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
    [...clientesRoutes, { path: '/sin-permiso', element: <p>Sin permiso</p> }],
    { initialEntries: [ruta] },
  );
  render(
    <AuthContext.Provider value={auth}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </AuthContext.Provider>,
  );
  return router;
}

// jsdom no implementa showModal/close del <dialog>: los simulamos (igual que ConfirmDialog.test).
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.removeAttribute('open');
  };
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ClienteListPage', () => {
  it('lista los clientes y filtra en memoria por nombre o DNI', async () => {
    const listar = vi.spyOn(clientesApi, 'listar').mockResolvedValue([ANA, JUAN]);
    renderComo('ADMIN', '/clientes');
    expect(await screen.findByText('Pérez, Ana')).toBeInTheDocument();
    expect(screen.getByText('Gómez, Juan')).toBeInTheDocument();

    const buscador = screen.getByRole('searchbox', { name: /buscar clientes/i });
    await userEvent.type(buscador, 'gomez');
    expect(screen.queryByText('Pérez, Ana')).not.toBeInTheDocument();
    expect(screen.getByText('Gómez, Juan')).toBeInTheDocument();

    await userEvent.clear(buscador);
    await userEvent.type(buscador, '3011');
    expect(screen.getByText('Pérez, Ana')).toBeInTheDocument();
    expect(screen.queryByText('Gómez, Juan')).not.toBeInTheDocument();
    expect(listar).toHaveBeenCalledTimes(1);
  });

  it('CLIENTE no puede entrar al listado', async () => {
    renderComo('CLIENTE', '/clientes');
    expect(await screen.findByText('Sin permiso')).toBeInTheDocument();
  });
});

describe('ClienteDetailPage', () => {
  it('ADMIN ve Editar y Eliminar', async () => {
    vi.spyOn(clientesApi, 'obtener').mockResolvedValue(ANA);
    renderComo('ADMIN', '/clientes/30111222');
    expect(await screen.findByRole('button', { name: /editar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /eliminar/i })).toBeInTheDocument();
  });

  it('al eliminar avisa que también se borran los envíos del cliente', async () => {
    vi.spyOn(clientesApi, 'obtener').mockResolvedValue(ANA);
    renderComo('ADMIN', '/clientes/30111222');
    await userEvent.click(await screen.findByRole('button', { name: /eliminar/i }));
    expect(
      screen.getByText(/también se van a eliminar todos los envíos de este cliente/i),
    ).toBeInTheDocument();
  });

  it('CLIENTE ve sus datos pero no puede editar ni eliminar', async () => {
    vi.spyOn(clientesApi, 'obtener').mockResolvedValue(ANA);
    renderComo('CLIENTE', '/clientes/30111222');
    expect(await screen.findByText('ana@mail.com')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /editar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /eliminar/i })).not.toBeInTheDocument();
  });

  it('CLIENTE no puede entrar a la edición', async () => {
    renderComo('CLIENTE', '/clientes/30111222/editar');
    expect(await screen.findByText('Sin permiso')).toBeInTheDocument();
  });
});

describe('MisDatosPage', () => {
  it('con un DNI válido navega al detalle', async () => {
    vi.spyOn(clientesApi, 'obtener').mockResolvedValue(ANA);
    const router = renderComo('CLIENTE', '/clientes/mis-datos');
    await userEvent.type(await screen.findByLabelText('Tu DNI'), '30111222');
    await userEvent.click(screen.getByRole('button', { name: /ver mis datos/i }));
    expect(router.state.location.pathname).toBe('/clientes/30111222');
  });

  it('con un DNI inválido muestra el error', async () => {
    renderComo('CLIENTE', '/clientes/mis-datos');
    await userEvent.type(await screen.findByLabelText('Tu DNI'), '123');
    await userEvent.click(screen.getByRole('button', { name: /ver mis datos/i }));
    expect(screen.getByText('El DNI debe tener 8 dígitos.')).toBeInTheDocument();
  });
});

describe('ClienteCreatePage', () => {
  it('valida antes de enviar y no llama al backend', async () => {
    const crear = vi.spyOn(clientesApi, 'crear');
    renderComo('ADMIN', '/clientes/nuevo');
    await userEvent.click(await screen.findByRole('button', { name: /crear cliente/i }));
    expect(screen.getByText('El email es obligatorio.')).toBeInTheDocument();
    expect(crear).not.toHaveBeenCalled();
  });

  it('un 409 del backend muestra el mensaje', async () => {
    vi.spyOn(clientesApi, 'crear').mockRejectedValue(
      new ApiError(409, 'Ya existe un cliente con ese DNI.'),
    );
    renderComo('ADMIN', '/clientes/nuevo');
    await userEvent.type(await screen.findByLabelText('DNI'), '30111222');
    await userEvent.type(screen.getByLabelText('Nombre'), 'Ana');
    await userEvent.type(screen.getByLabelText('Apellido'), 'Pérez');
    await userEvent.type(screen.getByLabelText('Email'), 'ana@mail.com');
    await userEvent.type(screen.getByLabelText('Teléfono'), '3884445555');
    await userEvent.click(screen.getByRole('button', { name: /crear cliente/i }));
    expect(await screen.findByText('Ya existe un cliente con ese DNI.')).toBeInTheDocument();
  });
});
