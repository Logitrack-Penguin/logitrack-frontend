import type { ReactNode } from 'react';
import { IconInbox } from '../icons/icons';
import styles from './EmptyState.module.css';

export type EmptyStateProps = { message: string; action?: ReactNode };

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className={styles.contenedor}>
      <span className={styles.icono}>
        <IconInbox size={28} />
      </span>
      <p className={styles.mensaje}>{message}</p>
      {action}
    </div>
  );
}
