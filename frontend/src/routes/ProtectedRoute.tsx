import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../auth/useAuth';
import { FullScreenLoader } from '../components/ui/FullScreenLoader';

// Solo deja pasar a usuarios autenticados; al resto los manda al login
// recordando la ruta a la que intentaban entrar.
export const ProtectedRoute = () => {
  const { isAuthenticated, isCheckingSession } = useAuth();
  const location = useLocation();

  if (isCheckingSession) {
    return <FullScreenLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};
