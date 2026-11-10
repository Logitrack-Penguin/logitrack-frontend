import {
  formatearDireccion,
  formatearFecha,
  formatearTarifa,
  puedeVerCodigoRecepcion,
} from './formato';

describe('formatearFecha', () => {
  it('convierte un LocalDate sin correrlo por zona horaria', () => {
    expect(formatearFecha('2026-11-12')).toBe('12/11/2026');
  });

  it('agrega la hora de un LocalDateTime', () => {
    expect(formatearFecha('2026-11-12T09:30:15.123')).toBe('12/11/2026 09:30');
  });

  it('acepta el formato del historial', () => {
    expect(formatearFecha('2026-11-12 18:05:00')).toBe('12/11/2026 18:05');
  });

  it('deja igual un texto que no es fecha', () => {
    expect(formatearFecha('sin fecha')).toBe('sin fecha');
  });
});

describe('formatearTarifa', () => {
  it('usa pesos argentinos', () => {
    expect(formatearTarifa(1234.5)).toMatch(/\$\s?1\.234,50/);
  });
});

describe('formatearDireccion', () => {
  it('arma calle, número, ciudad y código postal', () => {
    expect(
      formatearDireccion({
        calle: 'Belgrano',
        numero: '450',
        ciudad: 'San Salvador de Jujuy',
        codigoPostal: '4600',
      }),
    ).toBe('Belgrano 450, San Salvador de Jujuy (CP 4600)');
  });
});

describe('puedeVerCodigoRecepcion', () => {
  it('lo ven ADMIN y CLIENTE', () => {
    expect(puedeVerCodigoRecepcion(['ADMIN'])).toBe(true);
    expect(puedeVerCodigoRecepcion(['CLIENTE'])).toBe(true);
  });

  it('no lo ve REPARTIDOR ni alguien sin roles', () => {
    expect(puedeVerCodigoRecepcion(['REPARTIDOR'])).toBe(false);
    expect(puedeVerCodigoRecepcion([])).toBe(false);
  });
});
