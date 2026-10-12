package pe.edu.isil.santapatricia.dao.impl;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import pe.edu.isil.santapatricia.config.ConexionBD;
import pe.edu.isil.santapatricia.dao.DatosException;
import pe.edu.isil.santapatricia.dao.UsuarioDAO;
import pe.edu.isil.santapatricia.model.Usuario;

/**
 * Implementación JDBC de UsuarioDAO: aquí está el SQL de la tabla usuarios.
 * Se usa PreparedStatement con "?" para evitar inyección SQL.
 */
public class UsuarioDAOImpl implements UsuarioDAO {

    private static final String SELECT_BASE =
            "SELECT u.id, u.nombre, u.correo, u.password, u.activo, u.intentos_fallidos, u.bloqueado_hasta, "
            + "r.codigo AS rol_codigo, r.nombre AS rol_nombre "
            + "FROM usuarios u JOIN roles r ON r.id = u.rol_id ";

    @Override
    public Usuario buscarPorCorreo(String correo) {
        return buscarUno(SELECT_BASE + "WHERE u.correo = ?", correo);
    }

    @Override
    public Usuario buscarPorId(int id) {
        return buscarUno(SELECT_BASE + "WHERE u.id = ?", id);
    }

    @Override
    public void registrarIntentoFallido(int id, int intentos, LocalDateTime bloqueadoHasta) {
        String sql = "UPDATE usuarios SET intentos_fallidos = ?, bloqueado_hasta = ? WHERE id = ?";
        try (Connection cn = ConexionBD.obtener(); PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setInt(1, intentos);
            ps.setTimestamp(2, bloqueadoHasta == null ? null : Timestamp.valueOf(bloqueadoHasta));
            ps.setInt(3, id);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new DatosException("Error al registrar intento fallido", e);
        }
    }

    @Override
    public void registrarAccesoExitoso(int id) {
        String sql = "UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL, ultimo_acceso = NOW() WHERE id = ?";
        try (Connection cn = ConexionBD.obtener(); PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setInt(1, id);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new DatosException("Error al registrar el acceso", e);
        }
    }

    // ---------- Ayudantes ----------

    private Usuario buscarUno(String sql, Object parametro) {
        try (Connection cn = ConexionBD.obtener(); PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setObject(1, parametro);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? mapear(rs) : null;
            }
        } catch (SQLException e) {
            throw new DatosException("Error al buscar usuario", e);
        }
    }

    /** Convierte la fila actual del ResultSet en un objeto Usuario. */
    private Usuario mapear(ResultSet rs) throws SQLException {
        Usuario u = new Usuario();
        u.setId(rs.getInt("id"));
        u.setNombre(rs.getString("nombre"));
        u.setCorreo(rs.getString("correo"));
        u.setPassword(rs.getString("password"));
        u.setActivo(rs.getBoolean("activo"));
        u.setIntentosFallidos(rs.getInt("intentos_fallidos"));
        Timestamp bloqueo = rs.getTimestamp("bloqueado_hasta");
        u.setBloqueadoHasta(bloqueo == null ? null : bloqueo.toLocalDateTime());
        u.setRolCodigo(rs.getString("rol_codigo"));
        u.setRolNombre(rs.getString("rol_nombre"));
        return u;
    }
}
