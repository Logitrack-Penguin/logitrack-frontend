import { Outlet } from 'react-router';
import { useAuth } from '../../../shared/auth/useAuth';
import { Button, EmptyState } from '../../../shared/components';
import { useDniCliente } from '../useDniCliente';

/**
 * Ruta "padre" de todas las pantallas de envíos (como RequireRole). Un CLIENTE sin DNI en el token
 * no tiene envíos para ver (el backend no le devuelve ninguno): se le explica qué hacer. ADMIN y
 * REPARTIDOR pasan directo.
 */
export function RequireDniCliente() {
  const { debeFiltrar, dni } = useDniCliente();
  const { logout } = useAuth();
  if (debeFiltrar && !dni) {
    return (
      <EmptyState
        message="Tu cuenta todavía no está vinculada a tus datos de cliente. Volvé a iniciar sesión; si sigue igual, pedile a un administrador que revise que el email de tu cuenta sea el mismo que el de tu ficha de cliente."
        action={
          <Button variant="secondary" onClick={logout}>
            Volver a iniciar sesión
          </Button>
        }
      />
    );
  }
  return <Outlet />;
}
