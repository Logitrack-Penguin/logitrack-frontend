import { Outlet } from 'react-router';
import { NavBar } from '../NavBar/NavBar';
import styles from './Layout.module.css';

export function Layout() {
  return (
    <>
      <NavBar />
      <main className={styles.contenido}>
        <Outlet />
      </main>
    </>
  );
}
