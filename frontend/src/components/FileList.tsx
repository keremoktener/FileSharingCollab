import React, { useState } from 'react';
import { FileInfo, FolderInfo } from '../types';
import { fileService } from '../services/api';
import toast from 'react-hot-toast';
import { Download, Trash, Edit, Share, Move, MoreVertical, Eye, Music, Video, Image, File as FileIcon, FileText, Code } from 'react-feather';

// Display mode enum (matching Dashboard component)
enum DisplayMode {
  GRID,
  LIST
}

interface FileListProps {
  files: FileInfo[];
  onFileAction: () => void;
  onShare?: (file: FileInfo) => void;
  currentFolderId?: number;
  folders?: FolderInfo[];
  onFileMove?: () => void;
  displayMode?: DisplayMode;
}

const FileList: React.FC<FileListProps> = ({ 
  files, 
  onFileAction, 
  onShare,
  currentFolderId,
  folders = [],
  onFileMove,
  displayMode = DisplayMode.GRID
}) => {
  const [viewingFile, setViewingFile] = useState<FileInfo | null>(null);
  const [viewingContent, setViewingContent] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newFileName, setNewFileName] = useState<string>('');
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [fileExtension, setFileExtension] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
  const [isProcessingBatch, setIsProcessingBatch] = useState<boolean>(false);
  const [showMoveModal, setShowMoveModal] = useState<boolean>(false);
  const [fileToMove, setFileToMove] = useState<FileInfo | null>(null);
  const [targetFolderId, setTargetFolderId] = useState<number | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  const toggleFileSelection = (id: number) => {
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedFiles(newSelection);
  };

  const toggleAllFiles = () => {
    if (selectedFiles.size === files.length) {
      // If all files are selected, deselect all
      setSelectedFiles(new Set());
    } else {
      // Otherwise, select all files
      setSelectedFiles(new Set(files.map(file => file.id)));
    }
  };

  const handleDownload = async (fileId: number, fileName: string) => {
    try {
      toast.loading('Preparing download...', { id: `download-${fileId}` });
      const blob = await fileService.downloadFile(fileId);
      toast.success('Download ready!', { id: `download-${fileId}` });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file', { id: `download-${fileId}` });
    }
  };

  const handleBatchDownload = async () => {
    if (selectedFiles.size === 0) {
      toast.error('No files selected');
      return;
    }

    setIsProcessingBatch(true);
    const selectedFileIds = Array.from(selectedFiles);
    
    try {
      toast.loading('Preparing files for download...', { id: 'batch-download' });
      
      // Get all files in one ZIP archive
      const blob = await fileService.batchDownloadFiles(selectedFileIds);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `files-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Download complete!', { id: 'batch-download' });
    } catch (error) {
      console.error('Error in batch download:', error);
      toast.error('Failed to download files', { id: 'batch-download' });
    } finally {
      setIsProcessingBatch(false);
    }
  };

  const handleDelete = async (fileId: number) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        setDeletingId(fileId);
        await fileService.deleteFile(fileId);
        toast.success('File deleted successfully');
        onFileAction();
      } catch (error) {
        console.error('Error deleting file:', error);
        toast.error('Failed to delete file');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleBatchDelete = async () => {
    if (selectedFiles.size === 0) {
      toast.error('No files selected');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedFiles.size} files?`)) {
      setIsProcessingBatch(true);
      const selectedFileIds = Array.from(selectedFiles);
      const total = selectedFileIds.length;
      let completed = 0;

      toast.loading(`Deleting ${total} files... (0/${total})`, { id: 'batch-delete' });

      try {
        const promises = selectedFileIds.map(async (fileId) => {
          try {
            await fileService.deleteFile(fileId);
            completed++;
            toast.loading(`Deleting ${total} files... (${completed}/${total})`, { id: 'batch-delete' });
          } catch (error) {
            console.error(`Error deleting file ${fileId}:`, error);
          }
        });

        await Promise.all(promises);
        toast.success(`Deleted ${completed}/${total} files`, { id: 'batch-delete' });
        onFileAction(); // Refresh the list
        setSelectedFiles(new Set()); // Clear selection
      } catch (error) {
        console.error('Error in batch delete:', error);
        toast.error('Failed to delete some files', { id: 'batch-delete' });
      } finally {
        setIsProcessingBatch(false);
      }
    }
  };
  
  const handleView = async (file: FileInfo) => {
    setViewingFile(file);
    
    // For direct viewing content types, get a blob URL with proper auth
    if (file.fileType.startsWith('image/') || 
        file.fileType.startsWith('video/') || 
        file.fileType.startsWith('audio/') || 
        file.fileType === 'application/pdf') {
      try {
        toast.loading('Loading preview...', { id: 'preview' });
        const blob = await fileService.viewFile(file.id);
        const url = URL.createObjectURL(blob);
        setViewingContent(url);
        toast.success('Preview ready', { id: 'preview' });
      } catch (error) {
        console.error('Error viewing file:', error);
        toast.error('Failed to load file preview', { id: 'preview' });
      }
    }
  };
  
  const closePreview = () => {
    setViewingFile(null);
    // Revoke any object URLs to prevent memory leaks
    if (viewingContent) {
      URL.revokeObjectURL(viewingContent);
      setViewingContent(null);
    }
  };

  const handleShare = (file: FileInfo) => {
    if (onShare) {
      onShare(file);
    }
  };

  const openMoveModal = (file: FileInfo) => {
    setFileToMove(file);
    setTargetFolderId(file.folderId || null);
    setShowMoveModal(true);
  };

  const handleMoveFile = async () => {
    if (!fileToMove) return;

    try {
      await fileService.moveFile(fileToMove.id, targetFolderId !== null ? targetFolderId : undefined);
      toast.success('File moved successfully');
      setShowMoveModal(false);
      
      if (onFileMove) {
        onFileMove();
      } else {
        onFileAction();
      }
    } catch (error) {
      console.error('Error moving file:', error);
      toast.error('Failed to move file');
    }
  };

  // Format file size to human-readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
  };

  // Format date to readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get a simplified file type for badges
  const getFileType = (mimeType: string): { type: string, color: string, icon: JSX.Element } => {
    if (mimeType.startsWith('image/')) {
      return { 
        type: 'Image', 
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        icon: <Image size={20} className="text-blue-500 dark:text-blue-400" />
      };
    } else if (mimeType === 'application/pdf') {
      return { 
        type: 'PDF', 
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        icon: <FileText size={20} className="text-red-500 dark:text-red-400" />
      };
    } else if (mimeType.startsWith('video/')) {
      return { 
        type: 'Video', 
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
        icon: <Video size={20} className="text-purple-500 dark:text-purple-400" />
      };
    } else if (mimeType.startsWith('audio/')) {
      return { 
        type: 'Audio', 
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        icon: <Music size={20} className="text-green-500 dark:text-green-400" />
      };
    } else if (mimeType.includes('javascript') || mimeType.includes('typescript') || 
              mimeType.includes('json') || mimeType.includes('html') || mimeType.includes('css')) {
      return { 
        type: 'Code', 
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        icon: <Code size={20} className="text-yellow-500 dark:text-yellow-400" />
      };
    } else {
      return { 
        type: 'Document', 
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        icon: <FileIcon size={20} className="text-gray-500 dark:text-gray-400" />
      };
    }
  };

  // Toggle dropdown menu
  const toggleDropdown = (e: React.MouseEvent, fileId: number) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === fileId ? null : fileId);
  };

  // Close dropdown
  const closeDropdown = () => {
    setActiveDropdown(null);
  };

  // Get a folder name by its ID
  const getFolderName = (folderId: number | undefined | null): string => {
    if (!folderId) return 'Root';
    const folder = folders.find(f => f.id === folderId);
    return folder ? folder.name : 'Unknown folder';
  };

  // Main render function
  if (files.length === 0) {
    return (
      <div className="text-center p-6 border border-dashed rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
        <FileIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No files</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Upload files to get started</p>
      </div>
    );
  }

  // Render files in grid view (cards)
  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {files.map((file) => {
        const fileTypeInfo = getFileType(file.fileType);
        return (
          <div 
            key={file.id} 
            className="relative bg-white dark:bg-gray-800 rounded-md shadow-md p-5 
              hover:shadow-lg transition-all duration-200 cursor-pointer
              border border-gray-100 dark:border-gray-700 group"
            onClick={() => handleView(file)}
          >
            {/* File Type Icon */}
            <div className="flex justify-center items-center mb-4 h-24">
              {file.fileType.startsWith('image/') && file.thumbnailUrl ? (
                <img 
                  src={file.thumbnailUrl} 
                  alt={file.fileName} 
                  className="max-h-full max-w-full object-contain rounded"
                />
              ) : (
                <div className={`rounded-md p-4 ${fileTypeInfo.color.split(' ').slice(0, 2).join(' ')}`}>
                  {fileTypeInfo.icon}
                </div>
              )}
            </div>
            
            {/* File Name and Info */}
            <div className="space-y-2">
              <h3 className="text-md font-medium truncate text-gray-800 dark:text-gray-200" title={file.fileName}>
                {file.fileName}
              </h3>
              
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{formatFileSize(file.fileSize)}</span>
                <span>{formatDate(file.modifiedAt || file.uploadDate || file.createdAt)}</span>
              </div>
              
              <div className="flex items-center">
                <span className={`text-xs px-2 py-1 rounded-full ${fileTypeInfo.color}`}>
                  {fileTypeInfo.type}
                </span>
              </div>
            </div>
            
            {/* Hover actions */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="relative">
                <button 
                  onClick={(e) => toggleDropdown(e, file.id)}
                  className="p-1.5 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  <MoreVertical size={16} className="text-gray-700 dark:text-gray-300" />
                </button>
                
                {activeDropdown === file.id && (
                  <div 
                    className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 py-1 border border-gray-100 dark:border-gray-700"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleView(file);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Eye size={16} className="mr-2" />
                      <span>View</span>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(file.id, file.fileName);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Download size={16} className="mr-2" />
                      <span>Download</span>
                    </button>
                    {onShare && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(file);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Share size={16} className="mr-2" />
                        <span>Share</span>
                      </button>
                    )}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        openMoveModal(file);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Move size={16} className="mr-2" />
                      <span>Move</span>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(file.id);
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
          </div>
        );
      })}
    </div>
  );

  // Render files in list view (table)
  const renderListView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                  onChange={toggleAllFiles}
                  checked={selectedFiles.size === files.length && files.length > 0}
                />
                <span className="ml-3">Name</span>
              </div>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Size
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Date Modified
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {files.map((file) => {
            const fileTypeInfo = getFileType(file.fileType);
            return (
              <tr 
                key={file.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => handleView(file)}>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                      onChange={() => toggleFileSelection(file.id)}
                      checked={selectedFiles.has(file.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-shrink-0 h-10 w-10 ml-3 flex items-center justify-center">
                      {file.fileType.startsWith('image/') && file.thumbnailUrl ? (
                        <img 
                          src={file.thumbnailUrl} 
                          alt={file.fileName} 
                          className="h-10 w-10 object-cover rounded"
                        />
                      ) : (
                        <div className={`rounded p-2 ${fileTypeInfo.color.split(' ').slice(0, 2).join(' ')}`}>
                          {React.cloneElement(fileTypeInfo.icon, { size: 16 })}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {file.fileName}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${fileTypeInfo.color}`}>
                    {fileTypeInfo.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.fileSize)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(file.modifiedAt || file.uploadDate || file.createdAt)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleView(file)}
                      className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                      title="View file"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleDownload(file.id, file.fileName)}
                      className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                      title="Download file"
                    >
                      <Download size={16} />
                    </button>
                    {onShare && (
                      <button
                        onClick={() => handleShare(file)}
                        className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                        title="Share file"
                      >
                        <Share size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => openMoveModal(file)}
                      className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                      title="Move file"
                    >
                      <Move size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      title="Delete file"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Batch actions bar */}
      {selectedFiles.size > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-700 flex items-center z-20">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-4">
            {selectedFiles.size} {selectedFiles.size === 1 ? 'file' : 'files'} selected
          </span>
          <div className="flex space-x-2">
            <button
              onClick={handleBatchDownload}
              disabled={isProcessingBatch}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md shadow-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={14} className="mr-1" />
              Download
            </button>
            <button
              onClick={handleBatchDelete}
              disabled={isProcessingBatch}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md shadow-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash size={14} className="mr-1" />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Display batch actions if files are selected */}
      {selectedFiles.size > 0 && displayMode === DisplayMode.GRID && (
        <div className="mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 border border-gray-200 dark:border-gray-700 flex items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-4">
            {selectedFiles.size} {selectedFiles.size === 1 ? 'file' : 'files'} selected
          </span>
          <div className="flex space-x-2">
            <button
              onClick={handleBatchDownload}
              disabled={isProcessingBatch}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md shadow-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={14} className="mr-1" />
              Download
            </button>
            <button
              onClick={handleBatchDelete}
              disabled={isProcessingBatch}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md shadow-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash size={14} className="mr-1" />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* File display based on mode */}
      {displayMode === DisplayMode.GRID ? renderGridView() : renderListView()}

      {/* File preview modal */}
      {viewingFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => closePreview()}>
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{viewingFile.fileName}</h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleDownload(viewingFile.id, viewingFile.fileName)}
                  className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  title="Download"
                >
                  <Download size={18} />
                </button>
                <button
                  onClick={() => closePreview()}
                  className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  title="Close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 flex items-center justify-center overflow-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
              {viewingFile.fileType.startsWith('image/') && viewingContent && (
                <img src={viewingContent} alt={viewingFile.fileName} className="max-w-full max-h-full" />
              )}
              {viewingFile.fileType.startsWith('video/') && viewingContent && (
                <video controls className="max-w-full max-h-full" src={viewingContent} />
              )}
              {viewingFile.fileType.startsWith('audio/') && viewingContent && (
                <audio controls src={viewingContent} className="w-full" />
              )}
              {viewingFile.fileType === 'application/pdf' && viewingContent && (
                <iframe src={`${viewingContent}#view=FitH`} className="w-full h-full min-h-[70vh]" title={viewingFile.fileName} />
              )}
              {(!viewingContent || (!viewingFile.fileType.startsWith('image/') && !viewingFile.fileType.startsWith('video/') && 
                !viewingFile.fileType.startsWith('audio/') && viewingFile.fileType !== 'application/pdf')) && (
                <div className="text-center py-12">
                  <div className="mb-4">
                    {getFileType(viewingFile.fileType).icon}
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">{viewingFile.fileName}</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">This file type cannot be previewed</p>
                  <button
                    onClick={() => handleDownload(viewingFile.id, viewingFile.fileName)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                  >
                    Download File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Move file modal */}
      {showMoveModal && fileToMove && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={() => setShowMoveModal(false)}>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Move File</h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Select a destination folder for <span className="font-semibold">{fileToMove.fileName}</span>
            </p>
            
            <div className="mb-4">
              <select
                value={targetFolderId !== null ? targetFolderId : 'root'}
                onChange={(e) => setTargetFolderId(e.target.value === 'root' ? null : parseInt(e.target.value))}
                className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="root">Root (No Folder)</option>
                {folders.map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end gap-3">
              <button 
                className="px-4 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setShowMoveModal(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 rounded-md text-white bg-blue-500 hover:bg-blue-600 transition-colors"
                onClick={handleMoveFile}
              >
                Move
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FileList;
