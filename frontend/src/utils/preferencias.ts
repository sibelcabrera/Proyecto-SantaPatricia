import type { CategoriaProducto } from '../types/inventario';

// 🧭 Área que eligió el usuario en el login ("Paso 1"). El Inventario Central abre filtrado en esa área.
// Se guarda solo en esta pestaña del navegador (sessionStorage). "TODAS" = Supervisión.
const AREA_KEY = 'sp_area_trabajo';

export type AreaTrabajo = CategoriaProducto | 'TODAS';

export const areaTrabajo = {
  get(): AreaTrabajo {
    try {
      return (sessionStorage.getItem(AREA_KEY) as AreaTrabajo | null) ?? 'TODAS';
    } catch {
      return 'TODAS';
    }
  },

  set(area: AreaTrabajo) {
    try {
      sessionStorage.setItem(AREA_KEY, area);
    } catch {
      // Almacenamiento bloqueado: el inventario abrirá con todas las áreas.
    }
  },
};

// 🕘 Turno que corresponde a la hora actual, para dejarlo preseleccionado en el login.
// Compara "HH:MM" como texto: funciona porque las horas vienen siempre con 2 dígitos.
export const turnoSegunHora = <T extends { horaInicio: string; horaFin: string }>(turnos: T[], ahora = new Date()) => {
  const hora = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
  return turnos.find((t) => t.horaInicio <= hora && hora < t.horaFin) ?? turnos[0];
};
