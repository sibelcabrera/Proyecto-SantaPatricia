
package pe.edu.isil.santapatricia.servlet;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

import pe.edu.isil.santapatricia.dao.OrdenProduccionDAO;
import pe.edu.isil.santapatricia.dao.impl.OrdenProduccionDAOImpl;
import pe.edu.isil.santapatricia.service.ServicioException;

/**
 * HU05 - Consulta de ordenes de produccion.
 */
@WebServlet("/api/produccion/ordenes/*")
public class OrdenProduccionServlet extends BaseServlet {

    private final OrdenProduccionDAO ordenDAO =
            new OrdenProduccionDAOImpl();

    @Override
    protected void doGet(
            HttpServletRequest request,
            HttpServletResponse response) throws IOException {

        String ruta = request.getPathInfo();

        if (ruta == null || ruta.equals("/")
                || ruta.equals("/disponibles")) {

            // Devolver ordenes EN_PROCESO con sus datos.
            responder(
                    response,
                    200,
                    ordenDAO.listarEnProceso()
            );

            return;
        }

        throw new ServicioException(
                404,
                "Ruta de ordenes de produccion no encontrada"
        );
    }
}
