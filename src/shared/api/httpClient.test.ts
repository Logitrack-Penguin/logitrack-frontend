import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { crearToken } from '../../test/jwt';
import { sessionStore } from '../auth/sessionStore';
import { ApiError } from './apiError';
import { httpClient, setSesionInvalidaHandler } from './httpClient';
import { SECURITY, SHIPMENT } from './servicePaths';

const TOKEN = crearToken();

function respuesta(
  config: InternalAxiosRequestConfig,
  status: number,
  data: unknown = null,
): AxiosResponse {
  return { status, statusText: '', headers: {}, config, data };
}

// Simula al backend respondiendo siempre con el status indicado.
function backendResponde(status: number, data: unknown = null): void {
  httpClient.defaults.adapter = async (config) => {
    const res = respuesta(config, status, data);
    if (status < 400) return res;
    throw new AxiosError('Request failed', String(status), config, null, res);
  };
}

const handler = vi.fn<(status: 401 | 403) => void>();

beforeEach(() => {
  sessionStore.clear();
  sessionStorage.clear();
  handler.mockReset();
  setSesionInvalidaHandler(handler);
});

describe('interceptor de pedido', () => {
  let authorization: unknown;

  beforeEach(() => {
    authorization = undefined;
    httpClient.defaults.adapter = async (config) => {
      authorization = config.headers.Authorization;
      return respuesta(config, 200);
    };
  });

  it('con sesión agrega el Bearer', async () => {
    sessionStore.set(TOKEN);
    await httpClient.get(`${SHIPMENT}/envios`);
    expect(authorization).toBe(`Bearer ${TOKEN}`);
  });

  it('sin sesión no agrega Authorization', async () => {
    await httpClient.get(`${SHIPMENT}/envios`);
    expect(authorization).toBeUndefined();
  });
});

describe('interceptor de respuesta', () => {
  it('un 401 llama al manejador y rechaza con ApiError', async () => {
    backendResponde(401, { status: 401, message: 'Token inválido o expirado' });
    await expect(httpClient.get(`${SHIPMENT}/envios`)).rejects.toSatisfy(
      (e) => e instanceof ApiError && e.message === 'Token inválido o expirado',
    );
    expect(handler).toHaveBeenCalledWith(401);
  });

  it('un 403 llama al manejador', async () => {
    backendResponde(403, { status: 403, message: 'No tenés permisos para acceder a este recurso' });
    await expect(httpClient.delete(`${SHIPMENT}/clientes/12345678`)).rejects.toBeInstanceOf(
      ApiError,
    );
    expect(handler).toHaveBeenCalledWith(403);
  });

  it('un 401 en el login no llama al manejador', async () => {
    backendResponde(401, { status: 401, message: 'Credenciales inválidas' });
    await expect(httpClient.post(`${SECURITY}/auth/login`, {})).rejects.toMatchObject({
      status: 401,
      message: 'Credenciales inválidas',
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it('un 403 en el registro no llama al manejador', async () => {
    backendResponde(403, { status: 403, message: 'Solo un administrador puede asignar roles' });
    await expect(httpClient.post(`${SECURITY}/auth/register`, {})).rejects.toBeInstanceOf(ApiError);
    expect(handler).not.toHaveBeenCalled();
  });

  it('un 404 no llama al manejador', async () => {
    backendResponde(404, { status: 404, mensaje: 'Envío no encontrado' });
    await expect(httpClient.get(`${SHIPMENT}/envios/123`)).rejects.toMatchObject({
      status: 404,
      message: 'Envío no encontrado',
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it('una respuesta exitosa pasa sin cambios', async () => {
    backendResponde(200, [{ idEnvio: '1' }]);
    const { data } = await httpClient.get(`${SHIPMENT}/envios`);
    expect(data).toEqual([{ idEnvio: '1' }]);
    expect(handler).not.toHaveBeenCalled();
  });
});
