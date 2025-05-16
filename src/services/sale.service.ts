import axiosInstance from '../config/axios';
import { AxiosError } from 'axios';
import { Sale } from '../types/sale';

export const saleService = {
  async getSales(): Promise<Sale[]> {
    try {
      const response = await axiosInstance.get<Sale[]>('/venta');
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Error al obtener las ventas');
      }
      throw error;
    }
  },

  async createSale(saleData: any): Promise<Sale> {
    try {
      const response = await axiosInstance.post<Sale>('/venta', saleData);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Error al crear la venta');
      }
      throw error;
    }
  },

  async exportExcel(fechaInicio: string, fechaFin: string): Promise<string> {
    const response = await axiosInstance.get('/venta/export', {
      params: { fechaInicio, fechaFin }
    });
    if (!response.data || !response.data.file) throw new Error('Respuesta inválida del servidor');
    return response.data.file;
  }
}; 