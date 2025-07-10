export interface Sale {
  id: number;
  cliente: {
    id: number;
    name: string;
    apellido: string;
    telefono?: string;
  };
  servicios: {
    id: number;
    nombre: string;
    precio: number;
  }[];
  serviciosPersonalizados?: {
    nombre: string;
    precio: number;
    descripcion: string;
  }[];
  sucursal: {
    id: number;
    nombre: string;
    direccion?: string;
  };
  fecha: string;
  total: number;
  pagado?: boolean;
  createdAt?: string;
  patente?: string;
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
  patente?: string;
}