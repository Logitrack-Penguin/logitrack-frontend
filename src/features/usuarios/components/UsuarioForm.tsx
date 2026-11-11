import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Button, FormField, fieldErrorId } from '../../../shared/components';
import type { Rol } from '../../../shared/auth/permissions';
import { TIPOS_VEHICULO, type RepartidorRequest } from '../../repartidores/types';
import { type ErroresRepartidor, validarRepartidor } from '../../repartidores/validation';
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
  /**
   * Si rechaza, el formulario vuelve a habilitarse; el mensaje lo muestra la página.
   * Con rol REPARTIDOR también recibe la ficha del repartidor (alta unificada, LT4-40) y
   * `dto.dni` viene con el mismo DNI.
   */
  onSubmit: (dto: RegistroRequest, repartidor?: RepartidorRequest) => Promise<void>;
}

const VACIO: UsuarioFormValues = { username: '', email: '', password: '', confirmacion: '' };
const CLIENTE_VACIO: DatosClienteValues = { dni: '', nombre: '', apellido: '', telefono: '' };

const REPARTIDOR_VACIO: RepartidorRequest = {
  dni: '',
  nombre: '',
  apellido: '',
  telefono: '',
  tipoVehiculo: '',
};

const CAMPOS_REPARTIDOR: { campo: keyof RepartidorRequest; label: string; numerico?: boolean }[] = [
  { campo: 'dni', label: 'DNI', numerico: true },
  { campo: 'nombre', label: 'Nombre' },
  { campo: 'apellido', label: 'Apellido' },
  { campo: 'telefono', label: 'Teléfono', numerico: true },
  { campo: 'tipoVehiculo', label: 'Vehículo' },
];

export function UsuarioForm({ conRol = false, submitLabel, onSubmit }: UsuarioFormProps) {
  const [values, setValues] = useState(VACIO);
  const [rol, setRol] = useState<Rol>('REPARTIDOR');
  const [errores, setErrores] = useState<UsuarioFormErrors>({});
  // Una cuenta CLIENTE necesita sus datos de cliente: el backend crea (o vincula) el cliente en
  // shipment-service y así el usuario ve sus envíos desde el primer ingreso.
  const [cliente, setCliente] = useState(CLIENTE_VACIO);
  const [erroresCliente, setErroresCliente] = useState<DatosClienteErrors>({});
  const isCliente = !conRol || rol === 'CLIENTE';
  // Una cuenta REPARTIDOR se crea junto con su ficha de courier, con el mismo DNI (LT4-40).
  const [repartidor, setRepartidor] = useState(REPARTIDOR_VACIO);
  const [erroresRepartidor, setErroresRepartidor] = useState<ErroresRepartidor>({});
  const isRepartidor = conRol && rol === 'REPARTIDOR';
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
    const ficha: RepartidorRequest = {
      dni: repartidor.dni.trim(),
      nombre: repartidor.nombre.trim(),
      apellido: repartidor.apellido.trim(),
      telefono: repartidor.telefono.trim(),
      tipoVehiculo: repartidor.tipoVehiculo.trim().toUpperCase(),
    };
    const nuevosErroresRepartidor = isRepartidor ? validarRepartidor(ficha) : {};
    setErrores(nuevosErrores);
    setErroresCliente(nuevosErroresCliente);
    setErroresRepartidor(nuevosErroresRepartidor);
    const cantidadErrores =
      Object.keys(nuevosErrores).length +
      Object.keys(nuevosErroresCliente).length +
      Object.keys(nuevosErroresRepartidor).length;
    if (cantidadErrores > 0) return;

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
      ...(isRepartidor && { dni: ficha.dni }),
    };
    setIsLoading(true);
    try {
      await (isRepartidor ? onSubmit(dto, ficha) : onSubmit(dto));
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
          {isRepartidor && (
            <fieldset className={styles.grupo}>
              <legend>Datos del repartidor</legend>
              {CAMPOS_REPARTIDOR.map(({ campo, label, numerico }) => {
                const id = `repartidor-${campo}`;
                return (
                  <FormField
                    key={campo}
                    label={label}
                    htmlFor={id}
                    error={erroresRepartidor[campo]}
                  >
                    <input
                      id={id}
                      name={campo}
                      inputMode={numerico ? 'numeric' : undefined}
                      list={campo === 'tipoVehiculo' ? 'usuario-tipos-vehiculo' : undefined}
                      value={repartidor[campo]}
                      onChange={(e) => {
                        setRepartidor((r) => ({ ...r, [campo]: e.target.value }));
                        setErroresRepartidor((err) => ({ ...err, [campo]: undefined }));
                      }}
                      aria-invalid={!!erroresRepartidor[campo]}
                      aria-describedby={erroresRepartidor[campo] ? fieldErrorId(id) : undefined}
                    />
                  </FormField>
                );
              })}
              <datalist id="usuario-tipos-vehiculo">
                {TIPOS_VEHICULO.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </fieldset>
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
