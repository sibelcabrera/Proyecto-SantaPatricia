import type { CategoriaProducto } from '../types/inventario';

// 🏷️ Nombre que se muestra para cada área (código del backend -> texto en pantalla).
// Si se agrega un área nueva en la base de datos, añádanla aquí también.
export const CATEGORIA_LABEL: Record<CategoriaProducto, string> = {
  COCINA: 'Cocina',
  PANADERIA: 'Panadería',
  PASTELERIA: 'Pastelería',
  CAFETERIA: 'Cafetería',
  MINIMARKET: 'Minimarket',
};
