import { enviosNav } from './nav';

describe('enviosNav', () => {
  it('muestra Envíos y Seguimiento a quien tenga envios.ver', () => {
    expect(enviosNav).toEqual([
      { label: 'Envíos', to: '/envios', permiso: 'envios.ver' },
      { label: 'Seguimiento', to: '/envios/seguimiento', permiso: 'envios.ver' },
    ]);
  });
});
