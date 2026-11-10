import { useNavigate } from 'react-router';
import { Button } from '../../../shared/components';
import styles from '../pages/ClientePages.module.css';

/** Botón para volver a otra pantalla (listado o detalle). */
export function BotonVolver({ to, children }: { to: string; children: string }) {
  const navigate = useNavigate();
  return (
    <Button variant="secondary" size="sm" className={styles.volver} onClick={() => navigate(to)}>
      ← {children}
    </Button>
  );
}
