// src/features/clientes/types.ts — nombres idénticos a los DTO Java de shipment-service.
// UUID y LocalDateTime llegan como string.

/** ClienteRequestDto. En la edición el backend ignora el apellido (solo cambia nombre, email y
 *  teléfono), pero valida todos los campos: hay que mandar el DTO completo. */
export interface ClienteRequest {
  dni: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
}

/** ClienteResponseDto */
export interface ClienteResponse {
  idCliente: string;
  dni: string;
  nombreCompleto: string; // "Apellido, Nombre"
  email: string;
  telefono: string;
  fechaCreacion: string;
}
