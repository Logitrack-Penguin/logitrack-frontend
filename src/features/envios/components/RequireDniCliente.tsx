import { Outlet } from 'react-router';
import { useDniCliente } from '../useDniCliente';
import { VincularDni } from './VincularDni';

/**
 * Ruta "padre" de todas las pantallas de envíos (como RequireRole): un CLIENTE que todavía no
 * vinculó su DNI ve el formulario en vez de la pantalla. ADMIN y REPARTIDOR pasan directo.
 */
export function RequireDniCliente() {
  const { debeFiltrar, dni, vincular } = useDniCliente();
  if (debeFiltrar && !dni) return <VincularDni vincular={vincular} />;
  return <Outlet />;
}
