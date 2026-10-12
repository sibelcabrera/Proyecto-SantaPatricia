package pe.edu.isil.santapatricia.dao.impl;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import pe.edu.isil.santapatricia.config.ConexionBD;
import pe.edu.isil.santapatricia.dao.CategoriaDAO;
import pe.edu.isil.santapatricia.dao.DatosException;
import pe.edu.isil.santapatricia.model.Categoria;

/** Implementación JDBC de CategoriaDAO. */
public class CategoriaDAOImpl implements CategoriaDAO {

    @Override
    public List<Categoria> listar() {
        List<Categoria> lista = new ArrayList<>();
        try (Connection cn = ConexionBD.obtener();
             PreparedStatement ps = cn.prepareStatement("SELECT id, codigo, nombre FROM categorias ORDER BY nombre");
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                lista.add(new Categoria(rs.getInt("id"), rs.getString("codigo"), rs.getString("nombre")));
            }
            return lista;
        } catch (SQLException e) {
            throw new DatosException("Error al listar categorías", e);
        }
    }

    @Override
    public Categoria buscarPorCodigo(String codigo) {
        try (Connection cn = ConexionBD.obtener();
             PreparedStatement ps = cn.prepareStatement("SELECT id, codigo, nombre FROM categorias WHERE codigo = ?")) {
            ps.setString(1, codigo);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? new Categoria(rs.getInt("id"), rs.getString("codigo"), rs.getString("nombre")) : null;
            }
        } catch (SQLException e) {
            throw new DatosException("Error al buscar categoría", e);
        }
    }
}
