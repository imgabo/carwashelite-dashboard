import { Service, CreateServiceDTO } from '../types/service';
import axiosInstance from '../config/axios';
import { AxiosError } from 'axios';

export const serviceService = {
  async getServices(): Promise<Service[]> {
    try {
      const response = await axiosInstance.get<Service[]>('/servicios');
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Error al obtener los servicios');
      }
      throw error;
    }
  },

  async createService(serviceData: CreateServiceDTO): Promise<Service> {
    try {
      const response = await axiosInstance.post<Service>('/servicios', serviceData);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Error al crear el servicio');
      }
      throw error;
    }
  },

  async deleteService(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`/servicios/${id}`);
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Error al eliminar el servicio');
      }
      throw error;
    }
  }
};