import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider, useParams } from 'react-router';
import { ApiError } from '../../../shared/api/apiError';
import { enviosApi } from '../api/enviosApi';
import { envioDePrueba } from '../test/datos';
import { Proveedores } from '../test/Proveedores';
import { EnvioSeguimientoPage } from './EnvioSeguimientoPage';

function DetalleFalso() {
  return <p>Detalle de {useParams().id}</p>;
}

function renderizar() {
  const router = createMemoryRouter(
    [
      { path: '/envios/seguimiento', element: <EnvioSeguimientoPage /> },
      { path: '/envios/:id', element: <DetalleFalso /> },
    ],
    { initialEntries: ['/envios/seguimiento'] },
  );
  render(
    <Proveedores>
      <RouterProvider router={router} />
    </Proveedores>,
  );
}

async function buscar(codigo: string) {
  const user = userEvent.setup();
  if (codigo) await user.type(screen.getByLabelText('Código de seguimiento'), codigo);
  await user.click(screen.getByRole('button', { name: 'Buscar' }));
}

describe('EnvioSeguimientoPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('si encuentra el envío, abre su detalle', async () => {
    const buscarPorCodigo = vi
      .spyOn(enviosApi, 'buscarPorCodigo')
      .mockResolvedValue(envioDePrueba());
    renderizar();

    await buscar('  LT-0001 ');

    expect(buscarPorCodigo).toHaveBeenCalledWith('LT-0001');
    expect(
      await screen.findByText('Detalle de 3f2b8c1e-0000-4000-8000-000000000001'),
    ).toBeInTheDocument();
  });

  it('un código inexistente muestra el mensaje del backend', async () => {
    vi.spyOn(enviosApi, 'buscarPorCodigo').mockRejectedValue(
      new ApiError(404, 'Envío no encontrado'),
    );
    renderizar();

    await buscar('NO-EXISTE');

    expect(await screen.findByRole('alert')).toHaveTextContent('Envío no encontrado');
    expect(screen.getByLabelText('Código de seguimiento')).toHaveAttribute('aria-invalid', 'true');
  });

  it('no busca si el código está vacío', async () => {
    const buscarPorCodigo = vi.spyOn(enviosApi, 'buscarPorCodigo');
    renderizar();

    await buscar('');

    expect(await screen.findByText('Ingresá un código de seguimiento.')).toBeInTheDocument();
    expect(buscarPorCodigo).not.toHaveBeenCalled();
  });

  it('otros errores van a un toast', async () => {
    vi.spyOn(enviosApi, 'buscarPorCodigo').mockRejectedValue(
      new ApiError(0, 'No se pudo conectar con el servidor.'),
    );
    renderizar();

    await buscar('LT-0001');

    expect(await screen.findByText('No se pudo conectar con el servidor.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeEnabled();
  });
});
