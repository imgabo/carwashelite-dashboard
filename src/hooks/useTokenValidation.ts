import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth.service';

export const useTokenValidation = () => {
  const { isAuthenticated } = useAuth();
  const [tokenTimeRemaining, setTokenTimeRemaining] = useState<number>(0);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState<boolean>(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Actualizar tiempo restante cada minuto
    const updateTokenTime = () => {
      const timeRemaining = authService.getTokenTimeRemaining();
      setTokenTimeRemaining(timeRemaining);

      // Si quedan menos de 5 minutos, mostrar advertencia
      if (timeRemaining > 0 && timeRemaining < 5 * 60 * 1000) {
        console.warn('Token expirará pronto');
      }
    };

    updateTokenTime();
    const interval = setInterval(updateTokenTime, 60 * 1000); // Cada minuto

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Función para formatear el tiempo restante
  const formatTimeRemaining = (): string => {
    if (tokenTimeRemaining <= 0) return '0 min';
    
    const minutes = Math.floor(tokenTimeRemaining / (60 * 1000));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
    
    return `${minutes}m`;
  };

  // Determinar el estado del token
  const getTokenStatus = () => {
    if (tokenTimeRemaining <= 0) return 'expired';
    if (tokenTimeRemaining < 5 * 60 * 1000) return 'critical'; // Menos de 5 minutos
    if (tokenTimeRemaining < 15 * 60 * 1000) return 'warning'; // Menos de 15 minutos
    return 'healthy';
  };

  const tokenStatus = getTokenStatus();
  const isTokenExpiringSoon = tokenTimeRemaining > 0 && tokenTimeRemaining < 5 * 60 * 1000;
  const shouldShowWarning = tokenStatus === 'warning' || tokenStatus === 'critical';

  return {
    tokenTimeRemaining,
    formatTimeRemaining,
    isTokenExpiringSoon,
    isAutoRefreshing,
    tokenStatus,
    shouldShowWarning,
  };
};