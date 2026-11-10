import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { toApiError } from '../../../shared/api/apiError';
import { Button, Card, FormField, fieldErrorId } from '../../../shared/components';
import { useToast } from '../../../shared/notifications/useToast';
import { enviosApi } from '../api/enviosApi';
import styles from './EnvioPages.module.css';

const CAMPO = 'codigo-seguimiento';

/** /envios/seguimiento — busca un envío por su código y abre el detalle. */
export function EnvioSeguimientoPage() {
  const navigate = useNavigate();
  const toast = useToast();
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
    <section className={styles.pagina}>
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
