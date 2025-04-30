import React, { useState } from 'react';
import { FolderInfo } from '../types';
import { folderService } from '../services/api';
import toast from 'react-hot-toast';
import { FolderPlus, Folder, MoreVertical, Download, Trash, Share, ChevronRight, Calendar, File as FileIcon } from 'react-feather';

// Display mode enum (matching Dashboard component)
enum DisplayMode {
  GRID,
  LIST
}

interface FolderListProps {
  folders: FolderInfo[];
  onFolderAction: () => void;
  onFolderClick: (folderId: number) => void;
  onShare: (folder: FolderInfo) => void;
  currentFolder?: FolderInfo | null;
  displayMode?: DisplayMode;
}

const FolderList: React.FC<FolderListProps> = ({ 
  folders, 
  onFolderAction, 
  onFolderClick,
  onShare,
  currentFolder,
  displayMode = DisplayMode.GRID
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

  // Grid view (default card layout)
  const renderGridView = () => (
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
              <FileIcon size={12} className="mr-1" />
              <span>{folder.fileCount} {folder.fileCount === 1 ? 'file' : 'files'}</span>
            </div>
            <div className="flex items-center">
              <Folder size={12} className="mr-1" />
              <span>{folder.subfolderCount} {folder.subfolderCount === 1 ? 'folder' : 'folders'}</span>
            </div>
            <div className="flex items-center">
              <Calendar size={12} className="mr-1" />
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
  );

  // List view (table layout)
  const renderListView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Files
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Subfolders
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Created
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {folders.map((folder) => (
            <tr 
              key={folder.id}
              className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                currentFolder?.id === folder.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => onFolderClick(folder.id)}>
                <div className="flex items-center">
                  <div className="rounded-md p-2 bg-yellow-100 dark:bg-yellow-900/30 mr-3">
                    <Folder className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {folder.name}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {folder.fileCount}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {folder.subfolderCount}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(folder.createdAt)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => onShare(folder)}
                    className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    title="Share folder"
                  >
                    <Share size={16} />
                  </button>
                  <button
                    onClick={() => handleDownload(folder)}
                    className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    title="Download folder"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => confirmDeleteFolder(folder)}
                    className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    title="Delete folder"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      {displayMode === DisplayMode.GRID ? renderGridView() : renderListView()}

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