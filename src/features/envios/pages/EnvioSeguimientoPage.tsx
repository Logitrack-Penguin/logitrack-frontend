import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { toApiError } from '../../../shared/api/apiError';
import { useAuth } from '../../../shared/auth/useAuth';
import { Button, Card, FormField, fieldErrorId } from '../../../shared/components';
import { useToast } from '../../../shared/notifications/useToast';
import { enviosApi } from '../api/enviosApi';
import { dniDeRemitente } from '../clienteActual';
import { puedeVerEnvio } from '../formato';
import { esVisible, useDniCliente } from '../useDniCliente';
import styles from './EnvioPages.module.css';

// Mismo texto que el 404 del backend, para no revelar que el código existe.
const NO_ENCONTRADO = 'Envío no encontrado';

const CAMPO = 'codigo-seguimiento';

/** /envios/seguimiento — busca un envío por su código y abre el detalle. */
export function EnvioSeguimientoPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { sesion } = useAuth();
  const cliente = useDniCliente();
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const buscado = codigo.trim();
    if (!buscado) {
      setError('Ingresá un código de seguimiento.');
      return;
    }
    setError(undefined);
    setIsLoading(true);
    try {
      const envio = await enviosApi.buscarPorCodigo(buscado);
      // No se puede abrir el envío de otro cliente o de otro repartidor aunque se tenga el código.
      if (!esVisible(cliente, dniDeRemitente(envio.remitente)) || !puedeVerEnvio(envio, sesion)) {
        setError(NO_ENCONTRADO);
        setIsLoading(false);
        return;
      }
      navigate(`/envios/${envio.idEnvio}`);
    } catch (e) {
      const apiError = toApiError(e);
      // Un código inexistente es un error del campo, con el mensaje del backend.
      if (apiError.status === 404) setError(apiError.message);
      else toast.error(apiError.message);
      setIsLoading(false);
    }
  }

  return (
    <section className={`${styles.pagina} ${styles.centrada}`}>
      <h1 className={styles.titulo}>Seguimiento</h1>
      <Card className={styles.formulario}>
        <form className={styles.formulario} onSubmit={handleSubmit} noValidate>
          <FormField label="Código de seguimiento" htmlFor={CAMPO} error={error}>
            <input
              id={CAMPO}
              className={styles.input}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              aria-invalid={!!error}
              aria-describedby={error ? fieldErrorId(CAMPO) : undefined}
              autoComplete="off"
            />
          </FormField>
          <Button type="submit" loading={isLoading}>
            Buscar
          </Button>
        </form>
      </Card>
    </section>
  );
}
