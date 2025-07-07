import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/auth.service';
import { RegisterResponse } from '../types/auth';
import toast from 'react-hot-toast';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  register: (name: string, email: string, password: string, code: string) => Promise<RegisterResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return authService.isAuthenticated();
  });

  useEffect(() => {
    // Verificar autenticación cuando el componente se monta
    const token = authService.getToken();
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (token: string) => {
    authService.setToken(token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
  };

  const register = async (name: string, email: string, password: string, code: string): Promise<RegisterResponse> => {
    const response = await authService.register({ name, email, password, code });
    toast.success('Registro exitoso. Por favor inicia sesión.');
    return response;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, register }}>
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