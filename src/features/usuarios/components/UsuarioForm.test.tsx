import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UsuarioForm } from './UsuarioForm';

async function completar(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Usuario'), '  juan  ');
  await user.type(screen.getByLabelText('Email'), 'juan@mail.com');
  await user.type(screen.getByLabelText('Contraseña'), '12345678');
  await user.type(screen.getByLabelText('Repetir contraseña'), '12345678');
}

describe('UsuarioForm', () => {
  it('muestra los errores y no envía si el formulario es inválido', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<UsuarioForm submitLabel="Crear cuenta" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Usuario'), 'ab');
    await user.type(screen.getByLabelText('Contraseña'), '123');
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('El usuario debe tener entre 3 y 50 caracteres.')).toBeInTheDocument();
    expect(
      screen.getByText('La contraseña debe tener entre 8 y 72 caracteres.'),
    ).toBeInTheDocument();
    expect(screen.getByText('El email es obligatorio.')).toBeInTheDocument();
    expect(screen.getByText('Las contraseñas no coinciden.')).toBeInTheDocument();
    expect(screen.getByLabelText('Usuario')).toHaveAttribute('aria-invalid', 'true');
  });

  it('el registro público no envía roles y recorta los espacios', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<UsuarioForm submitLabel="Crear cuenta" onSubmit={onSubmit} />);

    expect(screen.queryByLabelText('Rol')).not.toBeInTheDocument();
    await completar(user);
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(onSubmit).toHaveBeenCalledWith({
      username: 'juan',
      email: 'juan@mail.com',
      password: '12345678',
    });
    expect(onSubmit.mock.calls[0][0]).not.toHaveProperty('roles');
  });

  it('el alta del ADMIN envía el rol elegido y avisa sobre el repartidor', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<UsuarioForm conRol submitLabel="Crear usuario" onSubmit={onSubmit} />);

    expect(screen.getByRole('note')).toHaveTextContent(/sección Repartidores/);
    await user.selectOptions(screen.getByLabelText('Rol'), 'ADMIN');
    expect(screen.queryByRole('note')).not.toBeInTheDocument();

    await completar(user);
    await user.click(screen.getByRole('button', { name: 'Crear usuario' }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ roles: ['ADMIN'] }));
  });

  it('vuelve a habilitar el botón si el envío falla', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error('409'));
    render(<UsuarioForm submitLabel="Crear cuenta" onSubmit={onSubmit} />);

    await completar(user);
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeEnabled();
  });
});
