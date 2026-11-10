import { PERMISOS, rolesTienenPermiso, type Permiso, type Rol } from './permissions';

const TODOS = Object.keys(PERMISOS) as Permiso[];
const permisosDe = (rol: Rol): Permiso[] => TODOS.filter((p) => rolesTienenPermiso([rol], p));

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

// Matriz por rol: replica config-ms/api-gateway-dev.yaml.
describe('permisos de cada rol', () => {
  it('ADMIN tiene todos los permisos', () => {
    expect(permisosDe('ADMIN')).toEqual(TODOS);
  });

  it('CLIENTE ve y crea envíos y ve clientes', () => {
    expect(permisosDe('CLIENTE')).toEqual(['envios.ver', 'envios.crear', 'clientes.ver']);
  });

  it('REPARTIDOR ve envíos y repartidores y cambia estados', () => {
    expect(permisosDe('REPARTIDOR')).toEqual([
      'envios.ver',
      'envios.cambiarEstado',
      'repartidores.ver',
      'repartidores.cambiarEstado',
    ]);
  });
});
