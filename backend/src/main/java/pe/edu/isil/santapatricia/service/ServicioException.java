package pe.edu.isil.santapatricia.service;

import java.util.Map;

/**
 * Error de negocio con su código HTTP. El Servlet lo convierte en la respuesta para React.
 *   400 = datos inválidos   401 = no autenticado   403 = sin permiso
 *   404 = no existe         409 = dato repetido
 */
public class ServicioException extends RuntimeException {

    private final int estadoHttp;
    private final Map<String, String> errores;   // errores por campo (solo en 400 de validación)

    public ServicioException(int estadoHttp, String mensaje) {
        this(estadoHttp, mensaje, null);
    }

    public ServicioException(int estadoHttp, String mensaje, Map<String, String> errores) {
        super(mensaje);
        this.estadoHttp = estadoHttp;
        this.errores = errores;
    }

    public int getEstadoHttp() {
        return estadoHttp;
    }

    public Map<String, String> getErrores() {
        return errores;
    }
}
