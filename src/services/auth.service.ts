import axiosInstance from '../config/axios';
import { AxiosError } from 'axios';
import { LoginDTO, LoginResponse, RegisterDTO, RegisterResponse } from '../types/auth';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const authService = {
  async login(credentials: LoginDTO): Promise<LoginResponse> {
    try {
      const response = await axiosInstance.post<LoginResponse>('/auth/login', credentials);
      this.setToken(response.data.token);
      // Si el backend envía refresh token, guardarlo también
      if (response.data.refreshToken) {
        this.setRefreshToken(response.data.refreshToken);
      }
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Error durante el login');
      }
      throw error;
    }
  },

  async register(data: RegisterDTO): Promise<RegisterResponse> {
    try {
      const response = await axiosInstance.post<RegisterResponse>('/auth/register', data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Error al registrar usuario');
      }
      throw error;
    }
  },

  // Función mejorada para renovar token
  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        console.warn('No refresh token available');
        this.logout(); // Limpiar tokens si no hay refresh token
        return null;
      }

      const response = await axiosInstance.post<{ token: string; refreshToken?: string }>('/auth/refresh', {
        refreshToken
      });

      const newToken = response.data.token;
      this.setToken(newToken);
      
      // Si el backend envía un nuevo refresh token, actualizarlo
      if (response.data.refreshToken) {
        this.setRefreshToken(response.data.refreshToken);
      }

      return newToken;
    } catch (error) {
      console.error('Error al renovar token:', error);
      
      // Distinguir entre diferentes tipos de errores
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        const message = error.response?.data?.message || 'Error desconocido';
        
        if (status === 401) {
          console.warn('Refresh token expirado o inválido:', message);
        } else if (status === 403) {
          console.warn('Refresh token revocado:', message);
        } else {
          console.warn('Error del servidor al renovar token:', message);
        }
        
        // Limpiar tokens solo si es un error de autenticación
        if ([401, 403].includes(status || 0)) {
          this.logout();
        }
      } else {
        console.error('Error no HTTP al renovar token:', error);
        // En caso de error de red u otro, también limpiar
        this.logout();
      }
      
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    // Configurar el token en axiosInstance para todas las peticiones futuras
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken(refreshToken: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    delete axiosInstance.defaults.headers.common['Authorization'];
  },

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convertir a milisegundos
      // Agregar un buffer de 30 segundos para evitar problemas de sincronización
      const bufferTime = 30 * 1000;
      return Date.now() >= (expirationTime - bufferTime);
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return true; // Si no se puede decodificar, considerarlo como expirado
    }
  },

  // Función simplificada sin llamadas asíncronas
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Solo verificar si el token está expirado, sin renovar automáticamente
    return !this.isTokenExpired(token);
  },

  // Nueva función para obtener información del token
  getTokenPayload(): any | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      console.error('Error al decodificar el payload del token:', error);
      return null;
    }
  },

  // Nueva función para obtener el tiempo restante del token
  getTokenTimeRemaining(): number {
    const token = this.getToken();
    if (!token) return 0;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      const timeRemaining = expirationTime - Date.now();
      return Math.max(0, timeRemaining);
    } catch (error) {
      return 0;
    }
  },

  // Función mejorada para verificar si necesita renovación
  shouldRefreshToken(): boolean {
    const timeRemaining = this.getTokenTimeRemaining();
    // Renovar si quedan menos de 10 minutos
    return timeRemaining > 0 && timeRemaining < 10 * 60 * 1000;
  },

  // Nueva función para verificar si el token necesita renovación pronto
  needsRefreshSoon(): boolean {
    const timeRemaining = this.getTokenTimeRemaining();
    // Considerar renovación si quedan menos de 5 minutos
    return timeRemaining > 0 && timeRemaining < 5 * 60 * 1000;
  },

  logout(): void {
    this.removeToken();
  }
};