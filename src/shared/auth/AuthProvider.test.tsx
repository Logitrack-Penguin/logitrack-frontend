import { act, renderHook } from '@testing-library/react';
import { authApi } from '../../features/auth/api/authApi';
import { crearToken } from '../../test/jwt';
import { ApiError } from '../api/apiError';
import { AuthProvider } from './AuthProvider';
import { sessionStore } from './sessionStore';
import { useAuth } from './useAuth';

vi.mock('../../features/auth/api/authApi', () => ({ authApi: { login: vi.fn() } }));

const renderAuth = () => renderHook(() => useAuth(), { wrapper: AuthProvider });

beforeEach(() => {
  sessionStore.clear();
  sessionStorage.clear();
  vi.mocked(authApi.login).mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('AuthProvider / useAuth', () => {
  it('login guarda la sesión con los datos del token', async () => {
    const token = crearToken({ sub: 'luci', roles: ['CLIENTE'] });
    vi.mocked(authApi.login).mockResolvedValue({
      token,
      type: 'Bearer',
      userId: 'u-2',
      username: 'luci',
      roles: ['CLIENTE'],
    });
    const { result } = renderAuth();

    await act(() => result.current.login('luci', 'secreta123'));

    expect(authApi.login).toHaveBeenCalledWith({ username: 'luci', password: 'secreta123' });
    expect(result.current.sesion).toMatchObject({ username: 'luci', roles: ['CLIENTE'] });
  });

  it('un login fallido propaga el ApiError y no deja sesión', async () => {
    vi.mocked(authApi.login).mockRejectedValue(new ApiError(401, 'Credenciales inválidas'));
    const { result } = renderAuth();

    await expect(act(() => result.current.login('luci', 'mal'))).rejects.toMatchObject({
      status: 401,
    });
    expect(result.current.sesion).toBeNull();
  });

  it('logout borra la sesión', () => {
    sessionStore.set(crearToken());
    const { result } = renderAuth();
    expect(result.current.sesion).not.toBeNull();

    act(() => result.current.logout());

    expect(result.current.sesion).toBeNull();
  });

  it('tienePermiso según el rol de la sesión', () => {
    sessionStore.set(crearToken({ roles: ['REPARTIDOR'] }));
    const { result } = renderAuth();
    expect(result.current.tienePermiso('envios.cambiarEstado')).toBe(true);
    expect(result.current.tienePermiso('envios.crear')).toBe(false);
  });

  it('sin sesión no tiene ningún permiso', () => {
    const { result } = renderAuth();
    expect(result.current.tienePermiso('envios.ver')).toBe(false);
  });

  it('cierra la sesión automáticamente cuando vence el token', () => {
    vi.useFakeTimers();
    sessionStore.set(crearToken({ exp: Math.floor(Date.now() / 1000) + 2 }));
    const { result } = renderAuth();
    expect(result.current.sesion).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.sesion).toBeNull();
  });

  it('useAuth fuera de AuthProvider lanza un error claro', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth debe usarse dentro de <AuthProvider>.',
    );
    vi.mocked(console.error).mockRestore();
  });
});
