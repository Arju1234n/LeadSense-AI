'use client';

import UploadDropzone from '@/components/UploadDropzone';
import ProgressBar from '@/components/ProgressBar';
import { useUpload } from '@/hooks/useUpload';
import { AlertCircle, CheckCircle2, FileText, Sparkles, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UploadPage() {
  const {
    selectedFile,
    uploading,
    uploadProgress,
    error,
    handleFileSelect,
    handleClearFile,
    uploadFile,
  } = useUpload();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-black text-text-primary tracking-tight">Upload Leads File</h2>
        <p className="text-sm text-text-secondary mt-1">
          Import your contacts from any CSV. Our AI engine will auto-detect columns and validate records.
        </p>
      </div>

      {/* Instructions */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-accent-bg border-accent/20 flex gap-4"
      >
        <div className="bg-white dark:bg-bg-secondary p-2.5 rounded-xl text-accent shadow-sm h-fit">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-text-primary mb-1">
            Arbitrary Columns & AI Mapping
          </h3>
          <ul className="text-xs text-text-secondary space-y-1 list-disc list-inside font-semibold leading-relaxed">
            <li>You do NOT need to match our headers. AI mapping will do the translation.</li>
            <li>Supported formats: CSV (.csv) up to 10MB in size.</li>
            <li>Make sure each row contains at least an email or a phone number.</li>
          </ul>
        </div>
      </motion.div>

      {/* Upload Section */}
      <div className="card">
        <h3 className="text-base font-bold text-text-primary mb-4">Select Spreadsheet</h3>
        
        <UploadDropzone
          onFileSelect={handleFileSelect}
          selectedFile={selectedFile}
          onClear={handleClearFile}
          disabled={uploading}
        />

        {/* Upload Progress */}
        {uploading && (
          <div className="mt-6">
            <ProgressBar
              progress={uploadProgress}
              status="uploading"
              message="Processing spreadsheet structure and rows..."
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-danger-50 dark:bg-danger-950/20 border border-danger-500/10 rounded-2xl flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-600 dark:text-red-400">File Processing Failed</p>
              <p className="text-xs font-semibold text-text-secondary mt-1">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Upload Button */}
        {selectedFile && !uploading && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex gap-4"
          >
            <button
              onClick={uploadFile}
              className="btn-primary flex-1 font-bold"
              disabled={uploading}
            >
              <CheckCircle2 className="w-5 h-5" />
              Upload & Preview
            </button>
            <button
              onClick={handleClearFile}
              className="btn-secondary font-bold"
              disabled={uploading}
            >
              Cancel
            </button>
          </motion.div>
        )}
      </div>

      {/* Expected Columns Guide */}
      <div className="card">
        <h3 className="text-sm font-bold text-text-primary mb-3">
          Auto-Mapped CRM Lead Fields
        </h3>
        <p className="text-xs text-text-secondary mb-4 leading-relaxed font-medium">
          The importer will attempt to parse, extract, and align raw data into these structured destination fields:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {[
            'Name',
            'Email',
            'Phone',
            'Country Code',
            'Company',
            'City',
            'State',
            'Country',
            'Lead Owner',
            'CRM Status',
            'CRM Note',
            'Possession Time',
            'Description',
          ].map((field) => (
            <div key={field} className="flex items-center gap-2 font-semibold">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span className="text-text-secondary">{field}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 p-3.5 bg-bg-tertiary rounded-xl border border-border-primary flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-text-secondary font-bold leading-normal uppercase">
            Validation Note: Name and at least one contact method (email or phone) must be present. Rows lacking these will be marked as skipped.
          </p>
        </div>
      </div>
    </div>
  );
}
