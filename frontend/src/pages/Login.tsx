import { useState, type FormEvent, type MouseEvent } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { getErrorMessage } from '../api/axios';

export const Login = () => {
  const { login } = useAuth();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [recordarme, setRecordarme] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 🔐 Este componente NO llama al backend directamente.
      // La petición real está en src/services/authService.ts → authService.login()
      // Al iniciar sesión, PublicRoute redirige automáticamente al dashboard.
      await login({ correo, password, recordarme });
    } catch (err) {
      // 💬 Muestra el "message" que devuelva el backend (ej. "Credenciales incorrectas")
      setError(getErrorMessage(err, 'Correo o contraseña incorrectos.'));
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    alert('Para restablecer tu contraseña, contacta al soporte de TI o administrador del sistema.');
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f2f0] flex items-center justify-center p-4 sm:p-6 lg:p-10">

      {/* Conteiner Principal */}
      <div className="w-full max-w-[1080px] bg-white rounded-[28px] sm:rounded-[32px] overflow-hidden shadow-2xl border border-neutral-200/80 flex flex-col lg:flex-row min-h-[640px]">

        <div className="lg:w-[50%] bg-[#2e1507] p-8 sm:p-12 lg:p-14 text-white flex flex-col justify-between relative overflow-hidden select-none min-h-[460px] lg:min-h-auto">

          <svg
            className="absolute -bottom-16 -left-16 w-[420px] h-[420px] pointer-events-none opacity-20 text-[#B65D16]"
            viewBox="0 0 400 400"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          >
            <circle cx="110" cy="290" r="260" />
            <circle cx="110" cy="290" r="200" />
            <circle cx="110" cy="290" r="140" />
            <circle cx="110" cy="290" r="80" />
          </svg>

          {/* Logo */}
          <div className="relative z-10">
            <div className="bg-[#48200b] border border-[#B65D16]/30 rounded-xl px-3 py-2 inline-flex items-center gap-2.5 shadow-sm">
              <div className="w-7 h-7 rounded-lg bg-[#B65D16] flex items-center justify-center text-white shadow-sm">
                <svg
                  className="w-4 h-4 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <span className="text-white font-bold text-sm tracking-tight">Santa Patricia</span>
            </div>
          </div>

          {/* Contenido Central */}
          <div className="relative z-10 my-8 lg:my-auto">
            {/* Eslogan */}
            <div className="flex items-center gap-2.5 text-[#f5903d] text-xs font-bold tracking-wider uppercase mb-4">
              <span className="w-5 h-[2px] bg-[#f5903d] inline-block"></span>
              <span>PLATAFORMA DE OPERACIONES</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-white tracking-tight leading-[1.15] mb-4">
              Gestión interna de<br />inventario.
            </h1>

            {/* Description */}
            <p className="text-[#ffedd5]/80 text-sm sm:text-base leading-relaxed max-w-sm mb-8 font-normal">
              Accede a las herramientas de control de existencias, movimientos de almacén y gestión de proveedores.
            </p>

            {/* Card de Advertencia */}
            <div className="bg-[#421d0a]/85 border border-[#B65D16]/30 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 max-w-sm backdrop-blur-md shadow-lg">
              <div className="w-10 h-10 rounded-xl border border-[#f5903d]/40 flex items-center justify-center text-[#f5903d] flex-shrink-0 bg-[#54240b]/50">
                <Lock className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Acceso restringido</h3>
                <p className="text-[#fed7aa]/75 text-xs mt-1 leading-snug">
                  Plataforma de uso exclusivo para personal autorizado de la organización.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 text-[#fdba74]/50 text-xs font-normal">
            Santa Patricia · Sistema interno de inventario
          </div>
        </div>

        <div className="lg:w-[50%] p-8 sm:p-12 lg:p-14 flex flex-col justify-between bg-white relative">

          {/* Badge */}
          <div className="flex items-center justify-end gap-2 text-xs text-neutral-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#B65D16] inline-block animate-pulse"></span>
            <span>Sistema operativo</span>
          </div>

          {/* Titulo de Formulario */}
          <div className="w-full max-w-[390px] mx-auto my-auto py-6">
            <span className="text-[#B65D16] text-xs font-bold tracking-wider uppercase block mb-2">
              PORTAL INTERNO
            </span>

            <h2 className="text-3xl sm:text-[34px] font-bold text-neutral-900 tracking-tight leading-tight mb-2">
              Acceso de personal
            </h2>

            <p className="text-neutral-500 text-xs sm:text-sm mb-6 leading-relaxed">
              Identifícate con las credenciales asignadas por tu organización.
            </p>

            {/* Alerta de Error */}
            {error && (
              <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Correo de Empleado*/}
              <div>
                <label htmlFor="login-correo" className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Correo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="login-correo"
                    type="email"
                    autoComplete="username"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="usuario@empresa.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50/70 border border-neutral-200 rounded-xl text-neutral-800 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#B65D16]/20 focus:border-[#B65D16] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <label htmlFor="login-password" className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-neutral-50/70 border border-neutral-200 rounded-xl text-neutral-800 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#B65D16]/20 focus:border-[#B65D16] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-600 cursor-pointer transition-colors"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Recordarme y Olvide mi contraseña */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none text-neutral-600 hover:text-neutral-800">
                  <input
                    type="checkbox"
                    checked={recordarme}
                    onChange={(e) => setRecordarme(e.target.checked)}
                    className="w-4 h-4 rounded border-neutral-300 text-[#B65D16] focus:ring-[#B65D16]/20 accent-[#B65D16] cursor-pointer"
                  />
                  <span>Recordarme</span>
                </label>
                <a
                  href="#olvide-contrasena"
                  onClick={handleForgotPassword}
                  className="text-[#B65D16] font-semibold hover:text-[#8e460e] hover:underline cursor-pointer transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              {/* Boton de Entrar */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#B65D16] hover:bg-[#9e4e10] active:scale-[0.99] text-white font-medium text-sm rounded-xl shadow-md shadow-[#B65D16]/20 transition-all flex items-center justify-center gap-2 cursor-pointer group disabled:opacity-75 disabled:cursor-not-allowed mt-2"
              >
                <span>{isLoading ? 'Ingresando...' : 'Ingresar al inventario'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </form>

            {/* Advertencia de Uso */}
            <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-col items-center">
              <span className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                USO EXCLUSIVO INTERNO
              </span>
              <p className="text-[11px] text-neutral-400 text-center mt-2 leading-relaxed">
                Toda actividad realizada en esta plataforma esta siendo registrada.
              </p>
            </div>
          </div>

          {/* Spacer for bottom symmetry */}
          <div className="h-4 hidden lg:block"></div>
        </div>
      </div>
    </div>
  );
};
