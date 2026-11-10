import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, type Location } from 'react-router';
import { toApiError } from '../../../shared/api/apiError';
import { useAuth } from '../../../shared/auth/useAuth';
import { Button, Card, FormField } from '../../../shared/components';
import styles from './LoginPage.module.css';

// Lo que puede llegar en location.state:
// - from: la ruta privada que se pidió sin sesión (RequireAuth).
// - motivo: por qué se cerró la sesión (main.tsx, ante un 401/403).
// - username: el usuario recién registrado (RegistroPage).
interface LoginState {
  from?: Location;
  motivo?: 'expirada' | 'sin-permiso';
  username?: string;
}

const AVISOS: Record<NonNullable<LoginState['motivo']>, string> = {
  expirada: 'Tu sesión expiró. Volvé a ingresar.',
  'sin-permiso': 'Se cerró la sesión porque no tenías permiso para esa acción.',
};

export function LoginPage() {
  const { sesion, login } = useAuth();
  const state = (useLocation().state ?? {}) as LoginState;
  const [username, setUsername] = useState(state.username ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Con sesión (ya logueado o recién logueado) va a la ruta pedida o a /envios.
  if (sesion) {
    const { from } = state;
    const destino = from ? `${from.pathname}${from.search}${from.hash}` : '/envios';
    return <Navigate to={destino} replace />;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(toApiError(err).message);
      setIsLoading(false);
    }
  }

  return (
    <main className={styles.pagina}>
      <Card className={styles.tarjeta}>
        <h1 className={styles.titulo}>LogiTrack</h1>
        <p className={styles.subtitulo}>Ingresá con tu usuario.</p>

        {state.motivo && (
          <p className={styles.aviso} role="status">
            {AVISOS[state.motivo]}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <FormField label="Usuario" htmlFor="username">
            <input
              id="username"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </FormField>
          <FormField label="Contraseña" htmlFor="password">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </FormField>
          <Button
            type="submit"
            className={styles.boton}
            loading={isLoading}
            disabled={!username.trim() || !password}
          >
            {isLoading ? 'Ingresando…' : 'Ingresar'}
          </Button>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
        </form>

        <p className={styles.pie}>
          ¿No tenés cuenta? <Link to="/registro">Registrate</Link>
        </p>
      </Card>
    </main>
  );
}
