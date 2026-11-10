import { httpClient } from '../../../shared/api/httpClient';
import type { ClienteRequest } from '../types';
import { clientesApi } from './clientesApi';

const BASE = '/applications/apishipment/api/v1/clientes';
const DNI = '30111222';
const DATA = { ok: true };

function simular(metodo: 'get' | 'post' | 'put' | 'delete') {
  return vi.spyOn(httpClient, metodo).mockResolvedValue({ data: DATA });
}

const dto: ClienteRequest = {
  dni: DNI,
  nombre: 'Ana',
  apellido: 'Pérez',
  email: 'ana@mail.com',
  telefono: '3884445555',
};

describe('clientesApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('listar pide todos los clientes', async () => {
    const get = simular('get');
    await expect(clientesApi.listar()).resolves.toBe(DATA);
    expect(get).toHaveBeenCalledWith(BASE);
  });

  it('obtener pide el cliente por DNI', async () => {
    const get = simular('get');
    await expect(clientesApi.obtener(DNI)).resolves.toBe(DATA);
    expect(get).toHaveBeenCalledWith(`${BASE}/${DNI}`);
  });

  it('crear hace POST con el DTO', async () => {
    const post = simular('post');
    await expect(clientesApi.crear(dto)).resolves.toBe(DATA);
    expect(post).toHaveBeenCalledWith(BASE, dto);
  });

  it('actualizar hace PUT con el DTO completo', async () => {
    const put = simular('put');
    await expect(clientesApi.actualizar(DNI, dto)).resolves.toBe(DATA);
    expect(put).toHaveBeenCalledWith(`${BASE}/${DNI}`, dto);
  });

  it('eliminar hace DELETE y no devuelve nada', async () => {
    const del = simular('delete');
    await expect(clientesApi.eliminar(DNI)).resolves.toBeUndefined();
    expect(del).toHaveBeenCalledWith(`${BASE}/${DNI}`);
  });
});
