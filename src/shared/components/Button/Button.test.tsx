import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renderiza el texto y es type="button" por defecto', () => {
    render(<Button>Guardar</Button>);
    expect(screen.getByRole('button', { name: 'Guardar' })).toHaveAttribute('type', 'button');
  });

  it('muestra el ícono antes del texto', () => {
    render(<Button icon={<svg data-testid="icono" />}>Crear envío</Button>);
    expect(screen.getByRole('button', { name: 'Crear envío' })).toContainElement(
      screen.getByTestId('icono'),
    );
  });

  it('llama a onClick al hacer clic', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Guardar</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('con loading queda deshabilitado y no dispara onClick', async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Guardar
      </Button>,
    );
    const boton = screen.getByRole('button', { name: 'Guardar' });
    expect(boton).toBeDisabled();
    expect(boton).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(boton);
    expect(onClick).not.toHaveBeenCalled();
  });
});
