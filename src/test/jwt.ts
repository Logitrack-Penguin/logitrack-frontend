import type { JwtClaims } from '../shared/auth/jwt';

// Solo para tests: arma un JWT "header.payload.firma" en base64url (la firma no se verifica).

function base64url(texto: string): string {
  let binario = '';
  new TextEncoder().encode(texto).forEach((byte) => {
    binario += String.fromCharCode(byte);
  });
  return btoa(binario).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function crearToken(claims: Partial<JwtClaims> = {}): string {
  const ahora = Math.floor(Date.now() / 1000);
  const payload: JwtClaims = {
    sub: 'agus',
    userId: '6f1c2a8e-0000-0000-0000-000000000000',
    roles: ['ADMIN'],
    iat: ahora,
    exp: ahora + 3600,
    iss: 'logitrack-security-service',
    ...claims,
  };
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  return `${header}.${base64url(JSON.stringify(payload))}.firma-de-prueba`;
}
