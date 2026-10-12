import { useEffect, useRef } from 'react';
import { Search, LogOut, ChevronRight, Store } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { useAuth } from '../../auth/useAuth';
import type { RolUsuario } from '../../types/auth';

// 🏷️ Texto que se muestra para cada rol (los 4 de Jira). Si el backend agrega roles nuevos, añádanlos aquí.
const ROL_LABEL: Record<RolUsuario, string> = {
  ADMINISTRADOR: 'Administrador',
  ENCARGADO_PRODUCCION: 'Encargado de Producción',
  CAJERO: 'Cajero',
  ALMACENERO: 'Almacenero',
};

// "Valeria Ramos" -> "VR"
const iniciales = (nombre = '') =>
  nombre.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');

export const Header = () => {
  const { user, logout } = useAuth();
  const buscador = useRef<HTMLInputElement>(null);
  // 🔎 Lo que se escribe en el buscador se guarda en la URL (?buscar=...) y el inventario filtra la tabla
  const [searchParams, setSearchParams] = useSearchParams();
  const buscar = searchParams.get('buscar') ?? '';

  const cambiarBusqueda = (texto: string) => {
    const params = new URLSearchParams(searchParams);
    if (texto) params.set('buscar', texto);
    else params.delete('buscar');
    setSearchParams(params, { replace: true });
  };

  // ⌨️ Ctrl + K lleva directo al buscador
  useEffect(() => {
    const atajo = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        buscador.current?.focus();
      }
    };
    window.addEventListener('keydown', atajo);
    return () => window.removeEventListener('keydown', atajo);
  }, []);

  return (
    <header className="bg-white h-16 border-b border-slate-200 flex items-center justify-between gap-4 px-6 sticky top-0 z-10">
      <div className="flex items-center gap-3 text-sm min-w-0">
        <span className="text-slate-500 hidden lg:inline">Inventario</span>
        <ChevronRight className="w-4 h-4 text-slate-300 hidden lg:inline" />
        <span className="font-medium text-secondary whitespace-nowrap">Almacén Central</span>
        {user?.turno && (
          <span className="hidden md:flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Conectado · Turno {user.turno.nombre}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            ref={buscador}
            type="search"
            value={buscar}
            onChange={(e) => cambiarBusqueda(e.target.value)}
            placeholder="Buscar insumo o código…"
            aria-label="Buscar insumo o código"
            className="pl-9 pr-16 py-2 bg-background border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary w-56 xl:w-72"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-slate-400 border border-slate-200 bg-white rounded px-1.5 py-0.5 pointer-events-none">
            Ctrl K
          </kbd>
        </div>

        <span className="hidden xl:flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-secondary whitespace-nowrap">
          <Store className="w-4 h-4 text-slate-400" /> Sede La Molina
        </span>

        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="text-right hidden md:block">
            {/* 👤 Datos que vienen del UsuarioDTO del backend (src/types/auth.ts) */}
            <p className="text-sm font-semibold text-secondary leading-tight whitespace-nowrap">{user?.nombre}</p>
            <p className="text-xs text-slate-500 whitespace-nowrap">{user ? ROL_LABEL[user.rol] ?? user.rol : ''}</p>
          </div>
          <div className="w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold shrink-0">
            {iniciales(user?.nombre)}
          </div>
          <button onClick={logout} className="text-slate-400 hover:text-danger transition-colors" aria-label="Cerrar sesión" title="Cerrar sesión">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
