import type { Rol } from '../../shared/auth/permissions';

// Copiados de security-service: dto/RegistroRequest.java y dto/UserResponse.java.

// POST /applications/apisecurity/api/auth/register
// Sin token solo crea CLIENTE (y no hay que mandar roles). Con token de ADMIN acepta cualquier rol.
export interface RegistroRequest {
  username: string; // 3 a 50 caracteres
  password: string; // 8 a 72 caracteres (BCrypt solo usa 72 bytes)
  email: string; // formato email, hasta 100 caracteres
  roles?: Rol[]; // si no se manda, el backend asigna CLIENTE
  // Obligatorios si la cuenta es CLIENTE: security-service crea (o vincula) el cliente en
  // shipment-service con estos datos y guarda el DNI en el usuario y en el token.
  dni?: string; // 8 dígitos
  nombre?: string; // solo letras, 3 a 30
  apellido?: string; // solo letras
  telefono?: string; // 10 dígitos
}

// Respuesta de /auth/register (201), /auth/me y /users. Nunca trae la contraseña.
export interface UserResponse {
  id: string; // UUID
  username: string;
  email: string;
  roles: Rol[]; // en Java es un Set: el orden no está garantizado
  dni?: string | null; // DNI del cliente vinculado; null si la cuenta no es de un cliente
}

export const ROL_TEXTO: Record<Rol, string> = {
  ADMIN: 'Administrador',
  CLIENTE: 'Cliente',
  REPARTIDOR: 'Repartidor',
};
