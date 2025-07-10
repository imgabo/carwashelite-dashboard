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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Función para verificar la validez del token
  const checkTokenValidity = (): boolean => {
    const isValid = authService.isAuthenticated();
    if (!isValid && isAuthenticated) {
      // Si el token no es válido pero el estado dice que está autenticado
      setIsAuthenticated(false);
      toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
    }
    return isValid;
  };

  // Nueva función para renovar token manualmente
  const refreshToken = async (): Promise<boolean> => {
    if (isRefreshing) return false;
    
    setIsRefreshing(true);
    try {
      const newToken = await authService.refreshToken();
      if (newToken) {
        setIsAuthenticated(true);
        toast.success('Sesión renovada automáticamente');
        return true;
      } else {
        setIsAuthenticated(false);
        toast.error('No se pudo renovar la sesión. Por favor, inicia sesión nuevamente.');
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

  // Función para intentar renovación automática
  const tryAutoRefresh = async (): Promise<boolean> => {
    if (isRefreshing) return false;

    const shouldRefresh = authService.shouldRefreshToken();
    if (shouldRefresh) {
      console.log('Intentando renovación automática del token...');
      return await refreshToken();
    }
    return true;
  };

  useEffect(() => {
    // Verificar autenticación cuando el componente se monta
    const initializeAuth = async () => {
      try {
        const isValid = authService.isAuthenticated();
        
        if (isValid) {
          // Si el token es válido, verificar si necesita renovación
          await tryAutoRefresh();
          setIsAuthenticated(true);
        } else {
          const token = authService.getToken();
          if (token) {
            // Si hay un token pero no es válido, intentar renovar
            const refreshed = await refreshToken();
            if (!refreshed) {
              toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
              authService.logout();
            }
          }
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        setIsAuthenticated(false);
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Verificar y renovar el token cada 5 minutos
    const tokenCheckInterval = setInterval(async () => {
      if (isAuthenticated && !isRefreshing) {
        const isValid = checkTokenValidity();
        if (isValid) {
          await tryAutoRefresh();
        }
      }
    }, 5 * 60 * 1000); // 5 minutos

    // Limpiar el intervalo cuando el componente se desmonte
    return () => {
      clearInterval(tokenCheckInterval);
    };
  }, [isAuthenticated]);

  // Verificar validez del token cuando la ventana recupera el foco
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden && isAuthenticated && !isRefreshing) {
        const isValid = checkTokenValidity();
        if (isValid) {
          await tryAutoRefresh();
        }
      }
    };

    const handleFocus = async () => {
      if (isAuthenticated && !isRefreshing) {
        const isValid = checkTokenValidity();
        if (isValid) {
          await tryAutoRefresh();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated, isRefreshing]);

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

  // Mostrar loading mientras se está verificando la autenticación inicial
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, register, checkTokenValidity, refreshToken }}>
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