'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DataTable from '@/components/DataTable';
import LoadingOverlay from '@/components/LoadingOverlay';
import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle, AlertTriangle, FileText, ArrowRight, X } from 'lucide-react';
import { importService } from '@/services/import.service';
import { CSVPreviewResponse } from '@/types';
import { formatFileSize, formatNumber } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function PreviewPage() {
  const router = useRouter();
  const params = useParams();
  const importId = params?.id as string;
  
  const [preview, setPreview] = useState<CSVPreviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (importId) {
      fetchPreview();
    }
  }, [importId]);

  const fetchPreview = () => {
    try {
      setLoading(true);
      setError(null);
      // Retrieve the preview data saved in sessionStorage during upload
      const savedData = sessionStorage.getItem(`csv_preview_${importId}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setPreview(parsed);
      } else {
        setError('Preview data expired or not found. Please upload the file again.');
      }
    } catch (err) {
      console.error('Failed to load preview:', err);
      setError('Failed to load CSV preview.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    try {
      setProcessing(true);
      const response = await importService.processImport(importId);
      
      if (response.success) {
        router.push(`/import/${importId}/processing`);
      } else {
        setError(response.message || 'Failed to start import processing');
      }
    } catch (err: any) {
      console.error('Failed to start import:', err);
      setError(err.response?.data?.message || err.message || 'Failed to start import');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    sessionStorage.removeItem(`csv_preview_${importId}`);
    router.push('/dashboard');
  };

  if (loading) {
    return <LoadingOverlay message="Loading CSV preview..." />;
  }

  if (error || !preview) {
    return (
      <div className="card text-center py-12 max-w-xl mx-auto space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto animate-pulse" />
        <div>
          <h3 className="text-lg font-bold text-text-primary">Preview Not Available</h3>
          <p className="text-sm text-text-secondary mt-1">{error || 'Data is missing'}</p>
        </div>
        <button onClick={() => router.push('/upload')} className="btn-primary mt-2">
          Upload New File
        </button>
      </div>
    );
  }

  // Create dynamic columns from preview headers
  const columns: ColumnDef<any>[] = preview.headers.map((header) => ({
    accessorKey: header,
    header: header,
    cell: ({ row }) => (
      <span className="text-xs font-semibold text-text-primary">
        {row.original[header] !== undefined && row.original[header] !== null
          ? String(row.original[header])
          : '-'}
      </span>
    ),
  }));

  return (
    <>
      {processing && <LoadingOverlay message="Starting AI extraction pipeline..." />}
      
      <div className="space-y-6">
        {/* File Info */}
        <div className="card flex items-center justify-between p-5">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-50 dark:bg-indigo-900/25 p-3.5 rounded-xl text-indigo-600 dark:text-indigo-400 shadow-sm">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-text-primary">{preview.filename}</h2>
              <p className="text-xs text-text-secondary font-semibold mt-1">
                {formatFileSize(preview.filesize)} • {formatNumber(preview.totalRows)} rows • {preview.headers.length} columns
              </p>
            </div>
          </div>
        </div>

        {/* Validation Status */}
        {preview.validation && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {preview.validation.isValid ? (
              <div className="card bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/10 p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Structure Validated</p>
                    <p className="text-xs font-medium text-text-secondary mt-1">
                      File format matches CSV standard and contains processable rows.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card bg-red-50 dark:bg-red-950/20 border border-red-500/10 p-5">
                <div className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-700 dark:text-red-400">File Errors Found</p>
                    <ul className="text-xs font-semibold text-text-secondary mt-2 space-y-1">
                      {preview.validation.errors.map((err, idx) => (
                        <li key={idx}>• {err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {preview.validation.warnings && preview.validation.warnings.length > 0 && (
              <div className="card bg-amber-50 dark:bg-amber-950/20 border border-amber-500/10 p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-700 dark:text-amber-400">Import Warnings</p>
                    <ul className="text-xs font-semibold text-text-secondary mt-2 space-y-1">
                      {preview.validation.warnings.map((warning, idx) => (
                        <li key={idx}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Preview Table */}
        <div className="card">
          <h3 className="text-base font-bold text-text-primary mb-4">
            Spreadsheet Sample Rows (First 10)
          </h3>
          <DataTable data={preview.preview} columns={columns} maxHeight="350px" />
        </div>

        {/* Column Statistics */}
        {preview.columnStats && Object.keys(preview.columnStats).length > 0 && (
          <div className="card">
            <h3 className="text-base font-bold text-text-primary mb-4">
              Metadata Column Diagnostics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(preview.columnStats).map(([column, stats]) => (
                <div key={column} className="border border-border-primary/80 bg-bg-primary/20 rounded-xl p-4 shadow-sm hover:border-accent/20 transition-all duration-350">
                  <p className="text-sm font-bold text-text-primary truncate">{column}</p>
                  <div className="mt-3 text-xs text-text-secondary space-y-2 font-semibold">
                    <div className="flex justify-between items-center">
                      <span>Fill Rate</span>
                      <span className="text-text-primary font-bold">{stats.fillRate}%</span>
                    </div>
                    {/* Fill Rate Progress Bar */}
                    <div className="w-full h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${stats.fillRate}%` }} />
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-border-primary/40">
                      <span>Inferred Type</span>
                      <span className="badge badge-primary text-[10px] uppercase font-bold">{stats.dataType}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Unique Count</span>
                      <span className="text-text-primary font-bold">{formatNumber(stats.uniqueCount)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="card bg-bg-secondary p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-text-primary">Proceed with Mapping?</p>
            <p className="text-xs text-text-secondary mt-1 font-semibold">
              Ready to send rows to AI extractor for CRM schema transformation.
            </p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={handleCancel}
              className="btn-secondary w-full sm:w-auto font-bold"
              disabled={processing}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmImport}
              className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 font-bold"
              disabled={processing || !preview.validation?.isValid}
            >
              Start Mapping Pipeline
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
