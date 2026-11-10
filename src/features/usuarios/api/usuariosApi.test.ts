import { afterEach, describe, expect, it, vi } from 'vitest';
import { httpClient } from '../../../shared/api/httpClient';
import { usuariosApi } from './usuariosApi';

const BASE = '/applications/apisecurity/api';
const DATA = { ok: true };

function simular(metodo: 'get' | 'post') {
  return vi.spyOn(httpClient, metodo).mockResolvedValue({ data: DATA });
}

describe('usuariosApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('registrar hace POST a /auth/register con el DTO', async () => {
    const post = simular('post');
    const dto = { username: 'juan', password: '12345678', email: 'juan@mail.com' };
    await expect(usuariosApi.registrar(dto)).resolves.toBe(DATA);
    expect(post).toHaveBeenCalledWith(`${BASE}/auth/register`, dto);
  });

  it('me pide /auth/me', async () => {
    const get = simular('get');
    await expect(usuariosApi.me()).resolves.toBe(DATA);
    expect(get).toHaveBeenCalledWith(`${BASE}/auth/me`);
  });

  it('listar pide /users', async () => {
    const get = simular('get');
    await expect(usuariosApi.listar()).resolves.toBe(DATA);
    expect(get).toHaveBeenCalledWith(`${BASE}/users`);
  });
});
