import React, { useState } from 'react';
import { SharedItemInfo } from '../types';
import { sharingService } from '../services/api';
import toast from 'react-hot-toast';
import { Download, Trash, FileText, Folder, Clock, User, MoreVertical, Eye } from 'react-feather';

// Display mode enum (matching Dashboard component)
enum DisplayMode {
  GRID,
  LIST
}

interface SharedItemListProps {
  items: SharedItemInfo[];
  refreshItems: () => void;
  displayMode?: DisplayMode;
}

const SharedItemList: React.FC<SharedItemListProps> = ({ 
  items, 
  refreshItems,
  displayMode = DisplayMode.GRID
}) => {
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleRemoveSharing = async (itemId: number) => {
    if (window.confirm('Are you sure you want to remove sharing for this item?')) {
      try {
        await sharingService.revokeSharing(itemId);
        toast.success('Sharing removed successfully');
        refreshItems();
      } catch (error) {
        console.error('Error removing sharing:', error);
        toast.error('Failed to remove sharing');
      }
    }
  };

  const toggleDropdown = (e: React.MouseEvent, itemId: number) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === itemId ? null : itemId);
  };

  const closeDropdown = () => {
    setActiveDropdown(null);
  };

  const getItemName = (item: SharedItemInfo): string => {
    return item.name || item.fileName || item.folderName || 'Unnamed item';
  };

  const getSharedBy = (item: SharedItemInfo): string => {
    return item.sharedBy || item.ownerName || 'Unknown';
  };

  const getSharedAt = (item: SharedItemInfo): string => {
    return item.sharedAt || item.createdAt;
  };

  if (items.length === 0) {
    return (
      <div className="text-center p-6 border border-dashed rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
        <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No shared items</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          No items have been shared with you yet
        </p>
      </div>
    );
  }

  // Grid view (default card layout)
  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {items.map((item) => (
        <div 
          key={item.id} 
          className="relative bg-white dark:bg-gray-800 rounded-md shadow-md p-5 
            hover:shadow-lg transition-all duration-200 cursor-pointer
            border border-gray-100 dark:border-gray-700 group"
        >
          {/* Icon and Name */}
          <div className="flex items-center mb-3 relative">
            <div className={`rounded-md p-2 ${item.isFolder ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-blue-100 dark:bg-blue-900/30'} mr-3`}>
              {item.isFolder ? (
                <Folder className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />
              ) : (
                <FileText className="h-6 w-6 text-blue-500 dark:text-blue-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium truncate text-gray-800 dark:text-gray-200" title={getItemName(item)}>
                {getItemName(item)}
              </h3>
            </div>
            
            {/* Actions Dropdown */}
            <div className="relative">
              <button 
                onClick={(e) => toggleDropdown(e, item.id)}
                className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Item options"
              >
                <MoreVertical size={18} className="text-gray-500 dark:text-gray-400" />
              </button>
              
              {activeDropdown === item.id && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 py-1 border border-gray-100 dark:border-gray-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      // View item logic
                      closeDropdown();
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Eye size={16} className="mr-2" />
                    <span>View</span>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      // Download item logic
                      closeDropdown();
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Download size={16} className="mr-2" />
                    <span>Download</span>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSharing(item.id);
                      closeDropdown();
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash size={16} className="mr-2" />
                    <span>Remove Sharing</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Item Info */}
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mb-3">
            <div className="flex items-center">
              <User size={12} className="mr-1" />
              <span>Shared by {getSharedBy(item)}</span>
            </div>
            <div className="flex items-center">
              <Clock size={12} className="mr-1" />
              <span>Shared on {formatDate(getSharedAt(item))}</span>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="absolute top-2 right-2">
            <span className={`text-xs px-2 py-1 rounded-full ${item.isFolder ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}`}>
              {item.isFolder ? 'Folder' : 'File'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  // List view (table layout)
  const renderListView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Shared By
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Shared On
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {items.map((item) => (
            <tr 
              key={item.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className={`rounded-md p-2 ${item.isFolder ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-blue-100 dark:bg-blue-900/30'} mr-3`}>
                    {item.isFolder ? (
                      <Folder className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
                    ) : (
                      <FileText className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                    )}
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {getItemName(item)}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs rounded-full ${item.isFolder ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                  {item.isFolder ? 'Folder' : 'File'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {getSharedBy(item)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(getSharedAt(item))}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                <div className="flex justify-end space-x-2">
                  <button
                    className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    title="View"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    title="Download"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => handleRemoveSharing(item.id)}
                    className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    title="Remove sharing"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      {displayMode === DisplayMode.GRID ? renderGridView() : renderListView()}
    </>
  );
};

export default SharedItemList; 