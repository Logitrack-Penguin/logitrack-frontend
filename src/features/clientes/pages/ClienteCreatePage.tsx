import { useNavigate } from 'react-router';
import { Card } from '../../../shared/components';
import { useToast } from '../../../shared/notifications/useToast';
import { clientesApi } from '../api/clientesApi';
import { BotonVolver } from '../components/BotonVolver';
import { ClienteForm } from '../components/ClienteForm';
import styles from './ClientePages.module.css';

export function ClienteCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();

  return (
    <section className={styles.paginaFormulario}>
      <BotonVolver to="/clientes">Volver al listado</BotonVolver>
      <header className={styles.encabezado}>
        <h1>Nuevo cliente</h1>
      </header>
      <Card>
        <ClienteForm
          submitLabel="Crear cliente"
          onSubmit={async (dto) => {
            const c = await clientesApi.crear(dto);
            toast.success('Cliente creado.');
            navigate(`/clientes/${c.dni}`);
          }}
        />
      </Card>
    </section>
  );
}
