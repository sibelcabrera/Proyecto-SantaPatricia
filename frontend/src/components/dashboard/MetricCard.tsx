import { ArrowRight, type LucideIcon } from 'lucide-react';

type MetricVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface MetricCardProps {
  titulo: string;
  valor: number;
  detalle: string;
  icono: LucideIcon;
  variante?: MetricVariant;
  loading?: boolean;
  // 👉 Si se pasa, aparece "Ver ítems" y al hacer clic filtra la tabla
  onVer?: () => void;
  activa?: boolean;
}

// 🎨 Colores de la guía de estilos de la PA1: verde = óptimo, ámbar = bajo, rojo = crítico
const VARIANT_STYLES: Record<MetricVariant, { borde: string; icono: string; valor: string; detalle: string }> = {
  default: { borde: 'border-t-slate-300', icono: 'bg-slate-100 text-slate-600', valor: 'text-secondary', detalle: 'text-slate-500' },
  success: { borde: 'border-t-success', icono: 'bg-emerald-50 text-success', valor: 'text-secondary', detalle: 'text-emerald-700' },
  warning: { borde: 'border-t-warning', icono: 'bg-amber-50 text-warning', valor: 'text-amber-600', detalle: 'text-slate-500' },
  danger: { borde: 'border-t-danger', icono: 'bg-red-50 text-danger', valor: 'text-danger', detalle: 'text-red-600' },
  info: { borde: 'border-t-primary', icono: 'bg-orange-50 text-primary', valor: 'text-secondary', detalle: 'text-slate-500' },
};

export const MetricCard = ({ titulo, valor, detalle, icono: Icono, variante = 'default', loading = false, onVer, activa = false }: MetricCardProps) => {
  const s = VARIANT_STYLES[variante];

  return (
    <div className={`bg-white p-5 rounded-xl border border-slate-200 border-t-4 ${s.borde} shadow-sm flex flex-col ${activa ? 'ring-2 ring-primary/40' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide leading-snug">{titulo}</p>
        <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${s.icono}`}>
          <Icono className="w-4.5 h-4.5" />
        </span>
      </div>
      {loading ? (
        <div className="h-9 w-16 mt-3 bg-slate-100 rounded animate-pulse" />
      ) : (
        <p className={`text-3xl font-bold mt-3 ${s.valor}`}>{valor}</p>
      )}
      <div className="mt-2 flex items-center justify-between gap-2 text-xs">
        <span className={s.detalle}>{detalle}</span>
        {onVer && (
          <button onClick={onVer} className="flex items-center gap-1 font-medium text-primary hover:underline whitespace-nowrap">
            {activa ? 'Ver todos' : 'Ver ítems'} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
