// Formulario compartido por alta y edición de repartidores.
import { type FormEvent, useState } from 'react';
import { toApiError } from '../../../shared/api/apiError';
import { Button, FormField, fieldErrorId } from '../../../shared/components';
import { useToast } from '../../../shared/notifications/useToast';
import { TIPOS_VEHICULO, type RepartidorRequest } from '../types';
import { type ErroresRepartidor, validarRepartidor } from '../validation';
import styles from '../pages/RepartidorPages.module.css';

const VACIO: RepartidorRequest = {
  dni: '',
  nombre: '',
  apellido: '',
  telefono: '',
  tipoVehiculo: '',
};

const CAMPOS: { campo: keyof RepartidorRequest; label: string; inputMode?: 'numeric' }[] = [
  { campo: 'dni', label: 'DNI', inputMode: 'numeric' },
  { campo: 'nombre', label: 'Nombre' },
  { campo: 'apellido', label: 'Apellido' },
  { campo: 'telefono', label: 'Teléfono', inputMode: 'numeric' },
  { campo: 'tipoVehiculo', label: 'Vehículo' },
];

/** En edición, el backend solo actualiza teléfono y vehículo: el resto queda de solo lectura. */
const SOLO_LECTURA_EN_EDICION: (keyof RepartidorRequest)[] = ['dni', 'nombre', 'apellido'];

interface RepartidorFormProps {
  inicial?: RepartidorRequest;
  isEdicion?: boolean;
  submitLabel: string;
  onSubmit: (dto: RepartidorRequest) => Promise<void>;
}

export function RepartidorForm({
  inicial = VACIO,
  isEdicion = false,
  submitLabel,
  onSubmit,
}: RepartidorFormProps) {
  const toast = useToast();
  const [valores, setValores] = useState<RepartidorRequest>(inicial);
  const [errores, setErrores] = useState<ErroresRepartidor>({});
  const [isGuardando, setIsGuardando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const dto: RepartidorRequest = {
      dni: valores.dni.trim(),
      nombre: valores.nombre.trim(),
      apellido: valores.apellido.trim(),
      telefono: valores.telefono.trim(),
      tipoVehiculo: valores.tipoVehiculo.trim().toUpperCase(),
    };
    const nuevos = validarRepartidor(dto);
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;

    setIsGuardando(true);
    try {
      await onSubmit(dto);
    } catch (err) {
      const error = toApiError(err);
      if (error.fieldErrors) setErrores(error.fieldErrors as ErroresRepartidor);
      toast.error(error.message);
      setIsGuardando(false);
    }
  }

  return (
    <form className={styles.formulario} onSubmit={handleSubmit} noValidate>
      {CAMPOS.map(({ campo, label, inputMode }) => {
        const id = `repartidor-${campo}`;
        return (
          <FormField key={campo} label={label} htmlFor={id} error={errores[campo]}>
            <input
              id={id}
              name={campo}
              inputMode={inputMode}
              list={campo === 'tipoVehiculo' ? 'tipos-vehiculo' : undefined}
              readOnly={isEdicion && SOLO_LECTURA_EN_EDICION.includes(campo)}
              value={valores[campo]}
              onChange={(e) => setValores((v) => ({ ...v, [campo]: e.target.value }))}
              aria-invalid={!!errores[campo]}
              aria-describedby={errores[campo] ? fieldErrorId(id) : undefined}
            />
          </FormField>
        );
      })}
      <datalist id="tipos-vehiculo">
        {TIPOS_VEHICULO.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>
      <div>
        <Button type="submit" loading={isGuardando}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
