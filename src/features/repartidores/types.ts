// src/features/repartidores/types.ts — nombres idénticos a los DTO Java de courier-service.
// UUID y LocalDateTime llegan como string.

export type EstadoRepartidor = 'ACTIVO' | 'INACTIVO';

/** Sugerencias para el campo vehículo (el backend acepta cualquier texto no vacío). */
export const TIPOS_VEHICULO = ['MOTO', 'AUTO', 'BICICLETA', 'CAMIONETA'] as const;

/** RepartidorRequestDto. En la edición el backend solo usa telefono y tipoVehiculo,
 *  pero valida todos los campos: hay que mandar el DTO completo. */
export interface RepartidorRequest {
  dni: string;
  nombre: string;
  apellido: string;
  telefono: string;
  tipoVehiculo: string;
}

/** RepartidorResponseDto */
export interface RepartidorResponse {
  idRepartidor: string;
  dni: string;
  nombreCompleto: string; // "Apellido, Nombre"
  telefono: string;
  tipoVehiculo: string;
  estadoRepartidor: EstadoRepartidor;
  fechaCreacion: string;
}
