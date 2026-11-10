// "Mis datos" para CLIENTE: el gateway le permite ver un cliente por DNI, pero la sesión no trae
// su DNI, así que se lo pedimos y navegamos al detalle.
import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, Card, FormField, fieldErrorId } from '../../../shared/components';
import styles from './ClientePages.module.css';

export function MisDatosPage() {
  const navigate = useNavigate();
  const [dni, setDni] = useState('');
  const [error, setError] = useState<string>();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const valor = dni.trim();
    if (!/^\d{8}$/.test(valor)) {
      setError('El DNI debe tener 8 dígitos.');
      return;
    }
    navigate(`/clientes/${valor}`);
  }

  return (
    <section className={styles.paginaFormulario}>
      <header className={styles.encabezado}>
        <h1>Mis datos</h1>
      </header>
      <Card>
        <form className={styles.formulario} onSubmit={handleSubmit} noValidate>
          <FormField label="Tu DNI" htmlFor="mis-datos-dni" error={error}>
            <input
              id="mis-datos-dni"
              inputMode="numeric"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              aria-invalid={!!error}
              aria-describedby={error ? fieldErrorId('mis-datos-dni') : undefined}
            />
          </FormField>
          <div>
            <Button type="submit">Ver mis datos</Button>
          </div>
        </form>
      </Card>
    </section>
  );
}
