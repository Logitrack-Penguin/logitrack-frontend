import type { Rol } from './permissions';

// Copiados de security-service: dto/LoginRequest.java y dto/JwtResponse.java.

// POST /applications/apisecurity/api/auth/login
export interface LoginRequest {
  username: string;
  password: string;
}

// Respuesta 200 del login
export interface JwtResponse {
  token: string;
  type: 'Bearer';
  userId: string;
  username: string;
  roles: Rol[];
}
