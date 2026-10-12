package pe.edu.isil.santapatricia.dto;

import pe.edu.isil.santapatricia.model.Turno;

/** Un turno tal como lo recibe React:  { "codigo": "MANANA", "nombre": "Mañana", "horaInicio": "06:00", "horaFin": "14:30" } */
public class TurnoDTO {

    private String codigo;
    private String nombre;
    private String horaInicio;
    private String horaFin;

    public TurnoDTO() {
    }

    public static TurnoDTO desde(Turno t) {
        TurnoDTO dto = new TurnoDTO();
        dto.codigo = t.getCodigo();
        dto.nombre = t.getNombre();
        dto.horaInicio = t.getHoraInicio().toString();   // LocalTime -> "06:00"
        dto.horaFin = t.getHoraFin().toString();
        return dto;
    }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getHoraInicio() { return horaInicio; }
    public void setHoraInicio(String horaInicio) { this.horaInicio = horaInicio; }
    public String getHoraFin() { return horaFin; }
    public void setHoraFin(String horaFin) { this.horaFin = horaFin; }
}
