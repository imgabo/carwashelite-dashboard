import axiosInstance from '../config/axios';
import { AxiosError } from 'axios';
import { Sale, CreateSaleDTO } from '../types/sale';

export const saleService = {
  async getSales(): Promise<Sale[]> {
    try {
      const response = await axiosInstance.get<Sale[]>('/ventas');
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Error al obtener las ventas');
      }
      throw error;
    }
  },

  async createSale(saleData: CreateSaleDTO): Promise<Sale> {
    try {
      const response = await axiosInstance.post<Sale>('/ventas', saleData);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Error al crear la venta');
      }
      throw error;
    }
  }
}; 