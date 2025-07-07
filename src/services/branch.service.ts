import { AxiosError } from 'axios';
import { Branch, CreateBranchDTO } from '../types/branch';
import axiosInstance from '../config/axios';

export const branchService = {
  async getBranches(): Promise<Branch[]> {
    try {
      const response = await axiosInstance.get<Branch[]>('/sucursales');
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Error al obtener las sucursales');
      }
      throw error;
    }
  },

  async createBranch(branchData: CreateBranchDTO): Promise<Branch> {
    try {
      const response = await axiosInstance.post<Branch>('/sucursales', branchData);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Error al crear la sucursal');
      }
      throw error;
    }
  },

  async updateBranch(id: number, branchData: CreateBranchDTO): Promise<Branch> {
    try {
      const response = await axiosInstance.put<Branch>(`/sucursales/${id}`, branchData);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Error al actualizar la sucursal');
      }
      throw error;
    }
  },

  async deleteBranch(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`/sucursales/${id}`);
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Error al eliminar la sucursal');
      }
      throw error;
    }
  }
};