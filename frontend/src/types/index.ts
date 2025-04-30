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
  folderId?: number;
  thumbnailUrl?: string;
  modifiedAt?: string;
  createdAt: string;
}

// Folder related types
export interface FolderInfo {
  id: number;
  name: string;
  parentId?: number;
  createdAt: string;
  fileCount: number;
  subfolderCount: number;
}

export interface CreateFolderRequest {
  name: string;
  parentId?: number;
}

// Sharing related types
export enum AccessType {
  VIEW = 'VIEW',
  COMMENT = 'COMMENT',
  EDIT = 'EDIT'
}

export interface SharedItemInfo {
  id: number;
  ownerName: string;
  sharedWithEmail?: string;
  fileId?: number;
  fileName?: string;
  folderId?: number;
  folderName?: string;
  access: AccessType;
  publicLink: string;
  expiryDate?: string;
  createdAt: string;
  isFolder: boolean;
  name: string;
  sharedAt: string;
  sharedBy: string;
}

export interface ShareItemRequest {
  fileId?: number;
  folderId?: number;
  userEmail?: string;
  access: AccessType;
  isPublic: boolean;
  expiryDate?: string;
} 