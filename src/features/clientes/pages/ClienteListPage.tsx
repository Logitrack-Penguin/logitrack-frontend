import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Button,
  Card,
  type Column,
  DataTable,
  EmptyState,
  IconPlus,
  SearchInput,
  Spinner,
} from '../../../shared/components';
import { useAsync } from '../../../shared/hooks/useAsync';
import { clientesApi } from '../api/clientesApi';
import type { ClienteResponse } from '../types';
import { coincideBusqueda } from '../validation';
import styles from './ClientePages.module.css';

const COLUMNAS: Column<ClienteResponse>[] = [
  { header: 'DNI', render: (c) => c.dni },
  { header: 'Nombre', render: (c) => c.nombreCompleto },
  { header: 'Email', render: (c) => c.email },
  { header: 'Teléfono', render: (c) => c.telefono },
];

export function ClienteListPage() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  // La lista no está paginada y es chica: se pide una vez y se filtra en memoria.
  const { data, error, loading, reload } = useAsync(() => clientesApi.listar(), []);
  const filtrados = (data ?? []).filter((c) => coincideBusqueda(c, busqueda));

  return (
    <section>
      <header className={styles.encabezado}>
        <h1>Clientes</h1>
        <Button icon={<IconPlus />} onClick={() => navigate('/clientes/nuevo')}>
          Nuevo cliente
        </Button>
      </header>

      <div className={styles.filtros}>
        <SearchInput
          value={busqueda}
          onChange={setBusqueda}
          placeholder="Buscar por DNI o nombre"
          ariaLabel="Buscar clientes"
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
            rows={filtrados}
            getRowKey={(c) => c.idCliente}
            onRowClick={(c) => navigate(`/clientes/${c.dni}`)}
            emptyMessage={
              busqueda ? 'Ningún cliente coincide con la búsqueda.' : 'No hay clientes.'
            }
          />
        )}
      </Card>
    </section>
  );
}
