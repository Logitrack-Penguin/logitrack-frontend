import { useRef } from 'react';
import { IconSearch, IconX } from '../icons/icons';
import styles from './SearchInput.module.css';

export type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Si no se pasa, se usa el placeholder como nombre accesible. */
  ariaLabel?: string;
};

/** Buscador con lupa y botón × para limpiar (visible solo cuando hay texto). */
export function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar…',
  ariaLabel,
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleLimpiar() {
    onChange('');
    inputRef.current?.focus();
  }

  return (
    <div className={styles.contenedor}>
      <span className={styles.lupa}>
        <IconSearch size={18} />
      </span>
      <input
        ref={inputRef}
        type="search"
        className={styles.input}
        value={value}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && value) handleLimpiar();
        }}
      />
      {value && (
        <button
          type="button"
          className={styles.limpiar}
          onClick={handleLimpiar}
          aria-label="Limpiar búsqueda"
        >
          <IconX size={16} />
        </button>
      )}
    </div>
  );
}
