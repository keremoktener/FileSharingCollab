import React, { useState, useCallback, useEffect } from 'react';
import { FileInfo, FolderInfo } from '../types';
import FileList from './FileList';
import FolderList from './FolderList';
import { fileService } from '../services/api';
import toast from 'react-hot-toast';
import { 
  Home, ChevronRight, ArrowLeft, Folder as FolderIcon, 
  Edit, Trash, Share, File as FileIcon, UploadCloud,
  Plus, Grid, List, Clock, Filter, Search
} from 'react-feather';

interface FolderViewProps {
  currentFolder: FolderInfo;
  subfolders: FolderInfo[];
  files: FileInfo[];
  breadcrumbs: FolderInfo[];
  loading: boolean;
  refreshKey: number;
  onNavigateBack: () => void;
  onBreadcrumbClick: (index: number) => void;
  onFolderClick: (folderId: number) => void;
  onFileAction: () => void;
  onFolderAction: () => void;
  onShareFile: (file: FileInfo) => void;
  onShareFolder: (folder: FolderInfo) => void;
  onRenameFolder?: (folderId: number, newName: string) => Promise<void>;
  onDeleteFolder?: (folderId: number) => Promise<void>;
  onFileUploaded: () => void;
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
  const [isRenamingFolder, setIsRenamingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState(currentFolder ? currentFolder.name : '');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [showDropzone, setShowDropzone] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Update folder name when the currentFolder changes
  useEffect(() => {
    if (currentFolder) {
      setNewFolderName(currentFolder.name);
    }
  }, [currentFolder]);

  // File upload functionality
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    let successCount = 0;
    
    try {
      const total = files.length;
      toast.loading(`Uploading ${total} files...`, { id: 'batch-upload' });
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 10 * 1024 * 1024) { // 10MB
          toast.error(`${file.name} exceeds 10MB limit`);
          continue;
        }
        
        try {
          await fileService.uploadFileToFolder(file, currentFolder.id);
          successCount++;
          toast.loading(`Uploading ${successCount}/${total} files...`, { id: 'batch-upload' });
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
        }
      }
      
      toast.success(`Uploaded ${successCount}/${total} files`, { id: 'batch-upload' });
      onFileUploaded();
    } catch (error) {
      toast.error('Upload failed', { id: 'batch-upload' });
      console.error('Error in batch upload:', error);
    } finally {
      setIsUploading(false);
      setShowDropzone(false);
    }
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onRenameFolder || !currentFolder) return;
    
    if (newFolderName.trim() === '') {
      toast.error('Folder name cannot be empty');
      return;
    }
    
    try {
      await onRenameFolder(currentFolder.id, newFolderName);
      toast.success('Folder renamed successfully');
      setIsRenamingFolder(false);
    } catch (error) {
      console.error('Error renaming folder:', error);
      toast.error('Failed to rename folder');
    }
  };

  const handleDeleteFolder = async () => {
    if (!onDeleteFolder || !currentFolder) return;
    
    try {
      await onDeleteFolder(currentFolder.id);
      toast.success('Folder deleted successfully');
      onNavigateBack();
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Failed to delete folder');
    }
  };

  // Safety check
  if (!currentFolder) {
    return <div>Loading folder...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8 animate-fadeIn">
      {/* Hero Header Section */}
      <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <button 
                onClick={onNavigateBack}
                className="mr-4 p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
                title="Back"
              >
                <ArrowLeft size={20} />
              </button>
              
              <div className="flex items-center">
                <div className="rounded-md p-3 bg-yellow-500/20 mr-4">
                  <FolderIcon size={32} className="text-yellow-400" />
                </div>
                
                {isRenamingFolder ? (
                  <form onSubmit={handleRenameSubmit} className="flex items-center">
                    <input
                      type="text"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      autoFocus
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white mr-2 w-64"
                    />
                    <button
                      type="submit"
                      className="p-2 text-green-400 hover:bg-green-900/40 rounded-md mr-1"
                      title="Save"
                    >
                      <span className="sr-only">Save</span>
                      ✓
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsRenamingFolder(false);
                        setNewFolderName(currentFolder.name);
                      }}
                      className="p-2 text-red-400 hover:bg-red-900/40 rounded-md"
                      title="Cancel"
                    >
                      <span className="sr-only">Cancel</span>
                      ✕
                    </button>
                  </form>
                ) : (
                  <h1 className="text-2xl font-bold text-white">{currentFolder.name}</h1>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setShowDropzone(!showDropzone)}
                className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                title="Upload Files"
              >
                <UploadCloud size={20} />
              </button>
              
              {!isRenamingFolder && onRenameFolder && (
                <button
                  onClick={() => setIsRenamingFolder(true)}
                  className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                  title="Rename Folder"
                >
                  <Edit size={20} />
                </button>
              )}
              
              <button
                onClick={() => onShareFolder(currentFolder)}
                className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                title="Share Folder"
              >
                <Share size={20} />
              </button>
              
              {!isConfirmingDelete && onDeleteFolder && (
                <button
                  onClick={() => setIsConfirmingDelete(true)}
                  className="p-2 text-red-400 hover:bg-red-900/40 rounded-md transition-colors"
                  title="Delete Folder"
                >
                  <Trash size={20} />
                </button>
              )}
              
              {isConfirmingDelete && (
                <div className="flex items-center bg-red-900/30 rounded-md px-3 py-2">
                  <span className="text-sm text-red-300 mr-2">Delete?</span>
                  <button
                    onClick={handleDeleteFolder}
                    className="px-2 py-1 text-white bg-red-600 hover:bg-red-700 rounded-md mr-1 text-xs font-medium"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-2 py-1 text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md text-xs font-medium"
                  >
                    No
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center flex-wrap text-sm text-gray-400">
            <button
              onClick={() => onBreadcrumbClick(-1)}
              className="flex items-center hover:text-blue-400 transition-colors"
            >
              <Home size={14} className="mr-1" />
              <span>Home</span>
            </button>
            
            {breadcrumbs.map((folder, index) => (
              <React.Fragment key={folder.id}>
                <ChevronRight size={14} className="mx-1 text-gray-500" />
                <button
                  onClick={() => onBreadcrumbClick(index)}
                  className="hover:text-blue-400 transition-colors whitespace-nowrap"
                >
                  {folder.name}
                </button>
              </React.Fragment>
            ))}
            
            <ChevronRight size={14} className="mx-1 text-gray-500" />
            <span className="font-medium text-white whitespace-nowrap">{currentFolder.name}</span>
          </div>
        </div>
      </div>

      {/* Upload Area - Minimized by default, expanded on drag or click */}
      {showDropzone || isDragActive ? (
        <div 
          className={`relative p-10 rounded-xl text-center transition-all duration-300 ease-in-out
            ${isDragActive ? 'scale-105' : ''} 
            ${isUploading ? 'opacity-90 cursor-not-allowed' : 'cursor-pointer'}`
          }
          style={{
            background: 'linear-gradient(135deg, #a84de9 0%, #7d4df3 50%, #5b6af3 100%)',
            boxShadow: '0 0 20px rgba(168, 77, 233, 0.3)',
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragActive(true);
          }}
          onDragLeave={() => setIsDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragActive(false);
            toast.error("Please use the file selector instead of drag and drop");
          }}
        >
          <div className="flex flex-col items-center justify-center space-y-6">
            <UploadCloud className="w-16 h-16 text-white" strokeWidth={1.5} />
            
            {isUploading ? (
              <div className="space-y-4">
                <p className="text-white font-medium text-lg">Uploading files...</p>
                <div className="w-48 h-1.5 bg-white/20 rounded-full overflow-hidden mx-auto">
                  <div className="h-full bg-white rounded-full" style={{width: '60%', animation: 'pulse 2s ease-in-out infinite'}}></div>
                </div>
              </div>
            ) : (
              <>
                <p className="text-xl font-medium text-white">
                  {isDragActive ? 'Drop files here' : 'Drag and drop files here'}
                </p>
                <p className="text-white/80">or</p>
                
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  multiple
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <label
                  htmlFor="file-upload"
                  className="px-8 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-md backdrop-blur-sm transition-colors cursor-pointer font-medium"
                >
                  Browse
                </label>
              </>
            )}
            
            {!isUploading && !isDragActive && (
              <button 
                onClick={() => setShowDropzone(false)} 
                className="absolute top-3 right-3 text-white/70 hover:text-white p-1 rounded-full"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      ) : (
        <div 
          onClick={() => setShowDropzone(true)}
          className="relative p-4 py-5 rounded-xl cursor-pointer transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, #a84de9 0%, #7d4df3 50%, #5b6af3 100%)',
            boxShadow: '0 0 15px rgba(168, 77, 233, 0.2)',
          }}
        >
          <div className="flex items-center justify-center space-x-3">
            <UploadCloud size={20} className="text-white" />
            <span className="text-white font-medium">Drag and drop files here</span>
          </div>
        </div>
      )}

      {/* View Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            title="Grid View"
          >
            <Grid size={18} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            title="List View"
          >
            <List size={18} />
          </button>
        </div>
        
        <div className="relative">
          <div className="flex items-center bg-gray-800 rounded-lg px-3 py-2">
            <Search size={16} className="text-gray-500 mr-2" />
            <input 
              type="text" 
              placeholder="Search files..." 
              className="bg-transparent border-none text-gray-300 text-sm focus:outline-none placeholder-gray-500 w-36"
            />
          </div>
        </div>
      </div>

      {/* Subfolders Section */}
      {subfolders.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-300 border-b border-gray-700 pb-2 flex items-center">
            <FolderIcon size={18} className="mr-2 text-yellow-400" />
            Subfolders
          </h2>
          
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subfolders.map(folder => (
                <div 
                  key={folder.id}
                  className="bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 hover:translate-y-[-2px] border border-gray-700 group"
                >
                  <div 
                    className="px-5 py-4 cursor-pointer"
                    onClick={() => onFolderClick(folder.id)}
                  >
                    <div className="flex items-start mb-3">
                      <div className="p-2 bg-yellow-500/20 rounded-md mr-3">
                        <FolderIcon size={24} className="text-yellow-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">{folder.name}</h3>
                        <p className="text-xs text-gray-400 flex items-center mt-1">
                          <Clock size={12} className="mr-1" />
                          Created {new Date(folder.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-4 py-3 bg-gray-800/80 border-t border-gray-700 flex items-center justify-between">
                    <span className="text-xs text-gray-400">3 items</span>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onShareFolder(folder)}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                        title="Share"
                      >
                        <Share size={14} />
                      </button>
                      <button 
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                        title="Rename"
                        onClick={() => {
                          /* Implement rename for subfolder */
                          toast.error("Rename subfolder not implemented");
                        }}
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        className="p-1.5 text-red-400 hover:bg-red-900/40 rounded"
                        title="Delete"
                        onClick={() => {
                          /* Implement delete for subfolder */
                          toast.error("Delete subfolder not implemented");
                        }}
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-xl overflow-hidden shadow-md border border-gray-700">
              <FolderList 
                folders={subfolders}
                onFolderAction={onFolderAction}
                onFolderClick={onFolderClick}
                onShare={onShareFolder}
                currentFolder={currentFolder}
              />
            </div>
          )}
        </div>
      )}
      
      {/* Files Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-gray-300 border-b border-gray-700 pb-2 flex items-center">
          <FileIcon size={18} className="mr-2 text-blue-400" />
          Files in "{currentFolder.name}"
        </h2>
        
        {loading ? (
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-700 rounded w-1/4 mb-6"></div>
              <div className="h-10 bg-gray-700 rounded"></div>
              <div className="grid grid-cols-6 gap-4">
                <div className="h-8 bg-gray-700 rounded col-span-1"></div>
                <div className="h-8 bg-gray-700 rounded col-span-1"></div>
                <div className="h-8 bg-gray-700 rounded col-span-1"></div>
                <div className="h-8 bg-gray-700 rounded col-span-2"></div>
                <div className="h-8 bg-gray-700 rounded col-span-1"></div>
              </div>
              <div className="space-y-2">
                {[1, 2, 3].map((item) => (
                  <div key={`skeleton-${item}-${refreshKey}`} className="h-16 bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl overflow-hidden shadow-md border border-gray-700">
            <FileList 
              files={files} 
              onFileAction={onFileAction} 
              onShare={onShareFile}
              currentFolderId={currentFolder.id}
              folders={subfolders}
              onFileMove={onFileAction}
            />
          </div>
        )}
      </div>
      
      {/* Empty State */}
      {!loading && subfolders.length === 0 && files.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 bg-gray-800/50 rounded-xl border border-gray-700">
          <FolderIcon size={48} className="text-gray-600" />
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-300">This folder is empty</h3>
            <p className="text-sm text-gray-500 max-w-md">
              Upload files or create subfolders to organize your content
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-2">
            <button
              onClick={() => setShowDropzone(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-md transition-colors flex items-center"
            >
              <UploadCloud size={16} className="mr-2" />
              Upload Files
            </button>
            <button
              onClick={() => {
                /* Implement create folder */
                toast.error("Create subfolder not implemented");
              }}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md shadow-md transition-colors flex items-center"
            >
              <Plus size={16} className="mr-2" />
              New Folder
            </button>
          </div>
        </div>
      )}
      
      {/* Keyboard Shortcuts Tooltip - Hidden in UI but available as info */}
      <div className="sr-only">
        <p>Keyboard shortcuts:</p>
        <ul>
          <li>U: Upload files</li>
          <li>N: New folder</li>
          <li>G: Grid view</li>
          <li>L: List view</li>
          <li>/: Search</li>
        </ul>
      </div>

      {/* Add the keyframe animation for the border */}
      <style>{`
        @keyframes pulse-gradient {
          0% { background-position: 0% 0%; }
          50% { background-position: 100% 0%; }
          100% { background-position: 0% 0%; }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.4), 0 0 10px 2px rgba(236, 72, 153, 0.3);
          }
          50% {
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.6), 0 0 20px 4px rgba(236, 72, 153, 0.5);
          }
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default FolderView; 