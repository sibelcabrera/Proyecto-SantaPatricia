package pe.edu.isil.santapatricia.config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

/**
 * CORS: permite que React (que corre en OTRA dirección, http://localhost:5173)
 * llame a esta API (http://localhost:8087). Sin esto, el navegador bloquea las peticiones.
 *
 * Las direcciones permitidas están en config.properties (cors.origenes).
 * Se registra en web.xml como el PRIMER filtro.
 */
public class CorsFilter implements Filter {

    private static final List<String> ORIGENES = Configuracion.lista("cors.origenes");

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain cadena)
            throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        String origen = request.getHeader("Origin");
        if (origen != null && ORIGENES.contains(origen)) {
            response.setHeader("Access-Control-Allow-Origin", origen);
            response.setHeader("Vary", "Origin");
            response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, Accept");
            response.setHeader("Access-Control-Max-Age", "3600");
        }

        // El navegador primero envía una petición OPTIONS ("¿puedo?"); se responde y se termina aquí.
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_NO_CONTENT);
            return;
        }
        cadena.doFilter(req, res);
    }
}
