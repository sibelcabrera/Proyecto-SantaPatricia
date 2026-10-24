
package pe.edu.isil.santapatricia.dao.impl;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import pe.edu.isil.santapatricia.config.ConexionBD;
import pe.edu.isil.santapatricia.dao.DatosException;
import pe.edu.isil.santapatricia.dao.OrdenProduccionDAO;
import pe.edu.isil.santapatricia.dto.OrdenProduccionDTO;

public class OrdenProduccionDAOImpl implements OrdenProduccionDAO {

    // Consultar IDs de ordenes pendientes o en proceso.
    @Override
    public List<Integer> listarIdsDisponibles() {

        List<Integer> ordenes = new ArrayList<>();

        String sql = "SELECT id FROM ordenes_produccion "
                + "WHERE estado IN ('PENDIENTE', 'EN_PROCESO') "
                + "ORDER BY id DESC";

        try (Connection cn = ConexionBD.obtener();
             PreparedStatement ps = cn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                ordenes.add(rs.getInt("id"));
            }

            return ordenes;

        } catch (SQLException e) {
            throw new DatosException(
                    "Error al consultar las ordenes de produccion", e);
        }
    }

    // Verificar si una orden existe y esta disponible.
    @Override
    public boolean existeOrdenDisponible(int ordenId) {

        String sql = "SELECT id FROM ordenes_produccion "
                + "WHERE id = ? "
                + "AND estado IN ('PENDIENTE', 'EN_PROCESO')";

        try (Connection cn = ConexionBD.obtener();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setInt(1, ordenId);

            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }

        } catch (SQLException e) {
            throw new DatosException(
                    "Error al verificar la orden de produccion", e);
        }
    }

    // HU05: Listar ordenes EN_PROCESO con sus datos.
    @Override
    public List<OrdenProduccionDTO> listarEnProceso() {

        List<OrdenProduccionDTO> ordenes = new ArrayList<>();

        String sql = "SELECT id, codigo, producto_id, "
                + "cantidad_planificada, estado "
                + "FROM ordenes_produccion "
                + "WHERE estado = 'EN_PROCESO' "
                + "ORDER BY id DESC";

        try (Connection cn = ConexionBD.obtener();
             PreparedStatement ps = cn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {

                OrdenProduccionDTO orden =
                        new OrdenProduccionDTO();

                orden.setId(rs.getInt("id"));

                orden.setCodigo(
                        rs.getString("codigo")
                );

                orden.setProductoId(
                        rs.getInt("producto_id")
                );

                orden.setCantidadPlanificada(
                        rs.getBigDecimal("cantidad_planificada")
                );

                orden.setEstado(
                        rs.getString("estado")
                );

                ordenes.add(orden);
            }

            return ordenes;

        } catch (SQLException e) {
            throw new DatosException(
                    "Error al consultar ordenes en proceso", e);
        }
    }
}
