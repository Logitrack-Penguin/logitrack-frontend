// src/features/usuarios/api/usuariosApi.ts — único lugar con las URL de usuarios.
import { httpClient } from '../../../shared/api/httpClient';
import { SECURITY } from '../../../shared/api/servicePaths';
import type { RegistroRequest, UserResponse } from '../types';

export const usuariosApi = {
  // Público para CLIENTE. Si hay sesión de ADMIN, el interceptor adjunta el token y el backend
  // permite pedir roles ADMIN o REPARTIDOR. Un 401/403 acá no cierra la sesión (ver httpClient).
  registrar: (dto: RegistroRequest) =>
    httpClient.post<UserResponse>(`${SECURITY}/auth/register`, dto).then((r) => r.data),

  me: () => httpClient.get<UserResponse>(`${SECURITY}/auth/me`).then((r) => r.data),

  // Solo ADMIN.
  listar: () => httpClient.get<UserResponse[]>(`${SECURITY}/users`).then((r) => r.data),
};
