import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Button, FormField, fieldErrorId } from '../../../shared/components';
import type { Rol } from '../../../shared/auth/permissions';
import { ROL_TEXTO, type RegistroRequest } from '../types';
import {
  validarDatosCliente,
  validarUsuario,
  type DatosClienteErrors,
  type DatosClienteValues,
  type UsuarioFormErrors,
  type UsuarioFormValues,
} from '../validacion';
import styles from './UsuarioForm.module.css';

/**ADMIN no se ofrece: no se crean administradores desde la UI*/
const ROLES: Rol[] = ['REPARTIDOR', 'CLIENTE'];

export interface UsuarioFormProps {
  /** true en el alta del ADMIN: muestra el selector de rol y lo envía. El registro público no manda roles. */
  conRol?: boolean;
  submitLabel: string;
  /** Si rechaza, el formulario vuelve a habilitarse; el mensaje lo muestra la página. */
  onSubmit: (dto: RegistroRequest) => Promise<void>;
}

const VACIO: UsuarioFormValues = { username: '', email: '', password: '', confirmacion: '' };
const CLIENTE_VACIO: DatosClienteValues = { dni: '', nombre: '', apellido: '', telefono: '' };

export function UsuarioForm({ conRol = false, submitLabel, onSubmit }: UsuarioFormProps) {
  const [values, setValues] = useState(VACIO);
  const [rol, setRol] = useState<Rol>('REPARTIDOR');
  const [errores, setErrores] = useState<UsuarioFormErrors>({});
  // Una cuenta CLIENTE necesita sus datos de cliente: el backend crea (o vincula) el cliente en
  // shipment-service y así el usuario ve sus envíos desde el primer ingreso.
  const [cliente, setCliente] = useState(CLIENTE_VACIO);
  const [erroresCliente, setErroresCliente] = useState<DatosClienteErrors>({});
  const isCliente = !conRol || rol === 'CLIENTE';
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const campo = e.target.name as keyof UsuarioFormValues;
    setValues((v) => ({ ...v, [campo]: e.target.value }));
    // Borra el error del campo apenas el usuario lo corrige.
    setErrores((err) => ({ ...err, [campo]: undefined }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nuevosErrores = validarUsuario(values);
    const nuevosErroresCliente = isCliente ? validarDatosCliente(cliente) : {};
    setErrores(nuevosErrores);
    setErroresCliente(nuevosErroresCliente);
    if (Object.keys(nuevosErrores).length + Object.keys(nuevosErroresCliente).length > 0) return;

    const dto: RegistroRequest = {
      username: values.username.trim(),
      email: values.email.trim(),
      password: values.password,
      ...(conRol && { roles: [rol] }),
      ...(isCliente && {
        dni: cliente.dni.trim(),
        nombre: cliente.nombre.trim(),
        apellido: cliente.apellido.trim(),
        telefono: cliente.telefono.trim(),
      }),
    };
    setIsLoading(true);
    try {
      await onSubmit(dto);
    } catch {
      // La página ya mostró el error con un toast.
    } finally {
      setIsLoading(false);
    }
  }

  const campo = (
    name: keyof UsuarioFormValues,
    label: string,
    type: string,
    autoComplete: string,
    hint?: string,
  ) => (
    <FormField label={label} htmlFor={name} error={errores[name]} hint={hint}>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        value={values[name]}
        onChange={handleChange}
        aria-invalid={!!errores[name]}
        aria-describedby={errores[name] ? fieldErrorId(name) : undefined}
      />
    </FormField>
  );

  const campoCliente = (
    name: keyof DatosClienteValues,
    label: string,
    autoComplete: string,
    inputMode?: 'numeric' | 'tel',
    hint?: string,
  ) => (
    <FormField label={label} htmlFor={name} error={erroresCliente[name]} hint={hint}>
      <input
        id={name}
        name={name}
        type="text"
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={cliente[name]}
        onChange={(e) => {
          setCliente((c) => ({ ...c, [name]: e.target.value }));
          setErroresCliente((err) => ({ ...err, [name]: undefined }));
        }}
        aria-invalid={!!erroresCliente[name]}
        aria-describedby={erroresCliente[name] ? fieldErrorId(name) : undefined}
      />
    </FormField>
  );

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {campo('username', 'Usuario', 'text', 'username', 'Entre 3 y 50 caracteres.')}
      {campo('email', 'Email', 'email', 'email')}
      {campo('password', 'Contraseña', 'password', 'new-password', 'Entre 8 y 72 caracteres.')}
      {campo('confirmacion', 'Repetir contraseña', 'password', 'new-password')}

      {conRol && (
        <>
          <FormField label="Rol" htmlFor="rol">
            <select id="rol" value={rol} onChange={(e) => setRol(e.target.value as Rol)}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROL_TEXTO[r]}
                </option>
              ))}
            </select>
          </FormField>
          {rol === 'REPARTIDOR' && (
            <p className={styles.aviso} role="note">
              Este usuario solo sirve para ingresar al sistema. El repartidor (DNI, vehículo y
              estado) se da de alta aparte, en la sección Repartidores.
            </p>
          )}
        </>
      )}

      {isCliente && (
        <>
          {campoCliente('dni', 'DNI', 'off', 'numeric', '8 dígitos, sin puntos.')}
          {campoCliente('nombre', 'Nombre', 'given-name')}
          {campoCliente('apellido', 'Apellido', 'family-name')}
          {campoCliente('telefono', 'Teléfono', 'tel', 'tel', '10 dígitos, sin 0 ni 15.')}
        </>
      )}

      <Button type="submit" loading={isLoading}>
        {submitLabel}
      </Button>
    </form>
  );
}
