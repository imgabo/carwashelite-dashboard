import axiosInstance from '../config/axios';
import { AxiosError } from 'axios';
import { LoginDTO, LoginResponse, RegisterDTO, RegisterResponse } from '../types/auth';

const TOKEN_KEY = 'auth_token';

export const authService = {
  async login(credentials: LoginDTO): Promise<LoginResponse> {
    try {
      const response = await axiosInstance.post<LoginResponse>('/auth/login', credentials);
      this.setToken(response.data.token);
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

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    // Configurar el token en axiosInstance para todas las peticiones futuras
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    delete axiosInstance.defaults.headers.common['Authorization'];
  },

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Verificar si el token es válido (no expirado)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convertir a milisegundos
      return Date.now() < expirationTime;
    } catch {
      return false;
    }
  },

  logout(): void {
    this.removeToken();
  }
};