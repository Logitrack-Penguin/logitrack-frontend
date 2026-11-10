import { crearToken } from '../../test/jwt';
import { decodeJwt, estaVencido, type JwtClaims } from './jwt';

const ahora = () => Math.floor(Date.now() / 1000);

describe('decodeJwt', () => {
  it('decodifica los claims de un token armado a mano', () => {
    const token = crearToken({ sub: 'agus', userId: 'u-1', roles: ['CLIENTE', 'REPARTIDOR'] });
    expect(decodeJwt(token)).toMatchObject({
      sub: 'agus',
      userId: 'u-1',
      roles: ['CLIENTE', 'REPARTIDOR'],
      iss: 'logitrack-security-service',
    });
  });

  it('soporta tildes y ñ', () => {
    expect(decodeJwt(crearToken({ sub: 'Muñoz Pérez' }))?.sub).toBe('Muñoz Pérez');
  });

  it('devuelve null con un token corrupto', () => {
    expect(decodeJwt('no-es-un-jwt')).toBeNull();
    expect(decodeJwt('aaa.%%%.bbb')).toBeNull();
    expect(decodeJwt('aaa.bm8tZXMtanNvbg.bbb')).toBeNull(); // payload "no-es-json"
    expect(decodeJwt('')).toBeNull();
  });
});

describe('estaVencido', () => {
  const claims = (exp: number): JwtClaims => ({
    sub: 'agus',
    userId: 'u-1',
    roles: ['ADMIN'],
    iat: ahora(),
    exp,
    iss: 'logitrack-security-service',
  });

  it('detecta un token vencido', () => {
    expect(estaVencido(claims(ahora() - 1))).toBe(true);
  });

  it('un token vigente no está vencido', () => {
    expect(estaVencido(claims(ahora() + 60))).toBe(false);
  });
});
