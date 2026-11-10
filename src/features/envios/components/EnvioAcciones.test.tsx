import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '../../../shared/api/apiError';
import type { Rol } from '../../../shared/auth/permissions';
import { sessionStore } from '../../../shared/auth/sessionStore';
import { repartidoresApi } from '../../repartidores/api/repartidoresApi';
import type { RepartidorResponse } from '../../repartidores/types';
import { enviosApi } from '../api/enviosApi';
import { envioDePrueba, iniciarSesionComo } from '../test/datos';
import { Proveedores } from '../test/Proveedores';
import type { EnvioCourierResponse, EstadoEnvio } from '../types';
import { EnvioAcciones } from './EnvioAcciones';

// jsdom no implementa showModal/close del <dialog>.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.removeAttribute('open');
  };
});

const ID = '3f2b8c1e-0000-4000-8000-000000000001';

function renderizar(rol: Rol, estadoEnvio: EstadoEnvio) {
  iniciarSesionComo(rol);
  const onActualizado = vi.fn();
  render(
    <Proveedores>
      <EnvioAcciones envio={envioDePrueba({ estadoEnvio })} onActualizado={onActualizado} />
    </Proveedores>,
  );
  return { onActualizado, user: userEvent.setup() };
}

const botones = () => screen.queryAllByRole('button').map((b) => b.textContent);

describe('EnvioAcciones', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    sessionStore.clear();
  });

  describe('qué botones muestra', () => {
    it('ADMIN con un envío pendiente puede asignar o cancelar', () => {
      renderizar('ADMIN', 'PENDIENTE_ASIGNACION');
      expect(botones()).toEqual(['Asignar repartidor', 'Cancelar envío']);
    });

    it('ADMIN con repartidor asignado puede marcar en ruta o cancelar', () => {
      renderizar('ADMIN', 'REPARTIDOR_ASIGNADO');
      expect(botones()).toEqual(['Marcar en ruta', 'Cancelar envío']);
    });

    it('REPARTIDOR puede marcar en ruta pero no cancelar', () => {
      renderizar('REPARTIDOR', 'REPARTIDOR_ASIGNADO');
      expect(botones()).toEqual(['Marcar en ruta']);
    });

    it('REPARTIDOR con un envío en ruta puede marcarlo entregado', () => {
      renderizar('REPARTIDOR', 'EN_RUTA');
      expect(botones()).toEqual(['Marcar entregado']);
    });

    it('CLIENTE no tiene acciones', () => {
      renderizar('CLIENTE', 'REPARTIDOR_ASIGNADO');
      expect(botones()).toEqual([]);
    });

    it.each(['ENTREGADO', 'CANCELADO'] as const)('un envío %s no tiene acciones', (estado) => {
      renderizar('ADMIN', estado);
      expect(botones()).toEqual([]);
    });
  });

  it('cancelar pide confirmación, llama al backend y avisa', async () => {
    const cancelar = vi
      .spyOn(enviosApi, 'cancelar')
      .mockResolvedValue(envioDePrueba({ estadoEnvio: 'CANCELADO' }));
    const { onActualizado, user } = renderizar('ADMIN', 'PENDIENTE_ASIGNACION');

    await user.click(screen.getByRole('button', { name: 'Cancelar envío' }));
    const dialogo = screen.getByRole('dialog');
    expect(dialogo).toHaveTextContent('¿Cancelar el envío LT-0001?');
    await user.click(within(dialogo).getByRole('button', { name: 'Sí, cancelar envío' }));

    expect(cancelar).toHaveBeenCalledWith(ID);
    expect(await screen.findByText('Envío cancelado.')).toBeInTheDocument();
    expect(onActualizado).toHaveBeenCalledOnce();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('cerrar el diálogo no cancela el envío', async () => {
    const cancelar = vi.spyOn(enviosApi, 'cancelar');
    const { onActualizado, user } = renderizar('ADMIN', 'PENDIENTE_ASIGNACION');

    await user.click(screen.getByRole('button', { name: 'Cancelar envío' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(cancelar).not.toHaveBeenCalled();
    expect(onActualizado).not.toHaveBeenCalled();
  });

  it('si el backend rechaza la acción, muestra su mensaje y no recarga', async () => {
    vi.spyOn(enviosApi, 'cancelar').mockRejectedValue(
      new ApiError(400, 'Solo se pueden cancelar envíos que todavía no estén en RUTA.'),
    );
    const { onActualizado, user } = renderizar('ADMIN', 'REPARTIDOR_ASIGNADO');

    await user.click(screen.getByRole('button', { name: 'Cancelar envío' }));
    await user.click(screen.getByRole('button', { name: 'Sí, cancelar envío' }));

    expect(
      await screen.findByText('Solo se pueden cancelar envíos que todavía no estén en RUTA.'),
    ).toBeInTheDocument();
    expect(onActualizado).not.toHaveBeenCalled();
  });

  it('marcar en ruta cambia el estado sin código', async () => {
    const cambiarEstado = vi
      .spyOn(enviosApi, 'cambiarEstado')
      .mockResolvedValue(envioDePrueba({ estadoEnvio: 'EN_RUTA' }));
    const { onActualizado, user } = renderizar('REPARTIDOR', 'REPARTIDOR_ASIGNADO');

    await user.click(screen.getByRole('button', { name: 'Marcar en ruta' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Marcar en ruta' }),
    );

    expect(cambiarEstado).toHaveBeenCalledWith(ID);
    expect(await screen.findByText('El envío está en ruta.')).toBeInTheDocument();
    expect(onActualizado).toHaveBeenCalledOnce();
  });

  describe('marcar entregado', () => {
    async function abrirYConfirmar(user: ReturnType<typeof userEvent.setup>, codigo: string) {
      await user.click(screen.getByRole('button', { name: 'Marcar entregado' }));
      if (codigo) await user.type(screen.getByLabelText('Código de recepción'), codigo);
      await user.click(
        within(screen.getByRole('dialog')).getByRole('button', { name: 'Marcar entregado' }),
      );
    }

    it('manda el código de recepción', async () => {
      const cambiarEstado = vi
        .spyOn(enviosApi, 'cambiarEstado')
        .mockResolvedValue(envioDePrueba({ estadoEnvio: 'ENTREGADO' }));
      const { onActualizado, user } = renderizar('REPARTIDOR', 'EN_RUTA');

      await abrirYConfirmar(user, ' 4821 ');

      expect(cambiarEstado).toHaveBeenCalledWith(ID, '4821');
      expect(await screen.findByText('Envío entregado.')).toBeInTheDocument();
      expect(onActualizado).toHaveBeenCalledOnce();
    });

    it('sin código no llama al backend', async () => {
      const cambiarEstado = vi.spyOn(enviosApi, 'cambiarEstado');
      const { user } = renderizar('REPARTIDOR', 'EN_RUTA');

      await abrirYConfirmar(user, '');

      expect(screen.getByText('Ingresá el código de recepción.')).toBeInTheDocument();
      expect(cambiarEstado).not.toHaveBeenCalled();
    });

    it('un código incorrecto muestra el 400 del backend debajo del campo', async () => {
      vi.spyOn(enviosApi, 'cambiarEstado').mockRejectedValue(
        new ApiError(400, 'El código de recepción ingresado es incorrecto.'),
      );
      const { onActualizado, user } = renderizar('ADMIN', 'EN_RUTA');

      await abrirYConfirmar(user, '0000');

      const campo = screen.getByLabelText('Código de recepción');
      expect(await screen.findByRole('alert')).toHaveTextContent(
        'El código de recepción ingresado es incorrecto.',
      );
      expect(campo).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(onActualizado).not.toHaveBeenCalled();
    });
  });

  describe('asignar repartidor', () => {
    const repartidor: RepartidorResponse = {
      idRepartidor: 'r1',
      dni: '40111222',
      nombreCompleto: 'Gómez, Juan',
      telefono: '3884000000',
      tipoVehiculo: 'MOTO',
      estadoRepartidor: 'ACTIVO',
      fechaCreacion: '2026-11-01T10:00:00',
    };

    const respuesta = (cambios: Partial<EnvioCourierResponse> = {}): EnvioCourierResponse => {
      const e = envioDePrueba({ estadoEnvio: 'REPARTIDOR_ASIGNADO' });
      return {
        idEnvio: e.idEnvio,
        codigoSeguimiento: e.codigoSeguimiento,
        peso: e.peso,
        dimensiones: e.dimensiones,
        tarifa: e.tarifa,
        remitente: e.remitente,
        estadoEnvio: e.estadoEnvio,
        fechaEstimadaEntrega: e.fechaEstimadaEntrega,
        codigoRecepcion: e.codigoRecepcion,
        direccionOrigen: e.direccionOrigen,
        direccionDestino: e.direccionDestino,
        fechaCreacionEnvio: e.fechaCreacion,
        mensajeAsignacion: 'Repartidor asignado correctamente.',
        idRepartidor: 'r1',
        dniRepartidor: '40111222',
        nombreCompletoRepartidor: 'Gómez, Juan',
        ...cambios,
      };
    };

    async function elegirYAsignar(user: ReturnType<typeof userEvent.setup>) {
      await user.click(screen.getByRole('button', { name: 'Asignar repartidor' }));
      await user.selectOptions(await screen.findByLabelText('Repartidor'), '40111222');
      await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Asignar' }));
    }

    it('lista solo los repartidores ACTIVO y asigna el elegido', async () => {
      const listar = vi.spyOn(repartidoresApi, 'listar').mockResolvedValue([repartidor]);
      const asignarRepartidor = vi
        .spyOn(enviosApi, 'asignarRepartidor')
        .mockResolvedValue(respuesta());
      const { onActualizado, user } = renderizar('ADMIN', 'PENDIENTE_ASIGNACION');

      await elegirYAsignar(user);

      expect(listar).toHaveBeenCalledWith('ACTIVO');
      expect(asignarRepartidor).toHaveBeenCalledWith(ID, '40111222');
      expect(await screen.findByText('Asignado a Gómez, Juan.')).toBeInTheDocument();
      expect(onActualizado).toHaveBeenCalledOnce();
    });

    it('un 200 sin repartidor (B5) avisa el motivo y no recarga', async () => {
      vi.spyOn(repartidoresApi, 'listar').mockResolvedValue([repartidor]);
      vi.spyOn(enviosApi, 'asignarRepartidor').mockResolvedValue(
        respuesta({
          mensajeAsignacion: 'El servicio de repartidores no está disponible.',
          idRepartidor: undefined,
          dniRepartidor: undefined,
          nombreCompletoRepartidor: undefined,
        }),
      );
      const { onActualizado, user } = renderizar('ADMIN', 'PENDIENTE_ASIGNACION');

      await elegirYAsignar(user);

      expect(
        await screen.findByText('El servicio de repartidores no está disponible.'),
      ).toBeInTheDocument();
      expect(screen.queryByText(/Asignado a/)).not.toBeInTheDocument();
      expect(onActualizado).not.toHaveBeenCalled();
    });

    it('sin elegir un repartidor no llama al backend', async () => {
      vi.spyOn(repartidoresApi, 'listar').mockResolvedValue([repartidor]);
      const asignarRepartidor = vi.spyOn(enviosApi, 'asignarRepartidor');
      const { user } = renderizar('ADMIN', 'PENDIENTE_ASIGNACION');

      await user.click(screen.getByRole('button', { name: 'Asignar repartidor' }));
      await screen.findByLabelText('Repartidor');
      await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Asignar' }));

      expect(screen.getByText('Elegí un repartidor.')).toBeInTheDocument();
      expect(asignarRepartidor).not.toHaveBeenCalled();
    });

    it('avisa si no hay repartidores activos', async () => {
      vi.spyOn(repartidoresApi, 'listar').mockResolvedValue([]);
      const { user } = renderizar('ADMIN', 'PENDIENTE_ASIGNACION');

      await user.click(screen.getByRole('button', { name: 'Asignar repartidor' }));

      expect(await screen.findByText('No hay repartidores activos.')).toBeInTheDocument();
    });
  });
});
