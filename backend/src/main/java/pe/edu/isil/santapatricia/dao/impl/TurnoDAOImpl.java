package pe.edu.isil.santapatricia.dao.impl;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import pe.edu.isil.santapatricia.config.ConexionBD;
import pe.edu.isil.santapatricia.dao.DatosException;
import pe.edu.isil.santapatricia.dao.TurnoDAO;
import pe.edu.isil.santapatricia.model.Turno;

/** Implementación JDBC de TurnoDAO: aquí está el SQL de turnos e inicios_turno. */
public class TurnoDAOImpl implements TurnoDAO {

    private static final String SELECT_BASE = "SELECT id, codigo, nombre, hora_inicio, hora_fin FROM turnos ";

    @Override
    public List<Turno> listar() {
        List<Turno> turnos = new ArrayList<>();
        try (Connection cn = ConexionBD.obtener();
             PreparedStatement ps = cn.prepareStatement(SELECT_BASE + "ORDER BY hora_inicio");
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                turnos.add(mapear(rs));
            }
            return turnos;
        } catch (SQLException e) {
            throw new DatosException("Error al listar turnos", e);
        }
    }

    @Override
    public Turno buscarPorCodigo(String codigo) {
        try (Connection cn = ConexionBD.obtener();
             PreparedStatement ps = cn.prepareStatement(SELECT_BASE + "WHERE codigo = ?")) {
            ps.setString(1, codigo);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? mapear(rs) : null;
            }
        } catch (SQLException e) {
            throw new DatosException("Error al buscar turno", e);
        }
    }

    @Override
    public void registrarInicio(int usuarioId, int turnoId) {
        String sql = "INSERT INTO inicios_turno (usuario_id, turno_id) VALUES (?, ?)";
        try (Connection cn = ConexionBD.obtener(); PreparedStatement ps = cn.prepareStatement(sql)) {
            ps.setInt(1, usuarioId);
            ps.setInt(2, turnoId);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new DatosException("Error al registrar el inicio de turno", e);
        }
    }

    private Turno mapear(ResultSet rs) throws SQLException {
        return new Turno(rs.getInt("id"), rs.getString("codigo"), rs.getString("nombre"),
                rs.getTime("hora_inicio").toLocalTime(), rs.getTime("hora_fin").toLocalTime());
    }
}
