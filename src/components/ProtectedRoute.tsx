import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { authService } from '../services/auth.service';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, checkTokenValidity } = useAuth();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const validateToken = () => {
      try {
        // Verificar si hay token y si es válido
        const token = authService.getToken();
        if (token && authService.isTokenExpired(token)) {
          // Token expirado, limpiar y redirigir
          authService.logout();
          return;
        }

        // Verificar validez completa del token
        checkTokenValidity();
      } catch (error) {
        console.error('Error al validar token:', error);
        authService.logout();
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [checkTokenValidity]);

  // Mostrar loading mientras se valida
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;