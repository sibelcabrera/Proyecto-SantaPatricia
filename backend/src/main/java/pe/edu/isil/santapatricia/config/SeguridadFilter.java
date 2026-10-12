package pe.edu.isil.santapatricia.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Set;
import pe.edu.isil.santapatricia.dto.ErrorDTO;

/**
 * Revisa que cada petición a /api/* traiga un token JWT válido (HU01).
 *
 *   Rutas LIBRES (sin token): el login, la lista de turnos (se ve antes de entrar) y /api/salud.
 *   Resto: exige la cabecera  Authorization: Bearer <token>
 *          - Token correcto  -> guarda el usuario en la petición y deja pasar.
 *          - Sin token, falso o vencido -> responde 401 y NO deja pasar.
 *
 * Se registra en web.xml después de CorsFilter.
 */
public class SeguridadFilter implements Filter {

    private static final Set<String> RUTAS_LIBRES = Set.of("/api/auth/login", "/api/auth/turnos", "/api/salud");

    // Nombres con los que los Servlets leen al usuario que hizo la petición
    public static final String ATR_USUARIO_ID = "usuarioId";
    public static final String ATR_USUARIO_ROL = "usuarioRol";
    public static final String ATR_USUARIO_TURNO = "usuarioTurno";

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain cadena)
            throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;
        String ruta = request.getRequestURI().substring(request.getContextPath().length());

        if (RUTAS_LIBRES.contains(ruta)) {
            cadena.doFilter(req, res);
            return;
        }

        String cabecera = request.getHeader("Authorization");
        if (cabecera == null || !cabecera.startsWith("Bearer ")) {
            rechazar(response);
            return;
        }
        try {
            Claims datos = JwtUtil.leerToken(cabecera.substring(7));
            request.setAttribute(ATR_USUARIO_ID, datos.get("id", Integer.class));
            request.setAttribute(ATR_USUARIO_ROL, datos.get("rol", String.class));
            request.setAttribute(ATR_USUARIO_TURNO, datos.get("turno", String.class));
            cadena.doFilter(req, res);
        } catch (JwtException | IllegalArgumentException e) {
            rechazar(response);   // token falso, modificado o vencido
        }
    }

    private void rechazar(HttpServletResponse response) throws IOException {
        JsonUtil.escribir(response, HttpServletResponse.SC_UNAUTHORIZED,
                new ErrorDTO("Su sesión expiró o no ha iniciado sesión"));
    }
}
