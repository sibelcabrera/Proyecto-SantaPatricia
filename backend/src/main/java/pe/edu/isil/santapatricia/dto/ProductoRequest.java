package pe.edu.isil.santapatricia.dto;

import java.math.BigDecimal;

/**
 * JSON que envía React para CREAR o EDITAR un producto (HU02).
 * Coincide con CrearProductoDTO de src/types/inventario.ts del frontend.
 * El "sku" es opcional: si viene vacío, el backend lo genera solo (ej. AZU-001).
 */
public class ProductoRequest {

    private String sku;
    private String nombre;
    private String categoria;          // PANADERIA, PASTELERIA...
    private String unidadMedida;       // KG, G, L, ML, UND, PAQ
    private BigDecimal stockActual;
    private BigDecimal stockMinimo;
    private BigDecimal precioUnitario;
    private String fechaVencimiento;   // "2026-10-31" o null

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    public String getUnidadMedida() { return unidadMedida; }
    public void setUnidadMedida(String unidadMedida) { this.unidadMedida = unidadMedida; }
    public BigDecimal getStockActual() { return stockActual; }
    public void setStockActual(BigDecimal stockActual) { this.stockActual = stockActual; }
    public BigDecimal getStockMinimo() { return stockMinimo; }
    public void setStockMinimo(BigDecimal stockMinimo) { this.stockMinimo = stockMinimo; }
    public BigDecimal getPrecioUnitario() { return precioUnitario; }
    public void setPrecioUnitario(BigDecimal precioUnitario) { this.precioUnitario = precioUnitario; }
    public String getFechaVencimiento() { return fechaVencimiento; }
    public void setFechaVencimiento(String fechaVencimiento) { this.fechaVencimiento = fechaVencimiento; }
}
