import { ChefHat, Coffee, Croissant, CakeSlice, ShoppingBasket, type LucideIcon } from 'lucide-react';
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

// 🎨 Cómo se ve cada área: ícono, descripción corta y colores de su etiqueta (guía de estilos de la PA1).
export const AREA_ESTILO: Record<CategoriaProducto, { icono: LucideIcon; detalle: string; etiqueta: string }> = {
  PANADERIA: { icono: Croissant, detalle: 'Horno, harinas y masas', etiqueta: 'bg-amber-50 text-amber-800 ring-amber-200' },
  PASTELERIA: { icono: CakeSlice, detalle: 'Tortas, cremas y frío', etiqueta: 'bg-rose-50 text-rose-700 ring-rose-200' },
  COCINA: { icono: ChefHat, detalle: 'Insumos de cocina', etiqueta: 'bg-orange-50 text-orange-800 ring-orange-200' },
  CAFETERIA: { icono: Coffee, detalle: 'Café, bebidas y salón', etiqueta: 'bg-stone-100 text-stone-700 ring-stone-300' },
  MINIMARKET: { icono: ShoppingBasket, detalle: 'Góndolas y abarrotes', etiqueta: 'bg-sky-50 text-sky-800 ring-sky-200' },
};
