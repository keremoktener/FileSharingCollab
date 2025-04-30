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
import { 
  FolderPlus, ChevronRight, Home, Share, Folder, File, Grid, List, 
  Menu, Search, Star, Clock, Users, Settings, Download, Upload, ExternalLink, Database, UserPlus, Share2, LogOut
} from 'react-feather';
import ThemeToggle from '../components/ThemeToggle';

// Maximum storage limit in bytes (10GB)
const MAX_STORAGE = 10 * 1024 * 1024 * 1024;

// View mode enum
enum ViewMode {
  FILES,
  SHARED_WITH_ME,
  SHARED_BY_ME
}

// Display mode enum
enum DisplayMode {
  GRID,
  LIST
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
  const [displayMode, setDisplayMode] = useState<DisplayMode>(DisplayMode.GRID);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
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

  // Filter folders and files by search query
  const filteredFolders = folders.filter(folder => 
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredFiles = files.filter(file => 
    file.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Modify the handleLogout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; // Redirect to login page
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <div className={`bg-blue-700 dark:bg-blue-800 shadow-lg transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b border-blue-600 dark:border-blue-700">
          <h1 className={`text-xl font-bold text-white transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
            FileShare
          </h1>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="p-2 rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 text-white"
          >
            <Menu size={20} />
          </button>
        </div>
        
        <div className="text-xs uppercase text-blue-200 font-semibold px-4 pt-4 pb-2">
          VIEWS
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <button 
            onClick={() => setViewMode(ViewMode.FILES)}
            className={`flex items-center w-full p-3 rounded-lg transition-all ${viewMode === ViewMode.FILES ? 'bg-blue-800 dark:bg-blue-900 text-white' : 'text-blue-100 dark:text-blue-100 hover:bg-blue-600 dark:hover:bg-blue-700'}`}
          >
            <File size={20} className="flex-shrink-0" />
            <span className={`ml-3 transition-all ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>My Files</span>
          </button>
          
          <button 
            onClick={() => setViewMode(ViewMode.SHARED_WITH_ME)}
            className={`flex items-center w-full p-3 rounded-lg transition-all ${viewMode === ViewMode.SHARED_WITH_ME ? 'bg-blue-800 dark:bg-blue-900 text-white' : 'text-blue-100 dark:text-blue-100 hover:bg-blue-600 dark:hover:bg-blue-700'}`}
          >
            <Share size={20} className="flex-shrink-0" />
            <span className={`ml-3 transition-all ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>Shared with Me</span>
          </button>
          
          <button 
            onClick={() => setViewMode(ViewMode.SHARED_BY_ME)}
            className={`flex items-center w-full p-3 rounded-lg transition-all ${viewMode === ViewMode.SHARED_BY_ME ? 'bg-blue-800 dark:bg-blue-900 text-white' : 'text-blue-100 dark:text-blue-100 hover:bg-blue-600 dark:hover:bg-blue-700'}`}
          >
            <ExternalLink size={20} className="flex-shrink-0" />
            <span className={`ml-3 transition-all ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>Shared by Me</span>
          </button>
        </nav>
        
        <div className="text-xs uppercase text-blue-200 font-semibold px-4 pt-4 pb-2">
          STORAGE
        </div>
        
        {/* Storage usage indicator */}
        <div className={`p-4 ${isSidebarOpen ? '' : 'hidden'}`}>
          <p className="text-sm text-blue-100 dark:text-blue-100 mb-1 flex justify-between">
            <span>Used Storage</span>
            <span>{formatTotalSize(totalSize)} / {formatTotalSize(MAX_STORAGE)}</span>
          </p>
          <div className="w-full h-2 bg-blue-800 dark:bg-blue-900 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getUsageColor()} transition-all duration-500 ease-out`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-blue-600 dark:bg-blue-700 shadow-md px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center mr-4">
                <svg className="h-8 w-8 text-white mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 22H20C21.1046 22 22 21.1046 22 20V8L16 2H4C2.89543 2 2 2.89543 2 4V20C2 21.1046 2.89543 22 4 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div className="text-white text-xl font-semibold">File Sharing Platform</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative max-w-md w-64">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search size={18} className="text-blue-200 dark:text-blue-300" />
                </div>
                <input 
                  type="search" 
                  className="block w-full pl-10 pr-3 py-2 border border-blue-500 dark:border-blue-600 rounded-lg bg-blue-500/50 dark:bg-blue-600/50 text-white placeholder-blue-200 dark:placeholder-blue-300 focus:ring-white focus:border-white"
                  placeholder="Search files and folders..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setDisplayMode(DisplayMode.GRID)}
                  className={`p-2 rounded-md ${displayMode === DisplayMode.GRID ? 'bg-blue-700 dark:bg-blue-800 text-white' : 'text-blue-100 dark:text-blue-200 hover:bg-blue-700 dark:hover:bg-blue-800'}`}
                  aria-label="Grid view"
                >
                  <Grid size={20} />
                </button>
                
                <button
                  onClick={() => setDisplayMode(DisplayMode.LIST)}
                  className={`p-2 rounded-md ${displayMode === DisplayMode.LIST ? 'bg-blue-700 dark:bg-blue-800 text-white' : 'text-blue-100 dark:text-blue-200 hover:bg-blue-700 dark:hover:bg-blue-800'}`}
                  aria-label="List view"
                >
                  <List size={20} />
                </button>
                
                <ThemeToggle />
              </div>
              
              <div className="flex items-center space-x-2 text-white">
                <span>Hello, {user?.email.split('@')[0]}</span>
                <div className="h-8 w-8 bg-blue-800 rounded-full flex items-center justify-center">
                  {user?.email.substring(0, 2).toUpperCase()}
                </div>
                <button 
                  onClick={handleLogout}
                  className="ml-2 px-3 py-1 bg-blue-700 hover:bg-blue-800 rounded text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main workspace */}
        <main className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-6">
          {viewMode === ViewMode.FILES ? (
            <div className="space-y-6">
              {/* Breadcrumbs */}
              <div className="flex items-center space-x-2 text-sm">
                <button
                  onClick={() => navigateToRoot()}
                  className={`flex items-center px-3 py-1.5 rounded-md ${!currentFolder ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <Home size={16} className="mr-1.5" />
                  <span>Home</span>
                </button>
                
                {breadcrumbs.map((folder, index) => (
                  <React.Fragment key={folder.id}>
                    <ChevronRight size={16} className="text-gray-400 dark:text-gray-500" />
                    <button
                      onClick={() => handleBreadcrumbClick(index)}
                      className="px-3 py-1.5 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {folder.name}
                    </button>
                  </React.Fragment>
                ))}
                
                {currentFolder && (
                  <>
                    <ChevronRight size={16} className="text-gray-400 dark:text-gray-500" />
                    <span className="px-3 py-1.5 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                      {currentFolder.name}
                    </span>
                  </>
                )}
              </div>
              
              {/* Actions bar */}
              <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <FileUpload 
                  onFileUploaded={loadFiles} 
                  currentFolderId={currentFolder?.id}
                  buttonClassName="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow transition-colors"
                  buttonContent={<>
                    <Upload size={18} className="mr-2" />
                    Upload File
                  </>}
                />
                
                <button
                  onClick={() => setShowCreateFolderModal(true)}
                  className="flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md shadow-sm transition-colors"
                >
                  <FolderPlus size={18} className="mr-2" />
                  New Folder
                </button>
                
                <div className="ml-auto flex items-center text-sm text-gray-500 dark:text-gray-400">
                  {filteredFolders.length} folders • {filteredFiles.length} files
                </div>
              </div>
              
              {/* Sections */}
              <div className="space-y-6">
                {/* Folders section */}
                <section>
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                    <Folder size={20} className="mr-2 text-yellow-500 dark:text-yellow-400" />
                    Folders
                  </h2>
                  
                  <FolderList 
                    folders={filteredFolders}
                    onFolderAction={loadFolders}
                    onFolderClick={handleFolderClick}
                    onShare={handleShareFolder}
                    currentFolder={currentFolder}
                    displayMode={displayMode}
                  />
                </section>
                
                {/* Files section */}
                <section>
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                    <File size={20} className="mr-2 text-blue-500 dark:text-blue-400" />
                    Files
                  </h2>
                  
                  <FileList 
                    files={filteredFiles}
                    onFileAction={loadFiles}
                    onShare={handleShareFile}
                    currentFolderId={currentFolder?.id}
                    folders={folders}
                    onFileMove={loadFiles}
                    displayMode={displayMode}
                  />
                </section>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                {viewMode === ViewMode.SHARED_WITH_ME ? 'Shared with Me' : 'Shared by Me'}
              </h1>
              
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => setDisplayMode(DisplayMode.GRID)}
                  className={`p-2 rounded-md ${displayMode === DisplayMode.GRID ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  aria-label="Grid view"
                >
                  <Grid size={20} />
                </button>
                
                <button
                  onClick={() => setDisplayMode(DisplayMode.LIST)}
                  className={`p-2 rounded-md ${displayMode === DisplayMode.LIST ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  aria-label="List view"
                >
                  <List size={20} />
                </button>
              </div>
              
              <SharedItemList 
                items={viewMode === ViewMode.SHARED_WITH_ME ? sharedWithMe : sharedByMe} 
                refreshItems={loadSharedItems}
                displayMode={displayMode}
              />
            </div>
          )}
        </main>
      </div>
      
      {/* Modals */}
      {showCreateFolderModal && (
        <CreateFolderModal
          onClose={() => setShowCreateFolderModal(false)}
          onFolderCreated={() => {
            loadFolders();
            setShowCreateFolderModal(false);
          }}
          parentFolderId={currentFolder?.id}
        />
      )}
      
      {showShareModal && itemToShare && (
        <ShareModal 
          onClose={() => {
            setShowShareModal(false);
            setItemToShare(null);
          }}
          itemId={itemToShare.id}
          isFolder={isShareFolder}
          onShareCompleted={() => {
            setShowShareModal(false);
            setItemToShare(null);
            toast.success('Item shared successfully');
          }}
        />
      )}
    </div>
  );
};

export default Dashboard; 