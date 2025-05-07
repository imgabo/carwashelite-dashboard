import axios from 'axios';
import { Branch, CreateBranchDTO } from '../types/branch';
import axiosInstance from '../config/axios';

const API_URL = 'http://localhost:3000/api';

export const branchService = {
  async getBranches(): Promise<Branch[]> {
    try {
      const response = await axiosInstance.get<Branch[]>(`${API_URL}/sucursales`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error al obtener las sucursales');
      }
      throw error;
    }
  },

  async createBranch(branchData: CreateBranchDTO): Promise<Branch> {
    try {
      const response = await axiosInstance.post<Branch>(`${API_URL}/sucursales`, branchData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error al crear la sucursal');
      }
      throw error;
    }
  }
}; 