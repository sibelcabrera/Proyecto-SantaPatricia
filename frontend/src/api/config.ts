// ╔══════════════════════════════════════════════════════════════════╗
// ║  ⚙️  CONFIGURACIÓN GENERAL DE LA API                               ║
// ║  Los valores salen del archivo .env de la raíz del proyecto.       ║
// ║  👉 Compañeros: NO cambien la URL aquí, cámbienla en el .env       ║
// ╚══════════════════════════════════════════════════════════════════╝

export const API_CONFIG = {
  // 🔌 URL de su Spring Boot. Si no hay .env, se usa localhost:8080/api por defecto.
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api',

  // ⏱️ Si su API tarda más que esto, la petición se cancela y se muestra un error.
  timeout: Number(import.meta.env.VITE_API_TIMEOUT ?? 10000),

  // 🧪 Mientras sea true, el frontend usa datos de prueba y NO llama a su API.
  useMocks: import.meta.env.VITE_USE_MOCKS === 'true',
} as const;

// ╔══════════════════════════════════════════════════════════════════╗
// ║  📍 MAPA DE ENDPOINTS                                              ║
// ║  Compañeros, coloquen aquí las rutas EXACTAS de sus controladores  ║
// ║  (lo que va después de la URL base). Si su @RequestMapping es      ║
// ║  distinto, solo cambien el texto de la derecha. 👇                 ║
// ╚══════════════════════════════════════════════════════════════════╝
export const ENDPOINTS = {
  auth: {
    // 🔐 POST → recibe { correo, password } y devuelve { token, usuario }
    login: '/auth/login',
    // ✅ GET → con el token en la cabecera, devuelve el usuario si el token sigue siendo válido
    validarToken: '/auth/me',
  },
  inventario: {
    // 📦 GET (listar) y POST (crear)
    productos: '/inventario/productos',
    // 📦 GET, PUT y DELETE de un producto concreto → /inventario/productos/{id}
    productoPorId: (id: number) => `/inventario/productos/${id}`,
    // 📋 GET → opciones del desplegable "Área" del formulario
    categorias: '/inventario/categorias',
    // 📏 GET → opciones del desplegable "Unidad" del formulario
    unidades: '/inventario/unidades',
  },
} as const;
