package pe.edu.isil.santapatricia.config;

import jakarta.json.bind.Jsonb;
import jakarta.json.bind.JsonbBuilder;
import jakarta.json.bind.JsonbException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import pe.edu.isil.santapatricia.service.ServicioException;

/**
 * Convierte objetos Java <-> JSON usando JSON-B (viene incluido en GlassFish).
 *   leer(request, LoginRequest.class)  : JSON que envía React  -> objeto Java
 *   escribir(response, 200, objeto)    : objeto Java           -> JSON para React
 */
public final class JsonUtil {

    private static final Jsonb JSONB = JsonbBuilder.create();

    private JsonUtil() {
    }

    public static <T> T leer(HttpServletRequest request, Class<T> tipo) throws IOException {
        request.setCharacterEncoding("UTF-8");
        try {
            T objeto = JSONB.fromJson(request.getReader(), tipo);
            if (objeto == null) {
                throw new ServicioException(400, "No se enviaron datos");
            }
            return objeto;
        } catch (JsonbException e) {
            throw new ServicioException(400, "Los datos enviados no tienen el formato correcto");
        }
    }

    public static void escribir(HttpServletResponse response, int estadoHttp, Object objeto) throws IOException {
        response.setStatus(estadoHttp);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(JSONB.toJson(objeto));
    }
}
