package pe.edu.isil.santapatricia.service;

import pe.edu.isil.santapatricia.dto.LoginRequest;
import pe.edu.isil.santapatricia.dto.LoginResponse;
import pe.edu.isil.santapatricia.dto.UsuarioDTO;

/** Reglas del inicio de sesión (HU01). La implementación está en service/impl/AuthServiceImpl. */
public interface AuthService {

    /** Valida correo y contraseña. Si son correctos devuelve el token y los datos del usuario. */
    LoginResponse login(LoginRequest datos);

    /** Datos del usuario dueño del token (para GET /api/auth/me). */
    UsuarioDTO usuarioActual(int idUsuario);
}
