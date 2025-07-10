import axios from 'axios';
import { useLoadingStore } from '../store/loadingStore';
import { authService } from '../services/auth.service';
import toast from 'react-hot-toast';

// Función para determinar la URL base correcta
const getBaseURL = () => {
  // Si hay una variable de entorno específica, úsala
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // En desarrollo
  if (import.meta.env.DEV) {
    return 'http://localhost:3000/api';
  }
  
  // En producción en Railway
  // Usar la URL interna de Railway para la API
  return 'https://carwashapi.railway.internal/api';
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag para evitar múltiples intentos de renovación simultáneos
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    useLoadingStore.getState().showLoading();
    
    // Añadir token a todas las peticiones si existe
    const token = authService.getToken();
    if (token && !authService.isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    useLoadingStore.getState().hideLoading();
    return Promise.reject(error);
  }
);

// Response interceptor con renovación automática
axiosInstance.interceptors.response.use(
  (response) => {
    useLoadingStore.getState().hideLoading();
    return response;
  },
  async (error) => {
    useLoadingStore.getState().hideLoading();
    
    const originalRequest = error.config;
    
    // Si recibimos 401 y no hemos intentado renovar aún
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      if (isRefreshing) {
        // Si ya estamos renovando, esperar en cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await authService.refreshToken();
        
        if (newToken) {
          // Token renovado exitosamente
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        } else {
          // No se pudo renovar el token
          processQueue(new Error('Token refresh failed'), null);
          
          // Redirigir al login
          window.location.href = '/login';
          toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // Limpiar tokens y redirigir al login
        authService.logout();
        window.location.href = '/login';
        toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    // Para otros errores, simplemente rechazar
    return Promise.reject(error);
  }
);

export default axiosInstance;