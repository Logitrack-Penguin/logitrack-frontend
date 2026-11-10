import styles from './Spinner.module.css';

export function Spinner() {
  return (
    <div className={styles.contenedor} role="status">
      <span className={styles.spinner} aria-hidden="true" />
      <span className={styles.oculto}>Cargando…</span>
    </div>
  );
}
