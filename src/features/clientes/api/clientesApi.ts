// src/features/clientes/api/clientesApi.ts — único lugar con las URL de clientes.
import { httpClient } from '../../../shared/api/httpClient';
import { SHIPMENT } from '../../../shared/api/servicePaths';
import type { ClienteRequest, ClienteResponse } from '../types';

const BASE = `${SHIPMENT}/clientes`;

export const clientesApi = {
  listar: () => httpClient.get<ClienteResponse[]>(BASE).then((r) => r.data),

  obtener: (dni: string) => httpClient.get<ClienteResponse>(`${BASE}/${dni}`).then((r) => r.data),

  crear: (dto: ClienteRequest) => httpClient.post<ClienteResponse>(BASE, dto).then((r) => r.data),

  // Mandar el DTO completo: el backend ignora el apellido, pero valida todo.
  actualizar: (dni: string, dto: ClienteRequest) =>
    httpClient.put<ClienteResponse>(`${BASE}/${dni}`, dto).then((r) => r.data),

  eliminar: (dni: string) => httpClient.delete<void>(`${BASE}/${dni}`).then(() => undefined),
};
