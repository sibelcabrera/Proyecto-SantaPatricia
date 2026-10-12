package pe.edu.isil.santapatricia.service.impl;

import java.time.Duration;
import java.time.LocalDateTime;
import pe.edu.isil.santapatricia.config.Configuracion;
import pe.edu.isil.santapatricia.config.JwtUtil;
import pe.edu.isil.santapatricia.dao.UsuarioDAO;
import pe.edu.isil.santapatricia.dao.impl.UsuarioDAOImpl;
import pe.edu.isil.santapatricia.dto.LoginRequest;
import pe.edu.isil.santapatricia.dto.LoginResponse;
import pe.edu.isil.santapatricia.dto.UsuarioDTO;
import pe.edu.isil.santapatricia.model.Usuario;
import pe.edu.isil.santapatricia.service.AuthService;
import pe.edu.isil.santapatricia.service.ServicioException;

/**
 * Lógica del login (HU01):
 *   1. Revisa que se haya escrito correo y contraseña.
 *   2. Busca el usuario por correo y revisa que esté activo.
 *   3. Si está bloqueado (5 intentos fallidos), no lo deja entrar hasta que pase el bloqueo.
 *   4. Compara la contraseña. Si falla, suma un intento; al 5.º lo bloquea 15 minutos.
 *   5. Si todo está bien, guarda la fecha de acceso y crea el token JWT.
 */
public class AuthServiceImpl implements AuthService {

    private static final String CREDENCIALES_INCORRECTAS = "Correo o contraseña incorrectos";

    private final UsuarioDAO usuarioDAO;
    private final int maxIntentos;
    private final int minutosBloqueo;

    /** Constructor que usa el Servlet: trabaja con MySQL. */
    public AuthServiceImpl() {
        this(new UsuarioDAOImpl(),
             Configuracion.entero("login.max.intentos"),
             Configuracion.entero("login.minutos.bloqueo"));
    }

    /** Constructor para las pruebas: permite pasar un DAO de prueba (sin MySQL). */
    public AuthServiceImpl(UsuarioDAO usuarioDAO, int maxIntentos, int minutosBloqueo) {
        this.usuarioDAO = usuarioDAO;
        this.maxIntentos = maxIntentos;
        this.minutosBloqueo = minutosBloqueo;
    }

    @Override
    public LoginResponse login(LoginRequest datos) {
        String correo = datos.getCorreo() == null ? "" : datos.getCorreo().trim();
        String password = datos.getPassword() == null ? "" : datos.getPassword();
        if (correo.isEmpty() || password.isEmpty()) {
            throw new ServicioException(400, "Ingrese su correo y su contraseña");
        }

        Usuario usuario = usuarioDAO.buscarPorCorreo(correo);
        // Mismo mensaje si el correo no existe o el usuario está dado de baja: no damos pistas a un intruso
        if (usuario == null || !usuario.isActivo()) {
            throw new ServicioException(401, CREDENCIALES_INCORRECTAS);
        }

        if (usuario.estaBloqueado()) {
            long minutos = Math.max(1, Duration.between(LocalDateTime.now(), usuario.getBloqueadoHasta()).toMinutes() + 1);
            throw new ServicioException(401,
                    "Cuenta bloqueada por varios intentos fallidos. Intente de nuevo en " + minutos + " minuto(s).");
        }

        // Comparación directa: la contraseña se guarda visible (decisión del equipo)
        if (!password.equals(usuario.getPassword())) {
            registrarFallo(usuario);
            throw new ServicioException(401, CREDENCIALES_INCORRECTAS);
        }

        usuarioDAO.registrarAccesoExitoso(usuario.getId());
        UsuarioDTO dto = aDTO(usuario);
        return new LoginResponse(JwtUtil.crearToken(dto), dto);
    }

    @Override
    public UsuarioDTO usuarioActual(int idUsuario) {
        Usuario usuario = usuarioDAO.buscarPorId(idUsuario);
        if (usuario == null || !usuario.isActivo()) {
            throw new ServicioException(401, "Su sesión ya no es válida");
        }
        return aDTO(usuario);
    }

    /** Suma un intento fallido; al llegar al máximo bloquea la cuenta unos minutos y reinicia el contador. */
    private void registrarFallo(Usuario usuario) {
        int intentos = usuario.getIntentosFallidos() + 1;
        LocalDateTime bloqueadoHasta = null;
        if (intentos >= maxIntentos) {
            bloqueadoHasta = LocalDateTime.now().plusMinutes(minutosBloqueo);
            intentos = 0;
        }
        usuarioDAO.registrarIntentoFallido(usuario.getId(), intentos, bloqueadoHasta);
    }

    private UsuarioDTO aDTO(Usuario u) {
        return new UsuarioDTO(u.getId(), u.getNombre(), u.getCorreo(), u.getRolCodigo());
    }
}
