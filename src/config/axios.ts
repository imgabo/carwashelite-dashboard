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

// Control mejorado para evitar múltiples intentos de renovación
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

// Request interceptor mejorado
axiosInstance.interceptors.request.use(
  (config) => {
    // Solo mostrar loading si no es una petición de renovación
    if (!config.url?.includes('/auth/refresh')) {
      useLoadingStore.getState().showLoading();
    }
    
    // Añadir token a todas las peticiones si existe y es válido
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

// Response interceptor mejorado con mejor manejo de errores
axiosInstance.interceptors.response.use(
  (response) => {
    // Solo ocultar loading si no es una petición de renovación
    if (!response.config.url?.includes('/auth/refresh')) {
      useLoadingStore.getState().hideLoading();
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Siempre ocultar loading en caso de error
    useLoadingStore.getState().hideLoading();
    
    // Si recibimos 401 y no hemos intentado renovar aún
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Evitar renovación en peticiones de login/registro
      if (originalRequest.url?.includes('/auth/login') || 
          originalRequest.url?.includes('/auth/register')) {
        return Promise.reject(error);
      }

      // Si ya estamos renovando, agregar a la cola
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          }
          return Promise.reject(error);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('Intentando renovar token desde interceptor...');
        const newToken = await authService.refreshToken();
        
        if (newToken) {
          // Token renovado exitosamente
          console.log('Token renovado exitosamente desde interceptor');
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        } else {
          // No se pudo renovar el token
          console.warn('No se pudo renovar el token desde interceptor');
          processQueue(new Error('Token refresh failed'), null);
          
          // Limpiar tokens y mostrar mensaje
          authService.logout();
          toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          
          // Redirigir al login si no estamos ya ahí
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          
          return Promise.reject(error);
        }
      } catch (refreshError) {
        console.error('Error al renovar token desde interceptor:', refreshError);
        processQueue(refreshError, null);
        
        // Limpiar tokens y mostrar mensaje
        authService.logout();
        toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        
        // Redirigir al login si no estamos ya ahí
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    // Manejo de otros errores comunes
    if (error.response?.status === 403) {
      toast.error('No tienes permisos para realizar esta acción.');
    } else if (error.response?.status === 404) {
      toast.error('El recurso solicitado no fue encontrado.');
    } else if (error.response?.status >= 500) {
      toast.error('Error del servidor. Por favor, inténtalo más tarde.');
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      toast.error('Error de conexión. Verifica tu conexión a internet.');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;