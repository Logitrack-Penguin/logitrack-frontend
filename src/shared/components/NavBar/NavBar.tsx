import { NavLink, useNavigate } from 'react-router';
import { NAV_ITEMS } from '../../../app/navigation';
import { useAuth } from '../../auth/useAuth';
import { Button } from '../Button/Button';
import { IconLogout } from '../icons/icons';
import styles from './NavBar.module.css';

// Menú armado con los nav.ts de cada feature: un ítem se ve si no pide permiso o si el rol lo tiene.
export function NavBar() {
  const { sesion, logout, tienePermiso } = useAuth();
  const navigate = useNavigate();
  const items = NAV_ITEMS.filter((i) => !i.permiso || tienePermiso(i.permiso));

  function handleSalir() {
    logout();
    // Sin state.from: el próximo usuario no vuelve a la página del anterior.
    void navigate('/login', { replace: true });
  }

  return (
    <header className={styles.barra}>
      <span className={styles.marca}>LogiTrack</span>
      <nav className={styles.menu} aria-label="Menú principal">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.activo}` : styles.link
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      {sesion && (
        <div className={styles.usuario}>
          <span className={styles.nombre}>{sesion.username}</span>
          <span className={styles.roles}>{sesion.roles.join(', ')}</span>
          <Button variant="secondary" size="sm" icon={<IconLogout />} onClick={handleSalir}>
            Salir
          </Button>
        </div>
      )}
    </header>
  );
}
