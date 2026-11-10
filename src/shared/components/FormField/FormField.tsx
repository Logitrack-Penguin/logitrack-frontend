import type { ReactNode } from 'react';
import { IconAlert } from '../icons/icons';
import { fieldErrorId } from './fieldErrorId';
import styles from './FormField.module.css';

export type FormFieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
};

/**
 * Envuelve cualquier input con su etiqueta, una ayuda opcional y el mensaje de error.
 * El input debe tener id={htmlFor}. Para accesibilidad, agregarle
 * aria-invalid={!!error} y aria-describedby={fieldErrorId(htmlFor)}.
 */
export function FormField({ label, htmlFor, error, hint, children }: FormFieldProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint && !error && <p className={styles.hint}>{hint}</p>}
      {error && (
        <p id={fieldErrorId(htmlFor)} className={styles.error} role="alert">
          <IconAlert size={15} />
          {error}
        </p>
      )}
    </div>
  );
}
