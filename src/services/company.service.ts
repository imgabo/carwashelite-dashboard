import axiosInstance from '../config/axios';
import { AxiosError } from 'axios';
import { Company } from '../types/client';

export const companyService = {
  async getCompanies(): Promise<Company[]> {
    try {
      const response = await axiosInstance.get<Company[]>('/empresas');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Error al obtener las empresas');
      }
      return [];
    }
  }
};