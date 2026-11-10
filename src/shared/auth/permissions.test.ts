import { rolesTienenPermiso } from './permissions';

describe('rolesTienenPermiso', () => {
  it('da permiso si alguno de los roles está habilitado', () => {
    expect(rolesTienenPermiso(['CLIENTE'], 'envios.crear')).toBe(true);
    expect(rolesTienenPermiso(['REPARTIDOR', 'CLIENTE'], 'clientes.ver')).toBe(true);
  });

  it('niega el permiso si ningún rol está habilitado', () => {
    expect(rolesTienenPermiso(['CLIENTE'], 'envios.cancelar')).toBe(false);
    expect(rolesTienenPermiso(['REPARTIDOR'], 'usuarios.gestionar')).toBe(false);
  });

  it('niega el permiso sin roles', () => {
    expect(rolesTienenPermiso([], 'envios.ver')).toBe(false);
  });
});
