import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, DataTable, IconPlus, Spinner, type Column } from '../../../shared/components';
import { toApiError } from '../../../shared/api/apiError';
import { useToast } from '../../../shared/notifications/useToast';
import { usuariosApi } from '../api/usuariosApi';
import { ROL_TEXTO, type UserResponse } from '../types';
import styles from './UsuarioPages.module.css';

const COLUMNAS: Column<UserResponse>[] = [
  { header: 'Usuario', render: (u) => u.username },
  { header: 'Email', render: (u) => u.email },
  {
    header: 'Roles',
    render: (u) =>
      u.roles
        .map((r) => ROL_TEXTO[r] ?? r)
        .sort()
        .join(', '),
  },
];

/** /usuarios — solo ADMIN. */
export function UsuarioListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [usuarios, setUsuarios] = useState<UserResponse[] | null>(null);

  useEffect(() => {
    let cancelado = false;
    usuariosApi
      .listar()
      .then((lista) => {
        if (!cancelado) {
          setUsuarios([...lista].sort((a, b) => a.username.localeCompare(b.username)));
        }
      })
      .catch((e: unknown) => {
        if (!cancelado) {
          toast.error(toApiError(e).message);
          setUsuarios([]);
        }
      });
    return () => {
      cancelado = true;
    };
  }, [toast]);

  return (
    <section className={styles.pagina}>
      <header className={styles.encabezado}>
        <h1 className={styles.titulo}>Usuarios</h1>
        <Button icon={<IconPlus />} onClick={() => navigate('/usuarios/nuevo')}>
          Nuevo usuario
        </Button>
      </header>
      {usuarios === null ? (
        <Spinner />
      ) : (
        <DataTable
          columns={COLUMNAS}
          rows={usuarios}
          getRowKey={(u) => u.id}
          emptyMessage="No hay usuarios para mostrar."
          footer={`${usuarios.length} ${usuarios.length === 1 ? 'usuario' : 'usuarios'}`}
        />
      )}
    </section>
  );
}
