package pe.edu.isil.santapatricia.dto;

/** JSON que recibe React tras un login correcto:  { "token": "...", "usuario": { ... } } */
public class LoginResponse {

    private String token;
    private UsuarioDTO usuario;

    public LoginResponse() {
    }

    public LoginResponse(String token, UsuarioDTO usuario) {
        this.token = token;
        this.usuario = usuario;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public UsuarioDTO getUsuario() { return usuario; }
    public void setUsuario(UsuarioDTO usuario) { this.usuario = usuario; }
}
