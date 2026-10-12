import { Navigate, Outlet, useLocation, type Location } from 'react-router';
import { useAuth } from '../auth/useAuth';
import { FullScreenLoader } from '../components/ui/FullScreenLoader';

interface RedirectState {
  from?: Location;
}

// Rutas como /login: si ya hay sesión, se redirige a la página que el usuario
// intentaba abrir (guardada por ProtectedRoute) o al inicio.
export const PublicRoute = () => {
  const { isAuthenticated, isCheckingSession } = useAuth();
  const location = useLocation();

  if (isCheckingSession) {
    return <FullScreenLoader />;
  }

  if (isAuthenticated) {
    const from = (location.state as RedirectState | null)?.from;
    const target = from ? `${from.pathname}${from.search}${from.hash}` : '/';
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
};
