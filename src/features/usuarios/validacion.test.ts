import { describe, expect, it } from 'vitest';
import { validarUsuario, type UsuarioFormValues } from './validacion';

const VALIDO: UsuarioFormValues = {
  username: 'juan',
  email: 'juan@mail.com',
  password: '12345678',
  confirmacion: '12345678',
};

const con = (cambios: Partial<UsuarioFormValues>) => validarUsuario({ ...VALIDO, ...cambios });

describe('validarUsuario', () => {
  it('no devuelve errores con datos válidos', () => {
    expect(validarUsuario(VALIDO)).toEqual({});
  });

  it('exige todos los campos', () => {
    const errores = validarUsuario({ username: '', email: '', password: '', confirmacion: '' });
    expect(errores.username).toMatch(/obligatorio/);
    expect(errores.email).toMatch(/obligatorio/);
    expect(errores.password).toMatch(/obligatoria/);
    expect(errores.confirmacion).toBeUndefined();
  });

  it('usuario de 3 a 50 caracteres (sin contar espacios de los bordes)', () => {
    expect(con({ username: 'ab' }).username).toBeDefined();
    expect(con({ username: '  ab  ' }).username).toBeDefined();
    expect(con({ username: 'abc' }).username).toBeUndefined();
    expect(con({ username: 'a'.repeat(50) }).username).toBeUndefined();
    expect(con({ username: 'a'.repeat(51) }).username).toBeDefined();
  });

  it('contraseña de 8 a 72 caracteres', () => {
    for (const [largo, valida] of [
      [7, false],
      [8, true],
      [72, true],
      [73, false],
    ] as const) {
      const password = 'x'.repeat(largo);
      expect(con({ password, confirmacion: password }).password === undefined).toBe(valida);
    }
  });

  it('email con formato válido y hasta 100 caracteres', () => {
    expect(con({ email: 'juan' }).email).toMatch(/formato/);
    expect(con({ email: 'juan@mail' }).email).toMatch(/formato/);
    expect(con({ email: 'juan @mail.com' }).email).toMatch(/formato/);
    expect(con({ email: `${'a'.repeat(91)}@mail.com` }).email).toBeUndefined(); // 100
    expect(con({ email: `${'a'.repeat(92)}@mail.com` }).email).toMatch(/100/); // 101
  });

  it('la confirmación tiene que ser igual a la contraseña', () => {
    expect(con({ confirmacion: '12345679' }).confirmacion).toMatch(/no coinciden/);
  });
});
