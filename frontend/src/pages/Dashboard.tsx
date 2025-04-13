import React, { useEffect, useState } from 'react';
import { fileService, folderService, sharingService } from '../services/api';
import { FileInfo, FolderInfo, SharedItemInfo } from '../types';
import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';
import FolderList from '../components/FolderList';
import CreateFolderModal from '../components/CreateFolderModal';
import ShareModal from '../components/ShareModal';
import SharedItemList from '../components/SharedItemList';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { FolderPlus, ChevronRight, Home, Share, Folder, File } from 'react-feather';

// Maximum storage limit in bytes (10GB)
const MAX_STORAGE = 10 * 1024 * 1024 * 1024;

// View mode enum
enum ViewMode {
  FILES,
  SHARED_WITH_ME,
  SHARED_BY_ME
}

const Dashboard: React.FC = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [folders, setFolders] = useState<FolderInfo[]>([]);
  const [currentFolder, setCurrentFolder] = useState<FolderInfo | null>(null);
  const [sharedWithMe, setSharedWithMe] = useState<SharedItemInfo[]>([]);
  const [sharedByMe, setSharedByMe] = useState<SharedItemInfo[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<FolderInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // Used to trigger skeleton refresh
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.FILES);
  
  // Modals
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [itemToShare, setItemToShare] = useState<FileInfo | FolderInfo | null>(null);
  const [isShareFolder, setIsShareFolder] = useState(false);
  
  const { user } = useAuth();

  // Load files based on current folder
  const loadFiles = async () => {
    try {
      setLoading(true);
      setRefreshKey(prev => prev + 1); // Update to trigger skeleton animation
      let data;
      
      if (currentFolder) {
        // Load files in the current folder
        data = await folderService.getFilesInFolder(currentFolder.id);
      } else {
        // Load root files (not in any folder)
        data = await fileService.getRootFiles();
      }
      
      setFiles(data);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  // Load folders based on current folder
  const loadFolders = async () => {
    try {
      let data;
      
      if (currentFolder) {
        // Load subfolders of current folder
        data = await folderService.getSubfolders(currentFolder.id);
      } else {
        // Load root folders
        data = await folderService.getRootFolders();
      }
      
      setFolders(data);
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast.error('Failed to load folders');
    }
  };

  // Load shared items
  const loadSharedItems = async () => {
    try {
      const [withMeItems, byMeItems] = await Promise.all([
        sharingService.getSharedWithMe(),
        sharingService.getSharedByMe()
      ]);
      
      setSharedWithMe(withMeItems);
      setSharedByMe(byMeItems);
    } catch (error) {
      console.error('Error loading shared items:', error);
      toast.error('Failed to load shared items');
    }
  };

  // Reset to root folder and update breadcrumbs
  const navigateToRoot = () => {
    setCurrentFolder(null);
    setBreadcrumbs([]);
    loadFolders();
    loadFiles();
  };

  // Navigate to a specific folder and update breadcrumbs
  const handleFolderClick = async (folderId: number) => {
    try {
      // Find the folder in the current folders list
      const folder = folders.find(f => f.id === folderId);
      
      if (folder) {
        setCurrentFolder(folder);
        
        // Update breadcrumbs
        if (currentFolder) {
          // Add current folder to breadcrumbs
          setBreadcrumbs([...breadcrumbs, currentFolder]);
        } else {
          // Starting from root
          setBreadcrumbs([]);
        }
        
        // Load subfolders and files for the clicked folder
        const [subfolders, filesInFolder] = await Promise.all([
          folderService.getSubfolders(folderId),
          folderService.getFilesInFolder(folderId)
        ]);
        
        setFolders(subfolders);
        setFiles(filesInFolder);
      }
    } catch (error) {
      console.error('Error navigating to folder:', error);
      toast.error('Failed to open folder');
    }
  };

  // Navigate to a specific folder in the breadcrumb path
  const handleBreadcrumbClick = async (index: number) => {
    if (index === -1) {
      // Clicked on "Home" - go to root
      navigateToRoot();
      return;
    }
    
    // Get the selected folder from breadcrumbs
    const folder = breadcrumbs[index];
    
    // Update breadcrumbs to only include folders up to the clicked one
    setBreadcrumbs(breadcrumbs.slice(0, index));
    
    // Set current folder and load its contents
    setCurrentFolder(folder);
    
    try {
      const [subfolders, filesInFolder] = await Promise.all([
        folderService.getSubfolders(folder.id),
        folderService.getFilesInFolder(folder.id)
      ]);
      
      setFolders(subfolders);
      setFiles(filesInFolder);
    } catch (error) {
      console.error('Error navigating to breadcrumb folder:', error);
      toast.error('Failed to navigate to folder');
    }
  };

  // Handle file sharing
  const handleShareFile = (file: FileInfo) => {
    setItemToShare(file);
    setIsShareFolder(false);
    setShowShareModal(true);
  };

  // Handle folder sharing
  const handleShareFolder = (folder: FolderInfo) => {
    setItemToShare(folder);
    setIsShareFolder(true);
    setShowShareModal(true);
  };

  // Refresh all data
  const refreshData = () => {
    loadFiles();
    loadFolders();
    loadSharedItems();
  };

  // Initial data loading
  useEffect(() => {
    if (viewMode === ViewMode.FILES) {
      loadFiles();
      loadFolders();
    } else {
      loadSharedItems();
    }
  }, [viewMode]);

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
          <div className="grid grid-cols-3 gap-4 mt-4 md:mt-0">
            <div 
              className={`bg-white dark:bg-gray-800 shadow rounded-xl p-3 text-center transition-all duration-300 hover:shadow-md transform cursor-pointer ${viewMode === ViewMode.FILES ? 'border-2 border-blue-500' : ''}`}
              onClick={() => setViewMode(ViewMode.FILES)}
            >
              <File className="h-5 w-5 mx-auto text-blue-600 dark:text-blue-400 mb-1" />
              <p className="text-sm text-gray-500 dark:text-gray-400">My Files</p>
            </div>
            <div 
              className={`bg-white dark:bg-gray-800 shadow rounded-xl p-3 text-center transition-all duration-300 hover:shadow-md transform cursor-pointer ${viewMode === ViewMode.SHARED_WITH_ME ? 'border-2 border-blue-500' : ''}`}
              onClick={() => setViewMode(ViewMode.SHARED_WITH_ME)}
            >
              <Share className="h-5 w-5 mx-auto text-green-600 dark:text-green-400 mb-1" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Shared with me</p>
            </div>
            <div 
              className={`bg-white dark:bg-gray-800 shadow rounded-xl p-3 text-center transition-all duration-300 hover:shadow-md transform cursor-pointer ${viewMode === ViewMode.SHARED_BY_ME ? 'border-2 border-blue-500' : ''}`}
              onClick={() => setViewMode(ViewMode.SHARED_BY_ME)}
            >
              <Share className="h-5 w-5 mx-auto text-purple-600 dark:text-purple-400 mb-1" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Shared by me</p>
            </div>
          </div>
        </div>
        
        {/* Storage usage bar (only show in Files view) */}
        {viewMode === ViewMode.FILES && (
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
        )}
        
        {/* Welcome message (only show in Files view) */}
        {viewMode === ViewMode.FILES && (
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
        )}
      </div>

      {/* Main content based on view mode */}
      {viewMode === ViewMode.FILES ? (
        <>
          {/* Breadcrumbs */}
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
            <button
              onClick={() => navigateToRoot()}
              className="flex items-center hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              <Home size={16} className="mr-1" />
              <span>Home</span>
            </button>
            
            {breadcrumbs.map((folder, index) => (
              <React.Fragment key={folder.id}>
                <ChevronRight size={16} className="mx-2" />
                <button
                  onClick={() => handleBreadcrumbClick(index)}
                  className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                >
                  {folder.name}
                </button>
              </React.Fragment>
            ))}
            
            {currentFolder && (
              <>
                <ChevronRight size={16} className="mx-2" />
                <span className="font-medium text-blue-500 dark:text-blue-400">{currentFolder.name}</span>
              </>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => setShowCreateFolderModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow transition-colors"
            >
              <FolderPlus size={18} className="mr-2" />
              New Folder
            </button>
            
            <FileUpload 
              onFileUploaded={loadFiles} 
              currentFolderId={currentFolder?.id} 
            />
          </div>

          {/* Folder list */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                <div className="rounded-md p-1.5 bg-yellow-100 dark:bg-yellow-900/30 mr-2">
                  <Folder size={20} className="text-yellow-500 dark:text-yellow-400" />
                </div>
                {currentFolder ? `Folders in ${currentFolder.name}` : 'Folders'}
              </h2>
              
              <button
                onClick={() => setShowCreateFolderModal(true)}
                className="text-sm flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <FolderPlus size={16} className="mr-1" />
                New Folder
              </button>
            </div>
            
            <FolderList 
              folders={folders}
              onFolderAction={loadFolders}
              onFolderClick={handleFolderClick}
              onShare={handleShareFolder}
              currentFolder={currentFolder}
            />
          </div>

          {/* File list */}
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
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                <File size={20} className="mr-2 text-blue-500" />
                {currentFolder ? `Files in ${currentFolder.name}` : 'Files'}
              </h2>
              
              <FileList 
                files={files} 
                onFileAction={loadFiles} 
                onShare={handleShareFile}
                currentFolderId={currentFolder?.id}
                folders={folders}
                onFileMove={loadFiles}
              />
            </div>
          )}
        </>
      ) : (
        /* Shared Items View */
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
            <Share size={20} className="mr-2 text-green-500" />
            {viewMode === ViewMode.SHARED_WITH_ME ? 'Shared with me' : 'Shared by me'}
          </h2>
          
          <SharedItemList 
            items={viewMode === ViewMode.SHARED_WITH_ME ? sharedWithMe : sharedByMe} 
            isSharedByMe={viewMode === ViewMode.SHARED_BY_ME}
            onItemAction={loadSharedItems}
          />
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

      {/* Modals */}
      <CreateFolderModal 
        isOpen={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        onFolderCreated={() => {
          loadFolders();
          toast.success('Folder created successfully');
        }}
        currentFolder={currentFolder}
      />
      
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShare={() => {
          loadSharedItems();
          toast.success('Item shared successfully');
        }}
        item={itemToShare}
        isFolder={isShareFolder}
      />
    </div>
  );
};

export default Dashboard; 