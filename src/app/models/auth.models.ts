export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  phone?: string;
  role_id?: number;
}

export interface UsernameRequest {
  username: string;
  newEmail: string;
  phone: string;
  newUsername: string;
}

export interface UserNewPasswordRequest {
  password: string;
}

export interface EmailResponse {
  email: string;
}

export interface UserProvidedCodeResponse {
  code: string;
}
