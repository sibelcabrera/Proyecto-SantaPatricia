package pe.edu.isil.santapatricia.servlet;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import pe.edu.isil.santapatricia.config.JsonUtil;
import pe.edu.isil.santapatricia.dto.ProductoDTO;
import pe.edu.isil.santapatricia.dto.ProductoRequest;
import pe.edu.isil.santapatricia.service.ProductoService;
import pe.edu.isil.santapatricia.service.ServicioException;
import pe.edu.isil.santapatricia.service.impl.ProductoServiceImpl;

/**
 * HU02 - Catálogo de productos del inventario.
 *
 *   GET    /api/inventario/productos        -> lista                (todos los roles)
 *   GET    /api/inventario/productos/{id}   -> un producto          (todos los roles)
 *   POST   /api/inventario/productos        -> registrar  (201)     (solo ADMINISTRADOR)
 *   PUT    /api/inventario/productos/{id}   -> editar                (solo ADMINISTRADOR)
 *   DELETE /api/inventario/productos/{id}   -> eliminar   (204)     (solo ADMINISTRADOR)
 *
 * El Servlet solo recibe la petición y responde; las reglas están en ProductoService.
 */
@WebServlet("/api/inventario/productos/*")
public class ProductoServlet extends BaseServlet {

    private final ProductoService productoService = new ProductoServiceImpl();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String ruta = request.getPathInfo();
        if (ruta == null || ruta.equals("/")) {
            responder(response, 200, productoService.listar());
        } else {
            responder(response, 200, productoService.obtener(idDeLaRuta(ruta)));
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        exigirAdministrador(request);
        ProductoRequest datos = JsonUtil.leer(request, ProductoRequest.class);
        ProductoDTO creado = productoService.crear(datos);
        response.setHeader("Location", request.getContextPath() + "/api/inventario/productos/" + creado.getId());
        responder(response, 201, creado);
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws IOException {
        exigirAdministrador(request);
        int id = idObligatorio(request);
        ProductoRequest datos = JsonUtil.leer(request, ProductoRequest.class);
        responder(response, 200, productoService.actualizar(id, datos));
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) {
        exigirAdministrador(request);
        productoService.eliminar(idObligatorio(request));
        response.setStatus(204);   // 204 = eliminado, sin contenido que devolver
    }

    private int idObligatorio(HttpServletRequest request) {
        String ruta = request.getPathInfo();
        if (ruta == null || ruta.equals("/")) {
            throw new ServicioException(400, "Indique el id del producto en la ruta");
        }
        return idDeLaRuta(ruta);
    }
}
