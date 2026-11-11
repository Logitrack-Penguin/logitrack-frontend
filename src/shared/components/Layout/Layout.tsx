import { Outlet } from 'react-router';
import { NavBar } from '../NavBar/NavBar';
import styles from './Layout.module.css';

export function Layout() {
  return (
    <div className={styles.layout}>
      <NavBar />
      <main className={styles.contenido}>
        <Outlet />
      </main>
      <footer className={styles.pie}>
        LogiTrack · Desarrollo y Arquitecturas Avanzadas de Software · UNJu
      </footer>
    </div>
  );
}
