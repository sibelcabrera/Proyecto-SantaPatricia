package pe.edu.isil.santapatricia.servlet;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;
import pe.edu.isil.santapatricia.config.JsonUtil;
import pe.edu.isil.santapatricia.config.SeguridadFilter;
import pe.edu.isil.santapatricia.dto.ErrorDTO;
import pe.edu.isil.santapatricia.service.ServicioException;

/**
 * Lo que tienen en común todos los Servlets de la API:
 *   - Atrapan los errores y los devuelven como JSON con el código HTTP correcto.
 *   - Saben quién hizo la petición (el usuario del token) y si es administrador.
 */
public abstract class BaseServlet extends HttpServlet {

    private static final Logger LOG = Logger.getLogger(BaseServlet.class.getName());

    /**
     * service() se ejecuta en TODAS las peticiones antes de doGet/doPost/doPut/doDelete.
     * Aquí atrapamos los errores en un solo lugar en vez de repetir try/catch en cada método.
     */
    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            super.service(request, response);
        } catch (ServicioException e) {
            // Error de negocio esperado: datos inválidos (400), no existe (404), repetido (409)...
            JsonUtil.escribir(response, e.getEstadoHttp(), new ErrorDTO(e.getMessage(), e.getErrores()));
        } catch (RuntimeException e) {
            // Error inesperado (por ejemplo MySQL apagado): el detalle va al log, no al usuario
            LOG.log(Level.SEVERE, "Error en " + request.getRequestURI(), e);
            JsonUtil.escribir(response, 500, new ErrorDTO("Ocurrió un error en el servidor. Intente nuevamente."));
        }
    }

    protected void responder(HttpServletResponse response, int estadoHttp, Object cuerpo) throws IOException {
        JsonUtil.escribir(response, estadoHttp, cuerpo);
    }

    /** Id del usuario que hizo la petición (lo dejó SeguridadFilter al revisar el token). */
    protected int usuarioId(HttpServletRequest request) {
        return (Integer) request.getAttribute(SeguridadFilter.ATR_USUARIO_ID);
    }

    /** HU01/HU02: solo el ADMINISTRADOR puede registrar, editar o eliminar. Si no lo es -> 403. */
    protected void exigirAdministrador(HttpServletRequest request) {
        if (!"ADMINISTRADOR".equals(request.getAttribute(SeguridadFilter.ATR_USUARIO_ROL))) {
            throw new ServicioException(403, "Su rol no tiene permiso para realizar esta operación");
        }
    }

    /** De "/15" obtiene 15. Si no es un número válido -> 400. */
    protected int idDeLaRuta(String pathInfo) {
        try {
            return Integer.parseInt(pathInfo.substring(1));
        } catch (NumberFormatException e) {
            throw new ServicioException(400, "El id debe ser un número");
        }
    }
}
