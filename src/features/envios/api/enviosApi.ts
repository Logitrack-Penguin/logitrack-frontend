// src/features/envios/api/enviosApi.ts — único lugar con las URL de envíos.
// Una URL mal escrita no coincide con ninguna regla del gateway → 403 → logout.
import { httpClient } from '../../../shared/api/httpClient';
import { SHIPMENT } from '../../../shared/api/servicePaths';
import type {
  EnvioCourierResponse,
  EnvioRequest,
  EnvioResponse,
  EstadoEnvio,
  HistoricoEstadoEnvio,
} from '../types';

const BASE = `${SHIPMENT}/envios`;

export const enviosApi = {
  // axios omite los params undefined: listar() sin estado pide todos.
  listar: (estado?: EstadoEnvio) =>
    httpClient.get<EnvioResponse[]>(BASE, { params: { estado } }).then((r) => r.data),

  obtener: (id: string) => httpClient.get<EnvioResponse>(`${BASE}/${id}`).then((r) => r.data),

  buscarPorCodigo: (codigo: string) =>
    httpClient
      .get<EnvioResponse>(`${BASE}/tracking/${encodeURIComponent(codigo)}`)
      .then((r) => r.data),

  crear: (dto: EnvioRequest) => httpClient.post<EnvioResponse>(BASE, dto).then((r) => r.data),

  cancelar: (id: string) =>
    httpClient.patch<EnvioResponse>(`${BASE}/${id}/cancelar`).then((r) => r.data),

  // Revisar dniRepartidor en la respuesta: un 200 puede traer el mensaje de fallo (B5).
  asignarRepartidor: (id: string, dniRepartidor: string) =>
    httpClient
      .put<EnvioCourierResponse>(`${BASE}/${id}/asignarRepartidor`, null, {
        params: { dniRepartidor },
      })
      .then((r) => r.data),

  // Requiere LT4-15. codigoRecepcion solo es obligatorio para pasar de EN_RUTA a ENTREGADO.
  cambiarEstado: (id: string, codigoRecepcion?: string) =>
    httpClient
      .patch<EnvioResponse>(`${BASE}/${id}/estado`, { codigoRecepcion })
      .then((r) => r.data),

  // Requiere LT4-15.
  historial: (id: string) =>
    httpClient.get<HistoricoEstadoEnvio[]>(`${BASE}/${id}/historial`).then((r) => r.data),
};
