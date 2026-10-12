import axios, { AxiosError } from 'axios';
import { API_CONFIG } from './config';
import { tokenStorage } from './tokenStorage';
import type { ApiErrorDTO } from '../types/api';

// ╔══════════════════════════════════════════════════════════════════╗
// ║  CLIENTE HTTP (AXIOS)                                           ║
// ║  TODAS las peticiones al backend pasan por aquí.                   ║
// ║  Compañeros: la URL base se cambia en el .env (VITE_API_URL).   ║
// ║                                                                    ║
// ║ CORS: como el frontend corre en http://localhost:5173 y su     ║
// ║  Spring Boot en otro puerto, necesitan permitir ese origen. Ej:    ║
// ║    @CrossOrigin(origins = "http://localhost:5173")                 ║
// ║  o una configuración global con WebMvcConfigurer / SecurityConfig. ║
// ╚══════════════════════════════════════════════════════════════════╝
export const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});


// Compañeros: su filtro de Spring Security debe leer la cabecera
// Authorization: Bearer <token>
// Si usan otro nombre de cabecera, cámbienlo aquí abajo 👇
api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//Evento que se dispara cuando el backend responde 401 (token vencido o inválido).
// El AuthProvider lo escucha y manda al usuario de vuelta al login.
export const SESSION_EXPIRED_EVENT = 'sp:session-expired';

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      tokenStorage.clear();
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
    return Promise.reject(error);
  },
);

// 💬 Convierte cualquier error en un mensaje legible para mostrar en pantalla.
// Compañeros: si su @ControllerAdvice devuelve el texto del error en un campo
// distinto a "message" o "mensaje", agréguenlo en ApiErrorDTO (src/types/api.ts) y aquí.
export const getErrorMessage = (error: unknown, fallback = 'Ocurrió un error inesperado.'): string => {
  if (axios.isAxiosError<ApiErrorDTO>(error)) {
    if (!error.response) {
      return 'No se pudo conectar con el servidor. ¿Está corriendo el backend?';
    }
    const data = error.response.data;
    return data?.message ?? data?.mensaje ?? data?.error ?? fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
};

// 📝 Errores por campo que manda el backend en un 400: { nombre: "El nombre es obligatorio", ... }
// El formulario los muestra debajo de cada casilla. Devuelve {} si no hay.
export const getErroresPorCampo = (error: unknown): Record<string, string> => {
  if (axios.isAxiosError<ApiErrorDTO>(error)) {
    return error.response?.data?.errores ?? {};
  }
  return {};
};
