import { httpClient } from '../../../shared/api/httpClient';
import { SECURITY } from '../../../shared/api/servicePaths';
import type { JwtResponse, LoginRequest } from '../../../shared/auth/types';

export const authApi = {
  // POST /auth/login — un 401 (credenciales inválidas) llega como ApiError sin cerrar sesión.
  async login(dto: LoginRequest): Promise<JwtResponse> {
    const { data } = await httpClient.post<JwtResponse>(`${SECURITY}/auth/login`, dto);
    return data;
  },
};
