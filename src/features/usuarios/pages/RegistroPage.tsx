import { Link, useNavigate } from 'react-router';
import { Card } from '../../../shared/components';
import { toApiError } from '../../../shared/api/apiError';
import { useToast } from '../../../shared/notifications/useToast';
import { usuariosApi } from '../api/usuariosApi';
import { UsuarioForm } from '../components/UsuarioForm';
import type { RegistroRequest } from '../types';
import styles from './RegistroPage.module.css';

/** /registro — pública. Crea un usuario CLIENTE (el backend lo asigna porque no se mandan roles). */
export function RegistroPage() {
  const navigate = useNavigate();
  const toast = useToast();

  async function handleSubmit(dto: RegistroRequest) {
    try {
      await usuariosApi.registrar(dto);
    } catch (e) {
      toast.error(toApiError(e).message); // 409: "El nombre de usuario o el correo ya está en uso"
      throw e;
    }
    toast.success('Cuenta creada, ya podés ingresar.');
    navigate('/login', { replace: true, state: { username: dto.username } });
  }

  return (
    <main className={styles.pagina}>
      <Card className={styles.tarjeta}>
        <h1 className={styles.titulo}>Crear cuenta</h1>
        <p className={styles.subtitulo}>Registrate como cliente para seguir tus envíos.</p>
        <UsuarioForm submitLabel="Crear cuenta" onSubmit={handleSubmit} />
        <p className={styles.pie}>
          ¿Ya tenés cuenta? <Link to="/login">Ingresar</Link>
        </p>
      </Card>
    </main>
  );
}
