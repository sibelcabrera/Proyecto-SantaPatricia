package pe.edu.isil.santapatricia.dao;

import java.util.List;
import pe.edu.isil.santapatricia.model.Turno;

/** Operaciones con las tablas "turnos" e "inicios_turno". */
public interface TurnoDAO {

    /** Turnos del local, ordenados por hora de inicio. */
    List<Turno> listar();

    /** Turno con ese código (ej. "MANANA"), o null si no existe. */
    Turno buscarPorCodigo(String codigo);

    /** Guarda que el usuario inició sesión en ese turno (tabla inicios_turno). */
    void registrarInicio(int usuarioId, int turnoId);
}
