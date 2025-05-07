import axios from 'axios';
import { Company } from '../types/client';

const API_URL = 'http://localhost:3000/api';

export const companyService = {
  async getCompanies(): Promise<Company[]> {
    try {
      const response = await axios.get<Company[]>(`${API_URL}/empresas`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error al obtener las empresas');
      }
      return [];
    }
  }
}; 