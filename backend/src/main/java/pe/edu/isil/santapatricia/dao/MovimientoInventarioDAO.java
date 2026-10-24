package pe.edu.isil.santapatricia.dao;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
import pe.edu.isil.santapatricia.model.MovimientoInventario;

/**
 * Operaciones con la tabla movimientos_inventario.
 * La implementacion SQL estara en MovimientoInventarioDAOImpl.
 */
public interface MovimientoInventarioDAO {

    /** Lista todos los movimientos, del mas reciente al mas antiguo. */
    List<MovimientoInventario> listar();

    /** Busca un movimiento por su identificador. */
    MovimientoInventario buscarPorId(int id);

    /** Lista los movimientos realizados sobre un producto. */
    List<MovimientoInventario> listarPorProducto(int productoId);

    /**
     * Inserta un movimiento usando una conexion existente.
     * No confirma ni revierte la transaccion.
     * Devuelve el ID generado.
     */
    int insertar(Connection conexion, MovimientoInventario movimiento)
            throws SQLException;
}
