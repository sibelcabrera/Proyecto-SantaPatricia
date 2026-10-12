import { createContext } from 'react';
import type { LoginCredentials, UsuarioDTO } from '../types/auth';

export interface AuthContextValue {
  user: UsuarioDTO | null;
  isAuthenticated: boolean;
  // ⏳ true mientras se valida el token guardado contra el backend (al recargar la página)
  isCheckingSession: boolean;
  login: (credentials: LoginCredentials) => Promise<UsuarioDTO>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
