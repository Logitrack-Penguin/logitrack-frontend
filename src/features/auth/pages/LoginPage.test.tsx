import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { ApiError } from '../../../shared/api/apiError';
import { AuthProvider } from '../../../shared/auth/AuthProvider';
import { sessionStore } from '../../../shared/auth/sessionStore';
import { crearToken } from '../../../test/jwt';
import { authApi } from '../api/authApi';
import { LoginPage } from './LoginPage';

vi.mock('../api/authApi', () => ({ authApi: { login: vi.fn() } }));

function renderLogin(state?: unknown) {
  const router = createMemoryRouter(
    [
      { path: '/login', element: <LoginPage /> },
      { path: '/envios', element: <p>Pantalla de envíos</p> },
      { path: '/clientes', element: <p>Pantalla de clientes</p> },
    ],
    { initialEntries: [{ pathname: '/login', state }] },
  );
  render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>,
  );
  return router;
}

function loginExitoso() {
  const token = crearToken({ sub: 'admin_logitrack', roles: ['ADMIN'] });
  vi.mocked(authApi.login).mockResolvedValue({
    token,
    type: 'Bearer',
    userId: 'u-1',
    username: 'admin_logitrack',
    roles: ['ADMIN'],
  });
}

async function ingresar(usuario: string, clave: string) {
  const user = userEvent.setup();
  if (usuario) await user.type(screen.getByLabelText('Usuario'), usuario);
  await user.type(screen.getByLabelText('Contraseña'), clave);
  await user.click(screen.getByRole('button', { name: 'Ingresar' }));
}

beforeEach(() => {
  sessionStore.clear();
  sessionStorage.clear();
  vi.mocked(authApi.login).mockReset();
});

describe('LoginPage', () => {
  it('envía lo escrito y lleva a /envios', async () => {
    loginExitoso();
    const router = renderLogin();

    await ingresar('admin_logitrack', '12345');

    expect(authApi.login).toHaveBeenCalledWith({ username: 'admin_logitrack', password: '12345' });
    expect(await screen.findByText('Pantalla de envíos')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/envios');
  });

  it('con credenciales malas muestra el error y se queda en el login', async () => {
    vi.mocked(authApi.login).mockRejectedValue(new ApiError(401, 'Credenciales inválidas'));
    const router = renderLogin();

    await ingresar('admin_logitrack', 'mala');

    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciales inválidas');
    expect(router.state.location.pathname).toBe('/login');
    expect(screen.getByRole('button', { name: 'Ingresar' })).toBeEnabled();
    expect(sessionStore.get()).toBeNull();
  });

  it('después de loguearse vuelve a la ruta que se había pedido', async () => {
    loginExitoso();
    const router = renderLogin({ from: { pathname: '/clientes', search: '', hash: '' } });

    await ingresar('admin_logitrack', '12345');

    expect(await screen.findByText('Pantalla de clientes')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/clientes');
  });

  it('precompleta el usuario que llega del registro', async () => {
    loginExitoso();
    renderLogin({ username: 'prueba_lt433' });

    expect(screen.getByLabelText('Usuario')).toHaveValue('prueba_lt433');
    await ingresar('', 'secreta123');
    expect(authApi.login).toHaveBeenCalledWith({
      username: 'prueba_lt433',
      password: 'secreta123',
    });
  });

  it('avisa si la sesión expiró', () => {
    renderLogin({ motivo: 'expirada' });
    expect(screen.getByText('Tu sesión expiró. Volvé a ingresar.')).toBeInTheDocument();
  });

  it('con sesión iniciada redirige a /envios', () => {
    sessionStore.set(crearToken());
    const router = renderLogin();
    expect(screen.getByText('Pantalla de envíos')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/envios');
  });
});
