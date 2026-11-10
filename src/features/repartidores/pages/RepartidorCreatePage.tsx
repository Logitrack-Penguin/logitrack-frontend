import { useNavigate } from 'react-router';
import { Card } from '../../../shared/components';
import { useToast } from '../../../shared/notifications/useToast';
import { repartidoresApi } from '../api/repartidoresApi';
import { BotonVolver } from '../components/BotonVolver';
import { RepartidorForm } from '../components/RepartidorForm';
import styles from './RepartidorPages.module.css';

export function RepartidorCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();

  return (
    <section className={styles.paginaFormulario}>
      <BotonVolver to="/repartidores">Volver al listado</BotonVolver>
      <header className={styles.encabezado}>
        <h1>Nuevo repartidor</h1>
      </header>
      <Card>
        <RepartidorForm
          submitLabel="Crear repartidor"
          onSubmit={async (dto) => {
            const r = await repartidoresApi.crear(dto);
            toast.success('Repartidor creado.');
            navigate(`/repartidores/${r.dni}`);
          }}
        />
      </Card>
    </section>
  );
}
