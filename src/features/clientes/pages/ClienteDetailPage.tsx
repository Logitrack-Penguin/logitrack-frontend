import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toApiError } from '../../../shared/api/apiError';
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  IconEdit,
  IconTrash,
  Spinner,
} from '../../../shared/components';
import { useAuth } from '../../../shared/auth/useAuth';
import { Can } from '../../../shared/guards/Can';
import { useAsync } from '../../../shared/hooks/useAsync';
import { useToast } from '../../../shared/notifications/useToast';
import { clientesApi } from '../api/clientesApi';
import { BotonVolver } from '../components/BotonVolver';
import styles from './ClientePages.module.css';

export function ClienteDetailPage() {
  const { dni = '' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { tienePermiso } = useAuth();
  const { data, error, loading } = useAsync(() => clientesApi.obtener(dni), [dni]);
  const [isConfirmando, setIsConfirmando] = useState(false);
  const [isEliminando, setIsEliminando] = useState(false);

  // ADMIN vuelve al listado; CLIENTE no lo puede ver, vuelve a "Mis datos".
  const volver = tienePermiso('clientes.gestionar') ? (
    <BotonVolver to="/clientes">Volver al listado</BotonVolver>
  ) : (
    <BotonVolver to="/clientes/mis-datos">Volver</BotonVolver>
  );

  if (loading) return <Spinner />;
  if (error || !data)
    return (
      <section>
        {volver}
        <EmptyState message={error?.message ?? 'No se encontró el cliente.'} />
      </section>
    );

  async function handleEliminar() {
    setIsEliminando(true);
    try {
      await clientesApi.eliminar(dni);
      toast.success('Cliente eliminado.');
      navigate('/clientes');
    } catch (e) {
      toast.error(toApiError(e).message);
      setIsEliminando(false);
      setIsConfirmando(false);
    }
  }

  return (
    <section>
      {volver}
      <header className={styles.encabezado}>
        <h1>{data.nombreCompleto}</h1>
      </header>

      <Card>
        <dl className={styles.datos}>
          <dt>DNI</dt>
          <dd>{data.dni}</dd>
          <dt>Email</dt>
          <dd>{data.email}</dd>
          <dt>Teléfono</dt>
          <dd>{data.telefono}</dd>
          <dt>Alta</dt>
          <dd>{new Date(data.fechaCreacion).toLocaleDateString('es-AR')}</dd>
        </dl>

        <Can permiso="clientes.gestionar">
          <div className={styles.acciones}>
            <Button
              variant="secondary"
              icon={<IconEdit />}
              onClick={() => navigate(`/clientes/${dni}/editar`)}
            >
              Editar
            </Button>
            <Button variant="danger" icon={<IconTrash />} onClick={() => setIsConfirmando(true)}>
              Eliminar
            </Button>
          </div>
        </Can>
      </Card>

      <ConfirmDialog
        open={isConfirmando}
        title="Eliminar cliente"
        message={
          <>
            ¿Eliminar a <strong>{data.nombreCompleto}</strong>? Esta acción no se puede deshacer.
          </>
        }
        confirmLabel="Eliminar"
        danger
        loading={isEliminando}
        onConfirm={handleEliminar}
        onCancel={() => setIsConfirmando(false)}
      />
    </section>
  );
}
