package pe.edu.isil.santapatricia.dto;

/** JSON que envía React al iniciar sesión:  { "correo": "...", "password": "...", "turno": "MANANA" } */
public class LoginRequest {

    private String correo;
    private String password;
    private String turno;   // código del turno que elige quien inicia sesión (MANANA o TARDE)

    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getTurno() { return turno; }
    public void setTurno(String turno) { this.turno = turno; }
}
