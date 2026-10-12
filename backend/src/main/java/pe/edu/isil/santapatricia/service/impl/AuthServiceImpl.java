package pe.edu.isil.santapatricia.service.impl;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import pe.edu.isil.santapatricia.config.Configuracion;
import pe.edu.isil.santapatricia.config.JwtUtil;
import pe.edu.isil.santapatricia.dao.TurnoDAO;
import pe.edu.isil.santapatricia.dao.UsuarioDAO;
import pe.edu.isil.santapatricia.dao.impl.TurnoDAOImpl;
import pe.edu.isil.santapatricia.dao.impl.UsuarioDAOImpl;
import pe.edu.isil.santapatricia.dto.LoginRequest;
import pe.edu.isil.santapatricia.dto.LoginResponse;
import pe.edu.isil.santapatricia.dto.TurnoDTO;
import pe.edu.isil.santapatricia.dto.UsuarioDTO;
import pe.edu.isil.santapatricia.model.Turno;
import pe.edu.isil.santapatricia.model.Usuario;
import pe.edu.isil.santapatricia.service.AuthService;
import pe.edu.isil.santapatricia.service.ServicioException;

/**
 * Lógica del login (HU01):
 *   1. Revisa que se haya escrito correo y contraseña, y que se haya elegido un turno válido.
 *   2. Busca el usuario por correo y revisa que esté activo.
 *   3. Si está bloqueado (5 intentos fallidos), no lo deja entrar hasta que pase el bloqueo.
 *   4. Compara la contraseña. Si falla, suma un intento; al 5.º lo bloquea 15 minutos.
 *   5. Si todo está bien, guarda la fecha de acceso, registra el inicio de turno y crea el token JWT.
 */
public class AuthServiceImpl implements AuthService {

    private static final String CREDENCIALES_INCORRECTAS = "Correo o contraseña incorrectos";

    private final UsuarioDAO usuarioDAO;
    private final TurnoDAO turnoDAO;
    private final int maxIntentos;
    private final int minutosBloqueo;

    /** Constructor que usa el Servlet: trabaja con MySQL. */
    public AuthServiceImpl() {
        this(new UsuarioDAOImpl(), new TurnoDAOImpl(),
             Configuracion.entero("login.max.intentos"),
             Configuracion.entero("login.minutos.bloqueo"));
    }

    /** Constructor para las pruebas: permite pasar DAOs de prueba (sin MySQL). */
    public AuthServiceImpl(UsuarioDAO usuarioDAO, TurnoDAO turnoDAO, int maxIntentos, int minutosBloqueo) {
        this.usuarioDAO = usuarioDAO;
        this.turnoDAO = turnoDAO;
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
        // El turno se revisa ANTES que la contraseña: un turno mal elegido no cuenta como intento fallido
        Turno turno = validarTurno(datos.getTurno());

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
        turnoDAO.registrarInicio(usuario.getId(), turno.getId());
        UsuarioDTO dto = aDTO(usuario, turno);
        return new LoginResponse(JwtUtil.crearToken(dto), dto);
    }

    @Override
    public UsuarioDTO usuarioActual(int idUsuario, String codigoTurno) {
        Usuario usuario = usuarioDAO.buscarPorId(idUsuario);
        if (usuario == null || !usuario.isActivo()) {
            throw new ServicioException(401, "Su sesión ya no es válida");
        }
        Turno turno = codigoTurno == null ? null : turnoDAO.buscarPorCodigo(codigoTurno);
        return aDTO(usuario, turno);
    }

    @Override
    public List<TurnoDTO> listarTurnos() {
        return turnoDAO.listar().stream().map(TurnoDTO::desde).toList();
    }

    private Turno validarTurno(String codigo) {
        if (codigo == null || codigo.isBlank()) {
            throw new ServicioException(400, "Seleccione su turno");
        }
        Turno turno = turnoDAO.buscarPorCodigo(codigo.trim());
        if (turno == null) {
            throw new ServicioException(400, "El turno seleccionado no existe");
        }
        return turno;
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

    private UsuarioDTO aDTO(Usuario u, Turno turno) {
        return new UsuarioDTO(u.getId(), u.getNombre(), u.getCorreo(), u.getRolCodigo(),
                turno == null ? null : TurnoDTO.desde(turno));
    }
}
