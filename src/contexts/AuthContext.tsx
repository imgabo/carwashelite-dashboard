import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/auth.service';
import { RegisterResponse } from '../types/auth';
import toast from 'react-hot-toast';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string, refreshToken?: string) => void;
  logout: () => void;
  register: (name: string, email: string, password: string, code: string) => Promise<RegisterResponse>;
  checkTokenValidity: () => boolean;
  refreshToken: () => Promise<boolean>;
  isRefreshing: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Función para verificar la validez del token sin efectos secundarios
  const checkTokenValidity = (): boolean => {
    const isValid = authService.isAuthenticated();
    if (!isValid && isAuthenticated) {
      setIsAuthenticated(false);
    }
    return isValid;
  };

  // Función para renovar token con control de estados
  const refreshToken = async (): Promise<boolean> => {
    if (isRefreshing) {
      console.log('Ya se está renovando el token, esperando...');
      return false;
    }
    
    setIsRefreshing(true);
    try {
      const newToken = await authService.refreshToken();
      if (newToken) {
        setIsAuthenticated(true);
        console.log('Token renovado exitosamente');
        return true;
      } else {
        console.warn('No se pudo renovar el token');
        setIsAuthenticated(false);
        return false;
      }
    } catch (error) {
      console.error('Error al renovar token:', error);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsRefreshing(false);
    }
  };

  // Función para manejar la renovación automática de forma controlada
  const handleAutoRefresh = async (): Promise<void> => {
    if (isRefreshing) return;

    const isValid = checkTokenValidity();
    if (!isValid) {
      // Si el token no es válido, intentar renovar una vez
      const refreshed = await refreshToken();
      if (!refreshed) {
        toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        authService.logout();
        setIsAuthenticated(false);
      }
      return;
    }

    // Si el token es válido, verificar si necesita renovación pronto
    if (authService.shouldRefreshToken()) {
      console.log('Renovando token automáticamente...');
      const refreshed = await refreshToken();
      if (refreshed) {
        toast.success('Sesión renovada automáticamente');
      } else {
        toast.error('No se pudo renovar la sesión. Por favor, inicia sesión nuevamente.');
        authService.logout();
        setIsAuthenticated(false);
      }
    }
  };

  // Inicialización mejorada
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = authService.getToken();
        if (!token) {
          setIsAuthenticated(false);
          return;
        }

        const isValid = authService.isAuthenticated();
        if (isValid) {
          setIsAuthenticated(true);
          // Verificar si necesita renovación pronto
          if (authService.needsRefreshSoon()) {
            await handleAutoRefresh();
          }
        } else {
          // Token expirado, intentar renovar
          const refreshed = await refreshToken();
          if (!refreshed) {
            console.log('Refresh token falló, redirigiendo al login');
            authService.logout();
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Error al inicializar autenticación:', error);
        setIsAuthenticated(false);
        authService.logout();
      } finally {
        // Asegurar que isLoading siempre se ponga en false
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Verificación periódica mejorada
  useEffect(() => {
    if (!isAuthenticated || isLoading) return;

    const tokenCheckInterval = setInterval(async () => {
      if (!isRefreshing) {
        await handleAutoRefresh();
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(tokenCheckInterval);
  }, [isAuthenticated, isLoading, isRefreshing]);

  // Verificación cuando la ventana recupera el foco
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden && isAuthenticated && !isRefreshing && !isLoading) {
        await handleAutoRefresh();
      }
    };

    const handleFocus = async () => {
      if (isAuthenticated && !isRefreshing && !isLoading) {
        await handleAutoRefresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated, isRefreshing, isLoading]);

  const login = (token: string, refreshToken?: string) => {
    authService.setToken(token);
    if (refreshToken) {
      authService.setRefreshToken(refreshToken);
    }
    setIsAuthenticated(true);
    toast.success('Sesión iniciada correctamente');
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    toast.success('Sesión cerrada correctamente');
  };

  const register = async (name: string, email: string, password: string, code: string): Promise<RegisterResponse> => {
    const response = await authService.register({ name, email, password, code });
    toast.success('Registro exitoso. Por favor inicia sesión.');
    return response;
  };

  // Componente de loading mejorado
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      login, 
      logout, 
      register, 
      checkTokenValidity, 
      refreshToken, 
      isRefreshing 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}