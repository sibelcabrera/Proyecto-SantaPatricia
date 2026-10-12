package pe.edu.isil.santapatricia.dao;

/**
 * Error al hablar con MySQL (base apagada, contraseña incorrecta, SQL inválido...).
 * Los DAO convierten la SQLException en esta excepción para no obligar a todas
 * las capas a escribir "throws SQLException". El Servlet la convierte en un error 500.
 */
public class DatosException extends RuntimeException {

    public DatosException(String mensaje, Throwable causa) {
        super(mensaje, causa);
    }
}
