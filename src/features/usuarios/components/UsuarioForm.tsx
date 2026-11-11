import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Button, FormField, fieldErrorId } from '../../../shared/components';
import type { Rol } from '../../../shared/auth/permissions';
import { TIPOS_VEHICULO, type RepartidorRequest } from '../../repartidores/types';
import { type ErroresRepartidor, validarRepartidor } from '../../repartidores/validation';
import { ROL_TEXTO, type RegistroRequest } from '../types';
import { validarUsuario, type UsuarioFormErrors, type UsuarioFormValues } from '../validacion';
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
  const [repartidor, setRepartidor] = useState(REPARTIDOR_VACIO);
  const [erroresRepartidor, setErroresRepartidor] = useState<ErroresRepartidor>({});
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const campo = e.target.name as keyof UsuarioFormValues;
    setValues((v) => ({ ...v, [campo]: e.target.value }));
    // Borra el error del campo apenas el usuario lo corrige.
    setErrores((err) => ({ ...err, [campo]: undefined }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const conRepartidor = conRol && rol === 'REPARTIDOR';
    const ficha: RepartidorRequest = {
      dni: repartidor.dni.trim(),
      nombre: repartidor.nombre.trim(),
      apellido: repartidor.apellido.trim(),
      telefono: repartidor.telefono.trim(),
      tipoVehiculo: repartidor.tipoVehiculo.trim().toUpperCase(),
    };
    const nuevosErrores = validarUsuario(values);
    const nuevosErroresRepartidor = conRepartidor ? validarRepartidor(ficha) : {};
    setErrores(nuevosErrores);
    setErroresRepartidor(nuevosErroresRepartidor);
    if (Object.keys(nuevosErrores).length + Object.keys(nuevosErroresRepartidor).length > 0) return;

    const dto: RegistroRequest = {
      username: values.username.trim(),
      email: values.email.trim(),
      password: values.password,
      ...(conRol && { roles: [rol] }),
      ...(conRepartidor && { dni: ficha.dni }),
    };
    setIsLoading(true);
    try {
      await (conRepartidor ? onSubmit(dto, ficha) : onSubmit(dto));
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

      <Button type="submit" loading={isLoading}>
        {submitLabel}
      </Button>
    </form>
  );
}
