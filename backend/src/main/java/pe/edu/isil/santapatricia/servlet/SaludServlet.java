package pe.edu.isil.santapatricia.servlet;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.Map;
import pe.edu.isil.santapatricia.config.ConexionBD;

/**
 * GET /api/salud  (sin token)
 * Sirve para comprobar rápidamente que el backend y la base de datos están funcionando.
 * La página de inicio (index.html) la usa para mostrar el estado.
 */
@WebServlet("/api/salud")
public class SaludServlet extends BaseServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Map<String, String> estado = new LinkedHashMap<>();
        estado.put("backend", "funcionando");
        try (Connection cn = ConexionBD.obtener()) {
            estado.put("baseDeDatos", "conectada a " + cn.getCatalog());
        } catch (SQLException e) {
            estado.put("baseDeDatos", "SIN CONEXIÓN: revise MySQL y config.properties");
        }
        responder(response, 200, estado);
    }
}
