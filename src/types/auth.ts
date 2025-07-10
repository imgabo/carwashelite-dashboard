export interface LoginDTO {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string; // Añadir refresh token opcional
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  code: string;
}

export interface RegisterResponse {
  token: string;
  refreshToken?: string; // Añadir refresh token opcional
  user: {
    id: number;
    name: string;
    email: string;
  };
}