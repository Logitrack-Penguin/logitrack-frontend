// src/features/envios/validarEnvio.ts — validaciones del alta, copiadas de EnvioRequestDto.java.
// El backend no valida los campos de las direcciones (falta @Valid en los objetos anidados):
// para esos campos, esta es la única validación.
import type { EnvioRequest } from './types';

const CAMPOS_DIRECCION = ['calle', 'numero', 'ciudad', 'codigoPostal'] as const;
const DIRECCIONES = ['direccionOrigen', 'direccionDestino'] as const;
const DIMENSIONES = ['ancho', 'alto', 'largo'] as const;

/**
 * Valores del formulario, todos como texto. Las claves son las mismas que usa el backend en
 * `detalles` ("dniCliente", "dimensiones.ancho", "direccionOrigen.calle"…), así los errores del
 * frontend y los del backend se muestran en el mismo campo.
 */
export type FormularioEnvio = Record<string, string>;

export const FORMULARIO_VACIO: FormularioEnvio = Object.fromEntries(
  [
    'peso',
    ...DIMENSIONES.map((k) => `dimensiones.${k}`),
    ...DIRECCIONES.flatMap((d) => [...CAMPOS_DIRECCION, 'observaciones'].map((k) => `${d}.${k}`)),
    'dniCliente',
  ].map((clave) => [clave, '']),
);

/** Pasa el formulario al DTO: números como number, textos sin espacios de más. */
export function armarEnvioRequest(f: FormularioEnvio): EnvioRequest {
  const texto = (clave: string) => (f[clave] ?? '').trim();
  const numero = (clave: string) => (texto(clave) === '' ? Number.NaN : Number(texto(clave)));
  const direccion = (d: (typeof DIRECCIONES)[number]) => {
    const observaciones = texto(`${d}.observaciones`);
    return {
      calle: texto(`${d}.calle`),
      numero: texto(`${d}.numero`),
      ciudad: texto(`${d}.ciudad`),
      codigoPostal: texto(`${d}.codigoPostal`),
      ...(observaciones && { observaciones }),
    };
  };
  return {
    peso: numero('peso'),
    dimensiones: {
      ancho: numero('dimensiones.ancho'),
      alto: numero('dimensiones.alto'),
      largo: numero('dimensiones.largo'),
    },
    direccionOrigen: direccion('direccionOrigen'),
    direccionDestino: direccion('direccionDestino'),
    dniCliente: texto('dniCliente'),
  };
}

/** Devuelve los errores por campo; un objeto vacío significa que el envío es válido. */
export function validarEnvio(f: EnvioRequest): Record<string, string> {
  const e: Record<string, string> = {};
  if (!f.dniCliente) e.dniCliente = 'El DNI del cliente es obligatorio.';
  else if (!/^\d{8}$/.test(f.dniCliente)) e.dniCliente = 'El DNI debe tener 8 dígitos.';
  if (!(f.peso > 0)) e.peso = 'El peso debe ser mayor a 0.';
  DIMENSIONES.forEach((k) => {
    if (!(f.dimensiones[k] > 0)) e[`dimensiones.${k}`] = 'Debe ser mayor a 0.';
  });
  DIRECCIONES.forEach((d) =>
    CAMPOS_DIRECCION.forEach((k) => {
      if (!f[d][k]?.trim()) e[`${d}.${k}`] = 'Obligatorio.';
    }),
  );
  return e;
}
