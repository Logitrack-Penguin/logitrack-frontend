import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { toApiError } from '../../../shared/api/apiError';
import { Button, Card, FormField, fieldErrorId } from '../../../shared/components';
import { useToast } from '../../../shared/notifications/useToast';
import { enviosApi } from '../api/enviosApi';
import { formatearTarifa } from '../formato';
import {
  armarEnvioRequest,
  FORMULARIO_VACIO,
  validarEnvio,
  type FormularioEnvio,
} from '../validarEnvio';
import styles from './EnvioPages.module.css';

interface Campo {
  clave: string;
  label: string;
  numerico?: boolean;
  hint?: string;
}

const PAQUETE: Campo[] = [
  { clave: 'peso', label: 'Peso (kg)', numerico: true },
  { clave: 'dimensiones.ancho', label: 'Ancho (cm)', numerico: true },
  { clave: 'dimensiones.alto', label: 'Alto (cm)', numerico: true },
  { clave: 'dimensiones.largo', label: 'Largo (cm)', numerico: true },
];

const direccion = (d: string): Campo[] => [
  { clave: `${d}.calle`, label: 'Calle' },
  { clave: `${d}.numero`, label: 'Número' },
  { clave: `${d}.ciudad`, label: 'Ciudad' },
  { clave: `${d}.codigoPostal`, label: 'Código postal' },
  { clave: `${d}.observaciones`, label: 'Observaciones (opcional)' },
];

const GRUPOS: { titulo: string; campos: Campo[] }[] = [
  { titulo: 'Paquete', campos: PAQUETE },
  { titulo: 'Origen', campos: direccion('direccionOrigen') },
  { titulo: 'Destino', campos: direccion('direccionDestino') },
];

/** /envios/nuevo — ADMIN y CLIENTE ('envios.crear'). */
export function EnvioCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [valores, setValores] = useState<FormularioEnvio>(FORMULARIO_VACIO);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setValores((v) => ({ ...v, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const dto = armarEnvioRequest(valores);
    const encontrados = validarEnvio(dto);
    setErrores(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    setIsLoading(true);
    try {
      const envio = await enviosApi.crear(dto);
      toast.success(
        `Envío ${envio.codigoSeguimiento} creado. Tarifa: ${formatearTarifa(envio.tarifa)}.`,
      );
      navigate(`/envios/${envio.idEnvio}`);
    } catch (e) {
      const error = toApiError(e);
      if (error.fieldErrors) setErrores(error.fieldErrors);
      // Un DNI sin cliente registrado vuelve como 404 con el mensaje del backend.
      toast.error(error.message);
      setIsLoading(false);
    }
  }

  const campo = ({ clave, label, numerico, hint }: Campo) => (
    <FormField key={clave} label={label} htmlFor={clave} error={errores[clave]} hint={hint}>
      <input
        id={clave}
        name={clave}
        className={styles.input}
        type={numerico ? 'number' : 'text'}
        min={numerico ? 0 : undefined}
        step={numerico ? 'any' : undefined}
        inputMode={numerico ? 'decimal' : undefined}
        value={valores[clave]}
        onChange={handleChange}
        aria-invalid={!!errores[clave]}
        aria-describedby={errores[clave] ? fieldErrorId(clave) : undefined}
      />
    </FormField>
  );

  return (
    <section className={styles.pagina}>
      <h1 className={styles.titulo}>Nuevo envío</h1>
      <form className={styles.alta} onSubmit={handleSubmit} noValidate>
        <div className={styles.secciones}>
          {GRUPOS.map((g) => (
            <Card key={g.titulo}>
              <fieldset className={styles.grupo}>
                <legend className={styles.subtitulo}>{g.titulo}</legend>
                {g.campos.map(campo)}
              </fieldset>
            </Card>
          ))}
          <Card>
            <fieldset className={styles.grupo}>
              <legend className={styles.subtitulo}>Cliente</legend>
              {campo({
                clave: 'dniCliente',
                label: 'DNI del cliente',
                hint: 'El DNI con el que el cliente está registrado (8 dígitos).',
              })}
            </fieldset>
          </Card>
        </div>
        <div className={styles.botones}>
          <Button variant="secondary" onClick={() => navigate('/envios')} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" loading={isLoading}>
            Crear envío
          </Button>
        </div>
      </form>
    </section>
  );
}
