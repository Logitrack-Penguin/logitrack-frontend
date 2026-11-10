import { sessionStore, type Sesion } from './sessionStore';

const ahoraEnSegundos = () => Math.floor(Date.now() / 1000);

const SESION: Sesion = {
  token: 'abc',
  userId: '6f1c2a8e-0000-0000-0000-000000000000',
  username: 'agus',
  roles: ['CLIENTE'],
  exp: ahoraEnSegundos() + 3600,
};

beforeEach(() => {
  sessionStore.clear();
  sessionStorage.clear();
});

describe('sessionStore', () => {
  it('guarda la sesión en memoria y en sessionStorage', () => {
    sessionStore.set(SESION);
    expect(sessionStore.get()).toEqual(SESION);
    expect(JSON.parse(sessionStorage.getItem('logitrack.sesion') ?? 'null')).toEqual(SESION);
  });

  it('recupera la sesión de sessionStorage (recarga de la pestaña)', () => {
    sessionStorage.setItem('logitrack.sesion', JSON.stringify(SESION));
    expect(sessionStore.get()).toEqual(SESION);
  });

  it('clear borra la sesión', () => {
    sessionStore.set(SESION);
    sessionStore.clear();
    expect(sessionStore.get()).toBeNull();
    expect(sessionStorage.getItem('logitrack.sesion')).toBeNull();
  });

  it('una sesión vencida devuelve null y se borra', () => {
    sessionStore.set({ ...SESION, exp: ahoraEnSegundos() - 1 });
    expect(sessionStore.get()).toBeNull();
    expect(sessionStorage.getItem('logitrack.sesion')).toBeNull();
  });

  it('un JSON inválido en sessionStorage devuelve null', () => {
    sessionStorage.setItem('logitrack.sesion', '{no es json');
    expect(sessionStore.get()).toBeNull();
  });
});
