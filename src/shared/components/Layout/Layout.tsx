import { Outlet } from 'react-router';

// Esqueleto (LT4-01): barra de navegación + <Outlet />. Se completa en el issue de layout.
export function Layout() {
  return (
    <>
      <header>LogiTrack</header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
