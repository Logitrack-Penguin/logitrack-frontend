import logo from '../../../assets/logo.jpg';
import styles from './Logo.module.css';

export type LogoProps = {
  /** sm: barra de navegación. lg: pantallas de login y registro. */
  size?: 'sm' | 'lg';
  /** claro: sobre fondo azul ("Track" amarillo). oscuro: sobre fondo amarillo ("Logi" azul). */
  variante?: 'claro' | 'oscuro';
  /** false oculta el texto "LogiTrack" y deja solo el pingüino. */
  conTexto?: boolean;
};

/** Pingüino de LogiTrack dentro de un círculo, con el nombre "Logi" + "Track". */
export function Logo({ size = 'sm', variante = 'claro', conTexto = true }: LogoProps) {
  return (
    <span className={`${styles.logo} ${styles[size]} ${styles[variante]}`}>
      <span className={styles.circulo}>
        <img src={logo} alt={conTexto ? '' : 'LogiTrack'} className={styles.imagen} />
      </span>
      {conTexto && (
        <span className={styles.texto}>
          Logi<span className={styles.track}>Track</span>
        </span>
      )}
    </span>
  );
}
