import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { X, Loader2, PackagePlus, Calculator } from 'lucide-react';
import { inventarioService } from '../../services/inventarioService';
import { getErrorMessage, getErroresPorCampo } from '../../api/axios';
import type { CategoriaProducto, CrearProductoDTO, OpcionDTO, ProductoDTO, UnidadMedida } from '../../types/inventario';

// ╔══════════════════════════════════════════════════════════════════╗
// ║  ➕ FORMULARIO "NUEVO PRODUCTO" (HU02)                             ║
// ║  - El código (SKU) NO se escribe: el backend lo genera con las     ║
// ║    3 primeras letras del nombre (Azúcar rubia -> AZU-001).         ║
// ║  - "¿Cómo llega?": 10 sacos x 10 KG = 100 KG de stock que entra.  ║
// ║  - Los errores del backend se muestran debajo de cada casilla.     ║
// ╚══════════════════════════════════════════════════════════════════╝

interface NuevoProductoModalProps {
  productos: ProductoDTO[];                               // para mostrar el código que se generará
  onCrear: (datos: CrearProductoDTO) => Promise<ProductoDTO>;
  onCreado: (producto: ProductoDTO) => void;
  onCerrar: () => void;
}

// Mismo criterio que el backend (ProductoServiceImpl.prefijoSku)
const prefijoSku = (nombre: string) =>
  (nombre.normalize('NFD').replace(/[^A-Za-z]/g, '').toUpperCase() + 'XXX').slice(0, 3);

const inputClase = (conError: boolean) =>
  `w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
    conError ? 'border-danger bg-red-50' : 'border-slate-200 bg-slate-50 focus:border-primary focus:bg-white'
  }`;

const Campo = ({ id, label, ayuda, error, children }: {
  id: string; label: string; ayuda?: string; error?: string; children: ReactNode;
}) => (
  <div className="flex flex-col gap-1.5 min-w-0">
    <label htmlFor={id} className="text-sm font-semibold text-secondary">
      {label} {ayuda && <span className="font-normal text-slate-400">{ayuda}</span>}
    </label>
    {children}
    {error && <p className="text-xs text-danger">{error}</p>}
  </div>
);

export const NuevoProductoModal = ({ productos, onCrear, onCreado, onCerrar }: NuevoProductoModalProps) => {
  const [categorias, setCategorias] = useState<OpcionDTO[]>([]);
  const [unidades, setUnidades] = useState<OpcionDTO[]>([]);

  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [unidad, setUnidad] = useState('');
  const [envases, setEnvases] = useState('');          // ej. 10 sacos
  const [contenido, setContenido] = useState('');      // ej. 10 KG cada saco
  const [stockActual, setStockActual] = useState('');
  const [stockMinimo, setStockMinimo] = useState('');
  const [precio, setPrecio] = useState('');
  const [vencimiento, setVencimiento] = useState('');

  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  // 📋 Al abrir, se piden al backend las opciones de los desplegables
  useEffect(() => {
    Promise.all([inventarioService.listarCategorias(), inventarioService.listarUnidades()])
      .then(([cats, unis]) => {
        setCategorias(cats);
        setUnidades(unis);
      })
      .catch((err) => setErrorGeneral(getErrorMessage(err, 'No se pudieron cargar las opciones del formulario.')));
  }, []);

  // ⌨️ Esc cierra el formulario
  useEffect(() => {
    const alPresionar = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar();
    window.addEventListener('keydown', alPresionar);
    return () => window.removeEventListener('keydown', alPresionar);
  }, [onCerrar]);

  // ✏️ Al corregir una casilla, su mensaje de error desaparece
  const limpiarError = (campo: string) =>
    setErrores((previos) => {
      if (!previos[campo]) return previos;
      const copia = { ...previos };
      delete copia[campo];
      return copia;
    });

  // Cambia el valor de una casilla y borra su error: cambiar(setNombre, 'nombre')(valor)
  const cambiar = (guardar: (valor: string) => void, campo: string) => (valor: string) => {
    guardar(valor);
    limpiarError(campo);
  };

  // 🧮 "10 sacos x 10 KG" -> llena solo el stock que entra (100)
  const calcularStock = (nuevosEnvases: string, nuevoContenido: string) => {
    const n = Number(nuevosEnvases);
    const c = Number(nuevoContenido);
    if (nuevosEnvases && nuevoContenido && n > 0 && c > 0) {
      setStockActual(String(Math.round(n * c * 100) / 100));
      limpiarError('stockActual');
    }
  };
  const cambiarEnvases = (valor: string) => {
    setEnvases(valor);
    calcularStock(valor, contenido);
  };
  const cambiarContenido = (valor: string) => {
    setContenido(valor);
    calcularStock(envases, valor);
  };

  // 🏷️ Vista previa del código que generará el backend
  const skuPrevio = useMemo(() => {
    if (!nombre.trim()) return '— se genera al escribir el nombre —';
    const prefijo = prefijoSku(nombre);
    const usados = productos
      .filter((p) => p.sku.startsWith(prefijo + '-'))
      .map((p) => Number(p.sku.slice(prefijo.length + 1)) || 0);
    const siguiente = (usados.length ? Math.max(...usados) : 0) + 1;
    return `${prefijo}-${String(siguiente).padStart(3, '0')}`;
  }, [nombre, productos]);

  const numeroONull = (texto: string) => (texto.trim() === '' ? null : Number(texto));

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    setErrores({});
    setErrorGeneral(null);
    setGuardando(true);
    try {
      // 📤 Se envía al backend (POST /inventario/productos). El sku NO se envía: lo genera el backend.
      const creado = await onCrear({
        nombre,
        categoria: categoria as CategoriaProducto,
        unidadMedida: unidad as UnidadMedida,
        stockActual: numeroONull(stockActual) as number,
        stockMinimo: numeroONull(stockMinimo) as number,
        precioUnitario: numeroONull(precio) as number,
        fechaVencimiento: vencimiento || null,
      });
      onCreado(creado);
    } catch (err) {
      const porCampo = getErroresPorCampo(err);
      setErrores(porCampo);
      if (Object.keys(porCampo).length === 0) {
        // Error sin campo específico (nombre repetido, sin permiso, backend apagado...)
        const mensaje = getErrorMessage(err, 'No se pudo registrar el producto.');
        if (mensaje.includes('llamado')) setErrores({ nombre: mensaje });
        else setErrorGeneral(mensaje);
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 z-30 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onCerrar()}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="titulo-nuevo-producto"
           className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto border-t-4 border-primary">
        <div className="flex items-start justify-between px-6 pt-6">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 id="titulo-nuevo-producto" className="text-xl font-bold text-secondary">Nuevo producto</h3>
              <p className="text-sm text-slate-500">Registre lo que entra al almacén. Los campos con * son obligatorios.</p>
            </div>
          </div>
          <button onClick={onCerrar} className="text-slate-400 hover:text-secondary" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={guardar} noValidate className="px-6 pb-6 pt-5 flex flex-col gap-5">
          {/* 1. Qué es */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Campo id="np-nombre" label="Nombre *" ayuda="(ej. Azúcar rubia)" error={errores.nombre}>
                <input id="np-nombre" autoFocus value={nombre} onChange={(e) => cambiar(setNombre, 'nombre')(e.target.value)}
                       maxLength={100} className={inputClase(!!errores.nombre)} placeholder="¿Qué producto entra?" />
              </Campo>
              <p className="text-xs text-slate-500 mt-1.5">
                Código que se asignará: <span className="font-mono font-semibold text-primary">{skuPrevio}</span>
              </p>
            </div>
            <Campo id="np-area" label="Área *" error={errores.categoria}>
              <select id="np-area" value={categoria} onChange={(e) => cambiar(setCategoria, 'categoria')(e.target.value)} className={inputClase(!!errores.categoria)}>
                <option value="">Seleccione...</option>
                {categorias.map((c) => <option key={c.codigo} value={c.codigo}>{c.nombre}</option>)}
              </select>
            </Campo>
            <Campo id="np-unidad" label="Unidad de medida *" ayuda="(cómo se cuenta el stock)" error={errores.unidadMedida}>
              <select id="np-unidad" value={unidad} onChange={(e) => cambiar(setUnidad, 'unidadMedida')(e.target.value)} className={inputClase(!!errores.unidadMedida)}>
                <option value="">Seleccione...</option>
                {unidades.map((u) => <option key={u.codigo} value={u.codigo}>{u.codigo} — {u.nombre}</option>)}
              </select>
            </Campo>
          </div>

          {/* 2. ¿Cómo llega? (ayuda para calcular el stock) */}
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-4">
            <p className="text-sm font-semibold text-secondary flex items-center gap-2 mb-3">
              <Calculator className="w-4 h-4 text-primary" /> ¿Cómo llega? <span className="font-normal text-slate-400">(opcional, calcula el stock por ti)</span>
            </p>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <input aria-label="Cantidad de envases" type="number" min="0" value={envases} onChange={(e) => cambiarEnvases(e.target.value)}
                     className="w-24 px-3 py-2 rounded-lg border border-slate-200 bg-white" placeholder="10" />
              <span>sacos / cajas / paquetes de</span>
              <input aria-label="Contenido de cada envase" type="number" min="0" step="0.01" value={contenido} onChange={(e) => cambiarContenido(e.target.value)}
                     className="w-24 px-3 py-2 rounded-lg border border-slate-200 bg-white" placeholder="10" />
              <span className="font-medium">{unidad || 'unidad'}</span>
              {envases && contenido && (
                <span className="ml-auto font-semibold text-secondary">
                  = {Number(envases) * Number(contenido)} {unidad}
                </span>
              )}
            </div>
          </div>

          {/* 3. Cantidades y precio */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Campo id="np-stock" label="Stock que entra *" ayuda={unidad ? `(${unidad})` : ''} error={errores.stockActual}>
              <input id="np-stock" type="number" min="0" step="0.01" value={stockActual} onChange={(e) => cambiar(setStockActual, 'stockActual')(e.target.value)}
                     className={inputClase(!!errores.stockActual)} placeholder="100" />
            </Campo>
            <Campo id="np-minimo" label="Stock mínimo *" ayuda={unidad ? `(${unidad})` : ''} error={errores.stockMinimo}>
              <input id="np-minimo" type="number" min="0" step="0.01" value={stockMinimo} onChange={(e) => cambiar(setStockMinimo, 'stockMinimo')(e.target.value)}
                     className={inputClase(!!errores.stockMinimo)} placeholder="20" />
            </Campo>
            <Campo id="np-precio" label="Precio (S/) *" ayuda={unidad ? `por ${unidad}` : ''} error={errores.precioUnitario}>
              <input id="np-precio" type="number" min="0" step="0.01" value={precio} onChange={(e) => cambiar(setPrecio, 'precioUnitario')(e.target.value)}
                     className={inputClase(!!errores.precioUnitario)} placeholder="3.50" />
            </Campo>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Campo id="np-vence" label="Vencimiento" ayuda="(vacío = no vence)" error={errores.fechaVencimiento}>
              <input id="np-vence" type="date" value={vencimiento} onChange={(e) => cambiar(setVencimiento, 'fechaVencimiento')(e.target.value)}
                     className={inputClase(!!errores.fechaVencimiento)} />
            </Campo>
          </div>

          {errorGeneral && (
            <div role="alert" className="p-3 bg-red-50 border border-red-200 text-danger text-sm rounded-lg">{errorGeneral}</div>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onCerrar}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:border-primary hover:text-primary">
              Cancelar
            </button>
            <button type="submit" disabled={guardando}
                    className="bg-primary hover:bg-[#9c4d14] text-white px-5 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-60">
              {guardando && <Loader2 className="w-4 h-4 animate-spin" />}
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
