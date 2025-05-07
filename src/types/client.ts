export interface Company {
  id: number;
  name: string;
}

export interface Client {
  id: number;
  name: string;
  apellido: string;
  telefono: string;
  empresa: Company;
}

export interface CreateClientDTO {
  name: string;
  apellido: string;
  telefono: string;
  empresaId: number;
  empresaNombre: string;
} 