export interface LoginDTO {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  code: string;
}

export interface RegisterResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}