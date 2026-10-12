package pe.edu.isil.santapatricia.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import pe.edu.isil.santapatricia.dao.CategoriaDAO;
import pe.edu.isil.santapatricia.dao.ProductoDAO;
import pe.edu.isil.santapatricia.dto.ProductoDTO;
import pe.edu.isil.santapatricia.dto.ProductoRequest;
import pe.edu.isil.santapatricia.model.Categoria;
import pe.edu.isil.santapatricia.model.EstadoStock;
import pe.edu.isil.santapatricia.model.Producto;
import pe.edu.isil.santapatricia.service.impl.ProductoServiceImpl;

/**
 * Pruebas de HU02 (registrar productos) SIN base de datos:
 * se usa un "DAO de mentira" que guarda los productos en una lista.
 */
class ProductoServiceImplTest {

    private ProductoDAOEnMemoria productos;
    private ProductoServiceImpl servicio;

    @BeforeEach
    void preparar() {
        productos = new ProductoDAOEnMemoria();
        servicio = new ProductoServiceImpl(productos, new CategoriaDAOEnMemoria());
    }

    // ---------- Código (SKU) automático ----------

    @Test
    @DisplayName("El prefijo del SKU son las 3 primeras letras del nombre, sin tildes")
    void prefijoDelSku() {
        assertEquals("AZU", ProductoServiceImpl.prefijoSku("Azúcar rubia"));
        assertEquals("HAR", ProductoServiceImpl.prefijoSku("harina de trigo"));
        assertEquals("TEF", ProductoServiceImpl.prefijoSku("Té filtrante"));
        assertEquals("NAN", ProductoServiceImpl.prefijoSku("Ñandú"));
        assertEquals("AJX", ProductoServiceImpl.prefijoSku("Aj"));   // nombre muy corto: se completa con X
    }

    @Test
    @DisplayName("Registrar 'Azúcar rubia' genera AZU-001, y el siguiente azúcar AZU-002")
    void skuCorrelativo() {
        ProductoDTO primero = servicio.crear(datos("Azúcar rubia"));
        ProductoDTO segundo = servicio.crear(datos("Azúcar en polvo"));

        assertEquals("AZU-001", primero.getSku());
        assertEquals("AZU-002", segundo.getSku());
    }

    @Test
    @DisplayName("El SKU sigue la numeración existente (si hay HAR-007, el nuevo es HAR-008)")
    void skuContinuaNumeracion() {
        productos.guardarExistente("HAR-007", "Harina integral");
        assertEquals("HAR-008", servicio.crear(datos("Harina de maíz")).getSku());
    }

    // ---------- Validaciones ----------

    @Test
    @DisplayName("Formulario vacío -> 400 con un mensaje por cada campo")
    void camposVacios() {
        ServicioException error = assertThrows(ServicioException.class, () -> servicio.crear(new ProductoRequest()));

        assertEquals(400, error.getEstadoHttp());
        assertTrue(error.getErrores().containsKey("nombre"));
        assertTrue(error.getErrores().containsKey("categoria"));
        assertTrue(error.getErrores().containsKey("unidadMedida"));
        assertTrue(error.getErrores().containsKey("stockActual"));
        assertTrue(error.getErrores().containsKey("stockMinimo"));
        assertTrue(error.getErrores().containsKey("precioUnitario"));
    }

    @Test
    @DisplayName("Unidad inexistente, stock negativo y fecha mal escrita -> 400")
    void datosInvalidos() {
        ProductoRequest r = datos("Harina");
        r.setUnidadMedida("LIBRA");
        r.setStockActual(new BigDecimal("-5"));
        r.setFechaVencimiento("31/10/2026");

        ServicioException error = assertThrows(ServicioException.class, () -> servicio.crear(r));

        assertEquals("Unidad no válida. Use KG, G, L, ML, UND o PAQ", error.getErrores().get("unidadMedida"));
        assertEquals("El stock actual no puede ser negativo", error.getErrores().get("stockActual"));
        assertTrue(error.getErrores().containsKey("fechaVencimiento"));
    }

    @Test
    @DisplayName("Área inexistente -> 400")
    void areaInexistente() {
        ProductoRequest r = datos("Harina");
        r.setCategoria("LAVANDERIA");
        ServicioException error = assertThrows(ServicioException.class, () -> servicio.crear(r));
        assertEquals("El área seleccionada no existe", error.getErrores().get("categoria"));
    }

    @Test
    @DisplayName("Nombre repetido -> 409")
    void nombreRepetido() {
        servicio.crear(datos("Azúcar rubia"));
        ServicioException error = assertThrows(ServicioException.class, () -> servicio.crear(datos("Azúcar rubia")));
        assertEquals(409, error.getEstadoHttp());
    }

    @Test
    @DisplayName("Código escrito a mano y repetido -> 409")
    void skuManualRepetido() {
        productos.guardarExistente("AZU-001", "Azúcar blanca");
        ProductoRequest r = datos("Azúcar morena");
        r.setSku("azu-001");
        ServicioException error = assertThrows(ServicioException.class, () -> servicio.crear(r));
        assertEquals(409, error.getEstadoHttp());
    }

    @Test
    @DisplayName("Limpia los datos: espacios de más y unidad en minúsculas")
    void normalizaDatos() {
        ProductoRequest r = datos("   Azúcar    rubia  ");
        r.setUnidadMedida("kg");
        ProductoDTO creado = servicio.crear(r);
        assertEquals("Azúcar rubia", creado.getNombre());
        assertEquals("KG", creado.getUnidadMedida());
    }

    // ---------- Eliminar ----------

    @Test
    @DisplayName("Eliminar un producto inexistente -> 404")
    void eliminarInexistente() {
        ServicioException error = assertThrows(ServicioException.class, () -> servicio.eliminar(999));
        assertEquals(404, error.getEstadoHttp());
    }

    // ---------- Estado del stock ----------

    @Test
    @DisplayName("Semáforo del stock: CRÍTICO <= mitad del mínimo, BAJO <= mínimo, si no ÓPTIMO")
    void estadoDelStock() {
        assertEquals(EstadoStock.CRITICO, EstadoStock.calcular(new BigDecimal("5"), new BigDecimal("10")));
        assertEquals(EstadoStock.BAJO, EstadoStock.calcular(new BigDecimal("10"), new BigDecimal("10")));
        assertEquals(EstadoStock.OPTIMO, EstadoStock.calcular(new BigDecimal("11"), new BigDecimal("10")));
    }

    // ==================================================================
    // Ayudantes y DAO "de mentira"
    // ==================================================================

    /** Datos válidos de ejemplo: 10 sacos de 10 kg de azúcar = 100 KG. */
    private static ProductoRequest datos(String nombre) {
        ProductoRequest r = new ProductoRequest();
        r.setNombre(nombre);
        r.setCategoria("PASTELERIA");
        r.setUnidadMedida("KG");
        r.setStockActual(new BigDecimal("100"));
        r.setStockMinimo(new BigDecimal("20"));
        r.setPrecioUnitario(new BigDecimal("3.50"));
        r.setFechaVencimiento("2027-06-30");
        return r;
    }

    static class CategoriaDAOEnMemoria implements CategoriaDAO {
        private final List<Categoria> categorias = List.of(
                new Categoria(1, "COCINA", "Cocina"),
                new Categoria(2, "PANADERIA", "Panadería"),
                new Categoria(3, "PASTELERIA", "Pastelería"));

        @Override
        public List<Categoria> listar() {
            return categorias;
        }

        @Override
        public Categoria buscarPorCodigo(String codigo) {
            return categorias.stream().filter(c -> c.getCodigo().equals(codigo)).findFirst().orElse(null);
        }
    }

    static class ProductoDAOEnMemoria implements ProductoDAO {
        private final List<Producto> lista = new ArrayList<>();

        void guardarExistente(String sku, String nombre) {
            Producto p = new Producto();
            p.setSku(sku);
            p.setNombre(nombre);
            p.setStockActual(BigDecimal.ONE);
            p.setStockMinimo(BigDecimal.ONE);
            p.setPrecioUnitario(BigDecimal.ONE);
            p.setActivo(true);
            insertar(p);
        }

        @Override
        public List<Producto> listarActivos() {
            return lista.stream().filter(Producto::isActivo).toList();
        }

        @Override
        public Producto buscarPorId(int id) {
            return lista.stream().filter(p -> p.getId() == id && p.isActivo()).findFirst().orElse(null);
        }

        @Override
        public boolean existeSku(String sku) {
            return lista.stream().anyMatch(p -> p.getSku().equalsIgnoreCase(sku));
        }

        @Override
        public boolean existeNombre(String nombre, int idExcluido) {
            return lista.stream().anyMatch(p -> p.getNombre().equalsIgnoreCase(nombre) && p.getId() != idExcluido);
        }

        @Override
        public int ultimoNumeroSku(String prefijo) {
            return lista.stream()
                    .map(Producto::getSku)
                    .filter(s -> s.startsWith(prefijo + "-"))
                    .mapToInt(s -> Integer.parseInt(s.substring(prefijo.length() + 1)))
                    .max().orElse(0);
        }

        @Override
        public int insertar(Producto producto) {
            producto.setId(lista.size() + 1);
            producto.setActivo(true);
            lista.add(producto);
            return producto.getId();
        }

        @Override
        public void actualizar(Producto producto) {
            lista.replaceAll(p -> p.getId() == producto.getId() ? producto : p);
        }

        @Override
        public void desactivar(int id) {
            lista.stream().filter(p -> p.getId() == id).forEach(p -> p.setActivo(false));
        }
    }
}
