// 🔑 Aquí se guarda el token JWT que devuelve el login.
// "Recordarme" activado  → localStorage (sobrevive al cerrar el navegador).
// "Recordarme" desactivado → sessionStorage (se borra al cerrar la pestaña).
// Compañeros: no necesitan tocar este archivo.

const TOKEN_KEY = 'sp_auth_token';

export const tokenStorage = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  set(token: string, recordarme: boolean) {
    this.clear();
    try {
      (recordarme ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
    } catch {
      // Almacenamiento bloqueado (modo privado, etc.): la sesión no persistirá.
    }
  },

  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      // Nada que limpiar.
    }
  },
};
