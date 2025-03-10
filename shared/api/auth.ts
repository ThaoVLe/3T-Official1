import type { User, AuthResponse, ApiResponse } from '../types/schema';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  name: string;
}

// Platform-agnostic API functions
export const AUTH_ENDPOINTS = {
  login: '/api/auth/login',
  signup: '/api/auth/signup',
  logout: '/api/auth/logout',
};

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export type AuthState = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
};
