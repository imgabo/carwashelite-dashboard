import axios from 'axios';
import { useLoadingStore } from '../store/loadingStore';

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

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    useLoadingStore.getState().showLoading();
    return config;
  },
  (error) => {
    useLoadingStore.getState().hideLoading();
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    useLoadingStore.getState().hideLoading();
    return response;
  },
  (error) => {
    useLoadingStore.getState().hideLoading();
    return Promise.reject(error);
  }
);

export default axiosInstance;