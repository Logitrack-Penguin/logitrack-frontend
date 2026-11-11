import type { Rol } from './permissions';

// Claims que arma security-service (util/JwtUtil.java).
export interface JwtClaims {
  sub: string; // username
  userId: string; // UUID
  roles: Rol[]; // sin prefijo ROLE_
  dni?: string; // solo en cuentas CLIENTE con su cliente de shipment vinculado
  exp: number; // vencimiento, en segundos
  iat: number;
  iss: string;
}

// Lee el payload del JWT. No verifica la firma: eso lo hace el gateway en cada pedido.
export function decodeJwt(token: string): JwtClaims | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const conRelleno = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const bytes = Uint8Array.from(atob(conRelleno), (c) => c.charCodeAt(0));
    // TextDecoder: soporta tildes y ñ
    return JSON.parse(new TextDecoder().decode(bytes)) as JwtClaims;
  } catch {
    return null;
  }
}

export const estaVencido = (claims: JwtClaims): boolean => claims.exp * 1000 <= Date.now();
