import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toApiError } from '../../../shared/api/apiError';
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  IconCheck,
  IconEdit,
  IconPower,
  IconTrash,
  Spinner,
  StatusBadge,
} from '../../../shared/components';
import { Can } from '../../../shared/guards/Can';
import { useAsync } from '../../../shared/hooks/useAsync';
import { useToast } from '../../../shared/notifications/useToast';
import { repartidoresApi } from '../api/repartidoresApi';
import { BotonVolver } from '../components/BotonVolver';
import type { RepartidorResponse } from '../types';
import styles from './RepartidorPages.module.css';

export function RepartidorDetailPage() {
  const { dni = '' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data, error, loading } = useAsync(() => repartidoresApi.obtener(dni), [dni]);

  // Copia local para reflejar el cambio de estado sin volver a pedir el repartidor.
  const [actualizado, setActualizado] = useState<RepartidorResponse>();
  const [disponible, setDisponible] = useState<boolean>();
  const [isVerificando, setIsVerificando] = useState(false);
  const [isCambiando, setIsCambiando] = useState(false);
  const [isConfirmando, setIsConfirmando] = useState(false);
  const [isEliminando, setIsEliminando] = useState(false);

  if (loading) return <Spinner />;
  if (error || !data)
    return <EmptyState message={error?.message ?? 'No se encontró el repartidor.'} />;

  const repartidor = actualizado?.dni === data.dni ? actualizado : data;
  const isActivo = repartidor.estadoRepartidor === 'ACTIVO';

  async function handleVerificar() {
    setIsVerificando(true);
    try {
      setDisponible(await repartidoresApi.estaDisponible(dni));
    } catch (e) {
      toast.error(toApiError(e).message);
    } finally {
      setIsVerificando(false);
    }
  }

  async function handleCambiarEstado() {
    setIsCambiando(true);
    try {
      const r = await repartidoresApi.cambiarEstado(dni);
      setActualizado(r);
      setDisponible(undefined);
      toast.success(
        r.estadoRepartidor === 'ACTIVO' ? 'Repartidor activado.' : 'Repartidor desactivado.',
      );
    } catch (e) {
      toast.error(toApiError(e).message);
    } finally {
      setIsCambiando(false);
    }
  }

  async function handleEliminar() {
    setIsEliminando(true);
    try {
      await repartidoresApi.eliminar(dni);
      toast.success('Repartidor eliminado.');
      navigate('/repartidores');
    } catch (e) {
      toast.error(toApiError(e).message);
      setIsEliminando(false);
      setIsConfirmando(false);
    }
  }

  return (
    <section>
      <BotonVolver to="/repartidores">Volver al listado</BotonVolver>
      <header className={styles.encabezado}>
        <h1>{repartidor.nombreCompleto}</h1>
        <StatusBadge estado={repartidor.estadoRepartidor} />
      </header>

      <Card>
        <dl className={styles.datos}>
          <dt>DNI</dt>
          <dd>{repartidor.dni}</dd>
          <dt>Teléfono</dt>
          <dd>{repartidor.telefono}</dd>
          <dt>Vehículo</dt>
          <dd>{repartidor.tipoVehiculo}</dd>
          <dt>Alta</dt>
          <dd>{new Date(repartidor.fechaCreacion).toLocaleDateString('es-AR')}</dd>
        </dl>

        <div className={styles.acciones}>
          <Button
            variant="secondary"
            icon={<IconCheck />}
            loading={isVerificando}
            onClick={handleVerificar}
          >
            Verificar disponibilidad
          </Button>
          {disponible !== undefined && (
            <span className={styles.disponibilidad} role="status">
              {disponible ? 'Disponible' : 'No disponible'}
            </span>
          )}

          <Can permiso="repartidores.cambiarEstado">
            <Button
              variant="secondary"
              icon={<IconPower />}
              loading={isCambiando}
              onClick={handleCambiarEstado}
            >
              {isActivo ? 'Desactivar' : 'Activar'}
            </Button>
          </Can>

          <Can permiso="repartidores.gestionar">
            <Button
              variant="secondary"
              icon={<IconEdit />}
              onClick={() => navigate(`/repartidores/${dni}/editar`)}
            >
              Editar
            </Button>
            <Button variant="danger" icon={<IconTrash />} onClick={() => setIsConfirmando(true)}>
              Eliminar
            </Button>
          </Can>
        </div>
      </Card>

      <ConfirmDialog
        open={isConfirmando}
        title="Eliminar repartidor"
        message={
          <>
            ¿Eliminar a <strong>{repartidor.nombreCompleto}</strong>? Esta acción no se puede
            deshacer.
            <br />
            Atención: si tiene envíos asignados, esos envíos quedan con un repartidor que ya no
            existe.
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
