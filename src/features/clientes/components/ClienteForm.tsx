// Formulario compartido por alta y edición de clientes.
import { type FormEvent, useState } from 'react';
import { toApiError } from '../../../shared/api/apiError';
import { Button, FormField, fieldErrorId } from '../../../shared/components';
import { useToast } from '../../../shared/notifications/useToast';
import type { ClienteRequest } from '../types';
import { type ErroresCliente, validarCliente } from '../validation';
import styles from '../pages/ClientePages.module.css';

const VACIO: ClienteRequest = { dni: '', nombre: '', apellido: '', email: '', telefono: '' };

const CAMPOS: {
  campo: keyof ClienteRequest;
  label: string;
  type?: 'email';
  inputMode?: 'numeric';
}[] = [
  { campo: 'dni', label: 'DNI', inputMode: 'numeric' },
  { campo: 'nombre', label: 'Nombre' },
  { campo: 'apellido', label: 'Apellido' },
  { campo: 'email', label: 'Email', type: 'email' },
  { campo: 'telefono', label: 'Teléfono', inputMode: 'numeric' },
];

/** En edición, el backend no cambia DNI ni apellido: quedan de solo lectura. */
const SOLO_LECTURA_EN_EDICION: (keyof ClienteRequest)[] = ['dni', 'apellido'];

interface ClienteFormProps {
  inicial?: ClienteRequest;
  isEdicion?: boolean;
  submitLabel: string;
  onSubmit: (dto: ClienteRequest) => Promise<void>;
}

export function ClienteForm({
  inicial = VACIO,
  isEdicion = false,
  submitLabel,
  onSubmit,
}: ClienteFormProps) {
  const toast = useToast();
  const [valores, setValores] = useState<ClienteRequest>(inicial);
  const [errores, setErrores] = useState<ErroresCliente>({});
  const [isGuardando, setIsGuardando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const dto: ClienteRequest = {
      dni: valores.dni.trim(),
      nombre: valores.nombre.trim(),
      apellido: valores.apellido.trim(),
      email: valores.email.trim(),
      telefono: valores.telefono.trim(),
    };
    const nuevos = validarCliente(dto);
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;

    setIsGuardando(true);
    try {
      await onSubmit(dto);
    } catch (err) {
      const error = toApiError(err);
      if (error.fieldErrors) setErrores(error.fieldErrors as ErroresCliente);
      toast.error(error.message);
      setIsGuardando(false);
    }
  }

  return (
    <form className={styles.formulario} onSubmit={handleSubmit} noValidate>
      {CAMPOS.map(({ campo, label, type, inputMode }) => {
        const id = `cliente-${campo}`;
        return (
          <FormField key={campo} label={label} htmlFor={id} error={errores[campo]}>
            <input
              id={id}
              name={campo}
              type={type ?? 'text'}
              inputMode={inputMode}
              readOnly={isEdicion && SOLO_LECTURA_EN_EDICION.includes(campo)}
              value={valores[campo]}
              onChange={(e) => setValores((v) => ({ ...v, [campo]: e.target.value }))}
              aria-invalid={!!errores[campo]}
              aria-describedby={errores[campo] ? fieldErrorId(id) : undefined}
            />
          </FormField>
        );
      })}
      <div>
        <Button type="submit" loading={isGuardando}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
