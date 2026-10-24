
package pe.edu.isil.santapatricia.service.impl;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import pe.edu.isil.santapatricia.config.ConexionBD;
import pe.edu.isil.santapatricia.dao.DatosException;
import pe.edu.isil.santapatricia.dao.MovimientoInventarioDAO;
import pe.edu.isil.santapatricia.dao.impl.MovimientoInventarioDAOImpl;
import pe.edu.isil.santapatricia.model.MovimientoInventario;
import pe.edu.isil.santapatricia.service.MovimientoInventarioService;

/**
 * Logica de negocio para entradas y salidas de inventario.
 *
 * HU04: Salidas por venta o despacho.
 * HU05: Consumo de materia prima para produccion.
 */
public class MovimientoInventarioServiceImpl
        implements MovimientoInventarioService {

    private final MovimientoInventarioDAO movimientoDAO =
            new MovimientoInventarioDAOImpl();

    // Registrar ingreso de mercaderia.
    @Override
    public void registrarIngreso(int productoId, int usuarioId,
            BigDecimal cantidad, String motivo) {

        registrarMovimiento(productoId, usuarioId, cantidad,
                motivo, "INGRESO", null);
    }

    // HU04: Registrar salida por venta.
    @Override
    public void registrarSalidaVenta(int productoId, int usuarioId,
            BigDecimal cantidad, String motivo) {

        registrarMovimiento(productoId, usuarioId, cantidad,
                motivo, "SALIDA_VENTA", null);
    }

    // HU05: Registrar salida de produccion sin orden asociada.
    @Override
    public void registrarSalidaProduccion(int productoId, int usuarioId,
            BigDecimal cantidad, String motivo) {

        registrarMovimiento(productoId, usuarioId, cantidad,
                motivo, "SALIDA_PRODUCCION", null);
    }

    // HU05: Registrar consumo asociado a una orden de produccion.
    @Override
    public void registrarConsumoOrden(int ordenProduccionId,
            int productoId, int usuarioId,
            BigDecimal cantidad, String motivo) {

        if (ordenProduccionId <= 0) {
            throw new IllegalArgumentException(
                    "La orden de produccion no es valida");
        }

        registrarMovimiento(productoId, usuarioId, cantidad,
                motivo, "SALIDA_PRODUCCION", ordenProduccionId);
    }

    /**
     * Registra un movimiento y actualiza el stock.
     *
     * Si existe ordenProduccionId, tambien vincula el
     * movimiento a esa orden en la misma transaccion.
     */
    private void registrarMovimiento(int productoId, int usuarioId,
            BigDecimal cantidad, String motivo,
            String tipo, Integer ordenProduccionId) {

        validarDatos(productoId, usuarioId, cantidad);

        if (cantidad.stripTrailingZeros().scale() > 2) {
            throw new IllegalArgumentException(
                    "La cantidad admite maximo 2 decimales");
        }

        if (motivo != null && motivo.length() > 255) {
            throw new IllegalArgumentException(
                    "El motivo no puede superar 255 caracteres");
        }

        try (Connection cn = ConexionBD.obtener()) {

            cn.setAutoCommit(false);

            try {

                // Verificar la orden antes de descontar inventario.
                if (ordenProduccionId != null) {
                    validarOrdenProduccion(cn, ordenProduccionId);
                }

                BigDecimal stockAnterior;

                // Bloquear el producto durante la operacion.
                String consulta =
                        "SELECT stock_actual FROM productos "
                        + "WHERE id = ? AND activo = TRUE FOR UPDATE";

                try (PreparedStatement ps =
                        cn.prepareStatement(consulta)) {

                    ps.setInt(1, productoId);

                    try (ResultSet rs = ps.executeQuery()) {

                        if (!rs.next()) {
                            throw new IllegalArgumentException(
                                    "El producto no existe o esta inactivo");
                        }

                        stockAnterior =
                                rs.getBigDecimal("stock_actual");
                    }
                }

                boolean ingreso = "INGRESO".equals(tipo);

                BigDecimal stockPosterior = ingreso
                        ? stockAnterior.add(cantidad)
                        : stockAnterior.subtract(cantidad);

                if (stockPosterior.compareTo(BigDecimal.ZERO) < 0) {
                    throw new IllegalArgumentException(
                            "Stock insuficiente para realizar la salida");
                }

                if (stockPosterior.precision()
                        - stockPosterior.scale() > 8) {
                    throw new IllegalArgumentException(
                            "El stock supera el limite permitido");
                }

                // Actualizar stock del producto.
                String actualizar =
                        "UPDATE productos "
                        + "SET stock_actual = ? WHERE id = ?";

                try (PreparedStatement ps =
                        cn.prepareStatement(actualizar)) {

                    ps.setBigDecimal(1, stockPosterior);
                    ps.setInt(2, productoId);

                    if (ps.executeUpdate() != 1) {
                        throw new SQLException(
                                "No se pudo actualizar el producto");
                    }
                }

                // Registrar movimiento de inventario.
                MovimientoInventario movimiento =
                        new MovimientoInventario();

                movimiento.setProductoId(productoId);
                movimiento.setUsuarioId(usuarioId);
                movimiento.setTipoMovimiento(tipo);
                movimiento.setCantidad(cantidad);
                movimiento.setStockAnterior(stockAnterior);
                movimiento.setStockPosterior(stockPosterior);
                movimiento.setMotivo(motivo);

                int movimientoId =
                        movimientoDAO.insertar(cn, movimiento);

                // HU05: Vincular movimiento con la orden.
                if (ordenProduccionId != null) {
                    vincularMovimientoOrden(
                            cn, ordenProduccionId, movimientoId);
                }

                // Confirmar todas las operaciones juntas.
                cn.commit();

            } catch (Exception e) {

                try {
                    cn.rollback();
                } catch (SQLException rollbackError) {
                    e.addSuppressed(rollbackError);
                }

                if (e instanceof IllegalArgumentException) {
                    throw (IllegalArgumentException) e;
                }

                throw new DatosException(
                        "Error al registrar el movimiento", e);
            }

        } catch (SQLException e) {
            throw new DatosException(
                    "Error de conexion al registrar movimiento", e);
        }
    }

    /**
     * Verifica que la orden exista y este EN_PROCESO.
     * FOR UPDATE evita que se modifique mientras se
     * registra el consumo.
     */
    private void validarOrdenProduccion(
            Connection cn, int ordenProduccionId)
            throws SQLException {

        String sql =
                "SELECT estado FROM ordenes_produccion "
                + "WHERE id = ? FOR UPDATE";

        try (PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setInt(1, ordenProduccionId);

            try (ResultSet rs = ps.executeQuery()) {

                if (!rs.next()) {
                    throw new IllegalArgumentException(
                            "La orden de produccion no existe");
                }

                String estado = rs.getString("estado");

                if (!"EN_PROCESO".equals(estado)) {
                    throw new IllegalArgumentException(
                            "La orden debe estar EN_PROCESO "
                            + "para registrar consumo");
                }
            }
        }
    }

    /**
     * Relaciona la orden con el movimiento generado.
     */
    private void vincularMovimientoOrden(
            Connection cn, int ordenProduccionId,
            int movimientoId) throws SQLException {

        String sql =
                "INSERT INTO ordenes_produccion_movimientos "
                + "(orden_produccion_id, movimiento_inventario_id) "
                + "VALUES (?, ?)";

        try (PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setInt(1, ordenProduccionId);
            ps.setInt(2, movimientoId);

            if (ps.executeUpdate() != 1) {
                throw new SQLException(
                        "No se pudo asociar el movimiento a la orden");
            }
        }
    }

    /**
     * Validaciones generales.
     */
    private void validarDatos(int productoId, int usuarioId,
            BigDecimal cantidad) {

        if (productoId <= 0) {
            throw new IllegalArgumentException(
                    "El producto no es valido");
        }

        if (usuarioId <= 0) {
            throw new IllegalArgumentException(
                    "El usuario no es valido");
        }

        if (cantidad == null
                || cantidad.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "La cantidad debe ser mayor a cero");
        }
    }
}
