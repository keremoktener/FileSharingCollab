import React, { useCallback, useState } from 'react';
import { FileInfo, FolderInfo } from '../types';
import FileList from './FileList';
import FolderList from './FolderList';
import { fileService } from '../services/api'; // Import fileService for uploads
import toast from 'react-hot-toast'; // Import toast for notifications
import { Home, ChevronRight, ArrowLeft, Folder as FolderIcon, Edit, Trash, Share, File as FileIcon, UploadCloud } from 'react-feather';
import { useDropzone } from 'react-dropzone'; // Re-enable import

interface FolderViewProps {
  currentFolder: FolderInfo;
  subfolders: FolderInfo[];
  files: FileInfo[];
  breadcrumbs: FolderInfo[];
  loading: boolean;
  refreshKey: number;
  onNavigateBack: () => void; // Keep for potential use, though breadcrumbs are primary
  onBreadcrumbClick: (index: number) => void;
  onFolderClick: (folderId: number) => void;
  onFileAction: () => void; // General refresh after file actions
  onFolderAction: () => void; // General refresh after folder actions
  onShareFile: (file: FileInfo) => void;
  onShareFolder: (folder: FolderInfo) => void;
  onRenameFolder: (folder: FolderInfo) => void; // Prop for triggering rename
  onDeleteFolder: (folder: FolderInfo) => void; // Prop for triggering delete
  onFileUploaded: () => void; // Callback after file upload
}

const FolderView: React.FC<FolderViewProps> = ({
  currentFolder,
  subfolders,
  files,
  breadcrumbs,
  loading,
  refreshKey,
  onNavigateBack,
  onBreadcrumbClick,
  onFolderClick,
  onFileAction,
  onFolderAction,
  onShareFile,
  onShareFolder,
  onRenameFolder,
  onDeleteFolder,
  onFileUploaded
}) => {

  const [isUploading, setIsUploading] = useState(false);

  // Keep onDrop commented out
  // const onDrop = useCallback(async (acceptedFiles: File[]) => {
  //   if (!currentFolder) return;
  //   if (acceptedFiles.length === 0) return;

  //   setIsUploading(true);
  //   const uploadPromises = acceptedFiles.map(file => 
  //     fileService.uploadFileToFolder(file, currentFolder.id)
  //       .then(() => toast.success(`${file.name} uploaded successfully!`))
  //       .catch(error => {
  //         console.error(`Error uploading ${file.name}:`, error);
  //         toast.error(`Failed to upload ${file.name}`);
  //       })
  //   );

  //   try {
  //     await Promise.all(uploadPromises);
  //   } finally {
  //     setIsUploading(false);
  //     onFileUploaded(); 
  //   }
  // }, [currentFolder, onFileUploaded]);

  // Re-enable useDropzone hook call with minimal options
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    // Minimal options for testing
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8 animate-fadeIn">
      {/* Redesigned Header Section */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        {/* Left Side: Icon, Name, Breadcrumbs */}
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-3">
            <FolderIcon className="w-8 h-8 text-yellow-500 dark:text-yellow-400 flex-shrink-0" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white truncate" title={currentFolder.name}>
              {currentFolder.name}
            </h1>
          </div>
          {/* Breadcrumbs - smaller font */}
          <nav className="flex items-center text-xs text-gray-500 dark:text-gray-400 ml-11"> {/* Indent to align with text */}
            <button
              onClick={() => onBreadcrumbClick(-1)} // -1 signifies root
              className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              Home
            </button>
            {breadcrumbs.map((folder, index) => (
              <React.Fragment key={folder.id}>
                <ChevronRight size={14} className="mx-1" />
                <button
                  onClick={() => onBreadcrumbClick(index)}
                  className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                >
                  {folder.name}
                </button>
              </React.Fragment>
            ))}
            {/* Current folder is implicitly the last part */}
          </nav>
        </div>

        {/* Right Side: Folder Actions (Icon Buttons) */}
        <div className="flex items-center space-x-1">
          <button 
            onClick={() => onShareFolder(currentFolder)}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
            title="Share Folder"
          >
            <Share size={18} />
          </button>
          <button 
            onClick={() => onRenameFolder(currentFolder)} // Use the passed prop
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
            title="Rename Folder"
          >
            <Edit size={18} />
          </button>
          <button 
            onClick={() => onDeleteFolder(currentFolder)} // Use the passed prop
            className="p-2 rounded-md hover:bg-red-100 dark:hover:bg-red-800 text-red-600 dark:text-red-400 transition-colors"
            title="Delete Folder"
          >
            <Trash size={18} />
          </button>
        </div>
      </div>

      {/* Drag and Drop Upload Area - Use actual hook props */}
      <div 
        {...getRootProps()}
        className={`relative p-6 rounded-lg text-center transition-all duration-200 ease-in-out 
          ${isDragActive 
            ? 'border-2 border-dashed border-blue-500 bg-blue-50 dark:bg-blue-900/30' 
            : 'border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
          } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`
        }
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
          <UploadCloud className={`w-10 h-10 ${isDragActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
          {isUploading ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">Uploading files...</p>
          ) : isDragActive ? (
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Drop files here to upload</p>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Drag & drop files here to upload to "<span className="font-medium text-gray-700 dark:text-gray-300">{currentFolder.name}</span>"
            </p>
          )}
        </div>
      </div>
      
      {/* Subfolders Section */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600 pb-2 mb-4 flex items-center">
          <FolderIcon size={18} className="mr-2 text-yellow-500 dark:text-yellow-400 flex-shrink-0" />
          Subfolders
        </h2>
        
      </div>

      {/* Files Section */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600 pb-2 mb-4 flex items-center">
          <FileIcon size={18} className="mr-2 text-blue-500 flex-shrink-0" />
          Files in "{currentFolder.name}"
        </h2>
        {loading && !files.length ? ( // Show skeleton only if loading AND no files are present yet
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            {/* Skeleton Loader */}
            <div className="animate-pulse space-y-4">
              {/* Simplified skeleton for files */}
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
              <div className="space-y-2">
                {[1, 2, 3].map((item) => (
                  <div key={`skeleton-file-${item}-${refreshKey}`} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <FileList 
            files={files} 
            onFileAction={onFileAction} 
            onShare={onShareFile}
            currentFolderId={currentFolder.id}
            folders={subfolders} // Pass subfolders for the Move modal
            onFileMove={onFileAction}
          />
        )}
      </div>
    </div>
  );
};

export default FolderView; 