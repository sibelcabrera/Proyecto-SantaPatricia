import { Trash2, Loader2 } from 'lucide-react';
import { CATEGORIA_LABEL } from '../../constants/etiquetas';
import type { EstadoStock, ProductoDTO } from '../../types/inventario';

// 🏷️ Textos y colores para los estados del stock que calcula el backend.
const ESTADO_STYLES: Record<EstadoStock, { label: string; className: string }> = {
  OPTIMO: { label: 'Óptimo', className: 'bg-green-50 text-success' },
  BAJO: { label: 'Stock bajo', className: 'bg-amber-50 text-warning' },
  CRITICO: { label: 'Crítico', className: 'bg-red-50 text-danger' },
};

// 📅 El backend manda las fechas como texto ISO ("2026-10-31"); aquí se muestran como 31/10/2026.
const formatearFecha = (fecha: string | null) => {
  if (!fecha) return '—';
  const [anio, mes, dia] = fecha.slice(0, 10).split('-');
  return `${dia}/${mes}/${anio}`;
};

// 🔢 120 -> "120"   |   2.5 -> "2.5"   (sin decimales de sobra)
const formatearCantidad = (n: number) => Number(n).toLocaleString('es-PE', { maximumFractionDigits: 2 });

interface InventarioTableProps {
  productos: ProductoDTO[];
  loading: boolean;
  eliminandoId: number | null;
  onEliminar: (producto: ProductoDTO) => void;
  // 🔐 Solo el ADMINISTRADOR ve el botón de eliminar (HU01)
  puedeEditar: boolean;
  // ✨ id del producto recién registrado, para resaltarlo en verde
  resaltadoId?: number | null;
  mensajeVacio?: string;
}

export const InventarioTable = ({
  productos,
  loading,
  eliminandoId,
  onEliminar,
  puedeEditar,
  resaltadoId = null,
  mensajeVacio = 'No hay productos registrados en el inventario.',
}: InventarioTableProps) => {
  const columnas = ['SKU', 'Producto', 'Área', 'Stock', 'Precio', 'Vencimiento', 'Estado', ...(puedeEditar ? [''] : [])];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            {columnas.map((col) => (
              <th key={col} className="px-6 py-3 font-semibold whitespace-nowrap">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading &&
            Array.from({ length: 5 }, (_, i) => (
              <tr key={i}>
                {columnas.map((col) => (
                  <td key={col} className="px-6 py-4">
                    <div className="h-4 bg-slate-100 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}

          {!loading && productos.length === 0 && (
            <tr>
              <td colSpan={columnas.length} className="px-6 py-16 text-center text-slate-400">
                {mensajeVacio}
              </td>
            </tr>
          )}

          {!loading &&
            productos.map((producto) => {
              const estado = ESTADO_STYLES[producto.estado];
              const eliminando = eliminandoId === producto.id;
              const esNuevo = producto.id === resaltadoId;
              return (
                <tr
                  key={producto.id}
                  id={`producto-${producto.id}`}
                  className={`transition-colors ${esNuevo ? 'bg-green-50 shadow-[inset_4px_0_0_var(--color-success)]' : 'hover:bg-slate-50/60'}`}
                >
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{producto.sku}</td>
                  <td className="px-6 py-4 font-medium text-secondary">{producto.nombre}</td>
                  <td className="px-6 py-4 text-slate-600">{CATEGORIA_LABEL[producto.categoria] ?? producto.categoria}</td>
                  <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                    <span className="font-semibold text-secondary">{formatearCantidad(producto.stockActual)}</span>
                    <span className="text-slate-400"> / mín. {formatearCantidad(producto.stockMinimo)} {producto.unidadMedida}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                    S/ {Number(producto.precioUnitario).toFixed(2)}
                    <span className="text-slate-400"> / {producto.unidadMedida}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{formatearFecha(producto.fechaVencimiento)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${estado.className}`}>
                      {estado.label}
                    </span>
                  </td>
                  {puedeEditar && (
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onEliminar(producto)}
                        disabled={eliminando}
                        className="text-slate-400 hover:text-danger transition-colors disabled:opacity-50"
                        aria-label={`Eliminar ${producto.nombre}`}
                        title="Eliminar"
                      >
                        {eliminando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};
