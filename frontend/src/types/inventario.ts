// ╔══════════════════════════════════════════════════════════════════╗
// ║  📦 DTOs DEL INVENTARIO CENTRAL                                    ║
// ║  Compañeros: esto representa el JSON que esperamos de su API.      ║
// ║  Los nombres deben coincidir con los atributos de su ProductoDTO   ║
// ║  en Java (Jackson los serializa tal cual, en camelCase).           ║
// ║                                                                    ║
// ║  🔁 Equivalencias Java → TypeScript:                               ║
// ║     Long / Integer / BigDecimal / Double  → number                 ║
// ║     String                                → string                 ║
// ║     LocalDate / LocalDateTime             → string (ISO)           ║
// ║     Enum                                  → unión de textos        ║
// ║     campo que puede ser null              → tipo | null            ║
// ╚══════════════════════════════════════════════════════════════════╝

// 🏷️ Áreas del negocio: mismos códigos que la tabla "categorias" de MySQL
export type CategoriaProducto = 'COCINA' | 'PANADERIA' | 'PASTELERIA' | 'CAFETERIA' | 'MINIMARKET';

// 📏 Unidades de medida: mismos valores que la columna productos.unidad_medida
export type UnidadMedida = 'KG' | 'G' | 'L' | 'ML' | 'UND' | 'PAQ';

// 📋 Opción de un desplegable que manda el backend: { codigo: "KG", nombre: "Kilogramo" }
export interface OpcionDTO {
  codigo: string;
  nombre: string;
}

// 🚦 Compañeros: mismos valores que su enum EstadoStock en Java
export type EstadoStock = 'OPTIMO' | 'BAJO' | 'CRITICO';

// 📥 Lo que el backend DEVUELVE por cada producto (GET)
export interface ProductoDTO {
  id: number;
  sku: string;
  nombre: string;
  categoria: CategoriaProducto;
  unidadMedida: UnidadMedida;
  stockActual: number;
  stockMinimo: number;
  precioUnitario: number;
  fechaVencimiento: string | null; // formato "2026-10-31"
  estado: EstadoStock;
  ultimaActualizacion: string; // formato "2026-10-09T08:30:00"
}

// 📤 Lo que el frontend ENVÍA para crear un producto (POST)
// (sin id, estado ni fechas automáticas: eso lo calcula el backend)
// sku es OPCIONAL: si no se envía, el backend lo genera con las 3 primeras letras del nombre (Azúcar -> AZU-001)
export interface CrearProductoDTO {
  sku?: string;
  nombre: string;
  categoria: CategoriaProducto;
  unidadMedida: UnidadMedida;
  stockActual: number;
  stockMinimo: number;
  precioUnitario: number;
  fechaVencimiento: string | null;
}

// 📤 Lo que el frontend ENVÍA para actualizar un producto (PUT)
export type ActualizarProductoDTO = CrearProductoDTO;

// 📊 Resumen que se muestra en las tarjetas del dashboard.
// (Se calcula en el frontend a partir de la lista, así el backend no necesita otro endpoint)
export interface ResumenInventario {
  totalSkus: number;
  optimos: number;
  stockBajo: number;
  criticos: number;
}
