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

  const handleDownload = async (fileId: number, fileName: string) => {
    try {
      const blob = await fileService.downloadFile(fileId);
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
      toast.error('Failed to download file');
    }
  };

  const handleDelete = async (fileId: number) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await fileService.deleteFile(fileId);
        toast.success('File deleted successfully');
        onFileAction();
      } catch (error) {
        console.error('Error deleting file:', error);
        toast.error('Failed to delete file');
      }
    }
  };
  
  const handleView = (file: FileInfo) => {
    setViewingFile(file);
  };
  
  const closePreview = () => {
    setViewingFile(null);
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

  if (files.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500 text-center py-8">No files uploaded yet</p>
      </div>
    );
  }

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

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
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
            <tbody className="bg-white divide-y divide-gray-200">
              {files.map((file) => (
                <tr key={file.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{file.fileName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{file.fileType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatFileSize(file.fileSize)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDate(file.uploadDate)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {isViewable(file.fileType) && (
                      <button
                        onClick={() => handleView(file)}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        View
                      </button>
                    )}
                    <button
                      onClick={() => handleDownload(file.id, file.fileName)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* File viewer modal */}
      {viewingFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{viewingFile.fileName}</h3>
              <button 
                onClick={closePreview} 
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              {viewingFile.fileType.startsWith('image/') ? (
                <img 
                  src={fileService.getFileViewUrl(viewingFile.id)} 
                  alt={viewingFile.fileName} 
                  className="max-w-full max-h-[70vh] mx-auto"
                />
              ) : viewingFile.fileType === 'application/pdf' ? (
                <iframe 
                  src={fileService.getFileViewUrl(viewingFile.id)} 
                  className="w-full h-[70vh]"
                  title={viewingFile.fileName}
                />
              ) : viewingFile.fileType.startsWith('video/') ? (
                <video 
                  src={fileService.getFileViewUrl(viewingFile.id)} 
                  controls 
                  className="max-w-full max-h-[70vh] mx-auto"
                />
              ) : viewingFile.fileType.startsWith('audio/') ? (
                <audio 
                  src={fileService.getFileViewUrl(viewingFile.id)} 
                  controls 
                  className="w-full"
                />
              ) : (
                <div className="p-4 bg-gray-100 rounded">
                  <p>This file type cannot be previewed directly in the browser.</p>
                  <button
                    onClick={() => handleDownload(viewingFile.id, viewingFile.fileName)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Download to view
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FileList;
