import { describe, expect, it } from 'vitest';
import { rolesTienenPermiso, type Rol } from '../../shared/auth/permissions';
import { usuariosNav } from './nav';

// Lo mismo que hará el NavBar (LT4-04): mostrar un ítem si no pide permiso o si el rol lo tiene.
const visibles = (rol: Rol) =>
  usuariosNav
    .filter((item) => !item.permiso || rolesTienenPermiso([rol], item.permiso))
    .map((item) => item.label);

describe('usuariosNav', () => {
  it('"Usuarios" solo aparece para ADMIN', () => {
    expect(visibles('ADMIN')).toContain('Usuarios');
    expect(visibles('CLIENTE')).not.toContain('Usuarios');
    expect(visibles('REPARTIDOR')).not.toContain('Usuarios');
  });

  it('"Mi perfil" aparece para todos los roles', () => {
    for (const rol of ['ADMIN', 'CLIENTE', 'REPARTIDOR'] as const) {
      expect(visibles(rol)).toContain('Mi perfil');
    }
  });
});
