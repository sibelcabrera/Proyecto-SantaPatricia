package pe.edu.isil.santapatricia.service;

import java.util.List;
import pe.edu.isil.santapatricia.dto.OpcionDTO;
import pe.edu.isil.santapatricia.dto.ProductoDTO;
import pe.edu.isil.santapatricia.dto.ProductoRequest;

/** Reglas del catálogo de productos (HU02). La implementación está en service/impl/ProductoServiceImpl. */
public interface ProductoService {

    List<ProductoDTO> listar();

    ProductoDTO obtener(int id);

    ProductoDTO crear(ProductoRequest datos);

    ProductoDTO actualizar(int id, ProductoRequest datos);

    void eliminar(int id);

    /** Opciones del desplegable "Área" del formulario. */
    List<OpcionDTO> listarCategorias();

    /** Opciones del desplegable "Unidad" del formulario. */
    List<OpcionDTO> listarUnidades();
}
