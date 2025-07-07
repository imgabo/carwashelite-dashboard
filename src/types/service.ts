export interface Service {
  id: number;
  nombre: string;
  precio: number;
}

export interface CreateServiceDTO {
  nombre: string;
  precio: number;
}

export interface UpdateServiceDTO {
  nombre: string;
  precio: number;
}