// "Mis datos": si el token trae el DNI del cliente (claim "dni"), abre directo su ficha. El backend
// solo le deja ver a un CLIENTE su propia ficha, así que sin DNI no hay nada que buscar. Un ADMIN
// (también tiene 'clientes.ver') sin DNI propio puede buscar cualquier ficha por DNI.
import { type FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { useAuth } from '../../../shared/auth/useAuth';
import { Button, Card, EmptyState, FormField, fieldErrorId } from '../../../shared/components';
import styles from './ClientePages.module.css';

export function MisDatosPage() {
  const navigate = useNavigate();
  const { sesion, logout } = useAuth();
  const [dni, setDni] = useState('');
  const [error, setError] = useState<string>();

  const roles = sesion?.roles ?? [];
  const esSoloCliente = roles.includes('CLIENTE') && !roles.includes('ADMIN');

  if (sesion?.dni) return <Navigate to={`/clientes/${sesion.dni}`} replace />;

  if (esSoloCliente) {
    return (
      <EmptyState
        message="Tu cuenta todavía no está vinculada a tus datos de cliente. Volvé a iniciar sesión; si sigue igual, pedile a un administrador que revise que el email de tu cuenta sea el mismo que el de tu ficha de cliente."
        action={
          <Button variant="secondary" onClick={logout}>
            Volver a iniciar sesión
          </Button>
        }
      />
    );
  }

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
          <FormField label="DNI" htmlFor="mis-datos-dni" error={error}>
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
            <Button type="submit">Ver datos</Button>
          </div>
        </form>
      </Card>
    </section>
  );
}
