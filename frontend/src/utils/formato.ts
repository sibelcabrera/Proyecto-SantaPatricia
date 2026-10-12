// 📅 El backend manda las fechas como texto ISO ("2026-10-31"); aquí se muestran como 31/10/2026.
export const formatearFecha = (fecha: string | null) => {
  if (!fecha) return '—';
  const [anio, mes, dia] = fecha.slice(0, 10).split('-');
  return `${dia}/${mes}/${anio}`;
};

// 🔢 120 -> "120"   |   2.5 -> "2.5"   (sin decimales de sobra)
export const formatearCantidad = (n: number) => Number(n).toLocaleString('es-PE', { maximumFractionDigits: 2 });

// ⏳ Días que faltan para una fecha ISO ("2026-10-20"). Negativo = ya venció. null = no vence.
export const diasParaVencer = (fecha: string | null, hoy = new Date()) => {
  if (!fecha) return null;
  const [anio, mes, dia] = fecha.slice(0, 10).split('-').map(Number);
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  return Math.round((new Date(anio, mes - 1, dia).getTime() - inicioHoy.getTime()) / 86_400_000);
};
