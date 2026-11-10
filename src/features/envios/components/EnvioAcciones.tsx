import { useState } from 'react';
import { toApiError } from '../../../shared/api/apiError';
import { useAuth } from '../../../shared/auth/useAuth';
import {
  Button,
  ConfirmDialog,
  FormField,
  Spinner,
  fieldErrorId,
} from '../../../shared/components';
import { useToast } from '../../../shared/notifications/useToast';
import { repartidoresApi } from '../../repartidores/api/repartidoresApi';
import type { RepartidorResponse } from '../../repartidores/types';
import { enviosApi } from '../api/enviosApi';
import type { EnvioResponse } from '../types';
import { accionesDisponibles, type AccionEnvio } from './accionesDisponibles';
import styles from './EnvioAcciones.module.css';

const BOTON: Record<AccionEnvio, string> = {
  asignar: 'Asignar repartidor',
  cancelar: 'Cancelar envío',
  marcarEnRuta: 'Marcar en ruta',
  marcarEntregado: 'Marcar entregado',
};

const CAMPO_CODIGO = 'codigo-recepcion';
const CAMPO_REPARTIDOR = 'repartidor';

interface EnvioAccionesProps {
  envio: EnvioResponse;
  /** Se llama después de una acción exitosa, para que el detalle se recargue. */
  onActualizado: () => void;
}

/** Botones del detalle de un envío según su estado y los permisos del usuario. */
export function EnvioAcciones({ envio, onActualizado }: EnvioAccionesProps) {
  const { tienePermiso } = useAuth();
  const toast = useToast();
  const [abierta, setAbierta] = useState<AccionEnvio | null>(null);
  // Texto del campo del diálogo abierto: código de recepción o DNI del repartidor elegido.
  const [valor, setValor] = useState('');
  const [errorCampo, setErrorCampo] = useState<string>();
  const [repartidores, setRepartidores] = useState<RepartidorResponse[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const acciones = accionesDisponibles(envio.estadoEnvio, tienePermiso);
  if (acciones.length === 0) return null;

  function abrir(accion: AccionEnvio) {
    setValor('');
    setErrorCampo(undefined);
    setAbierta(accion);
    if (accion === 'asignar') cargarRepartidores();
  }

  function cargarRepartidores() {
    setRepartidores(null);
    repartidoresApi
      .listar('ACTIVO')
      .then(setRepartidores)
      .catch((e: unknown) => {
        toast.error(toApiError(e).message);
        setAbierta(null);
      });
  }

  function cerrar() {
    if (!isLoading) setAbierta(null);
  }

  async function ejecutar(accion: AccionEnvio, llamada: () => Promise<unknown>, exito: string) {
    setIsLoading(true);
    try {
      await llamada();
      toast.success(exito);
      setAbierta(null);
      onActualizado();
    } catch (e) {
      const error = toApiError(e);
      // Un código de recepción incorrecto (400) se muestra debajo del campo.
      if (accion === 'marcarEntregado' && error.status === 400) setErrorCampo(error.message);
      else {
        toast.error(error.message);
        setAbierta(null);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function asignar(dni: string) {
    setIsLoading(true);
    try {
      const r = await enviosApi.asignarRepartidor(envio.idEnvio, dni);
      setAbierta(null);
      // B5: si courier-service falla, el backend responde 200 pero no asigna a nadie.
      if (!r.dniRepartidor) toast.warning(r.mensajeAsignacion);
      else {
        toast.success(`Asignado a ${r.nombreCompletoRepartidor}.`);
        onActualizado();
      }
    } catch (e) {
      toast.error(toApiError(e).message);
      setAbierta(null);
    } finally {
      setIsLoading(false);
    }
  }

  function handleConfirmar() {
    const id = envio.idEnvio;
    const texto = valor.trim();
    if (abierta === 'asignar') {
      if (!texto) setErrorCampo('Elegí un repartidor.');
      else void asignar(texto);
    } else if (abierta === 'cancelar') {
      void ejecutar('cancelar', () => enviosApi.cancelar(id), 'Envío cancelado.');
    } else if (abierta === 'marcarEnRuta') {
      void ejecutar('marcarEnRuta', () => enviosApi.cambiarEstado(id), 'El envío está en ruta.');
    } else if (abierta === 'marcarEntregado') {
      if (!texto) setErrorCampo('Ingresá el código de recepción.');
      else {
        void ejecutar(
          'marcarEntregado',
          () => enviosApi.cambiarEstado(id, texto),
          'Envío entregado.',
        );
      }
    }
  }

  const codigoSeguimiento = envio.codigoSeguimiento;
  const ariaCampo = (id: string) => ({
    'aria-invalid': !!errorCampo,
    'aria-describedby': errorCampo ? fieldErrorId(id) : undefined,
  });

  return (
    <div className={styles.acciones}>
      {acciones.map((a) => (
        <Button
          key={a}
          size="sm"
          variant={a === 'cancelar' ? 'danger' : 'primary'}
          onClick={() => abrir(a)}
        >
          {BOTON[a]}
        </Button>
      ))}

      {abierta === 'asignar' && (
        <ConfirmDialog
          open
          title="Asignar repartidor"
          message={`Elegí el repartidor del envío ${codigoSeguimiento}.`}
          confirmLabel="Asignar"
          loading={isLoading}
          onConfirm={handleConfirmar}
          onCancel={cerrar}
        >
          {repartidores === null ? (
            <Spinner />
          ) : repartidores.length === 0 ? (
            <p className={styles.mensaje}>No hay repartidores activos.</p>
          ) : (
            <FormField label="Repartidor" htmlFor={CAMPO_REPARTIDOR} error={errorCampo}>
              <select
                id={CAMPO_REPARTIDOR}
                className={styles.input}
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                {...ariaCampo(CAMPO_REPARTIDOR)}
              >
                <option value="">Elegí un repartidor…</option>
                {repartidores.map((r) => (
                  <option key={r.dni} value={r.dni}>
                    {r.nombreCompleto} · DNI {r.dni} · {r.tipoVehiculo}
                  </option>
                ))}
              </select>
            </FormField>
          )}
        </ConfirmDialog>
      )}

      {abierta === 'cancelar' && (
        <ConfirmDialog
          open
          title="Cancelar envío"
          message={`¿Cancelar el envío ${codigoSeguimiento}? No se puede deshacer.`}
          confirmLabel="Sí, cancelar envío"
          danger
          loading={isLoading}
          onConfirm={handleConfirmar}
          onCancel={cerrar}
        />
      )}

      {abierta === 'marcarEnRuta' && (
        <ConfirmDialog
          open
          title="Marcar en ruta"
          message={`¿Confirmás que el envío ${codigoSeguimiento} salió a reparto?`}
          confirmLabel="Marcar en ruta"
          loading={isLoading}
          onConfirm={handleConfirmar}
          onCancel={cerrar}
        />
      )}

      {abierta === 'marcarEntregado' && (
        <ConfirmDialog
          open
          title="Marcar entregado"
          message={`Pedile al destinatario el código de recepción del envío ${codigoSeguimiento}.`}
          confirmLabel="Marcar entregado"
          loading={isLoading}
          onConfirm={handleConfirmar}
          onCancel={cerrar}
        >
          <FormField label="Código de recepción" htmlFor={CAMPO_CODIGO} error={errorCampo}>
            <input
              id={CAMPO_CODIGO}
              className={styles.input}
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              autoComplete="off"
              {...ariaCampo(CAMPO_CODIGO)}
            />
          </FormField>
        </ConfirmDialog>
      )}
    </div>
  );
}
