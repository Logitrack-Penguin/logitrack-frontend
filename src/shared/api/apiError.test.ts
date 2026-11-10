import {
  AxiosError,
  AxiosHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { ApiError, toApiError } from './apiError';

function errorHttp(status: number, data: unknown): AxiosError {
  const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;
  const response: AxiosResponse = { status, statusText: '', headers: {}, config, data };
  return new AxiosError('Request failed', String(status), config, null, response);
}

describe('toApiError', () => {
  it('usa "message" (security-service y gateway)', () => {
    const body = { status: 401, error: 'Unauthorized', message: 'Credenciales inválidas' };
    const e = toApiError(errorHttp(401, body));
    expect(e).toBeInstanceOf(ApiError);
    expect(e.status).toBe(401);
    expect(e.message).toBe('Credenciales inválidas');
    expect(e.raw).toEqual(body);
  });

  it('usa "mensaje" (shipment y courier)', () => {
    const e = toApiError(
      errorHttp(404, { status: 404, error: 'Not Found', mensaje: 'Envío no encontrado' }),
    );
    expect(e.status).toBe(404);
    expect(e.message).toBe('Envío no encontrado');
  });

  it('convierte "detalles" en fieldErrors y usa el mensaje del status', () => {
    const detalles = { dni: 'El DNI es obligatorio.', nombre: 'El nombre es obligatorio.' };
    const e = toApiError(errorHttp(400, { status: 400, error: 'Validación fallida', detalles }));
    expect(e.fieldErrors).toEqual(detalles);
    expect(e.message).toBe('Los datos enviados no son válidos.');
  });

  it('usa "detail" de un ProblemDetail', () => {
    const e = toApiError(
      errorHttp(409, { type: 'about:blank', title: 'Conflict', detail: 'DNI repetido' }),
    );
    expect(e.message).toBe('DNI repetido');
  });

  it('usa "title" de un ProblemDetail sin "detail"', () => {
    const e = toApiError(errorHttp(500, { type: 'about:blank', title: 'Internal Server Error' }));
    expect(e.message).toBe('Internal Server Error');
  });

  it('sin respuesta del servidor devuelve status 0', () => {
    const e = toApiError(new AxiosError('Network Error', AxiosError.ERR_NETWORK));
    expect(e.status).toBe(0);
    expect(e.message).toBe('No se pudo conectar con el servidor.');
  });

  it('con cuerpo vacío usa el mensaje por status', () => {
    expect(toApiError(errorHttp(503, '')).message).toBe(
      'Un servicio no está disponible. Probá más tarde.',
    );
    expect(toApiError(errorHttp(403, null)).message).toBe('No tenés permisos para esta acción.');
  });

  it('con un status sin mensaje propio usa el genérico', () => {
    expect(toApiError(errorHttp(502, {})).message).toBe('Error del servidor.');
  });

  it('ignora mensajes en blanco', () => {
    expect(toApiError(errorHttp(404, { message: '  ', mensaje: '' })).message).toBe(
      'No se encontró el recurso.',
    );
  });

  it('un error que no es de axios devuelve status -1', () => {
    const e = toApiError(new TypeError('x is undefined'));
    expect(e.status).toBe(-1);
    expect(e.message).toBe('Ocurrió un error inesperado.');
  });

  it('devuelve el mismo ApiError si ya lo es', () => {
    const original = new ApiError(409, 'Duplicado');
    expect(toApiError(original)).toBe(original);
  });
});
