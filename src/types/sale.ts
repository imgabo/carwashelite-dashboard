export interface Sale {
  id: number;
  cliente: {
    id: number;
    name: string;
    apellido: string;
  };
  servicios: {
    id: number;
    nombre: string;
    precio: number;
  }[];
  sucursal: {
    id: number;
    nombre: string;
  };
  fecha: string;
  total: number;
  pagado?: boolean;
  createdAt?: string;
}

export interface CreateSaleDTO {
  clienteId: number;
  servicios: {
    id?: number;
    nombre?: string;
    precio?: number;
    descripcion?: string;
  }[];
  sucursalId: number;
} 