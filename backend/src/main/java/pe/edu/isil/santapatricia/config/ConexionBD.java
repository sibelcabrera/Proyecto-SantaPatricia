package pe.edu.isil.santapatricia.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Abre conexiones JDBC a MySQL con los datos de config.properties.
 * Los DAO la usan así:
 *   try (Connection cn = ConexionBD.obtener()) { ... }   // se cierra sola al terminar
 */
public final class ConexionBD {

    static {
        try {
            // Registra el driver de MySQL (necesario dentro de un servidor como GlassFish)
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            throw new IllegalStateException("No se encontró el driver de MySQL", e);
        }
    }

    private ConexionBD() {
    }

    public static Connection obtener() throws SQLException {
        return DriverManager.getConnection(
                Configuracion.texto("db.url"),
                Configuracion.texto("db.usuario"),
                Configuracion.texto("db.password"));
    }
}
