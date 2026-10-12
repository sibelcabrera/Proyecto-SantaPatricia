package pe.edu.isil.santapatricia.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import pe.edu.isil.santapatricia.model.EstadoStock;
import pe.edu.isil.santapatricia.model.Producto;

/**
 * JSON que recibe React por cada producto.
 * Coincide EXACTAMENTE con ProductoDTO de src/types/inventario.ts del frontend.
 */
public class ProductoDTO {

    private int id;
    private String sku;
    private String nombre;
    private String categoria;
    private String unidadMedida;
    private BigDecimal stockActual;
    private BigDecimal stockMinimo;
    private BigDecimal precioUnitario;
    private LocalDate fechaVencimiento;
    private String estado;                     // OPTIMO, BAJO o CRITICO (calculado)
    private LocalDateTime ultimaActualizacion;

    /** Convierte una fila de la base (Producto) en el JSON para React. */
    public static ProductoDTO desde(Producto p) {
        ProductoDTO dto = new ProductoDTO();
        dto.id = p.getId();
        dto.sku = p.getSku();
        dto.nombre = p.getNombre();
        dto.categoria = p.getCategoriaCodigo();
        dto.unidadMedida = p.getUnidadMedida();
        dto.stockActual = p.getStockActual();
        dto.stockMinimo = p.getStockMinimo();
        dto.precioUnitario = p.getPrecioUnitario();
        dto.fechaVencimiento = p.getFechaVencimiento();
        dto.estado = EstadoStock.calcular(p.getStockActual(), p.getStockMinimo()).name();
        dto.ultimaActualizacion = p.getActualizadoEn();
        return dto;
    }

    public int getId() { return id; }
    public String getSku() { return sku; }
    public String getNombre() { return nombre; }
    public String getCategoria() { return categoria; }
    public String getUnidadMedida() { return unidadMedida; }
    public BigDecimal getStockActual() { return stockActual; }
    public BigDecimal getStockMinimo() { return stockMinimo; }
    public BigDecimal getPrecioUnitario() { return precioUnitario; }
    public LocalDate getFechaVencimiento() { return fechaVencimiento; }
    public String getEstado() { return estado; }
    public LocalDateTime getUltimaActualizacion() { return ultimaActualizacion; }
}
