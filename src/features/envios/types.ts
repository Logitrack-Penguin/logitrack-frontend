// src/features/envios/types.ts — nombres idénticos a los DTO Java de shipment-service.
// UUID, LocalDate y LocalDateTime llegan como string; Double como number.

export type EstadoEnvio =
  'PENDIENTE_ASIGNACION' | 'REPARTIDOR_ASIGNADO' | 'EN_RUTA' | 'ENTREGADO' | 'CANCELADO';

export interface Dimensiones {
  ancho: number;
  alto: number;
  largo: number;
}

export interface Direccion {
  calle: string;
  numero: string;
  ciudad: string;
  codigoPostal: string;
  observaciones?: string;
}

/** EnvioRequestDto */
export interface EnvioRequest {
  peso: number;
  dimensiones: Dimensiones;
  direccionOrigen: Direccion;
  direccionDestino: Direccion;
  dniCliente: string;
}

/** EnvioResponseDto */
export interface EnvioResponse {
  idEnvio: string;
  codigoSeguimiento: string;
  peso: number;
  dimensiones: Dimensiones;
  tarifa: number;
  remitente: string; // texto armado por el backend: "Nombre: Ap, Nom - DNI: x"
  repartidorAsignado: string; // "DNI: x" o "Sin repartidor asignado"
  estadoEnvio: EstadoEnvio;
  fechaEstimadaEntrega: string;
  codigoRecepcion: string; // "PIN" del destinatario: no mostrarlo al rol REPARTIDOR
  direccionOrigen: Direccion;
  direccionDestino: Direccion;
  fechaCreacion: string;
}

/** EnvioCourierResponseDto: respuesta de asignarRepartidor. */
export interface EnvioCourierResponse {
  idEnvio: string;
  codigoSeguimiento: string;
  peso: number;
  dimensiones: Dimensiones;
  tarifa: number;
  remitente: string;
  estadoEnvio: EstadoEnvio;
  fechaEstimadaEntrega: string;
  codigoRecepcion: string;
  direccionOrigen: Direccion;
  direccionDestino: Direccion;
  fechaCreacionEnvio: string; // ojo: distinto de EnvioResponse.fechaCreacion
  mensajeAsignacion: string;
  // Vacíos cuando la asignación falla y el fallback responde 200 (B5).
  idRepartidor?: string;
  dniRepartidor?: string;
  nombreCompletoRepartidor?: string;
  telefonoRepartidor?: string;
  tipoVehiculoRepartidor?: string;
}

/** HistoricoEstadoEnvioResponseDto (endpoint GET /envios/{idEnvio}/historial de LT4-15). */
export interface HistoricoEstadoEnvio {
  estadoEnvioAnterior: EstadoEnvio;
  estadoEnvioNuevo: EstadoEnvio;
  fechaCambioEstado: string; // "yyyy-MM-dd HH:mm:ss"
}
