package pe.edu.isil.santapatricia.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** Representa una fila de la tabla "productos" (el catálogo del inventario). */
public class Producto {

    private int id;
    private String sku;                    // código interno, ej. AZU-001
    private String nombre;
    private int categoriaId;
    private String categoriaCodigo;        // PANADERIA (viene de la tabla categorias)
    private String unidadMedida;           // KG, G, L, ML, UND, PAQ
    private BigDecimal stockActual;
    private BigDecimal stockMinimo;
    private BigDecimal precioUnitario;
    private LocalDate fechaVencimiento;    // puede ser null
    private boolean activo;
    private LocalDateTime actualizadoEn;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public int getCategoriaId() { return categoriaId; }
    public void setCategoriaId(int categoriaId) { this.categoriaId = categoriaId; }
    public String getCategoriaCodigo() { return categoriaCodigo; }
    public void setCategoriaCodigo(String categoriaCodigo) { this.categoriaCodigo = categoriaCodigo; }
    public String getUnidadMedida() { return unidadMedida; }
    public void setUnidadMedida(String unidadMedida) { this.unidadMedida = unidadMedida; }
    public BigDecimal getStockActual() { return stockActual; }
    public void setStockActual(BigDecimal stockActual) { this.stockActual = stockActual; }
    public BigDecimal getStockMinimo() { return stockMinimo; }
    public void setStockMinimo(BigDecimal stockMinimo) { this.stockMinimo = stockMinimo; }
    public BigDecimal getPrecioUnitario() { return precioUnitario; }
    public void setPrecioUnitario(BigDecimal precioUnitario) { this.precioUnitario = precioUnitario; }
    public LocalDate getFechaVencimiento() { return fechaVencimiento; }
    public void setFechaVencimiento(LocalDate fechaVencimiento) { this.fechaVencimiento = fechaVencimiento; }
    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }
    public LocalDateTime getActualizadoEn() { return actualizadoEn; }
    public void setActualizadoEn(LocalDateTime actualizadoEn) { this.actualizadoEn = actualizadoEn; }
}
