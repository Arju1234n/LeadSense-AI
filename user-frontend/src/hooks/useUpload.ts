'use client';

import { useState } from 'react';
import { importService } from '@/services/import.service';
import { useRouter } from 'next/navigation';

export function useUpload() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);
    setUploadProgress(0);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setError(null);
    setUploadProgress(0);
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError(null);
      setUploadProgress(0);

      const response = await importService.uploadCSV(selectedFile, (progress) => {
        setUploadProgress(progress);
      });

      if (response.success && response.data) {
        // Save the preview data in sessionStorage so the preview page can access it immediately without an extra round-trip
        sessionStorage.setItem(`csv_preview_${response.data.importId}`, JSON.stringify(response.data));
        
        // Navigate to preview page
        router.push(`/import/${response.data.importId}/preview`);
      } else {
        setError(response.message || 'Upload failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  return {
    selectedFile,
    uploading,
    uploadProgress,
    error,
    handleFileSelect,
    handleClearFile,
    uploadFile,
  };
}
