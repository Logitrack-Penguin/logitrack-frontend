// src/features/repartidores/api/repartidoresApi.ts — único lugar con las URL de repartidores.
// Una URL mal escrita no coincide con ninguna regla del gateway → 403 → logout.
import { httpClient } from '../../../shared/api/httpClient';
import { COURIER } from '../../../shared/api/servicePaths';
import type { EstadoRepartidor, RepartidorRequest, RepartidorResponse } from '../types';

const BASE = `${COURIER}/repartidores`;

export const repartidoresApi = {
  // axios omite los params undefined: listar() sin estado pide todos.
  listar: (estado?: EstadoRepartidor) =>
    httpClient.get<RepartidorResponse[]>(BASE, { params: { estado } }).then((r) => r.data),

  obtener: (dni: string) =>
    httpClient.get<RepartidorResponse>(`${BASE}/${dni}`).then((r) => r.data),

  crear: (dto: RepartidorRequest) =>
    httpClient.post<RepartidorResponse>(BASE, dto).then((r) => r.data),

  // Mandar el DTO completo: el backend solo cambia teléfono y vehículo, pero valida todo.
  actualizar: (dni: string, dto: RepartidorRequest) =>
    httpClient.put<RepartidorResponse>(`${BASE}/${dni}`, dto).then((r) => r.data),

  // Alterna ACTIVO ↔ INACTIVO. Usar solo /estado: el gateway lo habilita también para REPARTIDOR
  // (el duplicado /cambiarEstado no).
  cambiarEstado: (dni: string) =>
    httpClient.put<RepartidorResponse>(`${BASE}/${dni}/estado`).then((r) => r.data),

  eliminar: (dni: string) => httpClient.delete<void>(`${BASE}/${dni}`).then(() => undefined),

  // Devuelve un true/false plano, no un objeto.
  estaDisponible: (dni: string) =>
    httpClient.get<boolean>(`${BASE}/${dni}/estaDisponible`).then((r) => r.data),
};
