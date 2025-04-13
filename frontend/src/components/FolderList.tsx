import React, { useState } from 'react';
import { FolderInfo } from '../types';
import { folderService } from '../services/api';
import toast from 'react-hot-toast';
import { FolderPlus, Folder, MoreVertical, Download, Trash, Share, ChevronRight } from 'react-feather';

interface FolderListProps {
  folders: FolderInfo[];
  onFolderAction: () => void;
  onFolderClick: (folderId: number) => void;
  onShare: (folder: FolderInfo) => void;
  currentFolder?: FolderInfo | null;
}

const FolderList: React.FC<FolderListProps> = ({ 
  folders, 
  onFolderAction, 
  onFolderClick,
  onShare,
  currentFolder 
}) => {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [folderToDelete, setFolderToDelete] = useState<FolderInfo | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  const handleDownload = async (folder: FolderInfo) => {
    try {
      toast.loading(`Preparing folder download...`, { id: `download-folder-${folder.id}` });
      const blob = await folderService.downloadFolder(folder.id);
      toast.success('Download ready!', { id: `download-folder-${folder.id}` });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${folder.name}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading folder:', error);
      toast.error('Failed to download folder', { id: `download-folder-${folder.id}` });
    }
  };

  const confirmDeleteFolder = (folder: FolderInfo) => {
    setFolderToDelete(folder);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!folderToDelete) return;
    
    try {
      setDeletingId(folderToDelete.id);
      await folderService.deleteFolder(folderToDelete.id);
      toast.success('Folder deleted successfully');
      onFolderAction();
      setShowDeleteConfirm(false);
      setFolderToDelete(null);
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Failed to delete folder');
    } finally {
      setDeletingId(null);
    }
  };

  // Format date to a more readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const toggleDropdown = (e: React.MouseEvent, folderId: number) => {
    e.stopPropagation();
    if (activeDropdown === folderId) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(folderId);
    }
  };

  const closeDropdown = () => {
    setActiveDropdown(null);
  };

  if (folders.length === 0) {
    return (
      <div className="text-center p-6 border border-dashed rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
        <FolderPlus className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No folders</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new folder</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {folders.map((folder) => (
          <div 
            key={folder.id} 
            className={`relative bg-white dark:bg-gray-800 rounded-md shadow-md p-5 
              hover:shadow-lg hover:scale-105 transform transition-all duration-200 cursor-pointer
              border border-gray-100 dark:border-gray-700
              ${currentFolder?.id === folder.id 
                ? 'ring-2 ring-blue-500 dark:ring-blue-400' 
                : ''
              }`}
            onClick={() => {
              onFolderClick(folder.id);
              closeDropdown();
            }}
          >
            {/* Folder Icon and Name */}
            <div className="flex items-center mb-3 relative">
              <div className="rounded-md p-2 bg-yellow-100 dark:bg-yellow-900/30 mr-3">
                <Folder className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium truncate text-gray-800 dark:text-gray-200" title={folder.name}>
                  {folder.name}
                </h3>
              </div>
              
              {/* Actions Dropdown */}
              <div className="relative">
                <button 
                  onClick={(e) => toggleDropdown(e, folder.id)}
                  className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Folder options"
                >
                  <MoreVertical size={18} className="text-gray-500 dark:text-gray-400" />
                </button>
                
                {activeDropdown === folder.id && (
                  <div 
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 py-1 border border-gray-100 dark:border-gray-700"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(folder);
                        closeDropdown();
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Download size={16} className="mr-2" />
                      <span>Download</span>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onShare(folder);
                        closeDropdown();
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Share size={16} className="mr-2" />
                      <span>Share</span>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDeleteFolder(folder);
                        closeDropdown();
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash size={16} className="mr-2" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Folder Info */}
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mb-3">
              <div className="flex items-center">
                <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 5H21V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 5H21V8H3V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{folder.fileCount} {folder.fileCount === 1 ? 'file' : 'files'}</span>
              </div>
              <div className="flex items-center">
                <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 10V7C20 5.89543 19.1046 5 18 5H6C4.89543 5 4 5.89543 4 7V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{folder.subfolderCount} {folder.subfolderCount === 1 ? 'folder' : 'folders'}</span>
              </div>
              <div className="flex items-center">
                <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Created {formatDate(folder.createdAt)}</span>
              </div>
            </div>
            
            {/* Open Indicator */}
            <div className="absolute bottom-4 right-4">
              <ChevronRight size={18} className="text-gray-400 dark:text-gray-500" />
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && folderToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Delete Folder</h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Are you sure you want to delete the folder "<span className="font-semibold">{folderToDelete.name}</span>"? 
              This will also delete all files inside the folder.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                className="px-4 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 rounded-md text-white bg-red-500 hover:bg-red-600 transition-colors"
                onClick={handleDelete}
                disabled={deletingId !== null}
              >
                {deletingId !== null ? 'Deleting...' : 'Delete Folder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FolderList; 