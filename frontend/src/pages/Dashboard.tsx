import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Plus, AlertCircle, RefreshCw, CheckCircle2, Lock } from 'lucide-react';
import { useInventario } from '../hooks/useInventario';
import { useAuth } from '../auth/useAuth';
import { getErrorMessage } from '../api/axios';
import { MetricCard } from '../components/dashboard/MetricCard';
import { InventarioTable } from '../components/dashboard/InventarioTable';
import { CATEGORIA_LABEL } from '../constants/etiquetas';
import { NuevoProductoModal } from '../components/dashboard/NuevoProductoModal';
import type { CategoriaProducto, ProductoDTO } from '../types/inventario';

// 🏪 MÓDULO DE ALMACÉN → INVENTARIO CENTRAL
// Esta pantalla solo se encarga de MOSTRAR datos.
// Los datos llegan desde el backend Java a través de:
//   useInventario (src/hooks) → inventarioService (src/services) → axios (src/api)

const AREAS = Object.keys(CATEGORIA_LABEL) as CategoriaProducto[];

// Para buscar sin importar tildes ni mayúsculas: "azucar" encuentra "Azúcar"
const normalizar = (texto: string) => texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

export const Dashboard = () => {
  const { user } = useAuth();
  const { productos, resumen, loading, error, recargar, crearProducto, eliminarProducto } = useInventario();
  const [searchParams, setSearchParams] = useSearchParams();
  const buscar = searchParams.get('buscar') ?? '';

  const [area, setArea] = useState<CategoriaProducto | 'TODAS'>('TODAS');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [resaltadoId, setResaltadoId] = useState<number | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  // 🔐 HU01: solo el ADMINISTRADOR registra o elimina productos
  const esAdministrador = user?.rol === 'ADMINISTRADOR';

  // 🔎 Filtro por área + buscador (por nombre o código)
  const productosFiltrados = useMemo(() => {
    const texto = normalizar(buscar.trim());
    return productos.filter((p) =>
      (area === 'TODAS' || p.categoria === area) &&
      (texto === '' || normalizar(p.nombre).includes(texto) || normalizar(p.sku).includes(texto)));
  }, [productos, area, buscar]);

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

  const handleCreado = (producto: ProductoDTO) => {
    setModalAbierto(false);
    setAviso(`"${producto.nombre}" registrado con el código ${producto.sku}`);
    setResaltadoId(producto.id);
    // Se quitan los filtros para que el nuevo producto se vea en la lista
    setArea('TODAS');
    setSearchParams({}, { replace: true });
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

  const porcentajeOptimo = resumen.totalSkus
    ? ((resumen.optimos / resumen.totalSkus) * 100).toFixed(1)
    : '0';

  const chipClase = (activo: boolean) =>
    `px-3.5 py-1.5 rounded-full text-sm border transition-colors ${
      activo ? 'bg-primary border-primary text-white font-medium' : 'bg-white border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
    }`;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8 gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2">Inventario Central & Catálogo</h2>
          <p className="text-slate-500">Monitoreo en tiempo real de mermas y niveles de reposición.</p>
        </div>
        {esAdministrador && (
          <button
            onClick={() => setModalAbierto(true)}
            className="bg-primary hover:bg-[#9c4d14] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Nuevo producto
          </button>
        )}
      </div>

      {/* 🔐 HU01: los demás roles solo consultan */}
      {user && !esAdministrador && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 text-orange-800 text-sm rounded-xl flex items-center gap-2">
          <Lock className="w-4 h-4 shrink-0" />
          Su rol puede consultar el inventario. Registrar o eliminar productos y la configuración del sistema son exclusivos del Administrador.
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard titulo="Total SKUs" valor={resumen.totalSkus} detalle="Productos en catálogo" loading={loading} />
        <MetricCard titulo="Existencias Óptimas" valor={resumen.optimos} detalle={`${porcentajeOptimo}% del catálogo`} variante="success" loading={loading} />
        <MetricCard titulo="Stock Bajo" valor={resumen.stockBajo} detalle="Requiere reabastecer" variante="warning" loading={loading} />
        <MetricCard titulo="Crítico / Merma" valor={resumen.criticos} detalle="Atención inmediata" variante="danger" loading={loading} />
      </div>

      {/* ✅ Producto registrado */}
      {aviso && (
        <div role="status" className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 text-sm rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          {aviso}
        </div>
      )}

      {/* ❗ Error al cargar o al eliminar (ej. backend apagado) */}
      {(error || errorAccion) && (
        <div role="alert" className="mb-6 p-4 bg-red-50 border border-red-200 text-danger text-sm rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error ?? errorAccion}</span>
          </div>
          {error && (
            <button
              onClick={() => void recargar()}
              className="flex items-center gap-1.5 font-medium hover:underline whitespace-nowrap"
            >
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </button>
          )}
        </div>
      )}

      {/* 🏷️ Filtros por área */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button onClick={() => setArea('TODAS')} className={chipClase(area === 'TODAS')}>
          Todas ({productos.length})
        </button>
        {AREAS.map((codigo) => (
          <button key={codigo} onClick={() => setArea(codigo)} className={chipClase(area === codigo)}>
            {CATEGORIA_LABEL[codigo]} ({cantidadPorArea(codigo)})
          </button>
        ))}
        {buscar && (
          <span className="ml-auto text-sm text-slate-500">
            Buscando “{buscar}”:{' '}
            <button onClick={() => setSearchParams({}, { replace: true })} className="text-primary hover:underline">limpiar</button>
          </span>
        )}
      </div>

      {/* 📋 Tabla de inventario */}
      <InventarioTable
        productos={productosFiltrados}
        loading={loading}
        eliminandoId={eliminandoId}
        onEliminar={(producto) => void handleEliminar(producto)}
        puedeEditar={esAdministrador}
        resaltadoId={resaltadoId}
        mensajeVacio={productos.length === 0 ? 'No hay productos registrados en el inventario.' : 'Ningún producto coincide con la búsqueda o el área elegida.'}
      />
      {!loading && (
        <p className="text-sm text-slate-500 mt-3">Mostrando {productosFiltrados.length} de {productos.length} productos</p>
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
