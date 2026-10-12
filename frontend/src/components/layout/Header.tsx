import { Search, Bell, User, LogOut } from 'lucide-react';
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

export const Header = () => {
  const { user, logout } = useAuth();
  // 🔎 Lo que se escribe en el buscador se guarda en la URL (?buscar=...) y el Dashboard filtra la tabla
  const [searchParams, setSearchParams] = useSearchParams();
  const buscar = searchParams.get('buscar') ?? '';

  const cambiarBusqueda = (texto: string) => {
    const params = new URLSearchParams(searchParams);
    if (texto) params.set('buscar', texto);
    else params.delete('buscar');
    setSearchParams(params, { replace: true });
  };

  return (
    <header className="bg-white h-16 border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4 text-sm text-slate-600">
        <span className="font-medium">Inventario &gt; Almacén Central</span>
        <span className="text-success bg-green-50 px-2 py-1 rounded-full text-xs font-medium">
          Sincronizado (Turno Mañana)
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={buscar}
            onChange={(e) => cambiarBusqueda(e.target.value)}
            placeholder="Buscar insumo o código..."
            aria-label="Buscar insumo o código"
            className="pl-9 pr-4 py-2 bg-background border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary w-64"
          />
        </div>
        <button className="text-slate-400 hover:text-primary transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right hidden md:block">
            {/* 👤 Datos que vienen del UsuarioDTO del backend (src/types/auth.ts) */}
            <p className="text-sm font-semibold text-secondary">{user?.nombre}</p>
            <p className="text-xs text-slate-500">{user ? ROL_LABEL[user.rol] ?? user.rol : ''}</p>
          </div>
          <div className="w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <button
            onClick={logout}
            className="text-slate-400 hover:text-danger transition-colors"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
