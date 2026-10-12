// 🧪 DATOS DE PRUEBA DEL INVENTARIO (solo se usan si VITE_USE_MOCKS=true en el .env).
// Simula un backend en memoria: los cambios se pierden al recargar la página.
import type {
  ActualizarProductoDTO,
  CrearProductoDTO,
  EstadoStock,
  OpcionDTO,
  ProductoDTO,
} from '../../types/inventario';

const CATEGORIAS: OpcionDTO[] = [
  { codigo: 'CAFETERIA', nombre: 'Cafetería' },
  { codigo: 'COCINA', nombre: 'Cocina' },
  { codigo: 'MINIMARKET', nombre: 'Minimarket' },
  { codigo: 'PANADERIA', nombre: 'Panadería' },
  { codigo: 'PASTELERIA', nombre: 'Pastelería' },
];

const UNIDADES: OpcionDTO[] = [
  { codigo: 'KG', nombre: 'Kilogramo' },
  { codigo: 'G', nombre: 'Gramo' },
  { codigo: 'L', nombre: 'Litro' },
  { codigo: 'ML', nombre: 'Mililitro' },
  { codigo: 'UND', nombre: 'Unidad' },
  { codigo: 'PAQ', nombre: 'Paquete' },
];

// Mismo criterio que el backend: 3 primeras letras del nombre sin tildes + número correlativo
const generarSku = (nombre: string): string => {
  const prefijo = (nombre.normalize('NFD').replace(/[^A-Za-z]/g, '').toUpperCase() + 'XXX').slice(0, 3);
  const usados = productos.filter((p) => p.sku.startsWith(prefijo + '-')).length;
  return `${prefijo}-${String(usados + 1).padStart(3, '0')}`;
};

const esperar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const calcularEstado = (stockActual: number, stockMinimo: number): EstadoStock => {
  if (stockActual <= stockMinimo / 2) return 'CRITICO';
  if (stockActual <= stockMinimo) return 'BAJO';
  return 'OPTIMO';
};

let productos: ProductoDTO[] = [
  { id: 1, sku: 'PAN-001', nombre: 'Harina preparada', categoria: 'PANADERIA', unidadMedida: 'KG', stockActual: 120, stockMinimo: 50, precioUnitario: 3.8, fechaVencimiento: '2027-01-15', estado: 'OPTIMO', ultimaActualizacion: '2026-10-09T07:45:00' },
  { id: 2, sku: 'PAN-014', nombre: 'Levadura fresca', categoria: 'PANADERIA', unidadMedida: 'KG', stockActual: 6, stockMinimo: 10, precioUnitario: 12.5, fechaVencimiento: '2026-10-20', estado: 'BAJO', ultimaActualizacion: '2026-10-09T06:10:00' },
  { id: 3, sku: 'COC-032', nombre: 'Aceite vegetal', categoria: 'COCINA', unidadMedida: 'L', stockActual: 45, stockMinimo: 20, precioUnitario: 9.9, fechaVencimiento: '2027-05-01', estado: 'OPTIMO', ultimaActualizacion: '2026-10-08T18:00:00' },
  { id: 4, sku: 'COC-007', nombre: 'Huevos', categoria: 'COCINA', unidadMedida: 'UND', stockActual: 30, stockMinimo: 120, precioUnitario: 0.6, fechaVencimiento: '2026-10-14', estado: 'CRITICO', ultimaActualizacion: '2026-10-09T08:20:00' },
  { id: 5, sku: 'MIN-101', nombre: 'Gaseosa 500 ml', categoria: 'MINIMARKET', unidadMedida: 'UND', stockActual: 240, stockMinimo: 60, precioUnitario: 2.5, fechaVencimiento: '2027-03-30', estado: 'OPTIMO', ultimaActualizacion: '2026-10-07T12:00:00' },
  { id: 6, sku: 'MIN-118', nombre: 'Leche evaporada', categoria: 'MINIMARKET', unidadMedida: 'UND', stockActual: 18, stockMinimo: 24, precioUnitario: 4.2, fechaVencimiento: '2027-02-10', estado: 'BAJO', ultimaActualizacion: '2026-10-09T09:00:00' },
];
let siguienteId = productos.length + 1;

const buscar = (id: number): ProductoDTO => {
  const producto = productos.find((p) => p.id === id);
  if (!producto) throw new Error(`No existe el producto con id ${id}`);
  return producto;
};

export const inventarioMock = {
  async listar(): Promise<ProductoDTO[]> {
    await esperar(500);
    return [...productos];
  },

  async obtenerPorId(id: number): Promise<ProductoDTO> {
    await esperar(300);
    return buscar(id);
  },

  async crear(datos: CrearProductoDTO): Promise<ProductoDTO> {
    await esperar(400);
    const nuevo: ProductoDTO = {
      ...datos,
      sku: datos.sku || generarSku(datos.nombre),
      id: siguienteId++,
      estado: calcularEstado(datos.stockActual, datos.stockMinimo),
      ultimaActualizacion: new Date().toISOString(),
    };
    productos = [...productos, nuevo];
    return nuevo;
  },

  async actualizar(id: number, datos: ActualizarProductoDTO): Promise<ProductoDTO> {
    await esperar(400);
    const actual = buscar(id);
    const actualizado: ProductoDTO = {
      ...actual,
      ...datos,
      sku: datos.sku || actual.sku,
      estado: calcularEstado(datos.stockActual, datos.stockMinimo),
      ultimaActualizacion: new Date().toISOString(),
    };
    productos = productos.map((p) => (p.id === id ? actualizado : p));
    return actualizado;
  },

  async eliminar(id: number): Promise<void> {
    await esperar(300);
    buscar(id);
    productos = productos.filter((p) => p.id !== id);
  },

  async listarCategorias(): Promise<OpcionDTO[]> {
    await esperar(150);
    return CATEGORIAS;
  },

  async listarUnidades(): Promise<OpcionDTO[]> {
    await esperar(150);
    return UNIDADES;
  },
};
