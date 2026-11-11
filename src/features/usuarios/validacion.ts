// Mismas reglas que RegistroRequest.java (security-service). Validar en el front evita un viaje
// al servidor, pero la validación que vale es la del backend.

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 50;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 72; // BCrypt solo usa los primeros 72 bytes
export const EMAIL_MAX = 100;

// Simple a propósito: algo@algo.algo, sin espacios.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface UsuarioFormValues {
  username: string;
  email: string;
  password: string;
  confirmacion: string; // solo existe en el front: no se envía
}

export type UsuarioFormErrors = Partial<Record<keyof UsuarioFormValues, string>>;

export function validarUsuario(values: UsuarioFormValues): UsuarioFormErrors {
  const errores: UsuarioFormErrors = {};
  const username = values.username.trim();
  const email = values.email.trim();

  if (!username) {
    errores.username = 'El usuario es obligatorio.';
  } else if (username.length < USERNAME_MIN || username.length > USERNAME_MAX) {
    errores.username = `El usuario debe tener entre ${USERNAME_MIN} y ${USERNAME_MAX} caracteres.`;
  }

  if (!email) {
    errores.email = 'El email es obligatorio.';
  } else if (email.length > EMAIL_MAX) {
    errores.email = `El email no puede superar los ${EMAIL_MAX} caracteres.`;
  } else if (!EMAIL_REGEX.test(email)) {
    errores.email = 'El email no tiene un formato válido.';
  }

  if (!values.password) {
    errores.password = 'La contraseña es obligatoria.';
  } else if (values.password.length < PASSWORD_MIN || values.password.length > PASSWORD_MAX) {
    errores.password = `La contraseña debe tener entre ${PASSWORD_MIN} y ${PASSWORD_MAX} caracteres.`;
  }

  if (values.confirmacion !== values.password) {
    errores.confirmacion = 'Las contraseñas no coinciden.';
  }

  return errores;
}

// ---------- Datos del cliente (cuenta CLIENTE) ----------
// Mismas reglas que RegistroRequest.java, que a su vez copia ClienteRequestDto de shipment-service.

export interface DatosClienteValues {
  dni: string;
  nombre: string;
  apellido: string;
  telefono: string;
}

export type DatosClienteErrors = Partial<Record<keyof DatosClienteValues, string>>;

const SOLO_LETRAS = /^[\p{L} ]+$/u;

export function validarDatosCliente(values: DatosClienteValues): DatosClienteErrors {
  const errores: DatosClienteErrors = {};
  const nombre = values.nombre.trim();
  const apellido = values.apellido.trim();

  if (!/^\d{8}$/.test(values.dni.trim())) errores.dni = 'El DNI debe tener 8 dígitos.';

  if (!nombre) errores.nombre = 'El nombre es obligatorio.';
  else if (nombre.length < 3 || nombre.length > 30)
    errores.nombre = 'El nombre debe tener entre 3 y 30 caracteres.';
  else if (!SOLO_LETRAS.test(nombre)) errores.nombre = 'El nombre solo puede contener letras.';

  if (!apellido) errores.apellido = 'El apellido es obligatorio.';
  else if (!SOLO_LETRAS.test(apellido))
    errores.apellido = 'El apellido solo puede contener letras.';

  if (!/^\d{10}$/.test(values.telefono.trim()))
    errores.telefono = 'El teléfono debe tener 10 dígitos.';

  return errores;
}
