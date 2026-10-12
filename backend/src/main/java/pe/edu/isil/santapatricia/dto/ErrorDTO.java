package pe.edu.isil.santapatricia.dto;

import java.util.Map;

/**
 * JSON de error que recibe React:
 *   { "message": "Revise los datos ingresados", "errores": { "nombre": "El nombre es obligatorio" } }
 * "message" es el nombre que lee el frontend (getErrorMessage en src/api/axios.ts).
 * "errores" solo aparece cuando hay errores por campo.
 */
public class ErrorDTO {

    private String message;
    private Map<String, String> errores;

    public ErrorDTO() {
    }

    public ErrorDTO(String message) {
        this.message = message;
    }

    public ErrorDTO(String message, Map<String, String> errores) {
        this.message = message;
        this.errores = errores;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Map<String, String> getErrores() { return errores; }
    public void setErrores(Map<String, String> errores) { this.errores = errores; }
}
