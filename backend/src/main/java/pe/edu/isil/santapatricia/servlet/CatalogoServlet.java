package pe.edu.isil.santapatricia.servlet;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import pe.edu.isil.santapatricia.service.ProductoService;
import pe.edu.isil.santapatricia.service.impl.ProductoServiceImpl;

/**
 * Opciones para los desplegables del formulario "Nuevo producto" (todos los roles).
 *
 *   GET /api/inventario/categorias -> [{ "codigo": "PANADERIA", "nombre": "Panadería" }, ...]
 *   GET /api/inventario/unidades   -> [{ "codigo": "KG", "nombre": "Kilogramo" }, ...]
 */
@WebServlet({"/api/inventario/categorias", "/api/inventario/unidades"})
public class CatalogoServlet extends BaseServlet {

    private final ProductoService productoService = new ProductoServiceImpl();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (request.getServletPath().endsWith("/categorias")) {
            responder(response, 200, productoService.listarCategorias());
        } else {
            responder(response, 200, productoService.listarUnidades());
        }
    }
}
