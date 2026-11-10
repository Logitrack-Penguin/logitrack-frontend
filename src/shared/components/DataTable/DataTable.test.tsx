import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable, type Column } from './DataTable';

interface Fila {
  dni: string;
  nombre: string;
}

const columnas: Column<Fila>[] = [
  { header: 'DNI', render: (f) => f.dni },
  { header: 'Nombre', render: (f) => f.nombre },
];

const filas: Fila[] = [
  { dni: '28111222', nombre: 'Quito, Esteban' },
  { dni: '30222333', nombre: 'Córdoba, María' },
];

describe('DataTable', () => {
  it('muestra encabezados y filas', () => {
    render(<DataTable columns={columnas} rows={filas} getRowKey={(f) => f.dni} />);
    expect(screen.getByRole('columnheader', { name: 'DNI' })).toBeInTheDocument();
    expect(screen.getByText('Quito, Esteban')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(3);
  });

  it('muestra emptyMessage cuando no hay filas', () => {
    render(
      <DataTable
        columns={columnas}
        rows={[]}
        getRowKey={(f) => f.dni}
        emptyMessage="No hay repartidores"
      />,
    );
    expect(screen.getByText('No hay repartidores')).toBeInTheDocument();
  });

  it('llama a onRowClick con la fila clickeada (mouse y Enter)', async () => {
    const onRowClick = vi.fn();
    render(
      <DataTable
        columns={columnas}
        rows={filas}
        getRowKey={(f) => f.dni}
        onRowClick={onRowClick}
      />,
    );
    await userEvent.click(screen.getByText('Córdoba, María'));
    expect(onRowClick).toHaveBeenCalledWith(filas[1]);

    screen.getByText('Quito, Esteban').closest('tr')?.focus();
    await userEvent.keyboard('{Enter}');
    expect(onRowClick).toHaveBeenCalledWith(filas[0]);
  });
});
