import { ApiError } from '../../shared/api/apiError';
import { clientesApi } from '../clientes/api/clientesApi';
import type { ClienteResponse } from '../clientes/types';
import { usuariosApi } from '../usuarios/api/usuariosApi';
import type { UserResponse } from '../usuarios/types';
import { dniDeRemitente, dniVinculado, esSoloCliente, vincularDni } from './clienteActual';

const USER_ID = 'u-1';

const usuario = (email: string): UserResponse => ({
  id: USER_ID,
  username: 'juan',
  email,
  roles: ['CLIENTE'],
});

const cliente = (email: string): ClienteResponse => ({
  idCliente: 'c-1',
  dni: '35123456',
  nombreCompleto: 'Pérez, Juan',
  email,
  telefono: '3881234567',
  fechaCreacion: '2026-11-01T10:00:00',
});

describe('dniDeRemitente', () => {
  it('saca el DNI del texto que arma el backend', () => {
    expect(dniDeRemitente('Nombre: Pérez, Juan - DNI: 35123456')).toBe('35123456');
  });

  it('devuelve null si el texto no tiene DNI', () => {
    expect(dniDeRemitente('Sin datos')).toBeNull();
  });
});

describe('esSoloCliente', () => {
  it('solo filtra al CLIENTE sin ADMIN', () => {
    expect(esSoloCliente(['CLIENTE'])).toBe(true);
    expect(esSoloCliente(['ADMIN'])).toBe(false);
    expect(esSoloCliente(['REPARTIDOR'])).toBe(false);
    expect(esSoloCliente(['ADMIN', 'CLIENTE'])).toBe(false);
  });
});

describe('vincularDni', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('con el mismo email (sin importar mayúsculas) guarda el DNI', async () => {
    vi.spyOn(usuariosApi, 'me').mockResolvedValue(usuario(' Juan.Perez@email.com '));
    const obtener = vi
      .spyOn(clientesApi, 'obtener')
      .mockResolvedValue(cliente('juan.perez@email.com'));

    await expect(vincularDni(USER_ID, '35123456')).resolves.toBe('35123456');

    expect(obtener).toHaveBeenCalledWith('35123456');
    expect(dniVinculado.get(USER_ID)).toBe('35123456');
  });

  it('con otro email no lo guarda', async () => {
    vi.spyOn(usuariosApi, 'me').mockResolvedValue(usuario('otra@email.com'));
    vi.spyOn(clientesApi, 'obtener').mockResolvedValue(cliente('juan.perez@email.com'));

    await expect(vincularDni(USER_ID, '35123456')).rejects.toThrow(
      'Ese DNI no corresponde a tu usuario.',
    );
    expect(dniVinculado.get(USER_ID)).toBeNull();
  });

  it('si no hay cliente con ese DNI, lo dice', async () => {
    vi.spyOn(usuariosApi, 'me').mockResolvedValue(usuario('juan.perez@email.com'));
    vi.spyOn(clientesApi, 'obtener').mockRejectedValue(new ApiError(404, 'No encontrado'));

    await expect(vincularDni(USER_ID, '99999999')).rejects.toThrow(
      'No hay un cliente registrado con ese DNI.',
    );
  });

  it('el DNI se guarda por usuario', () => {
    dniVinculado.set('u-1', '35123456');
    expect(dniVinculado.get('u-2')).toBeNull();
  });
});
