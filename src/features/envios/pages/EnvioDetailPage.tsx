import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { toApiError } from '../../../shared/api/apiError';
import { useAuth } from '../../../shared/auth/useAuth';
import { Card, EmptyState, Spinner, StatusBadge } from '../../../shared/components';
import { useToast } from '../../../shared/notifications/useToast';
import { enviosApi } from '../api/enviosApi';
import { dniDeRemitente } from '../clienteActual';
import { EnvioAcciones } from '../components/EnvioAcciones';
import {
  formatearDireccion,
  formatearFecha,
  formatearTarifa,
  puedeVerCodigoRecepcion,
} from '../formato';
import type { EnvioResponse, HistoricoEstadoEnvio } from '../types';
import { esVisible, useDniCliente } from '../useDniCliente';
import styles from './EnvioPages.module.css';

// Se guarda el id de lo cargado: si no coincide con el de la URL, está cargando.
type Carga<T> = { id: string; valor: T } | null;

/** /envios/:id — los tres roles. */
export function EnvioDetailPage() {
  const id = useParams().id ?? '';
  const toast = useToast();
  const { sesion } = useAuth();
  const cliente = useDniCliente();
  const [envio, setEnvio] = useState<Carga<EnvioResponse | 'no-encontrado'>>(null);
  const [historial, setHistorial] = useState<Carga<HistoricoEstadoEnvio[] | 'error'>>(null);
  // Cambia después de cada acción (cancelar, cambiar estado) para volver a pedir los datos.
  // Mientras llegan, se sigue mostrando lo anterior: el id no cambió.
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let cancelado = false;
    enviosApi
      .obtener(id)
      .then((valor) => {
        if (!cancelado) setEnvio({ id, valor });
      })
      .catch((e: unknown) => {
        if (cancelado) return;
        const error = toApiError(e);
        if (error.status !== 404) toast.error(error.message);
        setEnvio({ id, valor: 'no-encontrado' });
      });
    enviosApi
      .historial(id)
      .then((lista) => {
        // "yyyy-MM-dd HH:mm:ss" se ordena bien como texto.
        const ordenado = [...lista].sort((a, b) =>
          a.fechaCambioEstado.localeCompare(b.fechaCambioEstado),
        );
        if (!cancelado) setHistorial({ id, valor: ordenado });
      })
      .catch(() => {
        if (!cancelado) setHistorial({ id, valor: 'error' });
      });
    return () => {
      cancelado = true;
    };
  }, [id, recarga, toast]);

  if (envio === null || envio.id !== id) return <Spinner />;

  // El envío de otro cliente se muestra igual que uno inexistente: no se revela que existe.
  if (
    envio.valor === 'no-encontrado' ||
    !esVisible(cliente, dniDeRemitente(envio.valor.remitente))
  ) {
    return (
      <EmptyState
        message="Envío no encontrado."
        action={<Link to="/envios">Volver al listado</Link>}
      />
    );
  }

  const e = envio.valor;
  const puedeVerCodigo = puedeVerCodigoRecepcion(sesion?.roles ?? []);

  return (
    <section className={styles.pagina}>
      <header className={styles.encabezado}>
        <h1 className={styles.titulo}>Envío {e.codigoSeguimiento}</h1>
        <StatusBadge estado={e.estadoEnvio} />
      </header>

      <EnvioAcciones envio={e} onActualizado={() => setRecarga((r) => r + 1)} />

      <div className={styles.secciones}>
        <Card>
          <h2 className={styles.subtitulo}>Datos</h2>
          <dl className={styles.datos}>
            <dt>Código</dt>
            <dd>{e.codigoSeguimiento}</dd>
            <dt>Remitente</dt>
            <dd>{e.remitente}</dd>
            <dt>Repartidor</dt>
            <dd>{e.repartidorAsignado}</dd>
            <dt>Creado</dt>
            <dd>{formatearFecha(e.fechaCreacion)}</dd>
            <dt>Entrega estimada</dt>
            <dd>{formatearFecha(e.fechaEstimadaEntrega)}</dd>
            {puedeVerCodigo && (
              <>
                <dt>Código de recepción</dt>
                <dd>{e.codigoRecepcion}</dd>
              </>
            )}
          </dl>
        </Card>

        <Card>
          <h2 className={styles.subtitulo}>Origen y destino</h2>
          <dl className={styles.datos}>
            <dt>Origen</dt>
            <dd>{formatearDireccion(e.direccionOrigen)}</dd>
            {e.direccionOrigen.observaciones && (
              <>
                <dt>Obs. origen</dt>
                <dd>{e.direccionOrigen.observaciones}</dd>
              </>
            )}
            <dt>Destino</dt>
            <dd>{formatearDireccion(e.direccionDestino)}</dd>
            {e.direccionDestino.observaciones && (
              <>
                <dt>Obs. destino</dt>
                <dd>{e.direccionDestino.observaciones}</dd>
              </>
            )}
          </dl>
        </Card>

        <Card>
          <h2 className={styles.subtitulo}>Dimensiones y tarifa</h2>
          <dl className={styles.datos}>
            <dt>Peso</dt>
            <dd>{e.peso} kg</dd>
            <dt>Medidas</dt>
            <dd>
              {e.dimensiones.ancho} × {e.dimensiones.alto} × {e.dimensiones.largo} cm
            </dd>
            <dt>Tarifa</dt>
            <dd>{formatearTarifa(e.tarifa)}</dd>
          </dl>
        </Card>

        <Card>
          <h2 className={styles.subtitulo}>Historial</h2>
          {historial === null || historial.id !== id ? (
            <Spinner />
          ) : historial.valor === 'error' ? (
            <p className={styles.mensaje}>No se pudo cargar el historial.</p>
          ) : historial.valor.length === 0 ? (
            <p className={styles.mensaje}>Todavía no hay cambios de estado.</p>
          ) : (
            <ol className={styles.historial} aria-label="Historial de estados">
              {historial.valor.map((h) => (
                <li key={`${h.fechaCambioEstado}-${h.estadoEnvioNuevo}`}>
                  <span className={styles.fecha}>{formatearFecha(h.fechaCambioEstado)}</span>
                  <StatusBadge estado={h.estadoEnvioAnterior} />→
                  <StatusBadge estado={h.estadoEnvioNuevo} />
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </section>
  );
}
