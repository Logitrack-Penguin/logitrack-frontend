import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider, useParams } from 'react-router';
import { ApiError } from '../../../shared/api/apiError';
import { enviosApi } from '../api/enviosApi';
import { sessionStore } from '../../../shared/auth/sessionStore';
import { DNI_DE_PRUEBA, envioDePrueba, iniciarSesionComo, ponerDniEnElToken } from '../test/datos';
import { EnvioCreatePage } from './EnvioCreatePage';
import { Proveedores } from '../test/Proveedores';

function DetalleFalso() {
  return <p>Detalle de {useParams().id}</p>;
}

function renderizar() {
  const router = createMemoryRouter(
    [
      { path: '/envios/nuevo', element: <EnvioCreatePage /> },
      { path: '/envios/:id', element: <DetalleFalso /> },
    ],
    { initialEntries: ['/envios/nuevo'] },
  );
  render(
    <Proveedores>
      <RouterProvider router={router} />
    </Proveedores>,
  );
}

// Los campos de origen y destino tienen la misma etiqueta: se buscan por id.
const input = (id: string) => document.getElementById(id) as HTMLInputElement;

// Carga cada campo de una vez: tipear letra por letra 14 campos hace lento el test.
function completar(dni = '30111222') {
  const valores: Record<string, string> = {
    peso: '2.5',
    'dimensiones.ancho': '20',
    'dimensiones.alto': '10',
    'dimensiones.largo': '30',
    'direccionOrigen.calle': 'Belgrano',
    'direccionOrigen.numero': '450',
    'direccionOrigen.ciudad': 'Jujuy',
    'direccionOrigen.codigoPostal': '4600',
    'direccionDestino.calle': 'Güemes',
    'direccionDestino.numero': '1200',
    'direccionDestino.ciudad': 'Palpalá',
    'direccionDestino.codigoPostal': '4612',
    'direccionDestino.observaciones': 'Timbre B',
    dniCliente: dni,
  };
  for (const [id, valor] of Object.entries(valores)) {
    fireEvent.change(input(id), { target: { value: valor } });
  }
}

const crearEnvio = () => screen.getByRole('button', { name: 'Crear envío' });

describe('EnvioCreatePage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    sessionStore.clear();
  });

  it('con el formulario vacío muestra los errores y no llama al backend', async () => {
    const crear = vi.spyOn(enviosApi, 'crear');
    const user = userEvent.setup();
    renderizar();

    await user.click(crearEnvio());

    expect(screen.getByText('El peso debe ser mayor a 0.')).toBeInTheDocument();
    expect(screen.getByText('El DNI del cliente es obligatorio.')).toBeInTheDocument();
    expect(screen.getAllByText('Obligatorio.')).toHaveLength(8);
    expect(input('direccionOrigen.calle')).toHaveAttribute('aria-invalid', 'true');
    expect(crear).not.toHaveBeenCalled();
  });

  it('un DNI con menos de 8 dígitos no se envía', async () => {
    const crear = vi.spyOn(enviosApi, 'crear');
    const user = userEvent.setup();
    renderizar();

    completar('1234567');
    await user.click(crearEnvio());

    expect(screen.getByText('El DNI debe tener 8 dígitos.')).toBeInTheDocument();
    expect(crear).not.toHaveBeenCalled();
  });

  it('envía el DTO correcto, avisa código y tarifa, y abre el detalle', async () => {
    const crear = vi
      .spyOn(enviosApi, 'crear')
      .mockResolvedValue(envioDePrueba({ codigoSeguimiento: 'TRK-1A2B3C4D', tarifa: 1500 }));
    const user = userEvent.setup();
    renderizar();

    completar();
    await user.click(crearEnvio());

    expect(crear).toHaveBeenCalledWith({
      peso: 2.5,
      dimensiones: { ancho: 20, alto: 10, largo: 30 },
      direccionOrigen: { calle: 'Belgrano', numero: '450', ciudad: 'Jujuy', codigoPostal: '4600' },
      direccionDestino: {
        calle: 'Güemes',
        numero: '1200',
        ciudad: 'Palpalá',
        codigoPostal: '4612',
        observaciones: 'Timbre B',
      },
      dniCliente: '30111222',
    });
    expect(
      await screen.findByText(/Envío TRK-1A2B3C4D creado\. Tarifa: \$\s?1\.500,00\./),
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Detalle de 3f2b8c1e-0000-4000-8000-000000000001'),
    ).toBeInTheDocument();
  });

  it('un DNI sin cliente muestra el mensaje del backend', async () => {
    vi.spyOn(enviosApi, 'crear').mockRejectedValue(
      new ApiError(404, 'Cliente no encontrado con DNI: 30111222'),
    );
    const user = userEvent.setup();
    renderizar();

    completar();
    await user.click(crearEnvio());

    expect(await screen.findByText('Cliente no encontrado con DNI: 30111222')).toBeInTheDocument();
    expect(crearEnvio()).toBeEnabled();
  });

  it('los errores por campo del backend se muestran en su campo', async () => {
    vi.spyOn(enviosApi, 'crear').mockRejectedValue(
      new ApiError(400, 'Los datos enviados no son válidos.', {
        dniCliente: 'El DNI solo puede contener números.',
      }),
    );
    const user = userEvent.setup();
    renderizar();

    completar();
    await user.click(crearEnvio());

    expect(await screen.findByText('El DNI solo puede contener números.')).toBeInTheDocument();
    expect(input('dniCliente')).toHaveAttribute('aria-invalid', 'true');
  });

  it('un CLIENTE crea a su nombre: su DNI viene cargado y no se puede cambiar', async () => {
    iniciarSesionComo('CLIENTE');
    ponerDniEnElToken();
    const crear = vi.spyOn(enviosApi, 'crear').mockResolvedValue(envioDePrueba());
    const user = userEvent.setup();
    renderizar();

    expect(input('dniCliente')).toHaveValue(DNI_DE_PRUEBA);
    expect(input('dniCliente')).toHaveAttribute('readonly');

    completar('38987654'); // aunque se fuerce otro DNI, se manda el suyo
    await user.click(crearEnvio());

    expect(crear).toHaveBeenCalledWith(expect.objectContaining({ dniCliente: DNI_DE_PRUEBA }));
  });
});
