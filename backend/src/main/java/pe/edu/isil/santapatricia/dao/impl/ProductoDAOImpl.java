package pe.edu.isil.santapatricia.dao.impl;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;
import pe.edu.isil.santapatricia.config.ConexionBD;
import pe.edu.isil.santapatricia.dao.DatosException;
import pe.edu.isil.santapatricia.dao.ProductoDAO;
import pe.edu.isil.santapatricia.model.Producto;

/** Implementación JDBC de ProductoDAO: aquí está el SQL de la tabla productos. */
public class ProductoDAOImpl implements ProductoDAO {

    private static final String SELECT_BASE =
            "SELECT p.id, p.sku, p.nombre, p.categoria_id, c.codigo AS categoria_codigo, p.unidad_medida, "
            + "p.stock_actual, p.stock_minimo, p.precio_unitario, p.fecha_vencimiento, p.activo, p.actualizado_en "
            + "FROM productos p JOIN categorias c ON c.id = p.categoria_id ";

    @Override
    public List<Producto> listarActivos() {
        String sql = SELECT_BASE + "WHERE p.activo = TRUE ORDER BY p.nombre";
        List<Producto> lista = new ArrayList<>();
        try (Connection cn = ConexionBD.obtener();
             PreparedStatement ps = cn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                lista.add(mapear(rs));
            }
            return lista;
        } catch (SQLException e) {
            throw new DatosException("Error al listar productos", e);
        }
    }

    @Override
    public Producto buscarPorId(int id) {
        String sql = SELECT_BASE + "WHERE p.id = ? AND p.activo = TRUE";
        try (Connection cn = ConexionBD.obtener(); PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? mapear(rs) : null;
            }
        } catch (SQLException e) {
            throw new DatosException("Error al buscar producto", e);
        }
    }

    @Override
    public boolean existeSku(String sku) {
        try (Connection cn = ConexionBD.obtener();
             PreparedStatement ps = cn.prepareStatement("SELECT COUNT(*) FROM productos WHERE sku = ?")) {
            ps.setString(1, sku);
            try (ResultSet rs = ps.executeQuery()) {
                rs.next();
                return rs.getInt(1) > 0;
            }
        } catch (SQLException e) {
            throw new DatosException("Error al revisar el SKU", e);
        }
    }

    @Override
    public boolean existeNombre(String nombre, int idExcluido) {
        try (Connection cn = ConexionBD.obtener();
             PreparedStatement ps = cn.prepareStatement("SELECT COUNT(*) FROM productos WHERE nombre = ? AND id <> ?")) {
            ps.setString(1, nombre);
            ps.setInt(2, idExcluido);
            try (ResultSet rs = ps.executeQuery()) {
                rs.next();
                return rs.getInt(1) > 0;
            }
        } catch (SQLException e) {
            throw new DatosException("Error al revisar el nombre", e);
        }
    }

    @Override
    public int ultimoNumeroSku(String prefijo) {
        // De "AZU-007" toma "007" y lo convierte en número; devuelve el mayor (o 0 si no hay ninguno)
        String sql = "SELECT COALESCE(MAX(CAST(SUBSTRING(sku, ?) AS UNSIGNED)), 0) FROM productos WHERE sku LIKE ?";
        try (Connection cn = ConexionBD.obtener(); PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setInt(1, prefijo.length() + 2);   // posición después de "AZU-"
            ps.setString(2, prefijo + "-%");
            try (ResultSet rs = ps.executeQuery()) {
                rs.next();
                return rs.getInt(1);
            }
        } catch (SQLException e) {
            throw new DatosException("Error al calcular el SKU", e);
        }
    }

    @Override
    public int insertar(Producto p) {
        String sql = "INSERT INTO productos (sku, nombre, categoria_id, unidad_medida, stock_actual, stock_minimo, "
                + "precio_unitario, fecha_vencimiento) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection cn = ConexionBD.obtener();
             PreparedStatement ps = cn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            llenarDatos(ps, p);
            ps.executeUpdate();
            try (ResultSet claves = ps.getGeneratedKeys()) {
                claves.next();
                return claves.getInt(1);   // id que MySQL le asignó
            }
        } catch (SQLException e) {
            throw new DatosException("Error al registrar producto", e);
        }
    }

    @Override
    public void actualizar(Producto p) {
        String sql = "UPDATE productos SET sku = ?, nombre = ?, categoria_id = ?, unidad_medida = ?, stock_actual = ?, "
                + "stock_minimo = ?, precio_unitario = ?, fecha_vencimiento = ? WHERE id = ?";
        try (Connection cn = ConexionBD.obtener(); PreparedStatement ps = cn.prepareStatement(sql)) {
            llenarDatos(ps, p);
            ps.setInt(9, p.getId());
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new DatosException("Error al actualizar producto", e);
        }
    }

    @Override
    public void desactivar(int id) {
        try (Connection cn = ConexionBD.obtener();
             PreparedStatement ps = cn.prepareStatement("UPDATE productos SET activo = FALSE WHERE id = ?")) {
            ps.setInt(1, id);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new DatosException("Error al eliminar producto", e);
        }
    }

    // ---------- Ayudantes ----------

    /** Llena los 8 "?" comunes de INSERT y UPDATE, en el mismo orden. */
    private void llenarDatos(PreparedStatement ps, Producto p) throws SQLException {
        ps.setString(1, p.getSku());
        ps.setString(2, p.getNombre());
        ps.setInt(3, p.getCategoriaId());
        ps.setString(4, p.getUnidadMedida());
        ps.setBigDecimal(5, p.getStockActual());
        ps.setBigDecimal(6, p.getStockMinimo());
        ps.setBigDecimal(7, p.getPrecioUnitario());
        if (p.getFechaVencimiento() == null) {
            ps.setNull(8, Types.DATE);
        } else {
            ps.setDate(8, Date.valueOf(p.getFechaVencimiento()));
        }
    }

    /** Convierte la fila actual del ResultSet en un objeto Producto. */
    private Producto mapear(ResultSet rs) throws SQLException {
        Producto p = new Producto();
        p.setId(rs.getInt("id"));
        p.setSku(rs.getString("sku"));
        p.setNombre(rs.getString("nombre"));
        p.setCategoriaId(rs.getInt("categoria_id"));
        p.setCategoriaCodigo(rs.getString("categoria_codigo"));
        p.setUnidadMedida(rs.getString("unidad_medida"));
        p.setStockActual(rs.getBigDecimal("stock_actual"));
        p.setStockMinimo(rs.getBigDecimal("stock_minimo"));
        p.setPrecioUnitario(rs.getBigDecimal("precio_unitario"));
        Date vence = rs.getDate("fecha_vencimiento");
        p.setFechaVencimiento(vence == null ? null : vence.toLocalDate());
        p.setActivo(rs.getBoolean("activo"));
        Timestamp actualizado = rs.getTimestamp("actualizado_en");
        p.setActualizadoEn(actualizado == null ? null : actualizado.toLocalDateTime());
        return p;
    }
}
