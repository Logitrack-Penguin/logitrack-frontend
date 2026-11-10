import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';
import { Spinner } from '../Spinner/Spinner';

describe('EmptyState', () => {
  it('muestra el mensaje y la acción', () => {
    render(<EmptyState message="No hay clientes" action={<button>Nuevo cliente</button>} />);
    expect(screen.getByText('No hay clientes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nuevo cliente' })).toBeInTheDocument();
  });
});

describe('Spinner', () => {
  it('anuncia que está cargando', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toHaveTextContent('Cargando…');
  });
});
