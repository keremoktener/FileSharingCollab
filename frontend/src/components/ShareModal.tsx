import React, { useState } from 'react';
import { AccessType } from '../types';
import { sharingService } from '../services/api';
import toast from 'react-hot-toast';
import { Share, Link, Copy, X } from 'react-feather';

interface ShareModalProps {
  onClose: () => void;
  onShareCompleted: () => void;
  itemId: number;
  isFolder: boolean;
}

const ShareModal: React.FC<ShareModalProps> = ({ 
  onClose, 
  onShareCompleted,
  itemId,
  isFolder
}) => {
  const [email, setEmail] = useState('');
  const [access, setAccess] = useState<AccessType>(AccessType.VIEW);
  const [isPublic, setIsPublic] = useState(false);
  const [expiryDays, setExpiryDays] = useState('7');
  const [isLoading, setIsLoading] = useState(false);
  const [publicLink, setPublicLink] = useState('');
  const [error, setError] = useState('');

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate if not public, email is required
    if (!isPublic && !email.trim()) {
      setError('Please enter an email address');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // Calculate expiry date if applicable
      let expiryDate;
      if (expiryDays && parseInt(expiryDays) > 0) {
        expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + parseInt(expiryDays));
      }
      
      const response = await sharingService.shareItem({
        fileId: !isFolder ? itemId : undefined,
        folderId: isFolder ? itemId : undefined,
        userEmail: isPublic ? undefined : email.trim(),
        access: access,
        isPublic: isPublic,
        expiryDate: expiryDate?.toISOString(),
      });
      
      if (isPublic && response.publicLink) {
        setPublicLink(sharingService.getPublicUrl(response.publicLink));
      } else {
        toast.success(`Item shared successfully with ${email}`);
        onShareCompleted();
      }
      
    } catch (error) {
      console.error('Error sharing item:', error);
      setError('Failed to share. Please try again.');
      toast.error('Failed to share item');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicLink);
    toast.success('Link copied to clipboard');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <Share className="h-6 w-6 text-blue-500 dark:text-blue-400 mr-2" />
            Share {isFolder ? 'Folder' : 'File'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>
        
        {publicLink ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md text-green-800 dark:text-green-300">
              <p className="font-medium mb-1">Public link created successfully!</p>
              <p className="text-sm">Anyone with this link can access your {isFolder ? 'folder' : 'file'}.</p>
            </div>
            
            <div className="flex items-center mt-4">
              <input
                type="text"
                value={publicLink}
                readOnly
                className="flex-1 p-2.5 border border-gray-300 dark:border-gray-600 rounded-l-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none"
              />
              <button
                onClick={copyToClipboard}
                className="px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-r-md"
                title="Copy to clipboard"
              >
                <Copy size={20} />
              </button>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-300 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleShare} className="space-y-4">
            <div className="flex space-x-2 mb-4">
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`flex-1 py-2 px-3 rounded-md ${!isPublic 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 font-medium' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                }`}
              >
                Share with User
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`flex-1 py-2 px-3 rounded-md ${isPublic 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 font-medium' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                }`}
              >
                Create Link
              </button>
            </div>
            
            {!isPublic ? (
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter recipient's email"
                />
              </div>
            ) : (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md mb-4 flex items-start">
                <Link className="text-blue-500 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" size={18} />
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Anyone with the link will be able to access this {isFolder ? 'folder' : 'file'} without signing in.
                </p>
              </div>
            )}
            
            <div className="mb-4">
              <label htmlFor="access" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Permission
              </label>
              <select
                id="access"
                value={access}
                onChange={(e) => setAccess(e.target.value as AccessType)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value={AccessType.VIEW}>View only</option>
                <option value={AccessType.COMMENT}>Can comment</option>
                <option value={AccessType.EDIT}>Can edit</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Expires After (days)
              </label>
              <input
                type="number"
                id="expiry"
                value={expiryDays}
                onChange={(e) => setExpiryDays(e.target.value)}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter number of days (0 for no expiry)"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Set to 0 for no expiration
              </p>
            </div>
            
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Sharing...' : 'Share'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ShareModal; 