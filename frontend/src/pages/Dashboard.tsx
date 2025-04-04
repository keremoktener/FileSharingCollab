import React, { useEffect, useState } from 'react';
import { fileService } from '../services/api';
import { FileInfo } from '../types';
import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFiles = async () => {
    try {
      setLoading(true);
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Files</h1>
        <p className="text-gray-600 mt-2">
          Upload, download, and manage your files securely
        </p>
      </div>

      <FileUpload onFileUploaded={loadFiles} />

      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-6 flex justify-center">
          <p className="text-gray-500">Loading files...</p>
        </div>
      ) : (
        <FileList files={files} onFileAction={loadFiles} />
      )}
    </div>
  );
};

export default Dashboard; 