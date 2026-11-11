import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { NAV_ITEMS, type NavItem } from '../../../app/navigation';
import type { Rol } from '../../auth/permissions';
import { useAuth } from '../../auth/useAuth';
import { IconLogout, IconMenu, IconX } from '../icons/icons';
import { Logo } from '../Logo/Logo';
import styles from './NavBar.module.css';

const ROL_TEXTO: Record<Rol, string> = {
  ADMIN: 'Administrador',
  CLIENTE: 'Cliente',
  REPARTIDOR: 'Repartidor',
};

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
// En pantallas chicas el menú y el usuario se pliegan detrás del botón "Menú".
export function NavBar() {
  const { sesion, logout, tienePermiso } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isAbierto, setIsAbierto] = useState(false);
  const items = NAV_ITEMS.filter((i) => !i.permiso || tienePermiso(i.permiso));
  const activo = itemActivo(items, pathname);

  function handleSalir() {
    logout();
    // Sin state.from: el próximo usuario no vuelve a la página del anterior.
    void navigate('/login', { replace: true });
  }

  const cerrar = () => setIsAbierto(false);

  return (
    <header className={styles.barra}>
      <Link
        to="/envios"
        className={styles.marca}
        aria-label="LogiTrack, ir a envíos"
        onClick={cerrar}
      >
        <Logo size="sm" variante="claro" />
      </Link>

      <button
        type="button"
        className={styles.hamburguesa}
        aria-expanded={isAbierto}
        aria-controls="menu-principal"
        aria-label={isAbierto ? 'Cerrar menú' : 'Abrir menú'}
        onClick={() => setIsAbierto((a) => !a)}
      >
        {isAbierto ? <IconX size={22} /> : <IconMenu size={22} />}
      </button>

      <div
        id="menu-principal"
        className={isAbierto ? `${styles.desplegable} ${styles.abierto}` : styles.desplegable}
      >
        <nav className={styles.menu} aria-label="Menú principal">
          {items.map((item) => {
            const isActivo = item.to === activo;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={isActivo ? `${styles.link} ${styles.activo}` : styles.link}
                aria-current={isActivo ? 'page' : undefined}
                onClick={cerrar}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {sesion && (
          <div className={styles.usuario}>
            <span className={styles.avatar} aria-hidden="true">
              {sesion.username.charAt(0).toUpperCase()}
            </span>
            <span className={styles.identidad}>
              <span className={styles.nombre}>{sesion.username}</span>
              <span className={styles.roles}>
                {sesion.roles.map((r) => ROL_TEXTO[r]).join(', ')}
              </span>
            </span>
            <button type="button" className={styles.salir} onClick={handleSalir}>
              <IconLogout size={16} />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
