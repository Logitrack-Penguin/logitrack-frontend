import { useNavigate } from 'react-router';
import { Card } from '../../../shared/components';
import { toApiError } from '../../../shared/api/apiError';
import { useToast } from '../../../shared/notifications/useToast';
import { repartidoresApi } from '../../repartidores/api/repartidoresApi';
import type { RepartidorRequest } from '../../repartidores/types';
import { usuariosApi } from '../api/usuariosApi';
import { UsuarioForm } from '../components/UsuarioForm';
import type { RegistroRequest } from '../types';
import styles from './UsuarioPages.module.css';

/**
 * /usuarios/nuevo — solo ADMIN. Usa el mismo endpoint que el registro: como el interceptor adjunta
 * el token del ADMIN, la UI ofrece REPARTIDOR o CLIENTE.
 *
 * Alta unificada de repartidor (LT4-40): con rol REPARTIDOR se crean, en este orden,
 * 1) la ficha en courier (si el DNI o el teléfono ya existen, se corta acá) y
 * 2) el usuario en security con el mismo DNI (así el token lo lleva y courier sabe quién es).
 * Si falla el paso 2, se borra la ficha del paso 1 para no dejar un repartidor sin usuario.
 */
export function UsuarioCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();

  async function deshacerRepartidor(dni: string) {
    try {
      await repartidoresApi.eliminar(dni);
    } catch {
      toast.error(
        `No se pudo deshacer el alta del repartidor ${dni}. Eliminalo desde la sección Repartidores.`,
      );
    }
  }

  async function handleSubmit(dto: RegistroRequest, repartidor?: RepartidorRequest) {
    if (repartidor) {
      try {
        await repartidoresApi.crear(repartidor);
      } catch (e) {
        toast.error(toApiError(e).message);
        throw e;
      }
    }

    try {
      const creado = await usuariosApi.registrar(dto);
      toast.success(
        repartidor ? `Repartidor ${creado.username} creado.` : `Usuario ${creado.username} creado.`,
      );
    } catch (e) {
      toast.error(toApiError(e).message);
      if (repartidor) await deshacerRepartidor(repartidor.dni);
      throw e;
    }
    navigate('/usuarios');
  }

  return (
    <section className={styles.pagina}>
      <header className={styles.encabezado}>
        <h1 className={styles.titulo}>Nuevo usuario</h1>
      </header>
      <Card className={styles.formulario}>
        <UsuarioForm conRol submitLabel="Crear usuario" onSubmit={handleSubmit} />
      </Card>
    </section>
  );
}
