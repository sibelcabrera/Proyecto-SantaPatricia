
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import { api, getErrorMessage } from '../api/axios';

import {
  registrarSalidaVenta,
  registrarSalidaProduccion,
  registrarConsumoOrden,
  listarOrdenesDisponibles,
} from '../api/movimientos';

import type { OrdenProduccion } from '../api/movimientos';
import type { ProductoDTO } from '../types/inventario';

type TipoMovimiento = 'venta' | 'produccion';


export const Movimientos = () => {
  const [productos, setProductos] = useState<ProductoDTO[]>([]);
  const [ordenes, setOrdenes] = useState<OrdenProduccion[]>([]);

  const [cargando, setCargando] = useState(true);
  const [cargandoOrdenes, setCargandoOrdenes] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [tipo, setTipo] = useState<TipoMovimiento>('venta');

  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [motivo, setMotivo] = useState('');
  const [ordenId, setOrdenId] = useState('');

  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [errorOrdenes, setErrorOrdenes] = useState('');

  const cargarProductos = async () => {
    try {
      const respuesta = await api.get<ProductoDTO[]>(
        '/inventario/productos'
      );

      setProductos(respuesta.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCargando(false);
    }
  };

  const cargarOrdenes = async () => {
    setCargandoOrdenes(true);
    setErrorOrdenes('');

    try {
      const resultado = await listarOrdenesDisponibles();

      const lista = Array.isArray(resultado)
        ? resultado
        : [];

     setOrdenes(lista);

      console.log('Órdenes disponibles:', lista);
    } catch (err) {
      console.error('Error al consultar órdenes:', err);
      setErrorOrdenes(getErrorMessage(err));
    } finally {
      setCargandoOrdenes(false);
    }
  };

  useEffect(() => {
    void cargarProductos();
    void cargarOrdenes();
  }, []);

  const productoSeleccionado = productos.find(
    (producto) => producto.id === Number(productoId)
  );

  const ordenesEnProceso = ordenes.filter(
    (orden) => orden.estado === 'EN_PROCESO'
  );

  const registrarMovimiento = async (
    evento: FormEvent<HTMLFormElement>
  ) => {
    evento.preventDefault();

    setMensaje('');
    setError('');

    const cantidadNumero = Number(cantidad);

    if (!productoSeleccionado) {
      setError('Selecciona un producto.');
      return;
    }

    if (
      !Number.isFinite(cantidadNumero) ||
      cantidadNumero <= 0
    ) {
      setError('La cantidad debe ser mayor a cero.');
      return;
    }

    if (!/^\d+(\.\d{1,2})?$/.test(cantidad.trim())) {
      setError('La cantidad admite máximo 2 decimales.');
      return;
    }

    if (cantidadNumero > productoSeleccionado.stockActual) {
      setError('La cantidad supera el stock disponible.');
      return;
    }

    if (!motivo.trim()) {
      setError('Ingresa el motivo del movimiento.');
      return;
    }

    if (motivo.trim().length > 255) {
      setError('El motivo no puede superar 255 caracteres.');
      return;
    }

    // Evitar registrar un consumo sin asociarlo a la orden
    // que el usuario haya seleccionado.
if (tipo === 'produccion' && ordenId) {
  const idOrden = Number(ordenId);

  if (!Number.isInteger(idOrden) || idOrden <= 0) {
    setError('Selecciona una orden de producción válida.');
    return;
  }
}
    const datos = {
      productoId: productoSeleccionado.id,
      cantidad: cantidadNumero,
      motivo: motivo.trim(),
    };

    try {
  setGuardando(true);

  if (tipo === 'venta') {
    await registrarSalidaVenta(datos);

  } else if (ordenId) {
    await registrarConsumoOrden({
      ...datos,
      ordenProduccionId: Number(ordenId),
    });

  } else {
    await registrarSalidaProduccion(datos);
  }

  setMensaje('Movimiento registrado correctamente.');
  setCantidad('');
  setMotivo('');
  setOrdenId('');

  await cargarProductos();
  await cargarOrdenes();

} catch (err) {
  setError(getErrorMessage(err));

} finally {
  setGuardando(false);
}
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">
          Inventario / Movimientos y Kárdex
        </p>

        <h1 className="text-3xl font-bold text-slate-800 mt-2">
          Movimientos y Kárdex
        </h1>

        <p className="text-slate-500 mt-2">
          Registro de salidas por venta y consumo para producción.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <button
          type="button"
          onClick={() => {
            setTipo('venta');
            setOrdenId('');
            setMensaje('');
            setError('');
          }}
          className={`rounded-xl border p-6 text-left transition ${
            tipo === 'venta'
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <h2 className="text-lg font-semibold text-slate-800">
            HU04 - Salida por venta o despacho
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            Registra las existencias retiradas por ventas o despachos.
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            setTipo('produccion');
            setMensaje('');
            setError('');
            void cargarOrdenes();
          }}
          className={`rounded-xl border p-6 text-left transition ${
            tipo === 'produccion'
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <h2 className="text-lg font-semibold text-slate-800">
            HU05 - Consumo para producción
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            Registra los insumos utilizados para elaborar productos.
          </p>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-5">
          {tipo === 'venta'
            ? 'Registrar salida por venta'
            : 'Registrar consumo para producción'}
        </h2>

        {mensaje && (
          <div
            role="status"
            className="mb-5 rounded-lg bg-green-50 border border-green-200 p-4 text-green-700"
          >
            {mensaje}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={registrarMovimiento}
          className="space-y-5"
        >
          {tipo === 'produccion' && (
            <div>
              <label
                htmlFor="orden"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Orden de producción
              </label>

              <select
                id="orden"
                value={ordenId}
                onChange={(e) => setOrdenId(e.target.value)}
                disabled={cargandoOrdenes || guardando}
                className="w-full rounded-lg border border-slate-300 px-4 py-3"
              >
                <option value="">
                  {cargandoOrdenes
                    ? 'Consultando órdenes...'
                    : 'Sin orden asociada'}
                </option>

                {ordenesEnProceso.map((orden) => (
                  <option key={orden.id} value={orden.id}>
                    {orden.codigo} - {orden.estado}
                  </option>
                ))}
              </select>

              {errorOrdenes && (
                <p className="text-sm text-red-600 mt-2">
                  {errorOrdenes}
                </p>
              )}

              {!cargandoOrdenes &&
                !errorOrdenes &&
                ordenesEnProceso.length === 0 && (
                  <p className="text-sm text-amber-700 mt-2">
                    No hay órdenes de producción en proceso.
                    Puedes registrar un consumo sin orden asociada.
                  </p>
                )}


            </div>
          )}

          <div>
            <label
              htmlFor="producto"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Producto o materia prima
            </label>

            <select
              id="producto"
              value={productoId}
              onChange={(e) => setProductoId(e.target.value)}
              disabled={cargando || guardando}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
            >
              <option value="">
                {cargando
                  ? 'Cargando productos...'
                  : 'Selecciona un producto'}
              </option>

              {productos.map((producto) => (
                <option key={producto.id} value={producto.id}>
                  {producto.sku} - {producto.nombre}
                </option>
              ))}
            </select>
          </div>

          {productoSeleccionado && (
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
              <p className="text-sm text-slate-500">
                Stock disponible
              </p>

              <p className="text-2xl font-bold text-slate-800 mt-1">
                {productoSeleccionado.stockActual}{' '}
                {productoSeleccionado.unidadMedida}
              </p>
            </div>
          )}

          <div>
            <label
              htmlFor="cantidad"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Cantidad a retirar
            </label>

            <input
              id="cantidad"
              type="number"
              min="0.01"
              step="0.01"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              disabled={guardando}
              required
              placeholder="Ejemplo: 2.50"
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
            />
          </div>

          <div>
            <label
              htmlFor="motivo"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Motivo
            </label>

            <textarea
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              disabled={guardando}
              maxLength={255}
              required
              rows={3}
              placeholder={
                tipo === 'venta'
                  ? 'Ejemplo: Despacho de mercadería'
                  : 'Ejemplo: Elaboración de pan'
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
            />
          </div>

          <button
            type="submit"
            disabled={guardando || cargando}
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {guardando
              ? 'Registrando...'
              : 'Registrar movimiento'}
          </button>
        </form>
      </div>
    </div>
  );
};
