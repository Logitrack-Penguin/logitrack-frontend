import { useNavigate, useParams } from 'react-router';
import { Card, EmptyState, Spinner } from '../../../shared/components';
import { useAsync } from '../../../shared/hooks/useAsync';
import { useToast } from '../../../shared/notifications/useToast';
import { clientesApi } from '../api/clientesApi';
import { BotonVolver } from '../components/BotonVolver';
import { ClienteForm } from '../components/ClienteForm';
import { aRequest } from '../validation';
import styles from './ClientePages.module.css';

export function ClienteEditPage() {
  const { dni = '' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data, error, loading } = useAsync(() => clientesApi.obtener(dni), [dni]);

  if (loading) return <Spinner />;
  if (error || !data)
    return <EmptyState message={error?.message ?? 'No se encontró el cliente.'} />;

  return (
    <section className={styles.paginaFormulario}>
      <BotonVolver to={`/clientes/${dni}`}>Volver al detalle</BotonVolver>
      <header className={styles.encabezado}>
        <h1>Editar cliente</h1>
      </header>
      <Card>
        <ClienteForm
          isEdicion
          inicial={aRequest(data)}
          submitLabel="Guardar cambios"
          onSubmit={async (dto) => {
            // Se manda el DTO completo: el backend valida todo aunque ignore el apellido.
            await clientesApi.actualizar(dni, dto);
            toast.success('Cliente actualizado.');
            navigate(`/clientes/${dni}`);
          }}
        />
      </Card>
    </section>
  );
}
