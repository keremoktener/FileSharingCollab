// User related types
export interface User {
  id: number;
  username: string;
  email: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
}

// File related types
export interface FileInfo {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  deleted?: boolean;
  deletedAt?: string;
} 