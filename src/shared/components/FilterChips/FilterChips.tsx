import { useRef, type KeyboardEvent } from 'react';
import styles from './FilterChips.module.css';

export interface FilterOption<T extends string> {
  value: T;
  label: string;
}

export type FilterChipsProps<T extends string> = {
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Nombre del grupo para lectores de pantalla, por ejemplo "Filtrar por estado". */
  ariaLabel: string;
};

/**
 * Grupo de filtros en forma de píldoras (Todos / Activos / Inactivos).
 * Se comporta como un grupo de opciones: una sola activa y se recorre con las flechas.
 */
export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: FilterChipsProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const paso = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!paso) return;
    event.preventDefault();
    const siguiente = (index + paso + options.length) % options.length;
    onChange(options[siguiente].value);
    refs.current[siguiente]?.focus();
  }

  return (
    <div className={styles.grupo} role="radiogroup" aria-label={ariaLabel}>
      {options.map((opcion, i) => {
        const activo = opcion.value === value;
        return (
          <button
            key={opcion.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={activo}
            tabIndex={activo ? 0 : -1}
            className={activo ? `${styles.chip} ${styles.activo}` : styles.chip}
            onClick={() => onChange(opcion.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
          >
            {opcion.label}
          </button>
        );
      })}
    </div>
  );
}
