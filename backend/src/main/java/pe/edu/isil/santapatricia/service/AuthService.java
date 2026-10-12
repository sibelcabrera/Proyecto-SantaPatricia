package pe.edu.isil.santapatricia.service;

import java.util.List;
import pe.edu.isil.santapatricia.dto.LoginRequest;
import pe.edu.isil.santapatricia.dto.LoginResponse;
import pe.edu.isil.santapatricia.dto.TurnoDTO;
import pe.edu.isil.santapatricia.dto.UsuarioDTO;

/** Reglas del inicio de sesión (HU01). La implementación está en service/impl/AuthServiceImpl. */
public interface AuthService {

    /** Valida correo, contraseña y turno. Si son correctos devuelve el token y los datos del usuario. */
    LoginResponse login(LoginRequest datos);

    /** Datos del usuario dueño del token, con el turno que eligió al entrar (para GET /api/auth/me). */
    UsuarioDTO usuarioActual(int idUsuario, String codigoTurno);

    /** Turnos para el desplegable del login (GET /api/auth/turnos). */
    List<TurnoDTO> listarTurnos();
}
