package pe.edu.isil.santapatricia.model;

import java.time.LocalTime;

/** Representa una fila de la tabla "turnos" (Mañana, Tarde). */
public class Turno {

    private int id;
    private String codigo;        // MANANA
    private String nombre;        // Mañana
    private LocalTime horaInicio; // 06:00
    private LocalTime horaFin;    // 14:30

    public Turno() {
    }

    public Turno(int id, String codigo, String nombre, LocalTime horaInicio, LocalTime horaFin) {
        this.id = id;
        this.codigo = codigo;
        this.nombre = nombre;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public LocalTime getHoraInicio() { return horaInicio; }
    public void setHoraInicio(LocalTime horaInicio) { this.horaInicio = horaInicio; }
    public LocalTime getHoraFin() { return horaFin; }
    public void setHoraFin(LocalTime horaFin) { this.horaFin = horaFin; }
}
