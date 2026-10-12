type MetricVariant = 'default' | 'success' | 'warning' | 'danger';

interface MetricCardProps {
  titulo: string;
  valor: number;
  detalle: string;
  variante?: MetricVariant;
  loading?: boolean;
}

const VARIANT_STYLES: Record<MetricVariant, { card: string; valor: string; detalle: string }> = {
  default: { card: '', valor: 'text-secondary', detalle: 'text-slate-500' },
  success: { card: 'border-t-4 border-t-success', valor: 'text-secondary', detalle: 'text-slate-500' },
  warning: { card: 'border-t-4 border-t-warning', valor: 'text-warning', detalle: 'text-warning' },
  danger: { card: 'border-t-4 border-t-danger bg-red-50/30', valor: 'text-danger', detalle: 'text-danger' },
};

export const MetricCard = ({ titulo, valor, detalle, variante = 'default', loading = false }: MetricCardProps) => {
  const styles = VARIANT_STYLES[variante];

  return (
    <div className={`bg-white p-6 rounded-xl border border-slate-200 shadow-sm ${styles.card}`}>
      <p className="text-sm font-semibold text-slate-500 uppercase">{titulo}</p>
      {loading ? (
        <div className="h-9 w-16 mt-2 bg-slate-100 rounded animate-pulse" />
      ) : (
        <p className={`text-3xl font-bold mt-2 ${styles.valor}`}>{valor}</p>
      )}
      <p className={`text-sm mt-2 ${styles.detalle}`}>{detalle}</p>
    </div>
  );
};
