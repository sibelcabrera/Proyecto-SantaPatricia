import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import {
  Plus, AlertCircle, RefreshCw, CheckCircle2, Lock, Download, Search, ClipboardList, CircleCheck,
  TriangleAlert, Siren, CalendarClock, LayoutGrid, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useInventario } from '../hooks/useInventario';
import { useAuth } from '../auth/useAuth';
import { getErrorMessage } from '../api/axios';
import { MetricCard } from '../components/dashboard/MetricCard';
import { InventarioTable } from '../components/dashboard/InventarioTable';
import { AREA_ESTILO, CATEGORIA_LABEL } from '../constants/etiquetas';
import { NuevoProductoModal } from '../components/dashboard/NuevoProductoModal';
import { areaTrabajo, type AreaTrabajo } from '../utils/preferencias';
import { diasParaVencer, formatearCantidad, formatearFecha } from '../utils/formato';
import type { CategoriaProducto, EstadoStock, ProductoDTO } from '../types/inventario';

// 🏪 MÓDULO DE ALMACÉN → INVENTARIO CENTRAL (diseño de la maqueta de la PA1)
// Esta pantalla solo se encarga de MOSTRAR datos. Los datos llegan desde el backend Java a través de:
//   useInventario (src/hooks) → inventarioService (src/services) → axios (src/api)
// Todo lo que se ve aquí sale de la base de datos: no hay números inventados.

const AREAS = Object.keys(CATEGORIA_LABEL) as CategoriaProducto[];
const DIAS_ALERTA_VENCIMIENTO = 7;
const TAMANOS_PAGINA = [10, 25, 50];

const FILTROS_ESTADO: { valor: EstadoStock | 'TODOS'; label: string; punto?: string }[] = [
  { valor: 'TODOS', label: 'Todos' },
  { valor: 'OPTIMO', label: 'Óptimo', punto: 'bg-success' },
  { valor: 'BAJO', label: 'Bajo', punto: 'bg-warning' },
  { valor: 'CRITICO', label: 'Crítico', punto: 'bg-danger' },
];

// Para buscar sin importar tildes ni mayúsculas: "azucar" encuentra "Azúcar"
const normalizar = (texto: string) => texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

// 📤 Descarga la lista que se está viendo como CSV (se abre en Excel). ";" porque Excel en español lo usa.
const exportarCsv = (productos: ProductoDTO[]) => {
  const encabezado = ['SKU', 'Producto', 'Área', 'Unidad', 'Stock actual', 'Stock mínimo', 'Precio (S/)', 'Vencimiento', 'Estado'];
  const filas = productos.map((p) => [
    p.sku, p.nombre, CATEGORIA_LABEL[p.categoria] ?? p.categoria, p.unidadMedida,
    p.stockActual, p.stockMinimo, Number(p.precioUnitario).toFixed(2), formatearFecha(p.fechaVencimiento), p.estado,
  ]);
  const csv = [encabezado, ...filas].map((fila) => fila.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\r\n');
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
  enlace.download = `inventario-santa-patricia-${new Date().toISOString().slice(0, 10)}.csv`;
  enlace.click();
  URL.revokeObjectURL(enlace.href);
};

const textoDias = (dias: number) =>
  dias < 0 ? `venció hace ${-dias} d` : dias === 0 ? 'vence hoy' : dias === 1 ? '1 día' : `${dias} días`;

export const Dashboard = () => {
  const { user } = useAuth();
  const { productos, resumen, loading, error, recargar, crearProducto, eliminarProducto } = useInventario();
  const [searchParams, setSearchParams] = useSearchParams();
  const buscar = searchParams.get('buscar') ?? '';

  // 🧭 Abre en el área que el usuario eligió al iniciar sesión
  const [area, setArea] = useState<AreaTrabajo>(() => areaTrabajo.get());
  const [estado, setEstado] = useState<EstadoStock | 'TODOS'>('TODOS');
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(25);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [resaltadoId, setResaltadoId] = useState<number | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  // 🔐 HU01: solo el ADMINISTRADOR registra o elimina productos
  const esAdministrador = user?.rol === 'ADMINISTRADOR';
  const turno = user?.turno;

  // 🔎 Filtros: área + estado + buscador (por nombre o código)
  const productosFiltrados = useMemo(() => {
    const texto = normalizar(buscar.trim());
    return productos.filter((p) =>
      (area === 'TODAS' || p.categoria === area) &&
      (estado === 'TODOS' || p.estado === estado) &&
      (texto === '' || normalizar(p.nombre).includes(texto) || normalizar(p.sku).includes(texto)));
  }, [productos, area, estado, buscar]);

  // 📄 Paginación (si los filtros dejan menos páginas, se queda en la última que existe)
  const totalPaginas = Math.max(1, Math.ceil(productosFiltrados.length / porPagina));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = productosFiltrados.slice((paginaActual - 1) * porPagina, paginaActual * porPagina);

  // ⏳ Próximos a vencer (de la fecha de vencimiento de cada producto)
  const porVencer = useMemo(
    () => productos
      .map((p) => ({ producto: p, dias: diasParaVencer(p.fechaVencimiento) }))
      .filter((x): x is { producto: ProductoDTO; dias: number } => x.dias !== null && x.dias <= 30)
      .sort((a, b) => a.dias - b.dias),
    [productos],
  );
  const vencenPronto = porVencer.filter((x) => x.dias <= DIAS_ALERTA_VENCIMIENTO).length;

  // 🚨 Críticos ordenados por qué tan lejos están de su mínimo (el más vacío primero)
  const reponerPrimero = useMemo(
    () => productos
      .filter((p) => p.estado === 'CRITICO')
      .sort((a, b) => a.stockActual / (a.stockMinimo || 1) - b.stockActual / (b.stockMinimo || 1)),
    [productos],
  );

  const cantidadPorArea = (codigo: CategoriaProducto) => productos.filter((p) => p.categoria === codigo).length;

  // ✨ Al registrar, la pantalla baja sola hasta el producto nuevo (resaltado en verde)
  useEffect(() => {
    if (resaltadoId === null) return;
    requestAnimationFrame(() =>
      document.getElementById(`producto-${resaltadoId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  }, [resaltadoId]);

  // El aviso verde desaparece solo a los 4 segundos
  useEffect(() => {
    if (!aviso) return;
    const temporizador = setTimeout(() => setAviso(null), 4000);
    return () => clearTimeout(temporizador);
  }, [aviso]);

  const elegirArea = (valor: AreaTrabajo) => {
    setArea(valor);
    setPagina(1);
  };

  const elegirEstado = (valor: EstadoStock | 'TODOS') => {
    setEstado(valor);
    setPagina(1);
  };

  const cambiarBusqueda = (texto: string) => {
    const params = new URLSearchParams(searchParams);
    if (texto) params.set('buscar', texto);
    else params.delete('buscar');
    setSearchParams(params, { replace: true });
    setPagina(1);
  };

  const handleCreado = (producto: ProductoDTO) => {
    setModalAbierto(false);
    setAviso(`"${producto.nombre}" registrado con el código ${producto.sku}`);
    setResaltadoId(producto.id);
    // Se quitan los filtros y se va a la página del producto nuevo para que se vea en la lista
    setArea('TODAS');
    setEstado('TODOS');
    setSearchParams({}, { replace: true });
    const posicion = [...productos, producto]
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
      .findIndex((p) => p.id === producto.id);
    setPagina(Math.floor(posicion / porPagina) + 1);
  };

  const handleEliminar = async (producto: ProductoDTO) => {
    if (!confirm(`¿Eliminar "${producto.nombre}" del inventario?`)) return;
    setErrorAccion(null);
    setEliminandoId(producto.id);
    try {
      await eliminarProducto(producto.id);
    } catch (err) {
      setErrorAccion(getErrorMessage(err, 'No se pudo eliminar el producto.'));
    } finally {
      setEliminandoId(null);
    }
  };

  const porcentajeOptimo = resumen.totalSkus ? ((resumen.optimos / resumen.totalSkus) * 100).toFixed(1) : '0';

  const chipClase = (activo: boolean) =>
    `flex items-center gap-2 px-3.5 py-2 rounded-full text-sm whitespace-nowrap ring-1 transition-colors ${
      activo ? 'bg-primary ring-primary text-white font-medium' : 'bg-white ring-slate-200 text-slate-600 hover:ring-primary hover:text-primary'
    }`;

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Encabezado */}
      <div className="flex justify-between items-start mb-6 gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-500">
            Sede La Molina
            {turno && (
              <span className="text-emerald-700"> · Turno {turno.nombre}: {turno.horaInicio} – {turno.horaFin}</span>
            )}
          </p>
          <div className="flex items-center gap-3 mt-1">
            <h2 className="text-3xl font-bold text-secondary tracking-tight">Inventario Central & Catálogo</h2>
            {!loading && (
              <span className="text-xs font-semibold text-sky-800 bg-sky-50 ring-1 ring-sky-200 px-2 py-1 rounded-md whitespace-nowrap">
                {resumen.totalSkus} SKUs
              </span>
            )}
          </div>
          <p className="text-slate-500 mt-1">Niveles de reposición, vencimientos y existencias por área del local.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportarCsv(productosFiltrados)}
            disabled={loading || productosFiltrados.length === 0}
            className="bg-white ring-1 ring-slate-200 hover:ring-primary text-secondary px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Download size={17} />
            Exportar CSV
          </button>
          {esAdministrador && (
            <button
              onClick={() => setModalAbierto(true)}
              className="bg-primary hover:bg-[#9c4d14] text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm shadow-primary/20"
            >
              <Plus size={18} />
              Nuevo producto
            </button>
          )}
        </div>
      </div>

      {/* 🔐 HU01: los demás roles solo consultan */}
      {user && !esAdministrador && (
        <div className="mb-6 px-4 py-3 bg-orange-50 border border-orange-200 text-orange-800 text-sm rounded-xl flex items-center gap-2">
          <Lock className="w-4 h-4 shrink-0" />
          Su rol puede consultar el inventario. Registrar o eliminar productos es exclusivo del Administrador.
        </div>
      )}

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <MetricCard titulo="Total SKUs activos" valor={resumen.totalSkus} detalle={`En ${AREAS.length} áreas del local`} icono={ClipboardList} variante="default" loading={loading} />
        <MetricCard titulo="Existencias óptimas" valor={resumen.optimos} detalle={`${porcentajeOptimo}% del catálogo`} icono={CircleCheck} variante="success" loading={loading}
          onVer={() => elegirEstado(estado === 'OPTIMO' ? 'TODOS' : 'OPTIMO')} activa={estado === 'OPTIMO'} />
        <MetricCard titulo="Stock bajo" valor={resumen.stockBajo} detalle="Requiere reabastecer" icono={TriangleAlert} variante="warning" loading={loading}
          onVer={() => elegirEstado(estado === 'BAJO' ? 'TODOS' : 'BAJO')} activa={estado === 'BAJO'} />
        <MetricCard titulo="Crítico" valor={resumen.criticos} detalle="Comprar ya" icono={Siren} variante="danger" loading={loading}
          onVer={() => elegirEstado(estado === 'CRITICO' ? 'TODOS' : 'CRITICO')} activa={estado === 'CRITICO'} />
        <MetricCard titulo={`Vencen en ${DIAS_ALERTA_VENCIMIENTO} días`} valor={vencenPronto} detalle="Según fecha de vencimiento" icono={CalendarClock} variante="info" loading={loading} />
      </div>

      {/* ✅ Producto registrado */}
      {aviso && (
        <div role="status" className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 text-sm rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          {aviso}
        </div>
      )}

      {/* ❗ Error al cargar o al eliminar (ej. backend apagado) */}
      {(error || errorAccion) && (
        <div role="alert" className="mb-4 p-4 bg-red-50 border border-red-200 text-danger text-sm rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error ?? errorAccion}</span>
          </div>
          {error && (
            <button onClick={() => void recargar()} className="flex items-center gap-1.5 font-medium hover:underline whitespace-nowrap">
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </button>
          )}
        </div>
      )}

      {/* Catálogo: filtros + tabla + paginación */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {/* 🏷️ Áreas */}
        <div className="flex items-center gap-2 p-4 pb-3 overflow-x-auto">
          <button onClick={() => elegirArea('TODAS')} className={chipClase(area === 'TODAS')}>
            <LayoutGrid className="w-4 h-4" /> Todas las áreas ({productos.length})
          </button>
          {AREAS.map((codigo) => {
            const Icono = AREA_ESTILO[codigo].icono;
            return (
              <button key={codigo} onClick={() => elegirArea(codigo)} className={chipClase(area === codigo)}>
                <Icono className="w-4 h-4" /> {CATEGORIA_LABEL[codigo]} ({cantidadPorArea(codigo)})
              </button>
            );
          })}
        </div>

        {/* 🔎 Buscador + estado */}
        <div className="flex flex-wrap items-center gap-3 px-4 pb-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={buscar}
              onChange={(e) => cambiarBusqueda(e.target.value)}
              placeholder="Buscar por código SKU o nombre del producto…"
              aria-label="Buscar en el catálogo"
              className="w-full pl-9 pr-4 py-2.5 bg-background border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg" role="group" aria-label="Filtrar por estado">
            {FILTROS_ESTADO.map(({ valor, label, punto }) => (
              <button
                key={valor}
                onClick={() => elegirEstado(valor)}
                aria-pressed={estado === valor}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${estado === valor ? 'bg-white shadow-sm font-medium text-secondary' : 'text-slate-500 hover:text-secondary'}`}
              >
                {punto && <span className={`w-2 h-2 rounded-full ${punto}`} />}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 📋 Tabla */}
        <InventarioTable
          productos={visibles}
          loading={loading}
          eliminandoId={eliminandoId}
          onEliminar={(producto) => void handleEliminar(producto)}
          puedeEditar={esAdministrador}
          resaltadoId={resaltadoId}
          mensajeVacio={productos.length === 0 ? 'No hay productos registrados en el inventario.' : 'Ningún producto coincide con la búsqueda o los filtros elegidos.'}
        />

        {/* 📄 Paginación */}
        {!loading && productosFiltrados.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <span>
                Mostrando <b className="text-secondary">{(paginaActual - 1) * porPagina + 1} – {Math.min(paginaActual * porPagina, productosFiltrados.length)}</b> de{' '}
                <b className="text-secondary">{productosFiltrados.length}</b> productos
              </span>
              <span>·</span>
              <label className="flex items-center gap-1.5">
                Ver
                <select
                  value={porPagina}
                  onChange={(e) => { setPorPagina(Number(e.target.value)); setPagina(1); }}
                  className="border border-slate-200 rounded-md px-1.5 py-1 text-secondary bg-white"
                >
                  {TAMANOS_PAGINA.map((n) => <option key={n} value={n}>{n} por página</option>)}
                </select>
              </label>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setPagina(paginaActual - 1)} disabled={paginaActual === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md ring-1 ring-slate-200 text-secondary disabled:opacity-40">
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                <button key={n} onClick={() => setPagina(n)} aria-current={n === paginaActual ? 'page' : undefined}
                  className={`w-8 h-8 rounded-md ${n === paginaActual ? 'bg-primary text-white font-medium' : 'text-secondary hover:bg-slate-100'}`}>
                  {n}
                </button>
              ))}
              <button onClick={() => setPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md ring-1 ring-slate-200 text-secondary disabled:opacity-40">
                Siguiente <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Paneles inferiores: datos reales de la base */}
      {!loading && productos.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 font-semibold text-secondary">
                <CalendarClock className="w-5 h-5 text-primary" /> Próximos a vencer
              </h3>
              <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">{porVencer.length} en 30 días</span>
            </div>
            <p className="text-sm text-slate-500 mt-1">Usar primero lo que vence primero (FEFO).</p>
            <ul className="mt-3 divide-y divide-slate-100">
              {porVencer.slice(0, 6).map(({ producto, dias }) => (
                <li key={producto.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="min-w-0">
                    <span className="block font-medium text-secondary truncate">{producto.nombre}</span>
                    <span className="text-xs text-slate-500">{producto.sku} · {formatearCantidad(producto.stockActual)} {producto.unidadMedida} · {formatearFecha(producto.fechaVencimiento)}</span>
                  </span>
                  <span className={`text-xs font-semibold whitespace-nowrap ${dias <= 2 ? 'text-red-600' : dias <= DIAS_ALERTA_VENCIMIENTO ? 'text-amber-600' : 'text-slate-500'}`}>
                    {textoDias(dias)}
                  </span>
                </li>
              ))}
              {porVencer.length === 0 && <li className="py-6 text-center text-sm text-slate-400">Nada vence en los próximos 30 días.</li>}
            </ul>
          </section>

          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 font-semibold text-secondary">
                <Siren className="w-5 h-5 text-danger" /> Reponer primero
              </h3>
              <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{reponerPrimero.length} críticos</span>
            </div>
            <p className="text-sm text-slate-500 mt-1">Productos en estado crítico, del más vacío al menos vacío.</p>
            <ul className="mt-3 divide-y divide-slate-100">
              {reponerPrimero.slice(0, 6).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="min-w-0">
                    <span className="block font-medium text-secondary truncate">{p.nombre}</span>
                    <span className="text-xs text-slate-500">{p.sku} · {CATEGORIA_LABEL[p.categoria]}</span>
                  </span>
                  <span className="text-xs whitespace-nowrap text-slate-500">
                    <b className="text-red-600">{formatearCantidad(p.stockActual)}</b> / mín. {formatearCantidad(p.stockMinimo)} {p.unidadMedida}
                  </span>
                </li>
              ))}
              {reponerPrimero.length === 0 && <li className="py-6 text-center text-sm text-slate-400">No hay productos en estado crítico.</li>}
            </ul>
          </section>
        </div>
      )}

      {modalAbierto && (
        <NuevoProductoModal
          productos={productos}
          onCrear={crearProducto}
          onCreado={handleCreado}
          onCerrar={() => setModalAbierto(false)}
        />
      )}
    </div>
  );
};
