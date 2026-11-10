// src/features/clientes/validation.ts — mismas reglas que ClienteRequestDto (shipment-service).
import type { ClienteRequest, ClienteResponse } from './types';

export type ErroresCliente = Partial<Record<keyof ClienteRequest, string>>;

const LETRAS = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarCliente(dto: ClienteRequest): ErroresCliente {
  const errores: ErroresCliente = {};
  if (!/^\d{8}$/.test(dto.dni.trim())) errores.dni = 'El DNI debe tener 8 dígitos.';

  const nombre = dto.nombre.trim();
  if (!nombre) errores.nombre = 'El nombre es obligatorio.';
  else if (!LETRAS.test(nombre)) errores.nombre = 'El nombre solo puede tener letras.';
  else if (nombre.length < 3 || nombre.length > 30)
    errores.nombre = 'El nombre debe tener entre 3 y 30 letras.';

  const apellido = dto.apellido.trim();
  if (!apellido) errores.apellido = 'El apellido es obligatorio.';
  else if (!LETRAS.test(apellido)) errores.apellido = 'El apellido solo puede tener letras.';

  // Obligatorio aunque el DTO solo tenga @Email: la columna de la base no admite nulos.
  const email = dto.email.trim();
  if (!email) errores.email = 'El email es obligatorio.';
  else if (!EMAIL.test(email)) errores.email = 'El email no es válido.';

  if (!/^\d{10}$/.test(dto.telefono.trim()))
    errores.telefono = 'El teléfono debe tener 10 dígitos.';
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
export function aRequest(c: ClienteResponse): ClienteRequest {
  const { apellido, nombre } = separarNombreCompleto(c.nombreCompleto);
  return { dni: c.dni, nombre, apellido, email: c.email, telefono: c.telefono };
}

/** Búsqueda local del listado: por DNI o por nombre, sin distinguir mayúsculas ni tildes. */
export function coincideBusqueda(c: ClienteResponse, texto: string): boolean {
  const normalizar = (s: string) =>
    s
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase();
  const t = normalizar(texto.trim());
  return !t || c.dni.includes(t) || normalizar(c.nombreCompleto).includes(t);
}
