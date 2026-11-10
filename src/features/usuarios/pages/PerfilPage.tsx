import { useEffect, useState } from 'react';
import { Card, Spinner } from '../../../shared/components';
import { toApiError } from '../../../shared/api/apiError';
import { useToast } from '../../../shared/notifications/useToast';
import { usuariosApi } from '../api/usuariosApi';
import { ROL_TEXTO, type UserResponse } from '../types';
import styles from './UsuarioPages.module.css';

/** /perfil — cualquier usuario logueado. Muestra los datos de /auth/me. */
export function PerfilPage() {
  const toast = useToast();
  const [usuario, setUsuario] = useState<UserResponse | null>(null);
  const [hayError, setHayError] = useState(false);

  useEffect(() => {
    let cancelado = false;
    usuariosApi
      .me()
      .then((u) => {
        if (!cancelado) setUsuario(u);
      })
      .catch((e: unknown) => {
        if (!cancelado) {
          toast.error(toApiError(e).message);
          setHayError(true);
        }
      });
    return () => {
      cancelado = true;
    };
  }, [toast]);

  return (
    <section className={styles.pagina}>
      <header className={styles.encabezado}>
        <h1 className={styles.titulo}>Mi perfil</h1>
      </header>
      {usuario ? (
        <Card className={styles.formulario}>
          <dl className={styles.datos}>
            <dt>Usuario</dt>
            <dd>{usuario.username}</dd>
            <dt>Email</dt>
            <dd>{usuario.email}</dd>
            <dt>Roles</dt>
            <dd>{usuario.roles.map((r) => ROL_TEXTO[r] ?? r).join(', ')}</dd>
          </dl>
        </Card>
      ) : (
        !hayError && <Spinner />
      )}
    </section>
  );
}
