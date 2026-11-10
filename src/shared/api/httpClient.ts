import axios from 'axios';
import { env } from '../../config/env';
import { sessionStore } from '../auth/sessionStore';
import { toApiError } from './apiError';

export const httpClient = axios.create({ baseURL: env.apiBaseUrl, timeout: 10_000 });

// Qué hacer cuando la sesión deja de ser válida. Lo registra main.tsx, que conoce al router:
// este archivo no es un componente y no puede usar hooks.
type SesionInvalidaHandler = (status: 401 | 403) => void;
let onSesionInvalida: SesionInvalidaHandler = () => {};

export const setSesionInvalidaHandler = (handler: SesionInvalidaHandler): void => {
  onSesionInvalida = handler;
};

// Un 401/403 en login o registro es un error del formulario, no una sesión vencida.
const ES_AUTH = /\/auth\/(login|register)$/;

httpClient.interceptors.request.use((config) => {
  const token = sessionStore.get()?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = toApiError(error);
    const url = axios.isAxiosError(error) ? (error.config?.url ?? '') : '';
    if ((apiError.status === 401 || apiError.status === 403) && !ES_AUTH.test(url)) {
      onSesionInvalida(apiError.status);
    }
    return Promise.reject(apiError);
  },
);
