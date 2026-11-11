import { crearToken } from '../../test/jwt';
import { sessionStore } from './sessionStore';

const KEY = 'logitrack.session';
const ahora = () => Math.floor(Date.now() / 1000);

beforeEach(() => {
  sessionStore.clear();
  sessionStorage.clear();
});

describe('sessionStore', () => {
  it('set guarda el token y deriva la sesión de sus claims', () => {
    const token = crearToken({ sub: 'luci', userId: 'u-2', roles: ['CLIENTE'] });
    sessionStore.set(token);
    expect(sessionStore.get()).toMatchObject({
      token,
      userId: 'u-2',
      username: 'luci',
      roles: ['CLIENTE'],
    });
    expect(sessionStorage.getItem(KEY)).toBe(token);
  });

  it('toma el DNI del claim "dni" solo si el token lo trae', () => {
    sessionStore.set(crearToken({ roles: ['REPARTIDOR'], dni: '30111222' }));
    expect(sessionStore.get()?.dni).toBe('30111222');

    sessionStore.set(crearToken({ roles: ['CLIENTE'] }));
    expect(sessionStore.get()).not.toHaveProperty('dni');
  });

  it('clear borra la sesión y avisa a los suscriptores', () => {
    const oyente = vi.fn();
    const desuscribir = sessionStore.subscribe(oyente);
    sessionStore.set(crearToken());
    sessionStore.clear();
    expect(sessionStore.get()).toBeNull();
    expect(sessionStorage.getItem(KEY)).toBeNull();
    expect(oyente).toHaveBeenCalledTimes(2);
    desuscribir();
  });

  it('no guarda un token vencido ni uno inválido', () => {
    sessionStore.set(crearToken({ exp: ahora() - 1 }));
    expect(sessionStore.get()).toBeNull();
    sessionStore.set('token-corrupto');
    expect(sessionStore.get()).toBeNull();
    expect(sessionStorage.getItem(KEY)).toBeNull();
  });
});

describe('sessionStore al iniciar (recarga de la página)', () => {
  afterEach(() => {
    vi.resetModules();
  });

  it('recupera la sesión si el token no venció', async () => {
    sessionStorage.setItem(KEY, crearToken({ sub: 'dani' }));
    vi.resetModules();
    const { sessionStore: recargado } = await import('./sessionStore');
    expect(recargado.get()?.username).toBe('dani');
  });

  it('descarta un token vencido guardado', async () => {
    sessionStorage.setItem(KEY, crearToken({ exp: ahora() - 1 }));
    vi.resetModules();
    const { sessionStore: recargado } = await import('./sessionStore');
    expect(recargado.get()).toBeNull();
    expect(sessionStorage.getItem(KEY)).toBeNull();
  });

  it('descarta un token corrupto guardado', async () => {
    sessionStorage.setItem(KEY, 'basura');
    vi.resetModules();
    const { sessionStore: recargado } = await import('./sessionStore');
    expect(recargado.get()).toBeNull();
  });
});
