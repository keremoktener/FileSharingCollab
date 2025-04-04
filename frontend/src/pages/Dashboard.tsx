import React, { useEffect, useState } from 'react';
import { fileService } from '../services/api';
import { FileInfo } from '../types';
import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

// Maximum storage limit in bytes (10GB)
const MAX_STORAGE = 10 * 1024 * 1024 * 1024;

const Dashboard: React.FC = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // Used to trigger skeleton refresh
  const { user } = useAuth();

  const loadFiles = async () => {
    try {
      setLoading(true);
      setRefreshKey(prev => prev + 1); // Update to trigger skeleton animation
      const data = await fileService.getAllFiles();
      setFiles(data);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  // Get some stats
  const totalFiles = files.length;
  const totalSize = files.reduce((acc, file) => acc + file.fileSize, 0);
  const usagePercentage = (totalSize / MAX_STORAGE) * 100;
  
  // Format total size
  const formatTotalSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Determine usage color based on percentage
  const getUsageColor = () => {
    if (usagePercentage < 50) return 'bg-green-500';
    if (usagePercentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Files</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Upload, download, and manage your files securely
            </p>
          </div>
          
          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-4 mt-4 md:mt-0">
            <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-4 text-center transition-all duration-300 hover:shadow-md hover:scale-105 transform cursor-pointer">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalFiles}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Files</p>
            </div>
            <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-4 text-center transition-all duration-300 hover:shadow-md hover:scale-105 transform cursor-pointer">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatTotalSize(totalSize)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Used Space</p>
            </div>
          </div>
        </div>
        
        {/* Storage usage bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md mt-4 transition-all duration-300 hover:shadow-lg">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Storage Usage</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {formatTotalSize(totalSize)} / {formatTotalSize(MAX_STORAGE)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${getUsageColor()}`} 
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {usagePercentage.toFixed(1)}% used
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatTotalSize(MAX_STORAGE - totalSize)} free
            </span>
          </div>
        </div>
        
        {/* Welcome message */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-800 text-white rounded-xl p-6 shadow-lg mb-8 mt-6 flex items-center transition-all duration-300 hover:shadow-xl transform hover:scale-[1.01]">
          <div className="mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"></path>
              <path d="M13 2v7h7"></path>
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold">Welcome back, {user?.username || 'User'}!</h2>
            <p className="opacity-80 mt-1">Your personal cloud storage is ready. Upload files to get started.</p>
          </div>
        </div>
      </div>

      <div className="transition-all duration-300 ease-in-out transform hover:shadow-lg">
        <FileUpload onFileUploaded={loadFiles} />
      </div>

      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="grid grid-cols-6 gap-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded col-span-1"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded col-span-1"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded col-span-1"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded col-span-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded col-span-1"></div>
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map((item) => (
                <div key={`skeleton-${item}-${refreshKey}`} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="transition-all duration-300 ease-in-out transform">
          <FileList files={files} onFileAction={loadFiles} />
        </div>
      )}
      
      {/* Help section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-8 transition-all duration-300 hover:shadow-xl">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">File Sharing Tips</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex transition-all duration-300 hover:translate-y-[-2px]">
            <div className="mr-3 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <path d="M21 15l-5-5L5 21"></path>
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 dark:text-gray-200">Supported Files</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Upload images, documents, videos, and more. Max size: 10MB per file.</p>
            </div>
          </div>
          <div className="flex transition-all duration-300 hover:translate-y-[-2px]">
            <div className="mr-3 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 dark:text-gray-200">Preview Files</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Click 'View' to preview images, PDFs, videos, and audio directly in your browser.</p>
            </div>
          </div>
          <div className="flex transition-all duration-300 hover:translate-y-[-2px]">
            <div className="mr-3 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 dark:text-gray-200">Secure Storage</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">All files are securely stored and only accessible by you.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 