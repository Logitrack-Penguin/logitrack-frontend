import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Button,
  Card,
  type Column,
  DataTable,
  EmptyState,
  FilterChips,
  type FilterOption,
  IconPlus,
  Spinner,
  StatusBadge,
} from '../../../shared/components';
import { Can } from '../../../shared/guards/Can';
import { useAsync } from '../../../shared/hooks/useAsync';
import { repartidoresApi } from '../api/repartidoresApi';
import type { EstadoRepartidor, RepartidorResponse } from '../types';
import styles from './RepartidorPages.module.css';

type Filtro = 'TODOS' | EstadoRepartidor;

const FILTROS: FilterOption<Filtro>[] = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'ACTIVO', label: 'Activos' },
  { value: 'INACTIVO', label: 'Inactivos' },
];

const COLUMNAS: Column<RepartidorResponse>[] = [
  { header: 'DNI', render: (r) => r.dni },
  { header: 'Nombre', render: (r) => r.nombreCompleto },
  { header: 'Teléfono', render: (r) => r.telefono },
  { header: 'Vehículo', render: (r) => r.tipoVehiculo },
  { header: 'Estado', render: (r) => <StatusBadge estado={r.estadoRepartidor} /> },
];

export function RepartidorListPage() {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<Filtro>('TODOS');
  const { data, error, loading, reload } = useAsync(
    () => repartidoresApi.listar(filtro === 'TODOS' ? undefined : filtro),
    [filtro],
  );

  return (
    <section>
      <header className={styles.encabezado}>
        <h1>Repartidores</h1>
        <Can permiso="repartidores.gestionar">
          <Button icon={<IconPlus />} onClick={() => navigate('/usuarios/nuevo')}>
            Nuevo repartidor
          </Button>
        </Can>
      </header>

      <div className={styles.filtros}>
        <FilterChips
          options={FILTROS}
          value={filtro}
          onChange={setFiltro}
          ariaLabel="Filtrar por estado"
        />
      </div>

      <Card padding="sm">
        {loading ? (
          <Spinner />
        ) : error ? (
          <EmptyState
            message={error.message}
            action={
              <Button variant="secondary" onClick={reload}>
                Reintentar
              </Button>
            }
          />
        ) : (
          <DataTable
            columns={COLUMNAS}
            rows={data ?? []}
            getRowKey={(r) => r.idRepartidor}
            onRowClick={(r) => navigate(`/repartidores/${r.dni}`)}
            emptyMessage="No hay repartidores para mostrar."
          />
        )}
      </Card>
    </section>
  );
}
