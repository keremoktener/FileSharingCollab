import React, { useState, useEffect } from 'react';
import { FileInfo, FolderInfo, AccessType, ShareItemRequest } from '../types';
import { sharingService } from '../services/api';
import toast from 'react-hot-toast';
import { X, Copy, Calendar, Link } from 'react-feather';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: () => void;
  item: FileInfo | FolderInfo | null;
  isFolder: boolean;
}

const ShareModal: React.FC<ShareModalProps> = ({ 
  isOpen, 
  onClose, 
  onShare,
  item, 
  isFolder 
}) => {
  const [shareEmail, setShareEmail] = useState<string>('');
  const [accessType, setAccessType] = useState<AccessType>(AccessType.VIEW);
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [publicLink, setPublicLink] = useState<string>('');
  const [isSharing, setIsSharing] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setShareEmail('');
      setAccessType(AccessType.VIEW);
      setIsPublic(false);
      setExpiryDate('');
      setPublicLink('');
    }
  }, [isOpen]);

  const handleShare = async () => {
    if (!item) return;

    try {
      setIsSharing(true);

      const request: ShareItemRequest = {
        fileId: !isFolder ? (item as FileInfo).id : undefined,
        folderId: isFolder ? (item as FolderInfo).id : undefined,
        userEmail: shareEmail.trim() !== '' ? shareEmail : undefined,
        access: accessType,
        isPublic,
        expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined
      };

      const result = await sharingService.shareItem(request);
      
      if (isPublic) {
        const publicUrl = sharingService.getPublicUrl(result.publicLink);
        setPublicLink(publicUrl);
      }
      
      toast.success('Item shared successfully');
      onShare();
      
      if (!isPublic) {
        onClose();
      }
    } catch (error) {
      console.error('Error sharing item:', error);
      toast.error('Failed to share item');
    } finally {
      setIsSharing(false);
    }
  };

  const copyPublicLink = () => {
    navigator.clipboard.writeText(publicLink);
    toast.success('Link copied to clipboard');
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Share {isFolder ? 'Folder' : 'File'}</h2>
          <button 
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Share <strong>{isFolder ? (item as FolderInfo).name : (item as FileInfo).fileName}</strong> with:
          </p>
          
          {/* Share with user */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Email address:</label>
            <input
              type="email"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              placeholder="Enter email address"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          
          {/* Access permissions */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Permission:</label>
            <select
              value={accessType}
              onChange={(e) => setAccessType(e.target.value as AccessType)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            >
              <option value={AccessType.VIEW}>View only</option>
              <option value={AccessType.COMMENT}>Comment</option>
              <option value={AccessType.EDIT}>Edit</option>
            </select>
          </div>
          
          {/* Public sharing */}
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="mr-2"
              />
              <span>Create a public link</span>
            </label>
          </div>
          
          {/* Expiry date (only if public) */}
          {isPublic && (
            <div className="mb-4">
              <label className="flex items-center mb-1">
                <Calendar size={16} className="mr-2" />
                <span>Expires on (optional):</span>
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          )}
        </div>
        
        {/* Public link display */}
        {publicLink && (
          <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium flex items-center">
                <Link size={16} className="mr-2" />
                Public Link:
              </label>
              <button 
                onClick={copyPublicLink} 
                className="btn btn-ghost btn-xs"
              >
                <Copy size={14} className="mr-1" />
                Copy
              </button>
            </div>
            <div className="text-sm bg-white dark:bg-gray-600 p-2 rounded break-all">
              {publicLink}
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="btn btn-ghost"
            disabled={isSharing}
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            className="btn btn-primary"
            disabled={isSharing || (shareEmail.trim() === '' && !isPublic)}
          >
            {isSharing ? 'Sharing...' : 'Share'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal; 