import { Trash2, Loader2 } from 'lucide-react';
import { AREA_ESTILO, CATEGORIA_LABEL } from '../../constants/etiquetas';
import { formatearCantidad, formatearFecha } from '../../utils/formato';
import type { EstadoStock, ProductoDTO } from '../../types/inventario';

// 🏷️ Textos y colores para los estados del stock que calcula el backend.
const ESTADO_STYLES: Record<EstadoStock, { label: string; badge: string; punto: string; barra: string; texto: string }> = {
  OPTIMO: { label: 'Óptimo', badge: 'bg-emerald-50 text-emerald-700', punto: 'bg-success', barra: 'bg-success', texto: 'text-emerald-700' },
  BAJO: { label: 'Stock bajo', badge: 'bg-amber-50 text-amber-700', punto: 'bg-warning', barra: 'bg-warning', texto: 'text-amber-600' },
  CRITICO: { label: 'Crítico', badge: 'bg-red-50 text-red-600', punto: 'bg-danger', barra: 'bg-danger', texto: 'text-red-600' },
};

// 📊 Qué tan llena está la barra: el stock mínimo queda a la mitad de la barra.
//    Así "en el mínimo" = 50 % (ámbar) y "el doble del mínimo o más" = barra llena.
const porcentajeBarra = (actual: number, minimo: number) =>
  minimo <= 0 ? 100 : Math.min(100, Math.round((actual / (minimo * 2)) * 100));

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
  const columnas = ['Código SKU', 'Producto y detalle', 'Área', 'Nivel de stock (actual / mín.)', 'Unidad', 'Estado', ...(puedeEditar ? [''] : [])];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500 border-y border-slate-200">
          <tr>
            {columnas.map((col) => (
              <th key={col} className="px-5 py-3 font-semibold whitespace-nowrap">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading &&
            Array.from({ length: 6 }, (_, i) => (
              <tr key={i}>
                {columnas.map((col) => (
                  <td key={col} className="px-5 py-4">
                    <div className="h-4 bg-slate-100 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}

          {!loading && productos.length === 0 && (
            <tr>
              <td colSpan={columnas.length} className="px-5 py-16 text-center text-slate-400">{mensajeVacio}</td>
            </tr>
          )}

          {!loading &&
            productos.map((producto) => {
              const estado = ESTADO_STYLES[producto.estado];
              const area = AREA_ESTILO[producto.categoria];
              const IconoArea = area?.icono;
              const eliminando = eliminandoId === producto.id;
              const esNuevo = producto.id === resaltadoId;
              return (
                <tr
                  key={producto.id}
                  id={`producto-${producto.id}`}
                  className={`transition-colors ${esNuevo ? 'bg-green-50 shadow-[inset_4px_0_0_var(--color-success)]' : 'hover:bg-slate-50/70'}`}
                >
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="font-mono text-xs font-semibold text-secondary">{producto.sku}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                        {IconoArea && <IconoArea className="w-4.5 h-4.5" />}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-secondary">{producto.nombre}</p>
                        <p className="text-xs text-slate-500 whitespace-nowrap">
                          S/ {Number(producto.precioUnitario).toFixed(2)} por {producto.unidadMedida}
                          {' · '}
                          {producto.fechaVencimiento ? `vence ${formatearFecha(producto.fechaVencimiento)}` : 'no vence'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ring-1 whitespace-nowrap ${area?.etiqueta ?? 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
                      {CATEGORIA_LABEL[producto.categoria] ?? producto.categoria}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 min-w-[190px]">
                    <div className="flex items-baseline justify-between gap-3 text-xs">
                      <span className={`text-sm font-semibold ${estado.texto}`}>
                        {formatearCantidad(producto.stockActual)} {producto.unidadMedida}
                      </span>
                      <span className="text-slate-500 whitespace-nowrap">Mín: {formatearCantidad(producto.stockMinimo)}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full rounded-full ${estado.barra}`} style={{ width: `${porcentajeBarra(producto.stockActual, producto.stockMinimo)}%` }} />
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">{producto.unidadMedida}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${estado.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${estado.punto}`} />
                      {estado.label}
                    </span>
                  </td>
                  {puedeEditar && (
                    <td className="px-5 py-3.5 text-right">
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
