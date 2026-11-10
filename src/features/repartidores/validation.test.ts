import type { RepartidorRequest } from './types';
import { aRequest, separarNombreCompleto, validarRepartidor } from './validation';

const valido: RepartidorRequest = {
  dni: '28111222',
  nombre: 'Esteban',
  apellido: 'Quito',
  telefono: '3881112222',
  tipoVehiculo: 'MOTO',
};

describe('validarRepartidor', () => {
  it('un DTO válido no tiene errores', () => {
    expect(validarRepartidor(valido)).toEqual({});
  });

  it.each([
    ['dni', '1234567'],
    ['dni', '12345678a'],
    ['nombre', 'Al'],
    ['nombre', 'Juan2'],
    ['nombre', 'A'.repeat(31)],
    ['apellido', ''],
    ['apellido', 'B'.repeat(21)],
    ['telefono', '388111222'],
    ['telefono', '388-111222'],
    ['tipoVehiculo', '  '],
  ] as const)('marca error en %s con "%s"', (campo, valor) => {
    const errores = validarRepartidor({ ...valido, [campo]: valor });
    expect(errores[campo]).toBeDefined();
    expect(Object.keys(errores)).toEqual([campo]);
  });

  it('acepta tildes y espacios en el nombre', () => {
    expect(validarRepartidor({ ...valido, nombre: 'José María' })).toEqual({});
  });
});

describe('separarNombreCompleto', () => {
  it('separa "Apellido, Nombre"', () => {
    expect(separarNombreCompleto('Quito, Esteban')).toEqual({
      apellido: 'Quito',
      nombre: 'Esteban',
    });
  });

  it('sin coma deja todo en apellido', () => {
    expect(separarNombreCompleto('Quito')).toEqual({ apellido: 'Quito', nombre: '' });
  });

  it('aRequest arma el DTO completo para editar', () => {
    expect(
      aRequest({
        idRepartidor: 'x',
        dni: '28111222',
        nombreCompleto: 'Quito, Esteban',
        telefono: '3881112222',
        tipoVehiculo: 'MOTO',
        estadoRepartidor: 'ACTIVO',
        fechaCreacion: '2026-11-10T10:00:00',
      }),
    ).toEqual(valido);
  });
});
