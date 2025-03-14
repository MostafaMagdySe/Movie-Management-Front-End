export interface UserProvidedCodeResponse {
  code: string;
}

export interface UserNewPasswordRequest {
  password: string;
}

export interface ResetPasswordResponse {
  status: 'FOUND' | 'NOT_FOUND' | 'RATE_LIMITED';
  message: string;
} 