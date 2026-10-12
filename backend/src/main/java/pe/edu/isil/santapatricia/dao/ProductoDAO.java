package pe.edu.isil.santapatricia.dao;

import java.util.List;
import pe.edu.isil.santapatricia.model.Producto;

/** Operaciones con la tabla "productos". La implementación con SQL está en dao/impl/ProductoDAOImpl. */
public interface ProductoDAO {

    /** Productos activos, ordenados por nombre. */
    List<Producto> listarActivos();

    /** Producto ACTIVO con ese id, o null si no existe o fue eliminado. */
    Producto buscarPorId(int id);

    /** ¿Ya existe un producto con este SKU? (incluye eliminados, para no repetir códigos) */
    boolean existeSku(String sku);

    /** ¿Otro producto (distinto de idExcluido) ya usa este nombre? Usar idExcluido = 0 al crear. */
    boolean existeNombre(String nombre, int idExcluido);

    /** Mayor número usado con ese prefijo: para "AZU" con AZU-001 y AZU-004 devuelve 4. Si no hay, 0. */
    int ultimoNumeroSku(String prefijo);

    /** Guarda un producto nuevo y devuelve su id generado. */
    int insertar(Producto producto);

    void actualizar(Producto producto);

    /** Eliminación lógica: activo = false (no se borra la fila). */
    void desactivar(int id);
}
