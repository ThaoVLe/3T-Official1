// Common types shared between web and mobile apps
export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  userId: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// API response types
export type ApiResponse<T> = {
  data: T;
  error?: never;
} | {
  data?: never;
  error: string;
};
