
package pe.edu.isil.santapatricia.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Representa una fila de la tabla movimientos_inventario.
 * Registra entradas y salidas de productos del almacen.
 */
public class MovimientoInventario {

    private int id;
    private int productoId;
    private int usuarioId;
    private String tipoMovimiento;
    private BigDecimal cantidad;
    private BigDecimal stockAnterior;
    private BigDecimal stockPosterior;
    private String motivo;
    private String referencia;
    private LocalDateTime fechaMovimiento;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getProductoId() {
        return productoId;
    }

    public void setProductoId(int productoId) {
        this.productoId = productoId;
    }

    public int getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(int usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getTipoMovimiento() {
        return tipoMovimiento;
    }

    public void setTipoMovimiento(String tipoMovimiento) {
        this.tipoMovimiento = tipoMovimiento;
    }

    public BigDecimal getCantidad() {
        return cantidad;
    }

    public void setCantidad(BigDecimal cantidad) {
        this.cantidad = cantidad;
    }

    public BigDecimal getStockAnterior() {
        return stockAnterior;
    }

    public void setStockAnterior(BigDecimal stockAnterior) {
        this.stockAnterior = stockAnterior;
    }

    public BigDecimal getStockPosterior() {
        return stockPosterior;
    }

    public void setStockPosterior(BigDecimal stockPosterior) {
        this.stockPosterior = stockPosterior;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public String getReferencia() {
        return referencia;
    }

    public void setReferencia(String referencia) {
        this.referencia = referencia;
    }

    public LocalDateTime getFechaMovimiento() {
        return fechaMovimiento;
    }

    public void setFechaMovimiento(
            LocalDateTime fechaMovimiento) {
        this.fechaMovimiento = fechaMovimiento;
    }
}
