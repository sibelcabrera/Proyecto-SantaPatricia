package pe.edu.isil.santapatricia.dto;

/** Una opción para los desplegables del formulario:  { "codigo": "KG", "nombre": "Kilogramo" } */
public class OpcionDTO {

    private String codigo;
    private String nombre;

    public OpcionDTO() {
    }

    public OpcionDTO(String codigo, String nombre) {
        this.codigo = codigo;
        this.nombre = nombre;
    }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
}
