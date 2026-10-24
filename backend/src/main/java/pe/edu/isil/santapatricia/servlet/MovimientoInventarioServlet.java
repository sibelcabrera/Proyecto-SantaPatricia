package pe.edu.isil.santapatricia.servlet;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

import pe.edu.isil.santapatricia.config.JsonUtil;
import pe.edu.isil.santapatricia.dto.MovimientoInventarioRequest;
import pe.edu.isil.santapatricia.service.MovimientoInventarioService;
import pe.edu.isil.santapatricia.service.ServicioException;
import pe.edu.isil.santapatricia.service.impl.MovimientoInventarioServiceImpl;

/**
 * HU04 - Salida por venta o despacho.
 * HU05 - Consumo de materia prima para produccion.
 */
@WebServlet("/api/inventario/movimientos/*")
public class MovimientoInventarioServlet extends BaseServlet {

    private final MovimientoInventarioService servicio =
            new MovimientoInventarioServiceImpl();

    @Override
    protected void doPost(HttpServletRequest request,
            HttpServletResponse response) throws IOException {

        String ruta = request.getPathInfo();

        if (ruta == null || ruta.equals("/")) {
            throw new ServicioException(
                    400, "Debe indicar el tipo de movimiento");
        }

        int idUsuario = usuarioId(request);

        // Leer los datos enviados desde React.
        MovimientoInventarioRequest datos =
                JsonUtil.leer(
                        request,
                        MovimientoInventarioRequest.class
                );

        if (datos == null) {
            throw new ServicioException(
                    400, "Debe enviar los datos del movimiento");
        }

        try {
            switch (ruta) {

                // HU04: salida por venta o despacho.
                case "/salida-venta":
                    servicio.registrarSalidaVenta(
                            datos.getProductoId(),
                            idUsuario,
                            datos.getCantidad(),
                            datos.getMotivo()
                    );
                    break;

                // HU05: salida sin orden asociada.
                case "/salida-produccion":
                    servicio.registrarSalidaProduccion(
                            datos.getProductoId(),
                            idUsuario,
                            datos.getCantidad(),
                            datos.getMotivo()
                    );
                    break;

                // HU05: consumo asociado a una orden.
                case "/salida-produccion-orden":

                    if (datos.getOrdenProduccionId() == null) {
                        throw new ServicioException(
                                400,
                                "Debe seleccionar una orden de produccion"
                        );
                    }

                    servicio.registrarConsumoOrden(
                            datos.getOrdenProduccionId(),
                            datos.getProductoId(),
                            idUsuario,
                            datos.getCantidad(),
                            datos.getMotivo()
                    );
                    break;

                default:
                    throw new ServicioException(
                            404, "Tipo de movimiento no encontrado");
            }

        } catch (IllegalArgumentException e) {
            throw new ServicioException(400, e.getMessage());
        }

        responder(
                response,
                201,
                "Movimiento registrado correctamente"
        );
    }
}