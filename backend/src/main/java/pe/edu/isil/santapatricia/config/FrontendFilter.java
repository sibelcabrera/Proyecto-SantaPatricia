package pe.edu.isil.santapatricia.config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;

/**
 * El frontend React vive dentro del backend, en /app/ (lo genera "npm run build").
 *
 * React maneja sus propias rutas (/app/login, /app/...). Si el usuario recarga la página
 * en una de esas rutas, GlassFish buscaría un archivo que no existe. Este filtro entrega
 * index.html de React en esos casos, y React muestra la pantalla correcta.
 * Los archivos reales (.js, .css, .svg) se entregan normalmente.
 */
public class FrontendFilter implements Filter {

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain cadena)
            throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) req;
        String ruta = request.getRequestURI().substring(request.getContextPath().length());
        String ultimaParte = ruta.substring(ruta.lastIndexOf('/') + 1);

        if (ultimaParte.contains(".")) {
            cadena.doFilter(req, res);                                        // archivo real
        } else {
            request.getRequestDispatcher("/app/index.html").forward(req, res); // ruta de React
        }
    }
}
