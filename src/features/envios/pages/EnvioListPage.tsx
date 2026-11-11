import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toApiError } from '../../../shared/api/apiError';
import { useAuth } from '../../../shared/auth/useAuth';
import {
  Button,
  DataTable,
  EmptyState,
  IconPlus,
  Spinner,
  StatusBadge,
  type Column,
} from '../../../shared/components';
import { Can } from '../../../shared/guards/Can';
import { useToast } from '../../../shared/notifications/useToast';
import { enviosApi } from '../api/enviosApi';
import { dniDeRemitente } from '../clienteActual';
import { ESTADOS_ENVIO, formatearFecha, formatearTarifa, puedeVerEnvio } from '../formato';
import type { EnvioResponse, EstadoEnvio } from '../types';
import { esVisible, useDniCliente } from '../useDniCliente';
import styles from './EnvioPages.module.css';

// El código de recepción no va en el listado: es el PIN del destinatario.
const COLUMNAS: Column<EnvioResponse>[] = [
  { header: 'Código', render: (e) => e.codigoSeguimiento },
  { header: 'Estado', render: (e) => <StatusBadge estado={e.estadoEnvio} /> },
  { header: 'Remitente', render: (e) => e.remitente },
  { header: 'Repartidor', render: (e) => e.repartidorAsignado },
  { header: 'Entrega estimada', render: (e) => formatearFecha(e.fechaEstimadaEntrega) },
  { header: 'Tarifa', render: (e) => formatearTarifa(e.tarifa) },
];

type Filtro = EstadoEnvio | '';

/** /envios — los tres roles. */
export function EnvioListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { sesion } = useAuth();
  const cliente = useDniCliente();
  const [estado, setEstado] = useState<Filtro>('');
  // Se guarda con qué filtro se cargó: si no coincide con el actual, está cargando.
  const [datos, setDatos] = useState<{ estado: Filtro; envios: EnvioResponse[] } | null>(null);

  useEffect(() => {
    let cancelado = false;
    enviosApi
      .listar(estado || undefined)
      .then((envios) => {
        if (!cancelado) setDatos({ estado, envios });
      })
      .catch((e: unknown) => {
        if (!cancelado) {
          toast.error(toApiError(e).message);
          setDatos({ estado, envios: [] });
        }
      });
    return () => {
      cancelado = true;
    };
  }, [estado, toast]);

  const isLoading = datos === null || datos.estado !== estado;
  const textoEstado = ESTADOS_ENVIO.find((o) => o.value === estado)?.label.toLowerCase();
  // Un CLIENTE solo ve sus envíos (por el DNI del remitente) y un REPARTIDOR, los asignados a él.
  const envios = (datos?.envios ?? []).filter(
    (e) => esVisible(cliente, dniDeRemitente(e.remitente)) && puedeVerEnvio(e, sesion),
  );

  return (
    <section className={styles.pagina}>
      <header className={styles.encabezado}>
        <h1 className={styles.titulo}>Envíos</h1>
        <Can permiso="envios.crear">
          <Button icon={<IconPlus />} onClick={() => navigate('/envios/nuevo')}>
            Nuevo envío
          </Button>
        </Can>
      </header>

      <div className={styles.filtro}>
        <label htmlFor="filtro-estado">Estado</label>
        <select
          id="filtro-estado"
          className={styles.select}
          value={estado}
          onChange={(e) => setEstado(e.target.value as Filtro)}
        >
          <option value="">Todos</option>
          {ESTADOS_ENVIO.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {cliente.debeFiltrar && (
          <span className={styles.mensaje}>Tus envíos (DNI {cliente.dni})</span>
        )}
      </div>

      {isLoading ? (
        <Spinner />
      ) : envios.length === 0 ? (
        <EmptyState
          message={textoEstado ? `No hay envíos en estado ${textoEstado}.` : 'No hay envíos.'}
        />
      ) : (
        <DataTable
          columns={COLUMNAS}
          rows={envios}
          getRowKey={(e) => e.idEnvio}
          onRowClick={(e) => navigate(`/envios/${e.idEnvio}`)}
          footer={`${envios.length} ${envios.length === 1 ? 'envío' : 'envíos'}`}
        />
      )}
    </section>
  );
}
