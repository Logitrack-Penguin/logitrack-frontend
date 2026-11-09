import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { NotFoundPage } from './NotFoundPage';

describe('NotFoundPage', () => {
  it('muestra el mensaje de página no encontrada', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument();
  });
});
