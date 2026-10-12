package pe.edu.isil.santapatricia.servlet;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import pe.edu.isil.santapatricia.config.JsonUtil;
import pe.edu.isil.santapatricia.config.SeguridadFilter;
import pe.edu.isil.santapatricia.dto.LoginRequest;
import pe.edu.isil.santapatricia.service.AuthService;
import pe.edu.isil.santapatricia.service.ServicioException;
import pe.edu.isil.santapatricia.service.impl.AuthServiceImpl;

/**
 * HU01 - Inicio de sesión.
 *
 *   GET  /api/auth/turnos  (libre)                       -> 200 [{ codigo, nombre, horaInicio, horaFin }]
 *   POST /api/auth/login   { correo, password, turno }  -> 200 { token, usuario }  |  400 falta turno  |  401 credenciales incorrectas
 *   GET  /api/auth/me      (con token)                   -> 200 usuario (con su turno) |  401 sesión vencida
 */
@WebServlet("/api/auth/*")
public class AuthServlet extends BaseServlet {

    private final AuthService authService = new AuthServiceImpl();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!"/login".equals(request.getPathInfo())) {
            throw new ServicioException(404, "Ruta no encontrada");
        }
        LoginRequest datos = JsonUtil.leer(request, LoginRequest.class);
        responder(response, 200, authService.login(datos));
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String ruta = request.getPathInfo();
        if ("/turnos".equals(ruta)) {
            responder(response, 200, authService.listarTurnos());
        } else if ("/me".equals(ruta)) {
            String turno = (String) request.getAttribute(SeguridadFilter.ATR_USUARIO_TURNO);
            responder(response, 200, authService.usuarioActual(usuarioId(request), turno));
        } else {
            throw new ServicioException(404, "Ruta no encontrada");
        }
    }
}
