import { api } from '../api/axios';
import { API_CONFIG, ENDPOINTS } from '../api/config';
import type { ActualizarProductoDTO, CrearProductoDTO, OpcionDTO, ProductoDTO } from '../types/inventario';
import { inventarioMock } from './mocks/inventarioMock';

// ╔══════════════════════════════════════════════════════════════════╗
// ║  📦 SERVICIO DEL INVENTARIO CENTRAL                                ║
// ║  Todas las peticiones CRUD de productos pasan por aquí.            ║
// ║                                                                    ║
// ║  👉 Compañeros, lo único que deberían revisar:                     ║
// ║     1. Las rutas → src/api/config.ts (ENDPOINTS.inventario)        ║
// ║     2. La forma del JSON → src/types/inventario.ts                 ║
// ║     3. Poner VITE_USE_MOCKS=false en el .env                       ║
// ╚══════════════════════════════════════════════════════════════════╝

export const inventarioService = {
  // 📋 GET {VITE_API_URL}/inventario/productos → ProductoDTO[]
  // Compañeros: si su endpoint devuelve un Page<ProductoDTO> de Spring Data,
  // cambien el tipo a { content: ProductoDTO[] } y retornen data.content 👇
  async listar(): Promise<ProductoDTO[]> {
    if (API_CONFIG.useMocks) return inventarioMock.listar();
    const { data } = await api.get<ProductoDTO[]>(ENDPOINTS.inventario.productos);
    return data;
  },

  // 🔍 GET {VITE_API_URL}/inventario/productos/{id} → ProductoDTO
  async obtenerPorId(id: number): Promise<ProductoDTO> {
    if (API_CONFIG.useMocks) return inventarioMock.obtenerPorId(id);
    const { data } = await api.get<ProductoDTO>(ENDPOINTS.inventario.productoPorId(id));
    return data;
  },

  // ➕ POST {VITE_API_URL}/inventario/productos   body: CrearProductoDTO → ProductoDTO creado (201)
  async crear(producto: CrearProductoDTO): Promise<ProductoDTO> {
    if (API_CONFIG.useMocks) return inventarioMock.crear(producto);
    const { data } = await api.post<ProductoDTO>(ENDPOINTS.inventario.productos, producto);
    return data;
  },

  // ✏️ PUT {VITE_API_URL}/inventario/productos/{id}   body: ActualizarProductoDTO → ProductoDTO actualizado
  async actualizar(id: number, producto: ActualizarProductoDTO): Promise<ProductoDTO> {
    if (API_CONFIG.useMocks) return inventarioMock.actualizar(id, producto);
    const { data } = await api.put<ProductoDTO>(ENDPOINTS.inventario.productoPorId(id), producto);
    return data;
  },

  // 🗑️ DELETE {VITE_API_URL}/inventario/productos/{id} → 204 No Content
  async eliminar(id: number): Promise<void> {
    if (API_CONFIG.useMocks) return inventarioMock.eliminar(id);
    await api.delete(ENDPOINTS.inventario.productoPorId(id));
  },

  // 📋 GET {VITE_API_URL}/inventario/categorias → [{ codigo: "PANADERIA", nombre: "Panadería" }, ...]
  async listarCategorias(): Promise<OpcionDTO[]> {
    if (API_CONFIG.useMocks) return inventarioMock.listarCategorias();
    const { data } = await api.get<OpcionDTO[]>(ENDPOINTS.inventario.categorias);
    return data;
  },

  // 📏 GET {VITE_API_URL}/inventario/unidades → [{ codigo: "KG", nombre: "Kilogramo" }, ...]
  async listarUnidades(): Promise<OpcionDTO[]> {
    if (API_CONFIG.useMocks) return inventarioMock.listarUnidades();
    const { data } = await api.get<OpcionDTO[]>(ENDPOINTS.inventario.unidades);
    return data;
  },
};
