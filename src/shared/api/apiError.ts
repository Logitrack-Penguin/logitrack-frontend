import axios from 'axios';

// Error único que reciben las pantallas, sin importar el formato que devolvió el backend.
export class ApiError extends Error {
  status: number; // 0 = sin respuesta del servidor; -1 = error que no vino de axios
  fieldErrors?: Record<string, string>;
  raw?: unknown;

  constructor(
    status: number,
    message: string,
    fieldErrors?: Record<string, string>,
    raw?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.raw = raw;
  }
}

const texto = (v: unknown): string | undefined =>
  typeof v === 'string' && v.trim() ? v : undefined;

const POR_STATUS: Record<number, string> = {
  400: 'Los datos enviados no son válidos.',
  401: 'Tu sesión expiró. Volvé a ingresar.',
  403: 'No tenés permisos para esta acción.',
  404: 'No se encontró el recurso.',
  409: 'El recurso ya existe o está en conflicto.',
  503: 'Un servicio no está disponible. Probá más tarde.',
};

// Traduce cualquier error a ApiError. Formatos del backend:
// - security-service y gateway: { status, error, message, timestamp }
// - shipment / courier: { timestamp, status, error, mensaje } y, en validaciones, { detalles: { campo: msg } }
// - ProblemDetail: { title, detail }
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (!axios.isAxiosError(error)) return new ApiError(-1, 'Ocurrió un error inesperado.');
  if (!error.response) return new ApiError(0, 'No se pudo conectar con el servidor.');

  const { status, data } = error.response;
  const body = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>;
  const message =
    texto(body.message) ??
    texto(body.mensaje) ??
    texto(body.detail) ??
    texto(body.title) ??
    POR_STATUS[status] ??
    'Error del servidor.';
  const detalles = body.detalles;
  const fieldErrors =
    detalles && typeof detalles === 'object' ? (detalles as Record<string, string>) : undefined;

  return new ApiError(status, message, fieldErrors, data);
}
