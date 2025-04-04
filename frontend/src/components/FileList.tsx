import React, { useState } from 'react';
import { FileInfo } from '../types';
import { fileService } from '../services/api';
import toast from 'react-hot-toast';

interface FileListProps {
  files: FileInfo[];
  onFileAction: () => void;
}

const FileList: React.FC<FileListProps> = ({ files, onFileAction }) => {
  const [viewingFile, setViewingFile] = useState<FileInfo | null>(null);
  const [viewingContent, setViewingContent] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

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

  // Format file size to human-readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
    } else if (mimeType.startsWith('text/')) {
      return { type: 'Text', color: 'bg-gray-100 text-gray-800' };
    } else {
      return { type: 'Document', color: 'bg-yellow-100 text-yellow-800' };
    }
  };

  // Determine if a file is viewable in browser
  const isViewable = (fileType: string): boolean => {
    const viewableTypes = [
      'image/jpeg', 
      'image/png', 
      'image/gif', 
      'application/pdf', 
      'text/plain', 
      'text/html',
      'video/mp4',
      'audio/mpeg'
    ];
    return viewableTypes.includes(fileType);
  };

  // Get file icon based on type
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <path d="M21 15l-5-5L5 21"></path>
        </svg>
      );
    } else if (fileType === 'application/pdf') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <path d="M14 2v6h6"></path>
          <path d="M16 13H8"></path>
          <path d="M16 17H8"></path>
          <path d="M10 9H8"></path>
        </svg>
      );
    } else if (fileType.startsWith('video/')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M23 7l-7 5 7 5V7z"></path>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
        </svg>
      );
    } else if (fileType.startsWith('audio/')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18V5l12-2v13"></path>
          <circle cx="6" cy="18" r="3"></circle>
          <circle cx="18" cy="16" r="3"></circle>
        </svg>
      );
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <path d="M14 2v6h6"></path>
          <path d="M16 13H8"></path>
          <path d="M16 17H8"></path>
          <path d="M10 9H8"></path>
        </svg>
      );
    }
  };

  if (files.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"></path>
          <path d="M13 2v7h7"></path>
        </svg>
        <p className="text-gray-500 mb-2">No files uploaded yet</p>
        <p className="text-sm text-gray-400">Upload files using the section above</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all mb-4">
        <div className="p-4 md:p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Your Files</h2>
          <p className="text-sm text-gray-500 mt-1">Manage and view your uploaded files</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Upload Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {files.map((file, index) => {
                const fileTypeInfo = getFileType(file.fileType);
                return (
                  <tr key={file.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                          {getFileIcon(file.fileType)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{file.fileName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${fileTypeInfo.color}`}>
                        {fileTypeInfo.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatFileSize(file.fileSize)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(file.uploadDate)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        {isViewable(file.fileType) && (
                          <button
                            onClick={() => handleView(file)}
                            className="text-blue-600 hover:text-blue-900 transition-colors group flex items-center"
                            title="View file"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            <span className="ml-1 group-hover:underline">View</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDownload(file.id, file.fileName)}
                          className="text-green-600 hover:text-green-900 transition-colors group flex items-center"
                          title="Download file"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                          </svg>
                          <span className="ml-1 group-hover:underline">Download</span>
                        </button>
                        <button
                          onClick={() => handleDelete(file.id)}
                          disabled={deletingId === file.id}
                          className={`transition-colors group flex items-center ${
                            deletingId === file.id ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-900'
                          }`}
                          title="Delete file"
                        >
                          {deletingId === file.id ? (
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          )}
                          <span className="ml-1 group-hover:underline">Delete</span>
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
      
      {/* File viewer modal */}
      {viewingFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-5xl w-full max-h-[90vh] flex flex-col relative">
            <div className="flex justify-between items-center mb-4 pb-4 border-b">
              <div className="flex items-center space-x-3">
                {getFileIcon(viewingFile.fileType)}
                <h3 className="text-lg font-bold text-gray-800">{viewingFile.fileName}</h3>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getFileType(viewingFile.fileType).color}`}>
                  {getFileType(viewingFile.fileType).type}
                </span>
              </div>
              <button 
                onClick={closePreview} 
                className="text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-gray-50 rounded-lg p-4">
              {viewingFile.fileType.startsWith('image/') ? (
                <img 
                  src={viewingContent || ''} 
                  alt={viewingFile.fileName} 
                  className="max-w-full max-h-[70vh] mx-auto rounded-lg shadow-md"
                />
              ) : viewingFile.fileType === 'application/pdf' ? (
                <iframe 
                  src={viewingContent || ''}
                  className="w-full h-[70vh] rounded-lg shadow-md"
                  title={viewingFile.fileName}
                />
              ) : viewingFile.fileType.startsWith('video/') ? (
                <video 
                  src={viewingContent || ''} 
                  controls 
                  className="max-w-full max-h-[70vh] mx-auto rounded-lg shadow-md"
                />
              ) : viewingFile.fileType.startsWith('audio/') ? (
                <div className="p-8 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
                  <div className="text-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-blue-500 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18V5l12-2v13"></path>
                      <circle cx="6" cy="18" r="3"></circle>
                      <circle cx="18" cy="16" r="3"></circle>
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-700">Audio Player</h3>
                  </div>
                  <audio 
                    src={viewingContent || ''} 
                    controls 
                    className="w-full"
                  />
                </div>
              ) : (
                <div className="p-8 bg-white rounded-lg shadow-md max-w-2xl mx-auto text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                    <path d="M14 2v6h6"></path>
                    <path d="M16 13H8"></path>
                    <path d="M16 17H8"></path>
                    <path d="M10 9H8"></path>
                  </svg>
                  <p className="text-gray-700 mb-4">This file type cannot be previewed directly in the browser.</p>
                  <button
                    onClick={() => handleDownload(viewingFile.id, viewingFile.fileName)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download to view
                  </button>
                </div>
              )}
            </div>
            <div className="pt-4 mt-4 border-t flex justify-between">
              <div className="text-sm text-gray-500">
                <span className="font-medium">Size:</span> {formatFileSize(viewingFile.fileSize)} &bull; 
                <span className="font-medium ml-2">Uploaded:</span> {formatDate(viewingFile.uploadDate)}
              </div>
              <button
                onClick={() => handleDownload(viewingFile.id, viewingFile.fileName)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FileList;
