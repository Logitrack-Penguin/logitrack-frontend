import { Link, useLocation, useNavigate } from 'react-router';
import { NAV_ITEMS, type NavItem } from '../../../app/navigation';
import { useAuth } from '../../auth/useAuth';
import { Button } from '../Button/Button';
import { IconLogout } from '../icons/icons';
import styles from './NavBar.module.css';

// Activo = el ítem con la ruta más específica que contiene a la actual. Así en
// /envios/seguimiento se marca solo "Seguimiento" y en /envios/123 solo "Envíos".
function itemActivo(items: NavItem[], pathname: string): string | undefined {
  return items
    .filter((i) => pathname === i.to || pathname.startsWith(`${i.to}/`))
    .reduce<string | undefined>(
      (mejor, i) => (!mejor || i.to.length > mejor.length ? i.to : mejor),
      undefined,
    );
}

// Menú armado con los nav.ts de cada feature: un ítem se ve si no pide permiso o si el rol lo tiene.
export function NavBar() {
  const { sesion, logout, tienePermiso } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const items = NAV_ITEMS.filter((i) => !i.permiso || tienePermiso(i.permiso));
  const activo = itemActivo(items, pathname);

  function handleSalir() {
    logout();
    // Sin state.from: el próximo usuario no vuelve a la página del anterior.
    void navigate('/login', { replace: true });
  }

  return (
    <header className={styles.barra}>
      <span className={styles.marca}>LogiTrack</span>
      <nav className={styles.menu} aria-label="Menú principal">
        {items.map((item) => {
          const isActivo = item.to === activo;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={isActivo ? `${styles.link} ${styles.activo}` : styles.link}
              aria-current={isActivo ? 'page' : undefined}
            >
              {item.label}
            </Link>
          );
        })}
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
