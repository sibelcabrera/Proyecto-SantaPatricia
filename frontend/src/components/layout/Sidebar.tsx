import { Home, Package, AlertTriangle, Clock, Users, BarChart2 } from 'lucide-react';

export const Sidebar = () => {
  const menuItems = [
    { name: 'Inventario Central', icon: Home, active: true },
    { name: 'Movimientos y Kárdex', icon: Package, active: false },
    { name: 'Mermas y Caducidad', icon: AlertTriangle, active: false },
    { name: 'Producción del Día', icon: Clock, active: false },
    { name: 'Proveedores', icon: Users, active: false },
    { name: 'Reportes y Analítica', icon: BarChart2, active: false },
  ];

  return (
    <aside className="w-64 bg-secondary text-white flex flex-col h-screen fixed left-0 top-0">
      {/* Logo Area */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-700">
        <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center text-primary font-bold text-xl">
          SP
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">Santa Patricia</h1>
          <p className="text-xs text-slate-400">PANADERÍA • MINIMARKET</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Módulos de Almacén
        </p>
        {menuItems.map((item) => (
          <a
            key={item.name}
            href="#"
            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
              item.active 
                ? 'bg-primary text-white font-medium' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
};