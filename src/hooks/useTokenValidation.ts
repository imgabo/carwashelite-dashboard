import { useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service';
import { useAuth } from '../contexts/AuthContext';

export const useTokenValidation = () => {
  const { isAuthenticated, logout, isRefreshing } = useAuth();

  // Función para validar token de manera segura
  const validateToken = useCallback((): boolean => {
    if (!isAuthenticated) return false;
    
    const token = authService.getToken();
    if (!token) return false;
    
    return !authService.isTokenExpired(token);
  }, [isAuthenticated]);

  // Función para verificar si el token necesita renovación
  const needsRefresh = useCallback((): boolean => {
    if (!isAuthenticated || isRefreshing) return false;
    
    const token = authService.getToken();
    if (!token) return false;
    
    return authService.shouldRefreshToken();
  }, [isAuthenticated, isRefreshing]);

  // Función para obtener el tiempo restante del token
  const getTimeRemaining = useCallback((): number => {
    if (!isAuthenticated) return 0;
    return authService.getTokenTimeRemaining();
  }, [isAuthenticated]);

  // Función para formatear el tiempo restante
  const formatTimeRemaining = useCallback((): string => {
    const timeRemaining = getTimeRemaining();
    if (timeRemaining === 0) return 'Expirado';
    
    const minutes = Math.floor(timeRemaining / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} día(s)`;
    } else if (hours > 0) {
      return `${hours} hora(s)`;
    } else {
      return `${minutes} minuto(s)`;
    }
  }, [getTimeRemaining]);

  // Efecto para limpiar tokens inválidos
  useEffect(() => {
    if (isAuthenticated && !validateToken()) {
      console.warn('Token inválido detectado, cerrando sesión');
      logout();
    }
  }, [isAuthenticated, validateToken, logout]);

  return {
    validateToken,
    needsRefresh,
    getTimeRemaining,
    formatTimeRemaining,
    isTokenValid: validateToken(),
    tokenNeedsRefresh: needsRefresh(),
    timeRemaining: getTimeRemaining(),
    formattedTimeRemaining: formatTimeRemaining()
  };
};