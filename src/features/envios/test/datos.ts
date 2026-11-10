// Datos de prueba compartidos por los tests de envíos.
import type { Rol } from '../../../shared/auth/permissions';
import { sessionStore } from '../../../shared/auth/sessionStore';
import { crearToken } from '../../../test/jwt';
import type { EnvioResponse } from '../types';

export function envioDePrueba(cambios: Partial<EnvioResponse> = {}): EnvioResponse {
  return {
    idEnvio: '3f2b8c1e-0000-4000-8000-000000000001',
    codigoSeguimiento: 'LT-0001',
    peso: 2.5,
    dimensiones: { ancho: 20, alto: 10, largo: 30 },
    tarifa: 1500,
    remitente: 'Nombre: Pérez, Ana - DNI: 30111222',
    repartidorAsignado: 'Sin repartidor asignado',
    estadoEnvio: 'PENDIENTE_ASIGNACION',
    fechaEstimadaEntrega: '2026-11-15',
    codigoRecepcion: '4821',
    direccionOrigen: {
      calle: 'Belgrano',
      numero: '450',
      ciudad: 'San Salvador de Jujuy',
      codigoPostal: '4600',
    },
    direccionDestino: {
      calle: 'Güemes',
      numero: '1200',
      ciudad: 'Palpalá',
      codigoPostal: '4612',
      observaciones: 'Timbre B',
    },
    fechaCreacion: '2026-11-10T09:30:00',
    ...cambios,
  };
}

export function iniciarSesionComo(...roles: Rol[]): void {
  sessionStore.set(crearToken({ roles }));
}
