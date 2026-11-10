import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router';
import { ApiError } from '../../../shared/api/apiError';
import { ToastProvider } from '../../../shared/notifications/ToastProvider';
import { usuariosApi } from '../api/usuariosApi';
import { RegistroPage } from './RegistroPage';

function LoginFalso() {
  const { state } = useLocation() as { state: { username?: string } | null };
  return <p>Login de {state?.username}</p>;
}

function renderizar() {
  const router = createMemoryRouter(
    [
      { path: '/registro', element: <RegistroPage /> },
      { path: '/login', element: <LoginFalso /> },
    ],
    { initialEntries: ['/registro'] },
  );
  render(
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>,
  );
}

async function completarYEnviar() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Usuario'), 'juan');
  await user.type(screen.getByLabelText('Email'), 'juan@mail.com');
  await user.type(screen.getByLabelText('Contraseña'), '12345678');
  await user.type(screen.getByLabelText('Repetir contraseña'), '12345678');
  await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
}

describe('RegistroPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('registra sin roles, avisa y lleva al login con el usuario', async () => {
    const registrar = vi.spyOn(usuariosApi, 'registrar').mockResolvedValue({
      id: '1',
      username: 'juan',
      email: 'juan@mail.com',
      roles: ['CLIENTE'],
    });
    renderizar();

    await completarYEnviar();

    expect(registrar).toHaveBeenCalledWith({
      username: 'juan',
      email: 'juan@mail.com',
      password: '12345678',
    });
    expect(await screen.findByText('Login de juan')).toBeInTheDocument();
    expect(screen.getByText('Cuenta creada, ya podés ingresar.')).toBeInTheDocument();
  });

  it('un 409 muestra el mensaje del backend y se queda en el formulario', async () => {
    vi.spyOn(usuariosApi, 'registrar').mockRejectedValue(
      new ApiError(409, 'El nombre de usuario o el correo electrónico ya está en uso'),
    );
    renderizar();

    await completarYEnviar();

    expect(
      await screen.findByText('El nombre de usuario o el correo electrónico ya está en uso'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeEnabled();
  });
});
