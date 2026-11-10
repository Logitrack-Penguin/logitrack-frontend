import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchInput } from './SearchInput';
import { Card } from '../Card/Card';

function Buscador() {
  const [texto, setTexto] = useState('');
  return <SearchInput value={texto} onChange={setTexto} placeholder="Buscar por DNI" />;
}

describe('SearchInput', () => {
  it('muestra la × solo cuando hay texto y al tocarla limpia', async () => {
    render(<Buscador />);
    const input = screen.getByRole('searchbox', { name: 'Buscar por DNI' });
    expect(screen.queryByRole('button', { name: 'Limpiar búsqueda' })).not.toBeInTheDocument();

    await userEvent.type(input, '35123456');
    expect(input).toHaveValue('35123456');

    await userEvent.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }));
    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
  });

  it('Escape limpia la búsqueda', async () => {
    render(<Buscador />);
    const input = screen.getByRole('searchbox', { name: 'Buscar por DNI' });
    await userEvent.type(input, 'Quito{Escape}');
    expect(input).toHaveValue('');
  });
});

describe('Card', () => {
  it('renderiza su contenido', () => {
    render(<Card>Contenido</Card>);
    expect(screen.getByText('Contenido')).toBeInTheDocument();
  });
});
