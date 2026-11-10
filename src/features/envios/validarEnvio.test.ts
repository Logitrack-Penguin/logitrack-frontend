import type { EnvioRequest } from './types';
import { armarEnvioRequest, FORMULARIO_VACIO, validarEnvio } from './validarEnvio';

function envioValido(): EnvioRequest {
  return {
    peso: 2.5,
    dimensiones: { ancho: 20, alto: 10, largo: 30 },
    direccionOrigen: { calle: 'Belgrano', numero: '450', ciudad: 'Jujuy', codigoPostal: '4600' },
    direccionDestino: { calle: 'Güemes', numero: '1200', ciudad: 'Palpalá', codigoPostal: '4612' },
    dniCliente: '30111222',
  };
}

describe('validarEnvio', () => {
  it('un envío completo no tiene errores', () => {
    expect(validarEnvio(envioValido())).toEqual({});
  });

  it('el DNI es obligatorio y debe tener 8 dígitos', () => {
    expect(validarEnvio({ ...envioValido(), dniCliente: '' }).dniCliente).toBe(
      'El DNI del cliente es obligatorio.',
    );
    for (const dni of ['1234567', '123456789', '3011122a']) {
      expect(validarEnvio({ ...envioValido(), dniCliente: dni }).dniCliente).toBe(
        'El DNI debe tener 8 dígitos.',
      );
    }
  });

  it('peso y dimensiones deben ser mayores a 0', () => {
    const errores = validarEnvio({
      ...envioValido(),
      peso: 0,
      dimensiones: { ancho: -1, alto: Number.NaN, largo: 5 },
    });
    expect(errores).toEqual({
      peso: 'El peso debe ser mayor a 0.',
      'dimensiones.ancho': 'Debe ser mayor a 0.',
      'dimensiones.alto': 'Debe ser mayor a 0.',
    });
  });

  it('los campos de las direcciones son obligatorios, salvo observaciones', () => {
    const envio = envioValido();
    envio.direccionOrigen.calle = '   ';
    envio.direccionDestino.codigoPostal = '';
    expect(validarEnvio(envio)).toEqual({
      'direccionOrigen.calle': 'Obligatorio.',
      'direccionDestino.codigoPostal': 'Obligatorio.',
    });
  });
});

describe('armarEnvioRequest', () => {
  it('convierte números, recorta textos y omite observaciones vacías', () => {
    const dto = armarEnvioRequest({
      ...FORMULARIO_VACIO,
      peso: '2.5',
      'dimensiones.ancho': '20',
      'dimensiones.alto': '10',
      'dimensiones.largo': '30',
      'direccionOrigen.calle': ' Belgrano ',
      'direccionOrigen.numero': '450',
      'direccionOrigen.ciudad': 'Jujuy',
      'direccionOrigen.codigoPostal': '4600',
      'direccionDestino.calle': 'Güemes',
      'direccionDestino.numero': '1200',
      'direccionDestino.ciudad': 'Palpalá',
      'direccionDestino.codigoPostal': '4612',
      'direccionDestino.observaciones': ' Timbre B ',
      dniCliente: ' 30111222 ',
    });
    expect(dto).toEqual({
      ...envioValido(),
      direccionDestino: { ...envioValido().direccionDestino, observaciones: 'Timbre B' },
    });
    expect(dto.direccionOrigen).not.toHaveProperty('observaciones');
  });

  it('un número vacío queda como NaN para que la validación lo rechace', () => {
    expect(armarEnvioRequest(FORMULARIO_VACIO).peso).toBeNaN();
  });
});
