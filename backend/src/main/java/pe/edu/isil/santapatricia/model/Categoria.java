package pe.edu.isil.santapatricia.model;

/** Representa una fila de la tabla "categorias" (las áreas del negocio). */
public class Categoria {

    private int id;
    private String codigo;   // PANADERIA
    private String nombre;   // Panadería

    public Categoria() {
    }

    public Categoria(int id, String codigo, String nombre) {
        this.id = id;
        this.codigo = codigo;
        this.nombre = nombre;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
}
