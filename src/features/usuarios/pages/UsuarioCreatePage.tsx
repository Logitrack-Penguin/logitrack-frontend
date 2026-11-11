import { useNavigate } from 'react-router';
import { Card } from '../../../shared/components';
import { toApiError } from '../../../shared/api/apiError';
import { useToast } from '../../../shared/notifications/useToast';
import { usuariosApi } from '../api/usuariosApi';
import { UsuarioForm } from '../components/UsuarioForm';
import type { RegistroRequest } from '../types';
import styles from './UsuarioPages.module.css';

/**
 * /usuarios/nuevo — solo ADMIN. Usa el mismo endpoint que el registro: como el interceptor adjunta
 * el token del ADMIN, la UI ofrece REPARTIDOR o CLIENTE.
 */
export function UsuarioCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();

  async function handleSubmit(dto: RegistroRequest) {
    try {
      const creado = await usuariosApi.registrar(dto);
      toast.success(`Usuario ${creado.username} creado.`);
    } catch (e) {
      toast.error(toApiError(e).message);
      throw e;
    }
    navigate('/usuarios');
  }

  return (
    <section className={`${styles.pagina} ${styles.centrada}`}>
      <header className={styles.encabezado}>
        <h1 className={styles.titulo}>Nuevo usuario</h1>
      </header>
      <Card className={styles.formulario}>
        <UsuarioForm conRol submitLabel="Crear usuario" onSubmit={handleSubmit} />
      </Card>
    </section>
  );
}
