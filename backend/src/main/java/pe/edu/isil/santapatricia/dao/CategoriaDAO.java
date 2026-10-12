package pe.edu.isil.santapatricia.dao;

import java.util.List;
import pe.edu.isil.santapatricia.model.Categoria;

/** Operaciones con la tabla "categorias". */
public interface CategoriaDAO {

    List<Categoria> listar();

    /** Categoría con ese código (ej. "PANADERIA"), o null si no existe. */
    Categoria buscarPorCodigo(String codigo);
}
