// 🧪 DATOS DE PRUEBA DEL LOGIN (solo se usan si VITE_USE_MOCKS=true en el .env).
// Acepta cualquier correo y contraseña. Cuando el backend esté listo, este archivo deja de usarse.
import type { LoginRequestDTO, LoginResponseDTO, UsuarioDTO } from '../../types/auth';

const MOCK_TOKEN_PREFIX = 'mock-token:';

const esperar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const authMock = {
  async login({ correo }: LoginRequestDTO): Promise<LoginResponseDTO> {
    await esperar(800);
    const usuario: UsuarioDTO = { id: 1, nombre: correo.split('@')[0], correo, rol: 'ADMINISTRADOR' };
    return { token: MOCK_TOKEN_PREFIX + JSON.stringify(usuario), usuario };
  },

  async validarToken(token: string): Promise<UsuarioDTO> {
    await esperar(200);
    if (!token.startsWith(MOCK_TOKEN_PREFIX)) throw new Error('Token inválido');
    return JSON.parse(token.slice(MOCK_TOKEN_PREFIX.length)) as UsuarioDTO;
  },
};
