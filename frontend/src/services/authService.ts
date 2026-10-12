import { api } from '../api/axios';
import { API_CONFIG, ENDPOINTS } from '../api/config';
import { tokenStorage } from '../api/tokenStorage';
import type { LoginCredentials, LoginResponseDTO, TurnoDTO, UsuarioDTO } from '../types/auth';
import { authMock } from './mocks/authMock';

// ╔══════════════════════════════════════════════════════════════════╗
// ║  🔐 SERVICIO DE AUTENTICACIÓN                                      ║
// ║  Aquí viven TODAS las llamadas al backend relacionadas con login.  ║
// ║  El componente visual (Login.tsx) nunca hace fetch directamente.   ║
// ║                                                                    ║
// ║  👉 Compañeros, lo único que deberían revisar:                     ║
// ║     1. Las rutas → src/api/config.ts (ENDPOINTS.auth)              ║
// ║     2. La forma del JSON → src/types/auth.ts                       ║
// ║     3. Poner VITE_USE_MOCKS=false en el .env                       ║
// ╚══════════════════════════════════════════════════════════════════╝

export const authService = {
  // ──────────────────────────────────────────────────────────────────
  // 🔑 LOGIN
  // Envía:   POST {VITE_API_URL}/auth/login   →  { correo, password, turno }
  // Espera:  200 OK                            →  { token, usuario }
  // Si las credenciales son incorrectas, devuelvan 401 con un "message" 💬
  // ──────────────────────────────────────────────────────────────────
  async login({ correo, password, turno, recordarme }: LoginCredentials): Promise<UsuarioDTO> {
    const respuesta: LoginResponseDTO = API_CONFIG.useMocks
      ? await authMock.login({ correo, password, turno })
      : (await api.post<LoginResponseDTO>(ENDPOINTS.auth.login, { correo, password, turno })).data;

    // 💾 Guardamos el token para que axios lo mande en las siguientes peticiones
    tokenStorage.set(respuesta.token, recordarme);
    return respuesta.usuario;
  },

  // ──────────────────────────────────────────────────────────────────
  // 🕘 TURNOS (para el desplegable del login; no necesita token)
  // Envía:   GET {VITE_API_URL}/auth/turnos
  // Espera:  200 OK → [{ codigo, nombre, horaInicio, horaFin }]
  // ──────────────────────────────────────────────────────────────────
  async listarTurnos(): Promise<TurnoDTO[]> {
    return API_CONFIG.useMocks
      ? authMock.listarTurnos()
      : (await api.get<TurnoDTO[]>(ENDPOINTS.auth.turnos)).data;
  },

  // ──────────────────────────────────────────────────────────────────
  // ✅ VALIDAR TOKEN (se ejecuta al abrir/recargar la página)
  // Envía:   GET {VITE_API_URL}/auth/me   con   Authorization: Bearer <token>
  // Espera:  200 OK → UsuarioDTO   |   401 → token vencido o inválido
  // Devuelve null si no hay sesión válida.
  // ──────────────────────────────────────────────────────────────────
  async validarToken(): Promise<UsuarioDTO | null> {
    const token = tokenStorage.get();
    if (!token) return null;

    try {
      return API_CONFIG.useMocks
        ? await authMock.validarToken(token)
        : (await api.get<UsuarioDTO>(ENDPOINTS.auth.validarToken)).data;
    } catch {
      tokenStorage.clear();
      return null;
    }
  },

  // ──────────────────────────────────────────────────────────────────
  // 🚪 LOGOUT
  // Con JWT basta con borrar el token del navegador.
  // Compañeros: si implementan un endpoint de logout (ej. lista negra de
  // tokens), agreguen aquí la llamada:  await api.post('/auth/logout');
  // ──────────────────────────────────────────────────────────────────
  logout() {
    tokenStorage.clear();
  },
};
