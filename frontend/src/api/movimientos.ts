
import { api } from './axios';

// Datos generales para registrar movimientos.
export interface MovimientoRequest {
  productoId: number;
  cantidad: number;
  motivo: string;
}

// HU05: Consumo asociado a una orden de producción.
export interface ConsumoOrdenRequest extends MovimientoRequest {
  ordenProduccionId: number;
}

// Datos de una orden de producción.
export interface OrdenProduccion {
  id: number;
  codigo: string;
  productoId: number;
  cantidadPlanificada: number;
  estado: string;
}

// HU04 - Salida por venta o despacho.
export const registrarSalidaVenta = async (
  datos: MovimientoRequest
): Promise<void> => {
  await api.post(
    '/inventario/movimientos/salida-venta',
    datos
  );
};

// HU05 - Consumo para producción sin orden asociada.
export const registrarSalidaProduccion = async (
  datos: MovimientoRequest
): Promise<void> => {
  await api.post(
    '/inventario/movimientos/salida-produccion',
    datos
  );
};

// HU05 - Consumo asociado a una orden de producción.
export const registrarConsumoOrden = async (
  datos: ConsumoOrdenRequest
): Promise<void> => {
  await api.post(
    '/inventario/movimientos/salida-produccion-orden',
    datos
  );
};

// HU05 - Consultar órdenes de producción disponibles.
export const listarOrdenesDisponibles = async (
): Promise<OrdenProduccion[]> => {
  const respuesta = await api.get<OrdenProduccion[]>(
    '/produccion/ordenes/disponibles'
  );

  return respuesta.data;
};
