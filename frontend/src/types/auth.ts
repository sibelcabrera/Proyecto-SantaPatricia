// ╔══════════════════════════════════════════════════════════════════╗
// ║  🔐 DTOs DE AUTENTICACIÓN                                          ║
// ║  Compañeros: estos nombres de campo deben coincidir EXACTAMENTE    ║
// ║  con los de sus clases Java (LoginRequest, LoginResponse, etc.).   ║
// ║  Si en Java se llama distinto, cambien el nombre aquí. 👇          ║
// ╚══════════════════════════════════════════════════════════════════╝

// 📤 Lo que el frontend ENVÍA en POST /auth/login
export interface LoginRequestDTO {
  correo: string;
  password: string;
}

// 👤 Datos del usuario que inició sesión
export interface UsuarioDTO {
  id: number;
  nombre: string;
  correo: string;
  // 🏷️ Los 4 roles definidos en Jira (HU01). Coinciden con la tabla "roles" de MySQL.
  rol: RolUsuario;
}

export type RolUsuario = 'ADMINISTRADOR' | 'ENCARGADO_PRODUCCION' | 'CAJERO' | 'ALMACENERO';

// 📥 Lo que el backend DEVUELVE al hacer login correctamente
export interface LoginResponseDTO {
  token: string;
  usuario: UsuarioDTO;
}

// Datos del formulario de login (incluye "recordarme", que NO se envía al backend)
export interface LoginCredentials extends LoginRequestDTO {
  recordarme: boolean;
}
