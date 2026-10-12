import { useCallback, useEffect, useMemo, useState } from 'react';
import { inventarioService } from '../services/inventarioService';
import { getErrorMessage } from '../api/axios';
import type {
  ActualizarProductoDTO,
  CrearProductoDTO,
  ProductoDTO,
  ResumenInventario,
} from '../types/inventario';

// ╔══════════════════════════════════════════════════════════════════╗
// ║  🪝 HOOK useInventario                                             ║
// ║  Conecta la pantalla de Inventario Central con el servicio.        ║
// ║  Maneja por nosotros: la data, el "cargando..." y los errores.     ║
// ║  Compañeros de backend: aquí no hay nada que cambiar 😉            ║
// ║  (las peticiones están en src/services/inventarioService.ts)       ║
// ╚══════════════════════════════════════════════════════════════════╝

export interface UseInventarioResult {
  productos: ProductoDTO[];
  resumen: ResumenInventario;
  loading: boolean;
  error: string | null;
  recargar: () => Promise<void>;
  crearProducto: (datos: CrearProductoDTO) => Promise<ProductoDTO>;
  actualizarProducto: (id: number, datos: ActualizarProductoDTO) => Promise<ProductoDTO>;
  eliminarProducto: (id: number) => Promise<void>;
}

// 📡 Pide la lista al backend y devuelve la data o el mensaje de error (nunca lanza).
const pedirProductos = async (): Promise<{ data: ProductoDTO[] } | { error: string }> => {
  try {
    return { data: await inventarioService.listar() };
  } catch (err) {
    return { error: getErrorMessage(err, 'No se pudo cargar el inventario.') };
  }
};

export const useInventario = (): UseInventarioResult => {
  const [productos, setProductos] = useState<ProductoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const aplicarResultado = useCallback((resultado: Awaited<ReturnType<typeof pedirProductos>>) => {
    if ('data' in resultado) {
      setProductos(resultado.data);
      setError(null);
    } else {
      setError(resultado.error);
    }
    setLoading(false);
  }, []);

  // 📋 Primera carga al entrar a la pantalla
  useEffect(() => {
    let activo = true;
    pedirProductos().then((resultado) => {
      if (activo) aplicarResultado(resultado);
    });
    return () => {
      activo = false;
    };
  }, [aplicarResultado]);

  // 🔄 Volver a pedir la lista al backend (ej. botón "Reintentar")
  const recargar = useCallback(async () => {
    setLoading(true);
    aplicarResultado(await pedirProductos());
  }, [aplicarResultado]);

  // ➕ Crea y agrega el producto a la lista sin recargar todo.
  // Si falla, el error se lanza para que el formulario lo muestre.
  const crearProducto = useCallback(async (datos: CrearProductoDTO) => {
    const nuevo = await inventarioService.crear(datos);
    // Se inserta en orden alfabético, igual que viene la lista del backend
    setProductos((prev) => [...prev, nuevo].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')));
    return nuevo;
  }, []);

  // ✏️ Actualiza y reemplaza el producto en la lista
  const actualizarProducto = useCallback(async (id: number, datos: ActualizarProductoDTO) => {
    const actualizado = await inventarioService.actualizar(id, datos);
    setProductos((prev) => prev.map((p) => (p.id === id ? actualizado : p)));
    return actualizado;
  }, []);

  // 🗑️ Elimina y lo quita de la lista
  const eliminarProducto = useCallback(async (id: number) => {
    await inventarioService.eliminar(id);
    setProductos((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // 📊 Números de las tarjetas del dashboard, calculados con el "estado" que manda el backend
  const resumen = useMemo<ResumenInventario>(
    () => ({
      totalSkus: productos.length,
      optimos: productos.filter((p) => p.estado === 'OPTIMO').length,
      stockBajo: productos.filter((p) => p.estado === 'BAJO').length,
      criticos: productos.filter((p) => p.estado === 'CRITICO').length,
    }),
    [productos],
  );

  return {
    productos,
    resumen,
    loading,
    error,
    recargar,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
  };
};
