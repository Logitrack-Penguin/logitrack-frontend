import { afterEach, describe, expect, it, vi } from 'vitest';
import { httpClient } from '../../../shared/api/httpClient';
import { enviosApi } from './enviosApi';

const BASE = '/applications/apishipment/api/v1/envios';
const ID = '3f2b8c1e-0000-4000-8000-000000000001';
const DATA = { ok: true };

function simular(metodo: 'get' | 'post' | 'put' | 'patch') {
  return vi.spyOn(httpClient, metodo).mockResolvedValue({ data: DATA });
}

describe('enviosApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('listar sin estado pide todos los envíos', async () => {
    const get = simular('get');
    await expect(enviosApi.listar()).resolves.toBe(DATA);
    expect(get).toHaveBeenCalledWith(BASE, { params: { estado: undefined } });
  });

  it('listar con estado manda el filtro como query param', async () => {
    const get = simular('get');
    await enviosApi.listar('EN_RUTA');
    expect(get).toHaveBeenCalledWith(BASE, { params: { estado: 'EN_RUTA' } });
  });

  it('obtener pide el envío por id', async () => {
    const get = simular('get');
    await expect(enviosApi.obtener(ID)).resolves.toBe(DATA);
    expect(get).toHaveBeenCalledWith(`${BASE}/${ID}`);
  });

  it('buscarPorCodigo usa /tracking y codifica el código', async () => {
    const get = simular('get');
    await enviosApi.buscarPorCodigo('TRK-2026-000001');
    expect(get).toHaveBeenCalledWith(`${BASE}/tracking/TRK-2026-000001`);
    await enviosApi.buscarPorCodigo('a/b c');
    expect(get).toHaveBeenLastCalledWith(`${BASE}/tracking/a%2Fb%20c`);
  });

  it('crear hace POST con el DTO', async () => {
    const post = simular('post');
    const dto = {
      peso: 2,
      dimensiones: { ancho: 10, alto: 20, largo: 30 },
      direccionOrigen: { calle: 'A', numero: '1', ciudad: 'Jujuy', codigoPostal: '4600' },
      direccionDestino: { calle: 'B', numero: '2', ciudad: 'Salta', codigoPostal: '4400' },
      dniCliente: '12345678',
    };
    await expect(enviosApi.crear(dto)).resolves.toBe(DATA);
    expect(post).toHaveBeenCalledWith(BASE, dto);
  });

  it('cancelar hace PATCH a /cancelar', async () => {
    const patch = simular('patch');
    await expect(enviosApi.cancelar(ID)).resolves.toBe(DATA);
    expect(patch).toHaveBeenCalledWith(`${BASE}/${ID}/cancelar`);
  });

  it('asignarRepartidor hace PUT sin body y con dniRepartidor como query param', async () => {
    const put = simular('put');
    await expect(enviosApi.asignarRepartidor(ID, '28111222')).resolves.toBe(DATA);
    expect(put).toHaveBeenCalledWith(`${BASE}/${ID}/asignarRepartidor`, null, {
      params: { dniRepartidor: '28111222' },
    });
  });

  it('cambiarEstado hace PATCH a /estado con el código de recepción en el body', async () => {
    const patch = simular('patch');
    await expect(enviosApi.cambiarEstado(ID, 'REC-002')).resolves.toBe(DATA);
    expect(patch).toHaveBeenCalledWith(`${BASE}/${ID}/estado`, { codigoRecepcion: 'REC-002' });
  });

  it('cambiarEstado sin código (paso a EN_RUTA)', async () => {
    const patch = simular('patch');
    await enviosApi.cambiarEstado(ID);
    expect(patch).toHaveBeenCalledWith(`${BASE}/${ID}/estado`, { codigoRecepcion: undefined });
  });

  it('historial pide /historial', async () => {
    const get = simular('get');
    await expect(enviosApi.historial(ID)).resolves.toBe(DATA);
    expect(get).toHaveBeenCalledWith(`${BASE}/${ID}/historial`);
  });
});
