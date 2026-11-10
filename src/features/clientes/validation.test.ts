import type { ClienteRequest, ClienteResponse } from './types';
import { aRequest, coincideBusqueda, separarNombreCompleto, validarCliente } from './validation';

const valido: ClienteRequest = {
  dni: '30111222',
  nombre: 'Ana',
  apellido: 'Pérez',
  email: 'ana@mail.com',
  telefono: '3884445555',
};

const respuesta: ClienteResponse = {
  idCliente: 'c1',
  dni: '30111222',
  nombreCompleto: 'Pérez, Ana',
  email: 'ana@mail.com',
  telefono: '3884445555',
  fechaCreacion: '2026-11-10T10:00:00',
};

describe('validarCliente', () => {
  it('un DTO válido no tiene errores', () => {
    expect(validarCliente(valido)).toEqual({});
  });

  it.each([
    ['dni', '1234567'],
    ['dni', 'abcdefgh'],
    ['nombre', 'Al'],
    ['nombre', 'Ana1'],
    ['nombre', 'A'.repeat(31)],
    ['apellido', ''],
    ['apellido', 'Pérez2'],
    ['email', ''],
    ['email', 'ana@'],
    ['email', 'ana mail.com'],
    ['telefono', '388444555'],
    ['telefono', '388-4445555'],
  ] as const)('marca error en %s con "%s"', (campo, valor) => {
    const errores = validarCliente({ ...valido, [campo]: valor });
    expect(errores[campo]).toBeDefined();
    expect(Object.keys(errores)).toEqual([campo]);
  });
});

describe('nombre completo', () => {
  it('separa "Apellido, Nombre"', () => {
    expect(separarNombreCompleto('Pérez, Ana')).toEqual({ apellido: 'Pérez', nombre: 'Ana' });
  });

  it('aRequest arma el DTO completo para editar', () => {
    expect(aRequest(respuesta)).toEqual(valido);
  });
});

describe('coincideBusqueda', () => {
  it.each(['', '3011', 'perez', 'PÉREZ', 'ana'])('encuentra con "%s"', (texto) => {
    expect(coincideBusqueda(respuesta, texto)).toBe(true);
  });

  it('no encuentra con un texto que no está', () => {
    expect(coincideBusqueda(respuesta, 'gómez')).toBe(false);
  });
});
