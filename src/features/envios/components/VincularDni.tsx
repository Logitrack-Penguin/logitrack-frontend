import { useState, type FormEvent } from 'react';
import { Button, Card, FormField, fieldErrorId } from '../../../shared/components';
import styles from '../pages/EnvioPages.module.css';

const CAMPO = 'dni-cliente-vincular';

interface VincularDniProps {
  vincular(dni: string): Promise<string>;
}

/** Le pide el DNI al CLIENTE la primera vez, para mostrarle solo sus envíos. */
export function VincularDni({ vincular }: VincularDniProps) {
  const [dni, setDni] = useState('');
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const valor = dni.trim();
    if (!/^\d{8}$/.test(valor)) {
      setError('El DNI debe tener 8 dígitos.');
      return;
    }
    setError(undefined);
    setIsLoading(true);
    try {
      await vincular(valor);
      // Al vincularse, la guardia de rutas muestra la pantalla pedida y este componente se desmonta.
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ocurrió un error inesperado.');
      setIsLoading(false);
    }
  }

  return (
    <section className={styles.pagina}>
      <h1 className={styles.titulo}>Tus envíos</h1>
      <Card className={styles.formulario}>
        <form className={styles.formulario} onSubmit={handleSubmit} noValidate>
          <p className={styles.mensaje}>
            Para ver tus envíos, ingresá el DNI con el que estás registrado como cliente. Lo
            verificamos con el email de tu cuenta.
          </p>
          <FormField label="Tu DNI" htmlFor={CAMPO} error={error}>
            <input
              id={CAMPO}
              className={styles.input}
              inputMode="numeric"
              autoComplete="off"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              aria-invalid={!!error}
              aria-describedby={error ? fieldErrorId(CAMPO) : undefined}
            />
          </FormField>
          <Button type="submit" loading={isLoading}>
            Continuar
          </Button>
        </form>
      </Card>
    </section>
  );
}
