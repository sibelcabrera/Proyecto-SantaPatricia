
package pe.edu.isil.santapatricia.dto;

import java.math.BigDecimal;

public class MovimientoInventarioRequest {

    private int productoId;
    private BigDecimal cantidad;
    private String motivo;

    // Opcional para HU04 y salidas sin orden.
    private Integer ordenProduccionId;

    public MovimientoInventarioRequest() {
    }

    public int getProductoId() {
        return productoId;
    }

    public void setProductoId(int productoId) {
        this.productoId = productoId;
    }

    public BigDecimal getCantidad() {
        return cantidad;
    }

    public void setCantidad(BigDecimal cantidad) {
        this.cantidad = cantidad;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public Integer getOrdenProduccionId() {
        return ordenProduccionId;
    }

    public void setOrdenProduccionId(Integer ordenProduccionId) {
        this.ordenProduccionId = ordenProduccionId;
    }
}
