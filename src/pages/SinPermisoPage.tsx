import { Link } from 'react-router';
import styles from './ErrorPage.module.css';

export function SinPermisoPage() {
  return (
    <section className={styles.pagina}>
      <h1 className={styles.titulo}>Sin permiso</h1>
      <p className={styles.texto}>No tenés permisos para acceder a esta sección.</p>
      <Link to="/">Volver al inicio</Link>
    </section>
  );
}
