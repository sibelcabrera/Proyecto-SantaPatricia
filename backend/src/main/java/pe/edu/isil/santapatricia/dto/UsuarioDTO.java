package pe.edu.isil.santapatricia.dto;

/**
 * Datos del usuario que se envían a React (nunca la contraseña).
 * Coincide con UsuarioDTO de src/types/auth.ts del frontend.
 */
public class UsuarioDTO {

    private int id;
    private String nombre;
    private String correo;
    private String rol;   // ADMINISTRADOR, ENCARGADO_PRODUCCION, CAJERO o ALMACENERO

    public UsuarioDTO() {
    }

    public UsuarioDTO(int id, String nombre, String correo, String rol) {
        this.id = id;
        this.nombre = nombre;
        this.correo = correo;
        this.rol = rol;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }
    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
}
