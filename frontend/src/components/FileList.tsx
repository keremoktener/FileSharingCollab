import React, { useState } from 'react';
import { FileInfo, FolderInfo } from '../types';
import { fileService } from '../services/api';
import toast from 'react-hot-toast';
import { Download, Trash, Edit, Share, Move } from 'react-feather';

interface FileListProps {
  files: FileInfo[];
  onFileAction: () => void;
  onShare?: (file: FileInfo) => void;
  currentFolderId?: number;
  folders?: FolderInfo[];
  onFileMove?: () => void;
}

const FileList: React.FC<FileListProps> = ({ 
  files, 
  onFileAction, 
  onShare,
  currentFolderId,
  folders = [],
  onFileMove
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
  const getFileType = (mimeType: string): { type: string, color: string } => {
    if (mimeType.startsWith('image/')) {
      return { type: 'Image', color: 'bg-blue-100 text-blue-800' };
    } else if (mimeType === 'application/pdf') {
      return { type: 'PDF', color: 'bg-red-100 text-red-800' };
    } else if (mimeType.startsWith('video/')) {
      return { type: 'Video', color: 'bg-purple-100 text-purple-800' };
    } else if (mimeType.startsWith('audio/')) {
      return { type: 'Audio', color: 'bg-green-100 text-green-800' };
    } else if (mimeType === 'application/zip' || mimeType === 'application/x-zip-compressed') {
      return { type: 'Archive', color: 'bg-yellow-100 text-yellow-800' };
    } else if (mimeType.startsWith('text/')) {
      return { type: 'Text', color: 'bg-gray-100 text-gray-800' };
    } else {
      return { type: 'Document', color: 'bg-indigo-100 text-indigo-800' };
    }
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"></path>
          <path d="M13 2v7h7"></path>
        </svg>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No files yet</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Upload some files to get started!</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* File list header with batch actions */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedFiles.size === files.length && files.length > 0}
                onChange={toggleAllFiles}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {selectedFiles.size} of {files.length} selected
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleBatchDownload}
                disabled={selectedFiles.size === 0 || isProcessingBatch}
                className={`px-3 py-1.5 text-xs rounded font-medium 
                  ${selectedFiles.size === 0 || isProcessingBatch
                    ? 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
                  } transition-colors flex items-center`}
              >
                <Download size={14} className="mr-1" />
                Download Selected
              </button>
              <button
                onClick={handleBatchDelete}
                disabled={selectedFiles.size === 0 || isProcessingBatch}
                className={`px-3 py-1.5 text-xs rounded font-medium 
                  ${selectedFiles.size === 0 || isProcessingBatch
                    ? 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
                  } transition-colors flex items-center`}
              >
                <Trash size={14} className="mr-1" />
                Delete Selected
              </button>
            </div>
          </div>
        </div>

        {/* Table of files */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-10">
                  <span className="sr-only">Select</span>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  File
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Size
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Folder
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Uploaded
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {files.map((file) => {
                const fileTypeInfo = getFileType(file.fileType);
                
                return (
                  <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(file.id)}
                        onChange={() => toggleFileSelection(file.id)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <button
                          onClick={() => handleView(file)}
                          className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
                        >
                          {file.fileName}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${fileTypeInfo.color}`}>
                        {fileTypeInfo.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.fileSize)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {getFolderName(file.folderId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(file.uploadDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleDownload(file.id, file.fileName)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200"
                          title="Download"
                        >
                          <Download size={18} />
                        </button>
                        
                        {onShare && (
                          <button
                            onClick={() => handleShare(file)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200"
                            title="Share"
                          >
                            <Share size={18} />
                          </button>
                        )}
                        
                        <button
                          onClick={() => openMoveModal(file)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200"
                          title="Move to folder"
                        >
                          <Move size={18} />
                        </button>
                        
                        {renamingId === file.id ? (
                          <div className="flex items-center">
                            <input
                              type="text"
                              value={newFileName}
                              onChange={(e) => setNewFileName(e.target.value)}
                              className="border rounded py-1 px-2 text-sm w-32 mr-1"
                              autoFocus
                            />
                            <button 
                              onClick={() => {
                                // Handle rename logic
                                setRenamingId(null);
                              }}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200"
                            >
                              ✓
                            </button>
                            <button 
                              onClick={() => setRenamingId(null)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 ml-1"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setRenamingId(file.id);
                              setNewFileName(getFileNameWithoutExtension(file.fileName));
                              setFileExtension(getFileExtension(file.fileName));
                            }}
                            className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-200"
                            title="Rename"
                          >
                            <Edit size={18} />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDelete(file.id)}
                          disabled={deletingId === file.id}
                          className={`${
                            deletingId === file.id
                              ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                              : 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200'
                          }`}
                          title="Delete"
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* File Preview Modal */}
      {viewingFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-medium truncate max-w-md">{viewingFile.fileName}</h3>
              <button 
                onClick={closePreview}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                &times;
              </button>
            </div>
            <div className="p-4 overflow-auto flex-grow">
              {viewingContent ? (
                viewingFile.fileType.startsWith('image/') ? (
                  <img src={viewingContent} alt={viewingFile.fileName} className="max-w-full max-h-[70vh] mx-auto" />
                ) : viewingFile.fileType.startsWith('video/') ? (
                  <video controls className="max-w-full max-h-[70vh] mx-auto">
                    <source src={viewingContent} type={viewingFile.fileType} />
                    Your browser does not support the video tag.
                  </video>
                ) : viewingFile.fileType.startsWith('audio/') ? (
                  <audio controls className="w-full mt-4">
                    <source src={viewingContent} type={viewingFile.fileType} />
                    Your browser does not support the audio tag.
                  </audio>
                ) : viewingFile.fileType === 'application/pdf' ? (
                  <iframe 
                    src={viewingContent} 
                    title={viewingFile.fileName}
                    className="w-full h-[70vh]"
                  />
                ) : (
                  <div className="text-center p-12">
                    <p className="text-gray-500 dark:text-gray-400">Preview not available for this file type.</p>
                    <button
                      onClick={() => handleDownload(viewingFile.id, viewingFile.fileName)}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      Download Instead
                    </button>
                  </div>
                )
              ) : (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {formatFileSize(viewingFile.fileSize)} • {formatDate(viewingFile.uploadDate)}
              </div>
              <button
                onClick={() => handleDownload(viewingFile.id, viewingFile.fileName)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center"
              >
                <Download size={16} className="mr-2" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move File Modal */}
      {showMoveModal && fileToMove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Move File</h2>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Move <span className="font-semibold">{fileToMove.fileName}</span> to:
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select destination folder:
              </label>
              <select
                value={targetFolderId || ""}
                onChange={(e) => setTargetFolderId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">Root (No folder)</option>
                {folders.map(folder => (
                  <option 
                    key={folder.id} 
                    value={folder.id}
                    disabled={folder.id === fileToMove.folderId}
                  >
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowMoveModal(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleMoveFile}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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

// Helper functions
const getFileNameWithoutExtension = (fileName: string): string => {
  const lastDotIndex = fileName.lastIndexOf('.');
  return lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName;
};

const getFileExtension = (fileName: string): string => {
  const lastDotIndex = fileName.lastIndexOf('.');
  return lastDotIndex !== -1 ? fileName.substring(lastDotIndex) : '';
};

export default FileList;
