import React, { useState, useEffect, useRef } from 'react';
import { FolderInfo, CreateFolderRequest } from '../types';
import { folderService } from '../services/api';
import toast from 'react-hot-toast';
import { X, FolderPlus } from 'react-feather';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFolderCreated: () => void;
  currentFolder: FolderInfo | null;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({ 
  isOpen, 
  onClose, 
  onFolderCreated,
  currentFolder 
}) => {
  const [folderName, setFolderName] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFolderName('');
      // Focus the input when modal opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);
  
  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking the overlay
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCreateFolder = async () => {
    if (folderName.trim() === '') {
      toast.error('Folder name cannot be empty');
      return;
    }

    try {
      setIsCreating(true);

      const request: CreateFolderRequest = {
        name: folderName.trim(),
        parentId: currentFolder?.id
      };

      await folderService.createFolder(request);
      
      toast.success('Folder created successfully');
      onFolderCreated();
      onClose();
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create folder');
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && folderName.trim() !== '' && !isCreating) {
      handleCreateFolder();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleClickOutside}
    >
      <div 
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-md w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center">
            <div className="mr-3 rounded-md p-2 bg-yellow-100 dark:bg-yellow-900/30">
              <FolderPlus className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Folder</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-6">
          {currentFolder && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-sm text-blue-700 dark:text-blue-300 flex items-center">
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H9L11 6H20C20.5304 6 21.0391 6.21071 21.4142 6.58579C21.7893 6.96086 22 7.46957 22 8V19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Creating inside: <span className="font-medium ml-1">{currentFolder.name}</span>
            </div>
          )}
          
          <div>
            <label htmlFor="folder-name" className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
              Folder Name
            </label>
            <input
              ref={inputRef}
              id="folder-name"
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter folder name"
              className="w-full px-4 py-2.5 border rounded-md dark:bg-gray-700 dark:border-gray-600 
                focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400
                text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            disabled={isCreating}
          >
            Cancel
          </button>
          <button
            onClick={handleCreateFolder}
            className={`px-4 py-2 rounded-md text-white transition-colors flex items-center
              ${isCreating || folderName.trim() === '' 
                ? 'bg-blue-400 dark:bg-blue-500 cursor-not-allowed opacity-70' 
                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
              }`}
            disabled={isCreating || folderName.trim() === ''}
          >
            {isCreating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              <>Create Folder</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateFolderModal; 