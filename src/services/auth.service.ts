import axios, { AxiosError } from 'axios';
import { LoginDTO, LoginResponse } from '../types/auth';

const API_URL = 'http://localhost:3000/api';
const TOKEN_KEY = 'auth_token';

export const authService = {
  async login(credentials: LoginDTO): Promise<LoginResponse> {
    try {
      const response = await axios.post<LoginResponse>(`${API_URL}/auth/login`, credentials);
      this.setToken(response.data.token);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message: string }>;
        throw new Error(axiosError.response?.data?.message || 'Error durante el login');
      }
      throw error;
    }
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    // Configurar el token en axios para todas las peticiones futuras
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    delete axios.defaults.headers.common['Authorization'];
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