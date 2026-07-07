'use client';

import { useRouter } from 'next/navigation';
import DataTable from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { FileCheck, Upload, Trash2, ArrowRight } from 'lucide-react';
import { useHistory } from '@/hooks/useHistory';
import { formatNumber, formatFileSize } from '@/lib/utils';
import { format } from 'date-fns';
import { IMPORT_STATUSES, ImportHistory } from '@/types';
import { motion } from 'framer-motion';

export default function HistoryPage() {
  const router = useRouter();
  const {
    history,
    loading,
    error,
    pagination,
    sortBy,
    sortOrder,
    setPage,
    setSortOrder,
    refresh
  } = useHistory();

  const columns: ColumnDef<ImportHistory>[] = [
    {
      accessorKey: 'filename',
      header: 'Filename',
      cell: ({ row }) => (
        <div>
          <p className="font-bold text-text-primary text-sm">{row.original.filename}</p>
          <p className="text-[10px] text-text-secondary mt-0.5 font-semibold">
            {formatFileSize(row.original.filesize)}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'totalRows',
      header: 'Total Rows',
      cell: ({ row }) => formatNumber(row.original.totalRows),
    },
    {
      accessorKey: 'successfulRows',
      header: 'Successful',
      cell: ({ row }) => (
        <span className="text-emerald-500 font-bold">
          {formatNumber(row.original.successfulRows)}
        </span>
      ),
    },
    {
      accessorKey: 'skippedRows',
      header: 'Skipped',
      cell: ({ row }) => (
        <span className="text-amber-500 font-bold">
          {formatNumber(row.original.skippedRows)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const statusColors = {
          [IMPORT_STATUSES.COMPLETED]: 'bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/10',
          [IMPORT_STATUSES.PROCESSING]: 'bg-indigo-100 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/10',
          [IMPORT_STATUSES.FAILED]: 'bg-red-100 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-500/10',
          [IMPORT_STATUSES.PENDING]: 'bg-amber-100 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-500/10',
        };
        return (
          <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${statusColors[status]}`}>
            {status.toUpperCase()}
          </span>
        );
      },
    },
    {
      accessorKey: 'processingTimeMs',
      header: 'Time',
      cell: ({ row }) => `${Math.round(row.original.processingTimeMs / 1000)}s`,
    },
    {
      accessorKey: 'aiProvider',
      header: 'AI Provider',
      cell: ({ row }) => (
        <span className="capitalize text-xs font-semibold badge badge-neutral">{row.original.aiProvider}</span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => format(new Date(row.original.createdAt), 'MMM dd, yyyy HH:mm'),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <button
          onClick={() => router.push(`/import/${row.original._id}/results`)}
          className="text-accent hover:text-accent-dark text-sm font-bold flex items-center gap-0.5 hover:underline"
        >
          Details <ArrowRight className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  if (loading && history.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-bg-tertiary"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-accent border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-text-primary">Import Audit History</h2>
          <p className="text-sm text-text-secondary mt-1">
            View and manage all your past spreadsheet mapping and processing sessions.
          </p>
        </div>
        <button
          onClick={() => router.push('/upload')}
          className="btn-primary flex items-center gap-2 font-bold text-xs px-4"
        >
          <Upload className="w-4 h-4" />
          Upload New CSV
        </button>
      </div>

      {/* History Table */}
      <div className="card">
        {history.length > 0 ? (
          <div className="space-y-6">
            <DataTable data={history} columns={columns} maxHeight="600px" />
            
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-border-primary">
                <p className="text-xs font-semibold text-text-secondary">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} records
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="btn-secondary py-1.5 px-3 disabled:opacity-50 text-xs font-bold"
                  >
                    Previous
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setPage(page)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          page === pagination.page
                            ? 'bg-accent text-white shadow-glow-sm'
                            : 'bg-bg-tertiary text-text-secondary hover:bg-border-primary'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setPage(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="btn-secondary py-1.5 px-3 disabled:opacity-50 text-xs font-bold"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <FileCheck className="w-12 h-12 text-text-tertiary mx-auto mb-4 animate-bounce-slow" />
            <p className="text-text-secondary font-bold mb-4">No import sessions recorded yet</p>
            <button
              onClick={() => router.push('/upload')}
              className="btn-primary"
            >
              Upload Your First CSV
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
