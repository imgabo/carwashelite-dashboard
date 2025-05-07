export interface Branch {
  id: number;
  nombre: string;
  direccion: string;
}

export interface CreateBranchDTO {
  nombre: string;
  direccion: string;
} 