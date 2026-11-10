import { Link } from 'react-router';
import styles from './ErrorPage.module.css';

export function NotFoundPage() {
  return (
    <section className={styles.pagina}>
      <h1 className={styles.titulo}>Página no encontrada</h1>
      <p className={styles.texto}>La dirección que buscás no existe.</p>
      <Link to="/">Volver al inicio</Link>
    </section>
  );
}
