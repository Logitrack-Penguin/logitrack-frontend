import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it.each([
    ['EN_RUTA', 'En ruta'],
    ['PENDIENTE_ASIGNACION', 'Pendiente de asignación'],
    ['ACTIVO', 'Activo'],
    ['INACTIVO', 'Inactivo'],
  ])('muestra %s como "%s"', (estado, texto) => {
    render(<StatusBadge estado={estado} />);
    expect(screen.getByText(texto)).toBeInTheDocument();
  });

  it('un estado desconocido se muestra tal cual', () => {
    render(<StatusBadge estado="OTRO" />);
    expect(screen.getByText('OTRO')).toBeInTheDocument();
  });
});
