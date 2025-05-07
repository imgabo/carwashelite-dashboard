import axios from 'axios';
import { useLoadingStore } from '../store/loadingStore';

const API_URL = 'http://localhost:3000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
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