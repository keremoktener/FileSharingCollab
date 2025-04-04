import axios from 'axios';
import { AuthResponse, LoginRequest, RegisterRequest, FileInfo } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add interceptor to add the token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth related API calls
export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<any> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// File related API calls
export const fileService = {
  getAllFiles: async (): Promise<FileInfo[]> => {
    const response = await api.get<FileInfo[]>('/files');
    return response.data;
  },

  uploadFile: async (file: File): Promise<FileInfo> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<FileInfo>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  downloadFile: async (fileId: number): Promise<Blob> => {
    const response = await api.get<Blob>(`/files/download/${fileId}`, {
      responseType: 'blob'
    });
    return response.data;
  },
  
  viewFile: async (fileId: number): Promise<Blob> => {
    const response = await api.get(`/files/view/${fileId}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  deleteFile: async (fileId: number): Promise<any> => {
    const response = await api.delete(`/files/${fileId}`);
    return response.data;
  },
  
  renameFile: async (fileId: number, newName: string): Promise<FileInfo> => {
    const response = await api.put<FileInfo>(`/files/${fileId}/rename`, { newName });
    console.log('Rename response:', response);
    return response.data;
  },
  
  getFileViewUrl: (fileId: number): string => {
    return `${API_URL}/files/view/${fileId}`;
  },

  batchDownloadFiles: async (fileIds: number[]): Promise<Blob> => {
    const response = await api.post<Blob>('/files/batch-download', { fileIds }, {
      responseType: 'blob'
    });
    return response.data;
  }
};

export default api; 