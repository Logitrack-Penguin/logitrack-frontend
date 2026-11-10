// src/features/repartidores/validation.ts — mismas reglas que RepartidorRequestDto (courier-service).
import type { RepartidorRequest, RepartidorResponse } from './types';

export type ErroresRepartidor = Partial<Record<keyof RepartidorRequest, string>>;

const LETRAS = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$/;

function largoLetras(valor: string, min: number, max: number, campo: string): string | undefined {
  const v = valor.trim();
  if (!v) return `El ${campo} es obligatorio.`;
  if (!LETRAS.test(v)) return `El ${campo} solo puede tener letras.`;
  if (v.length < min || v.length > max)
    return `El ${campo} debe tener entre ${min} y ${max} letras.`;
  return undefined;
}

export function validarRepartidor(dto: RepartidorRequest): ErroresRepartidor {
  const errores: ErroresRepartidor = {};
  if (!/^\d{8}$/.test(dto.dni.trim())) errores.dni = 'El DNI debe tener 8 dígitos.';
  const nombre = largoLetras(dto.nombre, 3, 30, 'nombre');
  if (nombre) errores.nombre = nombre;
  const apellido = largoLetras(dto.apellido, 3, 20, 'apellido');
  if (apellido) errores.apellido = apellido;
  if (!/^\d{10}$/.test(dto.telefono.trim()))
    errores.telefono = 'El teléfono debe tener 10 dígitos.';
  if (!dto.tipoVehiculo.trim()) errores.tipoVehiculo = 'El vehículo es obligatorio.';
  return errores;
}

/** "Apellido, Nombre" → { apellido, nombre }. Si no hay coma, todo queda como apellido. */
export function separarNombreCompleto(nombreCompleto: string): {
  apellido: string;
  nombre: string;
} {
  const [apellido, ...resto] = nombreCompleto.split(', ');
  return { apellido: apellido ?? '', nombre: resto.join(', ') };
}

/** Respuesta del backend → DTO completo para el formulario de edición. */
export function aRequest(r: RepartidorResponse): RepartidorRequest {
  const { apellido, nombre } = separarNombreCompleto(r.nombreCompleto);
  return { dni: r.dni, nombre, apellido, telefono: r.telefono, tipoVehiculo: r.tipoVehiculo };
}
