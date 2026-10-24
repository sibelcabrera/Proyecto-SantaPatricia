package pe.edu.isil.santapatricia.dto;
import java.math.BigDecimal;

public class OrdenProduccionDTO {

    private int id;
    private String codigo;
    private int productoId;
    private BigDecimal cantidadPlanificada;
    private String estado;

    public OrdenProduccionDTO() {
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public int getProductoId() {
        return productoId;
    }

    public void setProductoId(int productoId) {
        this.productoId = productoId;
    }

   public BigDecimal getCantidadPlanificada() {
    return cantidadPlanificada;
}

public void setCantidadPlanificada(BigDecimal cantidadPlanificada) {
    this.cantidadPlanificada = cantidadPlanificada;
}

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}
