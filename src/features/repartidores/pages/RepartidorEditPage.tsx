import { useNavigate, useParams } from 'react-router';
import { Card, EmptyState, Spinner } from '../../../shared/components';
import { useAsync } from '../../../shared/hooks/useAsync';
import { useToast } from '../../../shared/notifications/useToast';
import { repartidoresApi } from '../api/repartidoresApi';
import { BotonVolver } from '../components/BotonVolver';
import { RepartidorForm } from '../components/RepartidorForm';
import { aRequest } from '../validation';
import styles from './RepartidorPages.module.css';

export function RepartidorEditPage() {
  const { dni = '' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data, error, loading } = useAsync(() => repartidoresApi.obtener(dni), [dni]);

  if (loading) return <Spinner />;
  if (error || !data)
    return <EmptyState message={error?.message ?? 'No se encontró el repartidor.'} />;

  return (
    <section className={styles.paginaFormulario}>
      <BotonVolver to={`/repartidores/${dni}`}>Volver al detalle</BotonVolver>
      <header className={styles.encabezado}>
        <h1>Editar repartidor</h1>
      </header>
      <Card>
        <RepartidorForm
          isEdicion
          inicial={aRequest(data)}
          submitLabel="Guardar cambios"
          onSubmit={async (dto) => {
            // Se manda el DTO completo: el backend valida todos los campos aunque solo cambie teléfono y vehículo.
            await repartidoresApi.actualizar(dni, dto);
            toast.success('Repartidor actualizado.');
            navigate(`/repartidores/${dni}`);
          }}
        />
      </Card>
    </section>
  );
}
