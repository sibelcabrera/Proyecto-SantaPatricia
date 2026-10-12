package pe.edu.isil.santapatricia.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import pe.edu.isil.santapatricia.dao.UsuarioDAO;
import pe.edu.isil.santapatricia.dto.LoginRequest;
import pe.edu.isil.santapatricia.dto.LoginResponse;
import pe.edu.isil.santapatricia.model.Usuario;
import pe.edu.isil.santapatricia.service.impl.AuthServiceImpl;

/** Pruebas de HU01 (login por roles) SIN base de datos, con un "DAO de mentira". */
class AuthServiceImplTest {

    private UsuarioDAOEnMemoria usuarios;
    private AuthServiceImpl servicio;

    @BeforeEach
    void preparar() {
        usuarios = new UsuarioDAOEnMemoria();
        usuarios.agregar(1, "Valeria Ramos", "admin@santapatricia.pe", "Admin123", "ADMINISTRADOR", true);
        usuarios.agregar(2, "Lucía Torres", "caja@santapatricia.pe", "Caja123", "CAJERO", true);
        usuarios.agregar(3, "Pedro Salas", "pedro.salas@santapatricia.pe", "Pedro123", "ALMACENERO", false);
        servicio = new AuthServiceImpl(usuarios, 5, 15);
    }

    @Test
    @DisplayName("Login correcto: devuelve token y el rol del usuario")
    void loginCorrecto() {
        LoginResponse r = servicio.login(login("caja@santapatricia.pe", "Caja123"));
        assertNotNull(r.getToken());
        assertEquals("CAJERO", r.getUsuario().getRol());
        assertEquals("Lucía Torres", r.getUsuario().getNombre());
    }

    @Test
    @DisplayName("Contraseña incorrecta y correo inexistente dan el MISMO mensaje (401)")
    void credencialesIncorrectas() {
        ServicioException a = assertThrows(ServicioException.class,
                () -> servicio.login(login("admin@santapatricia.pe", "otra")));
        ServicioException b = assertThrows(ServicioException.class,
                () -> servicio.login(login("nadie@santapatricia.pe", "Admin123")));
        assertEquals(401, a.getEstadoHttp());
        assertEquals(a.getMessage(), b.getMessage());
    }

    @Test
    @DisplayName("La contraseña distingue mayúsculas: 'admin123' no es 'Admin123'")
    void distingueMayusculas() {
        assertThrows(ServicioException.class, () -> servicio.login(login("admin@santapatricia.pe", "admin123")));
    }

    @Test
    @DisplayName("Usuario dado de baja no puede entrar")
    void usuarioInactivo() {
        ServicioException e = assertThrows(ServicioException.class,
                () -> servicio.login(login("pedro.salas@santapatricia.pe", "Pedro123")));
        assertEquals(401, e.getEstadoHttp());
    }

    @Test
    @DisplayName("Campos vacíos -> 400")
    void camposVacios() {
        ServicioException e = assertThrows(ServicioException.class, () -> servicio.login(login("", "")));
        assertEquals(400, e.getEstadoHttp());
    }

    @Test
    @DisplayName("5 contraseñas incorrectas bloquean la cuenta 15 minutos, aunque luego pongan la correcta")
    void bloqueoTrasCincoIntentos() {
        for (int i = 0; i < 5; i++) {
            assertThrows(ServicioException.class, () -> servicio.login(login("admin@santapatricia.pe", "mala")));
        }
        Usuario admin = usuarios.buscarPorId(1);
        assertTrue(admin.estaBloqueado());

        ServicioException e = assertThrows(ServicioException.class,
                () -> servicio.login(login("admin@santapatricia.pe", "Admin123")));
        assertTrue(e.getMessage().startsWith("Cuenta bloqueada"));
    }

    @Test
    @DisplayName("Un login correcto reinicia el contador de intentos")
    void loginCorrectoReiniciaIntentos() {
        assertThrows(ServicioException.class, () -> servicio.login(login("admin@santapatricia.pe", "mala")));
        servicio.login(login("admin@santapatricia.pe", "Admin123"));
        assertEquals(0, usuarios.buscarPorId(1).getIntentosFallidos());
        assertFalse(usuarios.buscarPorId(1).estaBloqueado());
    }

    // ---------- Ayudantes ----------

    private static LoginRequest login(String correo, String password) {
        LoginRequest r = new LoginRequest();
        r.setCorreo(correo);
        r.setPassword(password);
        return r;
    }

    static class UsuarioDAOEnMemoria implements UsuarioDAO {
        private final Map<Integer, Usuario> porId = new HashMap<>();

        void agregar(int id, String nombre, String correo, String password, String rol, boolean activo) {
            Usuario u = new Usuario();
            u.setId(id);
            u.setNombre(nombre);
            u.setCorreo(correo);
            u.setPassword(password);
            u.setRolCodigo(rol);
            u.setActivo(activo);
            porId.put(id, u);
        }

        @Override
        public Usuario buscarPorCorreo(String correo) {
            return porId.values().stream().filter(u -> u.getCorreo().equalsIgnoreCase(correo)).findFirst().orElse(null);
        }

        @Override
        public Usuario buscarPorId(int id) {
            return porId.get(id);
        }

        @Override
        public void registrarIntentoFallido(int id, int intentos, LocalDateTime bloqueadoHasta) {
            porId.get(id).setIntentosFallidos(intentos);
            porId.get(id).setBloqueadoHasta(bloqueadoHasta);
        }

        @Override
        public void registrarAccesoExitoso(int id) {
            porId.get(id).setIntentosFallidos(0);
            porId.get(id).setBloqueadoHasta(null);
        }
    }
}
