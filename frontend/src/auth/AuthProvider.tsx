import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AuthContext } from './authContext';
import { authService } from '../services/authService';
import { tokenStorage } from '../api/tokenStorage';
import { SESSION_EXPIRED_EVENT } from '../api/axios';
import type { LoginCredentials, UsuarioDTO } from '../types/auth';

// 🧠 Guarda quién está conectado y lo comparte con toda la app.
// Compañeros: aquí NO hay llamadas HTTP; todo pasa por src/services/authService.ts
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UsuarioDTO | null>(null);
  // Solo hay algo que validar si quedó un token guardado de una sesión anterior.
  const [isCheckingSession, setIsCheckingSession] = useState(() => tokenStorage.get() !== null);

  // ✅ Al abrir la app, se pregunta al backend si el token guardado sigue siendo válido.
  useEffect(() => {
    let activo = true;
    authService.validarToken().then((usuario) => {
      if (!activo) return;
      setUser(usuario);
      setIsCheckingSession(false);
    });
    return () => {
      activo = false;
    };
  }, []);

  // 🚪 Si el backend responde 401 en cualquier petición, se cierra la sesión.
  useEffect(() => {
    const cerrarSesion = () => setUser(null);
    window.addEventListener(SESSION_EXPIRED_EVENT, cerrarSesion);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, cerrarSesion);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const usuario = await authService.login(credentials);
    setUser(usuario);
    return usuario;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: user !== null, isCheckingSession, login, logout }),
    [user, isCheckingSession, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
