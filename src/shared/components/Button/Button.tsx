import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  /** Ícono opcional antes del texto, por ejemplo <IconPlus />. */
  icon?: ReactNode;
  /** 'sm' para acciones dentro de tablas y tarjetas. */
  size?: 'sm' | 'md';
};

export function Button({
  variant = 'primary',
  loading = false,
  icon,
  size = 'md',
  disabled,
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps) {
  const clases = [styles.button, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(' ');
  return (
    <button
      {...rest}
      type={type}
      className={clases}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : (
        icon && <span className={styles.icon}>{icon}</span>
      )}
      {children}
    </button>
  );
}
