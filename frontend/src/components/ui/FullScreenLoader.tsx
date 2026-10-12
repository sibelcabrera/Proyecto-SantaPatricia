import { Loader2 } from 'lucide-react';

// ⏳ Pantalla de carga mientras se verifica la sesión con el backend.
export const FullScreenLoader = () => (
  <div className="min-h-screen w-full flex items-center justify-center bg-background text-slate-500 gap-3">
    <Loader2 className="w-5 h-5 animate-spin text-primary" />
    <span className="text-sm">Verificando sesión...</span>
  </div>
);
