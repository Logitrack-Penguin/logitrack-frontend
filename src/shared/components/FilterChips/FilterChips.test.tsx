import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterChips } from './FilterChips';

type Filtro = 'TODOS' | 'ACTIVO' | 'INACTIVO';

const opciones = [
  { value: 'TODOS' as const, label: 'Todos' },
  { value: 'ACTIVO' as const, label: 'Activos' },
  { value: 'INACTIVO' as const, label: 'Inactivos' },
];

function renderChips(value: Filtro = 'TODOS') {
  const onChange = vi.fn();
  render(
    <FilterChips<Filtro>
      options={opciones}
      value={value}
      onChange={onChange}
      ariaLabel="Filtrar por estado"
    />,
  );
  return onChange;
}

describe('FilterChips', () => {
  it('marca como seleccionada la opción activa', () => {
    renderChips('ACTIVO');
    expect(screen.getByRole('radiogroup', { name: 'Filtrar por estado' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Activos' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Todos' })).toHaveAttribute('aria-checked', 'false');
  });

  it('llama a onChange al hacer clic', async () => {
    const onChange = renderChips();
    await userEvent.click(screen.getByRole('radio', { name: 'Inactivos' }));
    expect(onChange).toHaveBeenCalledWith('INACTIVO');
  });

  it('con la flecha derecha pasa a la siguiente opción', async () => {
    const onChange = renderChips('TODOS');
    screen.getByRole('radio', { name: 'Todos' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenCalledWith('ACTIVO');
  });
});
