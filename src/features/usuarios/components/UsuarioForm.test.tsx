import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UsuarioForm } from './UsuarioForm';

async function completar(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Usuario'), '  juan  ');
  await user.type(screen.getByLabelText('Email'), 'juan@mail.com');
  await user.type(screen.getByLabelText('Contraseña'), '12345678');
  await user.type(screen.getByLabelText('Repetir contraseña'), '12345678');
}

async function completarCliente(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('DNI'), '30111222');
  await user.type(screen.getByLabelText('Nombre'), ' Juan ');
  await user.type(screen.getByLabelText('Apellido'), 'Pérez');
  await user.type(screen.getByLabelText('Teléfono'), '3881234567');
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

  it('el registro público no envía roles, manda los datos del cliente y recorta los espacios', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<UsuarioForm submitLabel="Crear cuenta" onSubmit={onSubmit} />);

    expect(screen.queryByLabelText('Rol')).not.toBeInTheDocument();
    await completar(user);
    await completarCliente(user);
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(onSubmit).toHaveBeenCalledWith({
      username: 'juan',
      email: 'juan@mail.com',
      password: '12345678',
      dni: '30111222',
      nombre: 'Juan',
      apellido: 'Pérez',
      telefono: '3881234567',
    });
    expect(onSubmit.mock.calls[0][0]).not.toHaveProperty('roles');
  });

  it('el alta del ADMIN envía el rol elegido; con CLIENTE no pide la ficha de repartidor', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<UsuarioForm conRol submitLabel="Crear usuario" onSubmit={onSubmit} />);

    expect(screen.getByRole('group', { name: 'Datos del repartidor' })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Rol'), 'CLIENTE');
    expect(screen.queryByRole('group', { name: 'Datos del repartidor' })).not.toBeInTheDocument();

    await completar(user);
    await completarCliente(user); // una cuenta CLIENTE necesita sus datos de cliente
    await user.click(screen.getByRole('button', { name: 'Crear usuario' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ roles: ['CLIENTE'], dni: '30111222' }),
    );
  });

  it('el alta del ADMIN no ofrece crear administradores', () => {
    render(<UsuarioForm conRol submitLabel="Crear usuario" onSubmit={vi.fn()} />);

    expect(screen.queryByRole('option', { name: 'Administrador' })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Repartidor' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Cliente' })).toBeInTheDocument();
  });

  it('vuelve a habilitar el botón si el envío falla', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error('409'));
    render(<UsuarioForm submitLabel="Crear cuenta" onSubmit={onSubmit} />);

    await completar(user);
    await completarCliente(user);
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeEnabled();
  });

  it('el registro público exige los datos del cliente', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<UsuarioForm submitLabel="Crear cuenta" onSubmit={onSubmit} />);

    await completar(user);
    await user.type(screen.getByLabelText('DNI'), '123');
    await user.type(screen.getByLabelText('Teléfono'), '388');
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('El DNI debe tener 8 dígitos.')).toBeInTheDocument();
    expect(screen.getByText('El nombre es obligatorio.')).toBeInTheDocument();
    expect(screen.getByText('El apellido es obligatorio.')).toBeInTheDocument();
    expect(screen.getByText('El teléfono debe tener 10 dígitos.')).toBeInTheDocument();
  });

  it('el ADMIN ve los datos del cliente solo si elige el rol CLIENTE', async () => {
    const user = userEvent.setup();
    render(<UsuarioForm conRol submitLabel="Crear usuario" onSubmit={vi.fn()} />);

    // Con REPARTIDOR el DNI es el de la ficha (sin la ayuda del DNI de cliente).
    expect(screen.queryByText('8 dígitos, sin puntos.')).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Rol'), 'CLIENTE');
    expect(screen.getByText('8 dígitos, sin puntos.')).toBeInTheDocument();
  });

  it('con REPARTIDOR valida la ficha y no envía si falta algún dato', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<UsuarioForm conRol submitLabel="Crear usuario" onSubmit={onSubmit} />);

    await completar(user);
    await user.type(screen.getByLabelText('DNI'), '123');
    await user.click(screen.getByRole('button', { name: 'Crear usuario' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('El DNI debe tener 8 dígitos.')).toBeInTheDocument();
    expect(screen.getByText('El vehículo es obligatorio.')).toBeInTheDocument();
  });

  it('con REPARTIDOR envía el usuario con su DNI y la ficha del repartidor', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<UsuarioForm conRol submitLabel="Crear usuario" onSubmit={onSubmit} />);

    await completar(user);
    await user.type(screen.getByLabelText('DNI'), '30111222');
    await user.type(screen.getByLabelText('Nombre'), 'Juan');
    await user.type(screen.getByLabelText('Apellido'), 'Perez');
    await user.type(screen.getByLabelText('Teléfono'), '3881112222');
    await user.type(screen.getByLabelText('Vehículo'), 'moto');
    await user.click(screen.getByRole('button', { name: 'Crear usuario' }));

    expect(onSubmit).toHaveBeenCalledWith(
      {
        username: 'juan',
        email: 'juan@mail.com',
        password: '12345678',
        roles: ['REPARTIDOR'],
        dni: '30111222',
      },
      {
        dni: '30111222',
        nombre: 'Juan',
        apellido: 'Perez',
        telefono: '3881112222',
        tipoVehiculo: 'MOTO',
      },
    );
  });
});
