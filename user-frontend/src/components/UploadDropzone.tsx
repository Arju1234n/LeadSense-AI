'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, X, AlertCircle } from 'lucide-react';
import { formatFileSize } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadDropzoneProps {
  onFileSelect: (file: File) => void;
  selectedFile?: File | null;
  onClear?: () => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  disabled?: boolean;
}

export default function UploadDropzone({
  onFileSelect,
  selectedFile,
  onClear,
  accept = { 'text/csv': ['.csv'] },
  maxSize = 10 * 1024 * 1024, // 10MB
  disabled = false,
}: UploadDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    disabled,
  });

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {selectedFile ? (
          <motion.div
            key="file-selected"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border border-border-primary bg-bg-secondary rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-accent-bg p-3.5 rounded-xl text-accent shadow-sm">
                  <FileSpreadsheet className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary truncate max-w-md">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-text-secondary mt-1 font-medium">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              {onClear && (
                <motion.button
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClear}
                  className="p-2 rounded-xl text-text-secondary hover:text-red-500 transition-colors"
                  disabled={disabled}
                  aria-label="Remove File"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <div
              {...getRootProps()}
              className={`
                relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 outline-none
                ${isDragActive ? 'border-accent bg-accent-bg/40 shadow-glow-sm' : 'border-border-secondary hover:border-accent bg-bg-secondary'}
                ${isDragReject ? 'border-danger-500 bg-danger-50/50' : ''}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                <motion.div 
                  animate={isDragActive ? { y: -5, scale: 1.1 } : { y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className={`p-4 rounded-full ${isDragActive ? 'bg-accent/15 text-accent' : 'bg-bg-tertiary text-text-secondary'}`}
                >
                  <Upload className="w-8 h-8" />
                </motion.div>
                <div>
                  <p className="text-base font-semibold text-text-primary">
                    {isDragActive
                      ? 'Drop your CSV file here'
                      : 'Drag & drop your CSV file here'}
                  </p>
                  <p className="text-sm text-text-secondary mt-1 font-medium">
                    or <span className="text-accent font-semibold hover:underline">browse</span> to choose a file
                  </p>
                </div>
                <div className="text-xs text-text-tertiary space-y-1 mt-1 font-medium">
                  <p>Supported format: CSV only</p>
                  <p>Maximum size: {formatFileSize(maxSize)}</p>
                </div>
              </div>
              {isDragReject && (
                <div className="absolute inset-0 bg-danger-500/10 rounded-2xl flex items-center justify-center backdrop-blur-[1px]">
                  <div className="bg-bg-secondary border border-danger-200 px-4 py-2 rounded-xl shadow-md flex items-center gap-2 text-danger-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-semibold">Invalid file format!</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
