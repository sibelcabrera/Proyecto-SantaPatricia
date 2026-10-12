package pe.edu.isil.santapatricia.servlet;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import pe.edu.isil.santapatricia.config.JsonUtil;
import pe.edu.isil.santapatricia.dto.LoginRequest;
import pe.edu.isil.santapatricia.service.AuthService;
import pe.edu.isil.santapatricia.service.ServicioException;
import pe.edu.isil.santapatricia.service.impl.AuthServiceImpl;

/**
 * HU01 - Inicio de sesión.
 *
 *   POST /api/auth/login   { correo, password }  -> 200 { token, usuario }  |  401 credenciales incorrectas
 *   GET  /api/auth/me      (con token)           -> 200 usuario              |  401 sesión vencida
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
        if (!"/me".equals(request.getPathInfo())) {
            throw new ServicioException(404, "Ruta no encontrada");
        }
        responder(response, 200, authService.usuarioActual(usuarioId(request)));
    }
}
