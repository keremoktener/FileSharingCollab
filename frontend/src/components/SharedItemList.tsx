import React, { useState } from 'react';
import { SharedItemInfo, AccessType } from '../types';
import { sharingService, fileService } from '../services/api';
import toast from 'react-hot-toast';
import { Download, Trash, Link, FileText, Folder, User, Clock } from 'react-feather';

interface SharedItemListProps {
  items: SharedItemInfo[];
  isSharedByMe: boolean;
  onItemAction: () => void;
}

const SharedItemList: React.FC<SharedItemListProps> = ({ 
  items, 
  isSharedByMe,
  onItemAction 
}) => {
  const [revokingId, setRevokingId] = useState<number | null>(null);

  const handleDownload = async (item: SharedItemInfo) => {
    try {
      toast.loading(`Preparing download...`, { id: `download-shared-${item.id}` });
      
      let blob;
      if (item.isFolder) {
        blob = await fileService.downloadFile(item.fileId!);
      } else {
        blob = await fileService.downloadFile(item.fileId!);
      }
      
      toast.success('Download ready!', { id: `download-shared-${item.id}` });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.isFolder ? `${item.folderName}.zip` : item.fileName!;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading shared item:', error);
      toast.error('Failed to download item', { id: `download-shared-${item.id}` });
    }
  };

  const handleRevokeSharing = async (item: SharedItemInfo) => {
    if (window.confirm(`Are you sure you want to revoke sharing for this ${item.isFolder ? 'folder' : 'file'}?`)) {
      try {
        setRevokingId(item.id);
        await sharingService.revokeSharing(item.id);
        toast.success('Sharing revoked successfully');
        onItemAction();
      } catch (error) {
        console.error('Error revoking sharing:', error);
        toast.error('Failed to revoke sharing');
      } finally {
        setRevokingId(null);
      }
    }
  };

  const copyPublicLink = (link: string) => {
    const publicUrl = sharingService.getPublicUrl(link);
    navigator.clipboard.writeText(publicUrl);
    toast.success('Link copied to clipboard');
  };

  const getAccessLabel = (access: AccessType) => {
    switch (access) {
      case AccessType.VIEW:
        return { label: 'View only', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' };
      case AccessType.COMMENT:
        return { label: 'Comment', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' };
      case AccessType.EDIT:
        return { label: 'Edit', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' };
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' };
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center p-6 border border-dashed rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
        <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
          No shared items
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {isSharedByMe 
            ? "You haven't shared any items yet"
            : "No one has shared any items with you yet"
          }
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Item
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {isSharedByMe ? 'Shared With' : 'Owner'}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Access
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Date Shared
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
          {items.map((item) => {
            const accessInfo = getAccessLabel(item.access);
            return (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {item.isFolder ? (
                      <Folder className="h-5 w-5 text-yellow-500 mr-3" />
                    ) : (
                      <FileText className="h-5 w-5 text-blue-500 mr-3" />
                    )}
                    <div className="truncate max-w-xs">
                      {item.isFolder ? item.folderName : item.fileName}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    {isSharedByMe 
                      ? (item.sharedWithEmail || 'Public link')
                      : item.ownerName
                    }
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${accessInfo.color}`}>
                    {accessInfo.label}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                  {item.expiryDate && (
                    <div className="text-xs mt-1">
                      Expires: {new Date(item.expiryDate).toLocaleDateString()}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleDownload(item)}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200"
                      title="Download"
                    >
                      <Download className="h-5 w-5" />
                    </button>
                    
                    {item.publicLink && (
                      <button
                        onClick={() => copyPublicLink(item.publicLink)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200"
                        title="Copy public link"
                      >
                        <Link className="h-5 w-5" />
                      </button>
                    )}
                    
                    {isSharedByMe && (
                      <button
                        onClick={() => handleRevokeSharing(item)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
                        title="Revoke sharing"
                        disabled={revokingId === item.id}
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SharedItemList; 