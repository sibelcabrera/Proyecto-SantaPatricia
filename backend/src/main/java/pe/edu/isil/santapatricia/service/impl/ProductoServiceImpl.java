package pe.edu.isil.santapatricia.service.impl;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import pe.edu.isil.santapatricia.dao.CategoriaDAO;
import pe.edu.isil.santapatricia.dao.ProductoDAO;
import pe.edu.isil.santapatricia.dao.impl.CategoriaDAOImpl;
import pe.edu.isil.santapatricia.dao.impl.ProductoDAOImpl;
import pe.edu.isil.santapatricia.dto.OpcionDTO;
import pe.edu.isil.santapatricia.dto.ProductoDTO;
import pe.edu.isil.santapatricia.dto.ProductoRequest;
import pe.edu.isil.santapatricia.model.Categoria;
import pe.edu.isil.santapatricia.model.Producto;
import pe.edu.isil.santapatricia.model.UnidadMedida;
import pe.edu.isil.santapatricia.service.ProductoService;
import pe.edu.isil.santapatricia.service.ServicioException;

/**
 * Reglas del catálogo de productos (HU02):
 *   - Todos los datos obligatorios deben venir y ser válidos          -> si no, 400
 *   - El nombre no puede repetirse (sin importar mayúsculas)         -> si no, 409
 *   - El SKU se genera solo: 3 primeras letras del nombre + número   (Azúcar rubia -> AZU-002)
 *   - Eliminar = desactivar (el producto se conserva en la base)
 */
public class ProductoServiceImpl implements ProductoService {

    private static final BigDecimal MAXIMO = new BigDecimal("99999999.99");

    private final ProductoDAO productoDAO;
    private final CategoriaDAO categoriaDAO;

    /** Constructor que usa el Servlet: trabaja con MySQL. */
    public ProductoServiceImpl() {
        this(new ProductoDAOImpl(), new CategoriaDAOImpl());
    }

    /** Constructor para las pruebas: permite pasar DAO de prueba (sin MySQL). */
    public ProductoServiceImpl(ProductoDAO productoDAO, CategoriaDAO categoriaDAO) {
        this.productoDAO = productoDAO;
        this.categoriaDAO = categoriaDAO;
    }

    @Override
    public List<ProductoDTO> listar() {
        return productoDAO.listarActivos().stream().map(ProductoDTO::desde).toList();
    }

    @Override
    public ProductoDTO obtener(int id) {
        return ProductoDTO.desde(buscar(id));
    }

    @Override
    public ProductoDTO crear(ProductoRequest datos) {
        Producto producto = validarYConvertir(datos);

        if (productoDAO.existeNombre(producto.getNombre(), 0)) {
            throw new ServicioException(409, "Ya existe un producto llamado \"" + producto.getNombre() + "\"");
        }
        if (producto.getSku() == null) {
            producto.setSku(generarSku(producto.getNombre()));      // automático
        } else if (productoDAO.existeSku(producto.getSku())) {
            throw new ServicioException(409, "Ya existe un producto con el código " + producto.getSku());
        }

        int id = productoDAO.insertar(producto);
        return obtener(id);
    }

    @Override
    public ProductoDTO actualizar(int id, ProductoRequest datos) {
        Producto actual = buscar(id);
        Producto producto = validarYConvertir(datos);
        producto.setId(id);

        if (productoDAO.existeNombre(producto.getNombre(), id)) {
            throw new ServicioException(409, "Ya existe otro producto llamado \"" + producto.getNombre() + "\"");
        }
        if (producto.getSku() == null) {
            producto.setSku(actual.getSku());                         // se conserva el código
        } else if (!producto.getSku().equals(actual.getSku()) && productoDAO.existeSku(producto.getSku())) {
            throw new ServicioException(409, "Ya existe un producto con el código " + producto.getSku());
        }

        productoDAO.actualizar(producto);
        return obtener(id);
    }

    @Override
    public void eliminar(int id) {
        buscar(id);   // si no existe -> 404
        productoDAO.desactivar(id);
    }

    @Override
    public List<OpcionDTO> listarCategorias() {
        return categoriaDAO.listar().stream().map(c -> new OpcionDTO(c.getCodigo(), c.getNombre())).toList();
    }

    @Override
    public List<OpcionDTO> listarUnidades() {
        return Arrays.stream(UnidadMedida.values()).map(u -> new OpcionDTO(u.name(), u.getNombre())).toList();
    }

    // ------------------------------------------------------------------
    // GENERACIÓN AUTOMÁTICA DEL SKU
    // ------------------------------------------------------------------

    /**
     * "Azúcar rubia" -> prefijo "AZU" -> busca el mayor AZU-xxx usado -> AZU-00(n+1).
     * Es público y estático para poder probarlo y explicarlo fácilmente.
     */
    public static String prefijoSku(String nombre) {
        // 1. Quita tildes: "Azúcar" -> "Azucar"   ("Ñ" -> "N")
        String sinTildes = Normalizer.normalize(nombre, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        // 2. Deja solo letras y pasa a mayúsculas: "Azucar rubia" -> "AZUCARRUBIA"
        String letras = sinTildes.replaceAll("[^A-Za-z]", "").toUpperCase(Locale.ROOT);
        // 3. Toma las 3 primeras (si el nombre es muy corto completa con X)
        return (letras + "XXX").substring(0, 3);
    }

    private String generarSku(String nombre) {
        String prefijo = prefijoSku(nombre);
        int siguiente = productoDAO.ultimoNumeroSku(prefijo) + 1;
        return String.format("%s-%03d", prefijo, siguiente);   // AZU-005
    }

    // ------------------------------------------------------------------
    // VALIDACIONES
    // ------------------------------------------------------------------

    /**
     * Revisa cada campo. Si hay errores, los junta TODOS y lanza un 400 con un
     * mensaje por campo (así el formulario puede mostrarlos debajo de cada casilla).
     */
    private Producto validarYConvertir(ProductoRequest datos) {
        Map<String, String> errores = new LinkedHashMap<>();
        Producto p = new Producto();

        // Nombre
        String nombre = datos.getNombre() == null ? "" : datos.getNombre().trim().replaceAll("\\s+", " ");
        if (nombre.isEmpty()) {
            errores.put("nombre", "El nombre es obligatorio");
        } else if (nombre.length() > 100) {
            errores.put("nombre", "El nombre admite máximo 100 caracteres");
        }
        p.setNombre(nombre);

        // Área (categoría)
        String codigoCategoria = datos.getCategoria() == null ? "" : datos.getCategoria().trim().toUpperCase(Locale.ROOT);
        Categoria categoria = codigoCategoria.isEmpty() ? null : categoriaDAO.buscarPorCodigo(codigoCategoria);
        if (codigoCategoria.isEmpty()) {
            errores.put("categoria", "Seleccione un área");
        } else if (categoria == null) {
            errores.put("categoria", "El área seleccionada no existe");
        } else {
            p.setCategoriaId(categoria.getId());
            p.setCategoriaCodigo(categoria.getCodigo());
        }

        // Unidad de medida
        String unidad = datos.getUnidadMedida() == null ? "" : datos.getUnidadMedida().trim().toUpperCase(Locale.ROOT);
        if (unidad.isEmpty()) {
            errores.put("unidadMedida", "Seleccione una unidad de medida");
        } else if (!UnidadMedida.esValida(unidad)) {
            errores.put("unidadMedida", "Unidad no válida. Use KG, G, L, ML, UND o PAQ");
        }
        p.setUnidadMedida(unidad);

        // Cantidades
        p.setStockActual(validarNumero(datos.getStockActual(), "stockActual", "El stock actual", errores));
        p.setStockMinimo(validarNumero(datos.getStockMinimo(), "stockMinimo", "El stock mínimo", errores));
        p.setPrecioUnitario(validarNumero(datos.getPrecioUnitario(), "precioUnitario", "El precio", errores));

        // Fecha de vencimiento (opcional)
        String fecha = datos.getFechaVencimiento();
        if (fecha != null && !fecha.isBlank()) {
            try {
                p.setFechaVencimiento(LocalDate.parse(fecha.trim()));
            } catch (DateTimeParseException e) {
                errores.put("fechaVencimiento", "Fecha no válida. Use el formato AAAA-MM-DD");
            }
        }

        // SKU (opcional: si viene vacío se genera solo)
        String sku = datos.getSku() == null ? "" : datos.getSku().trim().toUpperCase(Locale.ROOT);
        if (!sku.isEmpty()) {
            if (!sku.matches("^[A-Z0-9-]{3,20}$")) {
                errores.put("sku", "El código solo admite letras, números y guiones (3 a 20 caracteres)");
            }
            p.setSku(sku);
        }

        if (!errores.isEmpty()) {
            throw new ServicioException(400, "Revise los datos ingresados", errores);
        }
        return p;
    }

    private BigDecimal validarNumero(BigDecimal valor, String campo, String descripcion, Map<String, String> errores) {
        if (valor == null) {
            errores.put(campo, descripcion + " es obligatorio");
        } else if (valor.signum() < 0) {
            errores.put(campo, descripcion + " no puede ser negativo");
        } else if (valor.compareTo(MAXIMO) > 0) {
            errores.put(campo, descripcion + " es demasiado grande");
        } else if (valor.scale() > 2 && valor.stripTrailingZeros().scale() > 2) {
            errores.put(campo, descripcion + " admite máximo 2 decimales");
        }
        return valor;
    }

    private Producto buscar(int id) {
        Producto producto = productoDAO.buscarPorId(id);
        if (producto == null) {
            throw new ServicioException(404, "No existe el producto con id " + id);
        }
        return producto;
    }
}
