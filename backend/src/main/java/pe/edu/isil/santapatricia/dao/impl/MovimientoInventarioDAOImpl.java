
package pe.edu.isil.santapatricia.dao.impl;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import pe.edu.isil.santapatricia.config.ConexionBD;
import pe.edu.isil.santapatricia.dao.DatosException;
import pe.edu.isil.santapatricia.dao.MovimientoInventarioDAO;
import pe.edu.isil.santapatricia.model.MovimientoInventario;

/**
 * Implementacion JDBC de MovimientoInventarioDAO.
 * Aqui se realizan las consultas SQL de movimientos_inventario.
 */
public class MovimientoInventarioDAOImpl
        implements MovimientoInventarioDAO {

    private static final String SELECT_BASE =
            "SELECT id, producto_id, usuario_id, "
            + "tipo_movimiento, cantidad, stock_anterior, "
            + "stock_posterior, motivo, referencia, fecha_movimiento "
            + "FROM movimientos_inventario ";

    @Override
    public List<MovimientoInventario> listar() {

        String sql = SELECT_BASE + "ORDER BY fecha_movimiento DESC, id DESC";

        List<MovimientoInventario> lista = new ArrayList<>();

        try (Connection cn = ConexionBD.obtener();
             PreparedStatement ps = cn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                lista.add(mapear(rs));
            }

            return lista;

        } catch (SQLException e) {
            throw new DatosException("Error al listar movimientos", e);
        }
    }

    @Override
    public MovimientoInventario buscarPorId(int id) {

        String sql = SELECT_BASE + "WHERE id = ?";

        try (Connection cn = ConexionBD.obtener();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setInt(1, id);

            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? mapear(rs) : null;
            }

        } catch (SQLException e) {
            throw new DatosException("Error al buscar movimiento", e);
        }
    }

    @Override
    public List<MovimientoInventario> listarPorProducto(int productoId) {

        String sql = SELECT_BASE
                + "WHERE producto_id = ? "
                + "ORDER BY fecha_movimiento DESC, id DESC";

        List<MovimientoInventario> lista = new ArrayList<>();

        try (Connection cn = ConexionBD.obtener();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setInt(1, productoId);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    lista.add(mapear(rs));
                }
            }

            return lista;

        } catch (SQLException e) {
            throw new DatosException(
                    "Error al listar movimientos del producto", e);
        }
    }

    @Override
    public int insertar(Connection cn, MovimientoInventario m)
            throws SQLException {

        String sql = "INSERT INTO movimientos_inventario "
                + "(producto_id, usuario_id, tipo_movimiento, "
                + "cantidad, stock_anterior, stock_posterior, "
                + "motivo, referencia) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        try (PreparedStatement ps = cn.prepareStatement(
                sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setInt(1, m.getProductoId());
            ps.setInt(2, m.getUsuarioId());
            ps.setString(3, m.getTipoMovimiento());
            ps.setBigDecimal(4, m.getCantidad());
            ps.setBigDecimal(5, m.getStockAnterior());
            ps.setBigDecimal(6, m.getStockPosterior());
            ps.setString(7, m.getMotivo());
            ps.setString(8, m.getReferencia());

            ps.executeUpdate();

            try (ResultSet claves = ps.getGeneratedKeys()) {
                if (claves.next()) {
                    return claves.getInt(1);
                }
                throw new SQLException(
                        "No se genero el ID del movimiento");
            }
        }
    }

    // ---------- Ayudantes ----------

    /**
     * Convierte una fila de MySQL en un objeto MovimientoInventario.
     */
    private MovimientoInventario mapear(ResultSet rs)
            throws SQLException {

        MovimientoInventario m = new MovimientoInventario();

        m.setId(rs.getInt("id"));
        m.setProductoId(rs.getInt("producto_id"));
        m.setUsuarioId(rs.getInt("usuario_id"));
        m.setTipoMovimiento(rs.getString("tipo_movimiento"));
        m.setCantidad(rs.getBigDecimal("cantidad"));
        m.setStockAnterior(rs.getBigDecimal("stock_anterior"));
        m.setStockPosterior(rs.getBigDecimal("stock_posterior"));
        m.setMotivo(rs.getString("motivo"));
        m.setReferencia(rs.getString("referencia"));

        Timestamp fecha = rs.getTimestamp("fecha_movimiento");

        m.setFechaMovimiento(
                fecha == null ? null : fecha.toLocalDateTime());

        return m;
    }
}
