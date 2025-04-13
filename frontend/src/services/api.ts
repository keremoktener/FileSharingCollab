import axios from 'axios';
import { AuthResponse, LoginRequest, RegisterRequest, FileInfo, FolderInfo, CreateFolderRequest, SharedItemInfo, ShareItemRequest, AccessType } from '../types';

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
  
  getRootFiles: async (): Promise<FileInfo[]> => {
    const response = await api.get<FileInfo[]>('/files/root');
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
  
  uploadFileToFolder: async (file: File, folderId: number): Promise<FileInfo> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<FileInfo>(`/files/upload/folder/${folderId}`, formData, {
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
    return response.data;
  },
  
  moveFile: async (fileId: number, folderId?: number): Promise<FileInfo> => {
    const url = `/files/${fileId}/move`;
    const response = await api.put<FileInfo>(url, { folderId });
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

// Folder related API calls
export const folderService = {
  getAllFolders: async (): Promise<FolderInfo[]> => {
    const response = await api.get<FolderInfo[]>('/folders');
    return response.data;
  },
  
  getRootFolders: async (): Promise<FolderInfo[]> => {
    const response = await api.get<FolderInfo[]>('/folders/root');
    return response.data;
  },
  
  getSubfolders: async (folderId: number): Promise<FolderInfo[]> => {
    const response = await api.get<FolderInfo[]>(`/folders/${folderId}/subfolders`);
    return response.data;
  },
  
  getFilesInFolder: async (folderId: number): Promise<FileInfo[]> => {
    const response = await api.get<FileInfo[]>(`/folders/${folderId}/files`);
    return response.data;
  },
  
  createFolder: async (data: CreateFolderRequest): Promise<FolderInfo> => {
    const response = await api.post<FolderInfo>('/folders', data);
    return response.data;
  },
  
  deleteFolder: async (folderId: number): Promise<any> => {
    const response = await api.delete(`/folders/${folderId}`);
    return response.data;
  },
  
  downloadFolder: async (folderId: number): Promise<Blob> => {
    const response = await api.get<Blob>(`/folders/${folderId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

// Sharing related API calls
export const sharingService = {
  shareItem: async (request: ShareItemRequest): Promise<SharedItemInfo> => {
    const response = await api.post<SharedItemInfo>('/share', request);
    return response.data;
  },
  
  getSharedByMe: async (): Promise<SharedItemInfo[]> => {
    const response = await api.get<SharedItemInfo[]>('/share/by-me');
    return response.data;
  },
  
  getSharedWithMe: async (): Promise<SharedItemInfo[]> => {
    const response = await api.get<SharedItemInfo[]>('/share/with-me');
    return response.data;
  },
  
  revokeSharing: async (sharedItemId: number): Promise<any> => {
    const response = await api.delete(`/share/${sharedItemId}`);
    return response.data;
  },
  
  getPublicSharedItem: async (publicLink: string): Promise<SharedItemInfo> => {
    const response = await api.get<SharedItemInfo>(`/public/${publicLink}`);
    return response.data;
  },
  
  downloadPublicItem: async (publicLink: string): Promise<Blob> => {
    const response = await api.get<Blob>(`/public/${publicLink}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },
  
  getPublicUrl: (publicLink: string): string => {
    return `${window.location.origin}/share/${publicLink}`;
  }
};

export default api; 