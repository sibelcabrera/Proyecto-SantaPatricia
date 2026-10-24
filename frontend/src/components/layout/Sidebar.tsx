
import {
  LayoutGrid,
  ArrowRightLeft,
  TriangleAlert,
  ChefHat,
  Truck,
  BarChart3,
  Croissant,
  Clock
} from 'lucide-react';

import { NavLink } from 'react-router';
import { useAuth } from '../../auth/useAuth';

// Modulos del sistema Santa Patricia
const MODULOS = [
  {
    nombre: 'Inventario Central',
    icono: LayoutGrid,
    sprint: null,
    ruta: '/'
  },
  {
    nombre: 'Movimientos y Kárdex',
    icono: ArrowRightLeft,
    sprint: 'Sprint 2',
    ruta: '/movimientos'
  },
  {
    nombre: 'Mermas y Caducidad',
    icono: TriangleAlert,
    sprint: 'Sprint 3',
    ruta: null
  },
  {
    nombre: 'Producción del Día',
    icono: ChefHat,
    sprint: 'Sprint 3',
    ruta: null
  },
  {
    nombre: 'Proveedores y Pedidos',
    icono: Truck,
    sprint: 'Sprint 2',
    ruta: null
  },
  {
    nombre: 'Reportes y Analítica',
    icono: BarChart3,
    sprint: 'Sprint 4',
    ruta: null
  }
];

export const Sidebar = () => {

  const { user } = useAuth();
  const turno = user?.turno;

  return (
    <aside className="w-72 bg-secondary text-white flex flex-col h-screen fixed left-0 top-0">

      {/* Marca Santa Patricia */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">

          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-primary shrink-0">
            <Croissant className="w-5.5 h-5.5" />
          </div>

          <div>
            <h1 className="font-semibold text-[17px] leading-tight">
              Santa Patricia
            </h1>

            <p className="text-xs text-slate-400">
              Control de Inventario
            </p>
          </div>

        </div>

        <p className="mt-4 text-[11px] font-medium tracking-wider text-slate-300 uppercase leading-relaxed">
          Panadería · Pastelería · Minimarket
        </p>
      </div>

      {/* Menu lateral */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">

        <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Módulos de almacén
        </p>

        {MODULOS.map(({ nombre, icono: Icono, sprint, ruta }) => {

          // Modulos habilitados
          if (ruta !== null) {
            return (
              <NavLink
                key={nombre}
                to={ruta}
                end={ruta === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`
                }
              >
                <Icono size={19} />

                <span className="flex-1 truncate">
                  {nombre}
                </span>

                {sprint && (
                  <span className="text-[10px] font-medium text-slate-400 bg-slate-700/60 px-1.5 py-0.5 rounded">
                    {sprint.replace('Sprint ', 'S')}
                  </span>
                )}
              </NavLink>
            );
          }

          // Modulos de futuros sprints
          return (
            <div
              key={nombre}
              title={`Disponible en el ${sprint}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 cursor-not-allowed"
            >
              <Icono size={19} />

              <span className="flex-1 truncate">
                {nombre}
              </span>

              <span className="text-[10px] font-medium text-slate-400 bg-slate-700/60 px-1.5 py-0.5 rounded">
                {sprint?.replace('Sprint ', 'S')}
              </span>
            </div>
          );
        })}

      </nav>

      {/* Turno del usuario autenticado */}
      {turno && (
        <div className="m-3 p-3.5 rounded-xl bg-slate-800/70 ring-1 ring-slate-700">

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Turno en curso
            </span>

            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Activo
            </span>
          </div>

          <p className="mt-1.5 flex items-center gap-2 text-sm font-medium">
            <Clock className="w-4 h-4 text-primary" />

            {turno.nombre} · {turno.horaInicio} – {turno.horaFin}
          </p>

        </div>
      )}

    </aside>
  );
};
