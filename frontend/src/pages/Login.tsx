import { useEffect, useState, type FormEvent, type MouseEvent } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Croissant, Store, ShieldCheck, ChevronDown, Loader2 } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { getErrorMessage } from '../api/axios';
import { authService } from '../services/authService';
import { AREA_ESTILO, CATEGORIA_LABEL } from '../constants/etiquetas';
import { areaTrabajo, turnoSegunHora, type AreaTrabajo } from '../utils/preferencias';
import type { TurnoDTO } from '../types/auth';
import type { CategoriaProducto } from '../types/inventario';

// 🔐 HU01 - Inicio de sesión (diseño de la maqueta de la PA1)
//   Paso 1: el colaborador elige su ÁREA de trabajo (solo cambia qué ve primero en el inventario).
//   Paso 2: correo, contraseña y TURNO. El backend valida todo y registra quién inició qué turno.

const AREAS = Object.keys(CATEGORIA_LABEL) as CategoriaProducto[];
const SEDE = 'Sede La Molina';

type EstadoTurnos = { estado: 'cargando' } | { estado: 'listo'; turnos: TurnoDTO[] } | { estado: 'error'; mensaje: string };

export const Login = () => {
  const { login } = useAuth();
  const [area, setArea] = useState<AreaTrabajo | null>(null);
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [turno, setTurno] = useState('');
  const [recordarme, setRecordarme] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [turnos, setTurnos] = useState<EstadoTurnos>({ estado: 'cargando' });

  // 🕘 Los turnos vienen de MySQL (GET /auth/turnos). Se preselecciona el que corresponde a la hora actual.
  useEffect(() => {
    let activo = true;
    authService
      .listarTurnos()
      .then((lista) => {
        if (!activo) return;
        setTurnos({ estado: 'listo', turnos: lista });
        setTurno(turnoSegunHora(lista)?.codigo ?? '');
      })
      .catch((err) => {
        if (activo) setTurnos({ estado: 'error', mensaje: getErrorMessage(err, 'No se pudo conectar con el servidor.') });
      });
    return () => {
      activo = false;
    };
  }, []);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // La petición real está en src/services/authService.ts → authService.login()
      areaTrabajo.set(area ?? 'TODAS');
      await login({ correo, password, turno, recordarme });
    } catch (err) {
      // 💬 Muestra el "message" del backend (ej. "Correo o contraseña incorrectos", "Seleccione su turno")
      setError(getErrorMessage(err, 'Correo o contraseña incorrectos.'));
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    alert('Para restablecer su contraseña, comuníquese con el administrador del local.');
  };

  const enLinea = turnos.estado === 'listo';
  const tarjetaArea = (activa: boolean) =>
    `flex items-center gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ring-1 ${
      activa ? 'bg-white ring-2 ring-primary shadow-sm' : 'bg-slate-50 ring-slate-200/70 hover:ring-primary/40 hover:bg-white'
    }`;
  const iconoArea = (activa: boolean) =>
    `w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${activa ? 'bg-primary text-white' : 'bg-white text-slate-500 ring-1 ring-slate-200'}`;

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-[560px] bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200/70 overflow-hidden">
        {/* Franja superior con el color de marca */}
        <div className="h-1.5 bg-gradient-to-r from-primary via-[#d9884a] to-[#f6d3b5]" />

        <div className="p-6 sm:p-10">
          {/* Marca */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-orange-50 ring-1 ring-orange-100 flex items-center justify-center text-primary shrink-0">
              <Croissant className="w-7 h-7" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-semibold text-secondary tracking-tight">Santa Patricia</h1>
                {turnos.estado !== 'cargando' && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${enLinea ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${enLinea ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    {enLinea ? 'En línea' : 'Sin conexión'}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 truncate">Control de Inventario · Panadería, Pastelería y Minimarket</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            {/* Paso 1: área */}
            <fieldset>
              <div className="flex items-center justify-between mb-2">
                <legend className="text-xs font-semibold tracking-wider text-slate-600 uppercase">Área de trabajo</legend>
                <span className="text-xs font-semibold text-primary">Paso {area ? 2 : 1} de 2</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AREAS.map((codigo) => {
                  const { icono: Icono, detalle } = AREA_ESTILO[codigo];
                  const activa = area === codigo;
                  return (
                    <button key={codigo} type="button" onClick={() => setArea(codigo)} className={tarjetaArea(activa)} aria-pressed={activa}>
                      <span className={iconoArea(activa)}><Icono className="w-4.5 h-4.5" /></span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-secondary leading-tight">{CATEGORIA_LABEL[codigo]}</span>
                        <span className="block text-[11px] text-slate-500 truncate">{detalle}</span>
                      </span>
                    </button>
                  );
                })}
                <button type="button" onClick={() => setArea('TODAS')} className={tarjetaArea(area === 'TODAS')} aria-pressed={area === 'TODAS'}>
                  <span className={iconoArea(area === 'TODAS')}><ShieldCheck className="w-4.5 h-4.5" /></span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-secondary leading-tight">Supervisión</span>
                    <span className="block text-[11px] text-slate-500 truncate">Todas las áreas</span>
                  </span>
                </button>
              </div>
            </fieldset>

            {/* Alerta de error */}
            {(error || turnos.estado === 'error') && (
              <div role="alert" className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error || (turnos.estado === 'error' ? turnos.mensaje : '')}</span>
              </div>
            )}

            {/* Correo */}
            <div>
              <label htmlFor="login-correo" className="block text-sm font-medium text-secondary mb-1.5">Correo</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="login-correo"
                  type="email"
                  autoComplete="username"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="usuario@santapatricia.pe"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-secondary text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-sm font-medium text-secondary">Contraseña</label>
                <a href="#olvide-contrasena" onClick={handleForgotPassword} className="text-xs font-medium text-primary hover:underline">
                  ¿Olvidó su contraseña?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese su contraseña"
                  required
                  className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-secondary text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sede y turno */}
            <div>
              <label htmlFor="login-turno" className="block text-sm font-medium text-secondary mb-1.5">Sede y turno</label>
              <div className="relative">
                <Store className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  id="login-turno"
                  value={turno}
                  onChange={(e) => setTurno(e.target.value)}
                  required
                  disabled={turnos.estado !== 'listo'}
                  className="w-full appearance-none pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:text-slate-400"
                >
                  {turnos.estado === 'cargando' && <option value="">Cargando turnos…</option>}
                  {turnos.estado === 'error' && <option value="">Turnos no disponibles</option>}
                  {turnos.estado === 'listo' &&
                    turnos.turnos.map((t) => (
                      <option key={t.codigo} value={t.codigo}>
                        {SEDE} · Turno {t.nombre} ({t.horaInicio} – {t.horaFin})
                      </option>
                    ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <label className="flex items-center gap-2.5 text-sm text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={recordarme}
                onChange={(e) => setRecordarme(e.target.checked)}
                className="w-4 h-4 rounded accent-primary cursor-pointer"
              />
              Mantener la sesión abierta en este equipo
            </label>

            <button
              type="submit"
              disabled={isLoading || turnos.estado !== 'listo'}
              className="w-full py-3.5 px-4 bg-primary hover:bg-[#9c4d14] active:scale-[0.99] text-white font-medium rounded-xl shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>{isLoading ? 'Ingresando…' : 'Iniciar turno'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
            </button>
          </form>

          <div className="mt-8 pt-5 border-t border-slate-100 text-center space-y-1">
            <p className="text-xs text-slate-500">Uso exclusivo del personal · Av. Flora Tristán 443, La Molina</p>
            <p className="text-xs text-slate-400">Cada inicio de sesión queda registrado con su usuario y turno.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
