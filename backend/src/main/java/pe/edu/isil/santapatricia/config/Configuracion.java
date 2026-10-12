package pe.edu.isil.santapatricia.config;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import java.util.Properties;

/**
 * Lee el archivo src/main/resources/config.properties UNA sola vez
 * y entrega sus valores al resto del sistema.
 * Así ninguna clave ni contraseña queda escrita dentro del código Java.
 */
public final class Configuracion {

    private static final Properties PROPIEDADES = cargar();

    private Configuracion() {
    }

    private static Properties cargar() {
        Properties p = new Properties();
        try (InputStream in = Configuracion.class.getResourceAsStream("/config.properties")) {
            if (in == null) {
                throw new IllegalStateException("No se encontró config.properties");
            }
            p.load(new InputStreamReader(in, StandardCharsets.UTF_8));
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo leer config.properties", e);
        }
        return p;
    }

    public static String texto(String clave) {
        String valor = PROPIEDADES.getProperty(clave);
        if (valor == null) {
            throw new IllegalStateException("Falta la clave '" + clave + "' en config.properties");
        }
        return valor.trim();
    }

    public static int entero(String clave) {
        return Integer.parseInt(texto(clave));
    }

    /** Para valores separados por coma: "a,b,c" -> [a, b, c] */
    public static List<String> lista(String clave) {
        return Arrays.stream(texto(clave).split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();
    }
}
