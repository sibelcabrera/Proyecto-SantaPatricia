package pe.edu.isil.santapatricia.dao;

import java.time.LocalDateTime;
import pe.edu.isil.santapatricia.model.Usuario;

/** Operaciones con la tabla "usuarios". La implementación con SQL está en dao/impl/UsuarioDAOImpl. */
public interface UsuarioDAO {

    /** Devuelve el usuario con ese correo, o null si no existe. */
    Usuario buscarPorCorreo(String correo);

    /** Devuelve el usuario con ese id, o null si no existe. */
    Usuario buscarPorId(int id);

    /** Guarda cuántos intentos fallidos lleva y, si corresponde, hasta cuándo queda bloqueado. */
    void registrarIntentoFallido(int id, int intentos, LocalDateTime bloqueadoHasta);

    /** Login correcto: reinicia intentos, quita el bloqueo y guarda la fecha de acceso. */
    void registrarAccesoExitoso(int id);
}
