import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Card.module.css';

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padding?: 'sm' | 'md';
};

/** Contenedor blanco redondeado con sombra suave (barra de filtros, tarjetas de repartidor…). */
export function Card({ children, padding = 'md', className, ...rest }: CardProps) {
  const clases = [styles.card, styles[padding], className].filter(Boolean).join(' ');
  return (
    <div {...rest} className={clases}>
      {children}
    </div>
  );
}
