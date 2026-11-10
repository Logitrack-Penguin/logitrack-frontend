import { afterEach, describe, expect, it, vi } from 'vitest';
import { httpClient } from '../../../shared/api/httpClient';
import { repartidoresApi } from './repartidoresApi';
import type { RepartidorRequest } from '../types';

const BASE = '/applications/apicourier/api/v1/repartidores';
const DNI = '28111222';
const DATA = { ok: true };

function simular(metodo: 'get' | 'post' | 'put' | 'delete') {
  return vi.spyOn(httpClient, metodo).mockResolvedValue({ data: DATA });
}

const dto: RepartidorRequest = {
  dni: DNI,
  nombre: 'Esteban',
  apellido: 'Quito',
  telefono: '3881112222',
  tipoVehiculo: 'MOTO',
};

describe('repartidoresApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('listar sin estado pide todos los repartidores', async () => {
    const get = simular('get');
    await expect(repartidoresApi.listar()).resolves.toBe(DATA);
    expect(get).toHaveBeenCalledWith(BASE, { params: { estado: undefined } });
  });

  it('listar con estado manda el filtro como query param', async () => {
    const get = simular('get');
    await repartidoresApi.listar('ACTIVO');
    expect(get).toHaveBeenCalledWith(BASE, { params: { estado: 'ACTIVO' } });
  });

  it('obtener pide el repartidor por DNI', async () => {
    const get = simular('get');
    await expect(repartidoresApi.obtener(DNI)).resolves.toBe(DATA);
    expect(get).toHaveBeenCalledWith(`${BASE}/${DNI}`);
  });

  it('crear hace POST con el DTO', async () => {
    const post = simular('post');
    await expect(repartidoresApi.crear(dto)).resolves.toBe(DATA);
    expect(post).toHaveBeenCalledWith(BASE, dto);
  });

  it('actualizar hace PUT con el DTO completo', async () => {
    const put = simular('put');
    await expect(repartidoresApi.actualizar(DNI, dto)).resolves.toBe(DATA);
    expect(put).toHaveBeenCalledWith(`${BASE}/${DNI}`, dto);
  });

  it('cambiarEstado usa /estado (no /cambiarEstado)', async () => {
    const put = simular('put');
    await expect(repartidoresApi.cambiarEstado(DNI)).resolves.toBe(DATA);
    expect(put).toHaveBeenCalledWith(`${BASE}/${DNI}/estado`);
  });

  it('eliminar hace DELETE y no devuelve nada', async () => {
    const del = simular('delete');
    await expect(repartidoresApi.eliminar(DNI)).resolves.toBeUndefined();
    expect(del).toHaveBeenCalledWith(`${BASE}/${DNI}`);
  });

  it('estaDisponible devuelve el booleano plano', async () => {
    vi.spyOn(httpClient, 'get').mockResolvedValue({ data: false });
    await expect(repartidoresApi.estaDisponible(DNI)).resolves.toBe(false);
    expect(httpClient.get).toHaveBeenCalledWith(`${BASE}/${DNI}/estaDisponible`);
  });
});
