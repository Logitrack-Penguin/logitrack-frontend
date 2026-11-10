import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from './ConfirmDialog';

// jsdom no implementa showModal/close: los simulamos solo en este archivo.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.removeAttribute('open');
  };
});

function renderDialog(props: Partial<Parameters<typeof ConfirmDialog>[0]> = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  const utils = render(
    <ConfirmDialog
      open
      title="Eliminar repartidor"
      message="¿Seguro que querés eliminarlo?"
      confirmLabel="Eliminar"
      danger
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...props}
    />,
  );
  return { ...utils, onConfirm, onCancel };
}

describe('ConfirmDialog', () => {
  it('abierto muestra título y mensaje', () => {
    renderDialog();
    expect(screen.getByRole('dialog', { name: 'Eliminar repartidor' })).toBeInTheDocument();
    expect(screen.getByText('¿Seguro que querés eliminarlo?')).toBeInTheDocument();
  });

  it('llama a onConfirm y onCancel', async () => {
    const { onConfirm, onCancel } = renderDialog();
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('cerrado no se muestra', () => {
    renderDialog({ open: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('muestra children (por ejemplo un campo extra)', () => {
    renderDialog({ children: <input aria-label="Código de recepción" /> });
    expect(screen.getByLabelText('Código de recepción')).toBeInTheDocument();
  });
});
