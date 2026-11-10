import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { SinPermisoPage } from './SinPermisoPage';

describe('SinPermisoPage', () => {
  it('muestra el mensaje y el enlace al inicio', () => {
    render(
      <MemoryRouter>
        <SinPermisoPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'Sin permiso' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/');
  });
});
