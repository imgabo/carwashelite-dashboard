import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTokenValidation } from '../hooks/useTokenValidation';

interface SessionStatusProps {
  className?: string;
}

export const SessionStatus: React.FC<SessionStatusProps> = ({ className = '' }) => {
  const { isAuthenticated, isRefreshing, refreshToken } = useAuth();
  const { formattedTimeRemaining, tokenNeedsRefresh, isTokenValid } = useTokenValidation();

  if (!isAuthenticated) {
    return null;
  }

  const handleManualRefresh = async () => {
    await refreshToken();
  };

  const getStatusColor = () => {
    if (isRefreshing) return 'bg-yellow-100 border-yellow-400 text-yellow-800';
    if (!isTokenValid) return 'bg-red-100 border-red-400 text-red-800';
    if (tokenNeedsRefresh) return 'bg-orange-100 border-orange-400 text-orange-800';
    return 'bg-green-100 border-green-400 text-green-800';
  };

  const getStatusText = () => {
    if (isRefreshing) return 'Renovando sesión...';
    if (!isTokenValid) return 'Sesión expirada';
    if (tokenNeedsRefresh) return 'Renovación próxima';
    return 'Sesión activa';
  };

  return (
    <div className={`${className} border-l-4 p-4 ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {isRefreshing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            ) : (
              <div className="h-4 w-4 rounded-full bg-current"></div>
            )}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">{getStatusText()}</p>
            <p className="text-xs mt-1">
              Tiempo restante: {formattedTimeRemaining}
            </p>
          </div>
        </div>
        {tokenNeedsRefresh && !isRefreshing && (
          <button
            onClick={handleManualRefresh}
            className="text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded transition-all"
          >
            Renovar ahora
          </button>
        )}
      </div>
    </div>
  );
};