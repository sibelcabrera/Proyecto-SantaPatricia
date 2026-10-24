
import { createBrowserRouter, Navigate } from 'react-router';

import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Movimientos } from './pages/Movimientos';
import { Login } from './pages/Login';

import { ProtectedRoute } from './routes/ProtectedRoute';
import { PublicRoute } from './routes/PublicRoute';

export const routes = [
  {
    element: <PublicRoute />,
    children: [
      {
        path: '/login',
        element: <Login />
      }
    ]
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <Dashboard />
          },
          {
            path: 'movimientos',
            element: <Movimientos />
          }
        ]
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
];

export const router = createBrowserRouter(routes, {
  basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/'
});
