import axiosInstance from '../config/axios';
import { AxiosError } from 'axios';
import { Client, CreateClientDTO } from '../types/client';

export const clientService = {
  async getClients(): Promise<Client[]> {
    try {
      const response = await axiosInstance.get<Client[]>('/clientes');
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Error al obtener los clientes');
      }
      throw error;
    }
  },

  async getClientById(id: number): Promise<Client> {
    try {
      const response = await axiosInstance.get<Client>(`/clientes/${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Error al obtener el cliente');
      }
      throw error;
    }
  },

  async createClient(clientData: CreateClientDTO): Promise<Client> {
    try {
      const response = await axiosInstance.post<Client>('/clientes', clientData);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Error al crear el cliente');
      }
      throw error;
    }
  },

  async deleteClient(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`/clientes/${id}`);
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Error al eliminar el cliente');
      }
      throw error;
    }
  },

  async updateClient(id: number, clientData: Partial<CreateClientDTO>): Promise<Client> {
    try {
      const response = await axiosInstance.patch<Client>(`/clientes/${id}`, clientData);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Error al actualizar el cliente');
      }
      throw error;
    }
  }
}; 