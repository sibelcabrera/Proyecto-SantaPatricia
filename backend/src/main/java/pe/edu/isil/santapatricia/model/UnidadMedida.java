package pe.edu.isil.santapatricia.model;

/** Unidades en que se mide un producto. Coinciden con la columna productos.unidad_medida. */
public enum UnidadMedida {
    KG("Kilogramo"),
    G("Gramo"),
    L("Litro"),
    ML("Mililitro"),
    UND("Unidad"),
    PAQ("Paquete");

    private final String nombre;

    UnidadMedida(String nombre) {
        this.nombre = nombre;
    }

    public String getNombre() {
        return nombre;
    }

    /** true si el texto es una unidad válida ("KG", "G"...). */
    public static boolean esValida(String codigo) {
        for (UnidadMedida u : values()) {
            if (u.name().equals(codigo)) {
                return true;
            }
        }
        return false;
    }
}
