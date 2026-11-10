import { act, fireEvent, render, screen } from '@testing-library/react';
import { ToastProvider, TOAST_DURACION_MS } from './ToastProvider';
import { useToast } from './useToast';

function Disparador() {
  const toast = useToast();
  return (
    <>
      <button onClick={() => toast.success('Repartidor creado')}>ok</button>
      <button onClick={() => toast.error('Cliente no encontrado')}>error</button>
    </>
  );
}

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('muestra el toast y lo quita a los 4 segundos', () => {
    render(
      <ToastProvider>
        <Disparador />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(screen.getByText('Repartidor creado')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(TOAST_DURACION_MS);
    });
    expect(screen.queryByText('Repartidor creado')).not.toBeInTheDocument();
  });

  it('se puede cerrar a mano y el contenedor es una región aria-live', () => {
    render(
      <ToastProvider>
        <Disparador />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'error' }));
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('status')).toHaveTextContent('Cliente no encontrado');

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar notificación' }));
    expect(screen.queryByText('Cliente no encontrado')).not.toBeInTheDocument();
  });

  it('useToast fuera del provider da un error claro', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Disparador />)).toThrow('useToast debe usarse dentro de <ToastProvider>.');
  });
});
