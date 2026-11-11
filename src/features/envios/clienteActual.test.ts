import { dniDeRemitente, esSoloCliente } from './clienteActual';
import { esVisible } from './useDniCliente';

describe('dniDeRemitente', () => {
  it('saca el DNI del texto que arma el backend', () => {
    expect(dniDeRemitente('Nombre: Pérez, Juan - DNI: 35123456')).toBe('35123456');
  });

  it('devuelve null si el texto no tiene DNI', () => {
    expect(dniDeRemitente('Sin datos')).toBeNull();
  });
});

describe('esSoloCliente', () => {
  it('solo filtra al CLIENTE sin ADMIN', () => {
    expect(esSoloCliente(['CLIENTE'])).toBe(true);
    expect(esSoloCliente(['ADMIN'])).toBe(false);
    expect(esSoloCliente(['REPARTIDOR'])).toBe(false);
    expect(esSoloCliente(['ADMIN', 'CLIENTE'])).toBe(false);
  });
});

describe('esVisible', () => {
  it('si no hay que filtrar, se ve todo', () => {
    expect(esVisible({ debeFiltrar: false, dni: null }, '38987654')).toBe(true);
  });

  it('un CLIENTE solo ve los envíos de su DNI', () => {
    expect(esVisible({ debeFiltrar: true, dni: '35123456' }, '35123456')).toBe(true);
    expect(esVisible({ debeFiltrar: true, dni: '35123456' }, '38987654')).toBe(false);
  });

  it('un CLIENTE sin DNI no ve ninguno', () => {
    expect(esVisible({ debeFiltrar: true, dni: null }, '35123456')).toBe(false);
  });
});
