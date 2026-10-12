package pe.edu.isil.santapatricia.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import pe.edu.isil.santapatricia.dto.UsuarioDTO;

/**
 * Crea y revisa los tokens JWT (HU01).
 *
 * ¿Qué es un JWT? Un texto que el backend entrega al hacer login y que dice:
 * "este es el usuario X, con rol Y, válido hasta tal hora". Va FIRMADO con la
 * clave secreta de config.properties: si alguien lo modifica (por ejemplo para
 * cambiarse el rol), la firma deja de coincidir y el backend lo rechaza.
 * React lo guarda y lo envía en cada petición:  Authorization: Bearer <token>
 */
public final class JwtUtil {

    private static final SecretKey CLAVE =
            Keys.hmacShaKeyFor(Configuracion.texto("jwt.clave").getBytes(StandardCharsets.UTF_8));
    private static final Duration DURACION = Duration.ofHours(Configuracion.entero("jwt.horas"));

    private JwtUtil() {
    }

    /** Se llama después de un login correcto. */
    public static String crearToken(UsuarioDTO usuario) {
        Instant ahora = Instant.now();
        return Jwts.builder()
                .subject(usuario.getCorreo())                   // quién es
                .claim("id", usuario.getId())
                .claim("rol", usuario.getRol())                 // qué rol tiene
                .claim("turno", usuario.getTurno() == null ? null : usuario.getTurno().getCodigo())  // en qué turno entró
                .issuedAt(Date.from(ahora))                     // cuándo se creó
                .expiration(Date.from(ahora.plus(DURACION)))    // hasta cuándo vale
                .signWith(CLAVE)
                .compact();
    }

    /**
     * Revisa la firma y el vencimiento.
     * @throws JwtException si el token es falso, fue modificado o ya venció
     */
    public static Claims leerToken(String token) {
        return Jwts.parser().verifyWith(CLAVE).build().parseSignedClaims(token).getPayload();
    }
}
