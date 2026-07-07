'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { FileCheck, Search, Filter } from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { formatNumber, formatFileSize } from '@/lib/utils';
import { format } from 'date-fns';
import { ImportHistory, IMPORT_STATUSES } from '@/types';
import { motion } from 'framer-motion';

export default function AllImportsPage() {
  const [imports, setImports] = useState<ImportHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchImports();
  }, [pagination.page, status]);

  const fetchImports = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllImports(
        pagination.page,
        pagination.limit,
        search,
        status
      );
      if (response.success && response.data) {
        setImports(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (error) {
      console.error('Failed to fetch admin imports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchImports();
  };

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
        const rowStatus = row.original.status;
        const statusColors = {
          [IMPORT_STATUSES.COMPLETED]: 'bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/10',
          [IMPORT_STATUSES.PROCESSING]: 'bg-indigo-100 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/10',
          [IMPORT_STATUSES.FAILED]: 'bg-red-100 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-500/10',
          [IMPORT_STATUSES.PENDING]: 'bg-amber-100 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-500/10',
        };
        return (
          <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${statusColors[rowStatus]}`}>
            {rowStatus.toUpperCase()}
          </span>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => format(new Date(row.original.createdAt), 'MMM dd, yyyy HH:mm'),
    },
    {
      accessorKey: 'aiProvider',
      header: 'AI Engine',
      cell: ({ row }) => (
        <span className="capitalize text-xs font-semibold badge badge-neutral">{row.original.aiProvider}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black tracking-tight text-text-primary">System CSV Ingestions</h2>
        <p className="text-sm text-text-secondary mt-1">
          Review, filter, and audit all spreadsheet uploads and batch import jobs across the platform.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="card flex flex-col md:flex-row gap-4 items-center justify-between p-4">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 absolute left-3 top-3 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search files by filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="input-with-icon w-full"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="select flex-1 md:w-48 text-xs font-semibold"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
          <button onClick={handleSearch} className="btn-primary py-2.5 px-6 font-bold text-xs">
            Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        ) : imports.length > 0 ? (
          <div className="space-y-6">
            <DataTable data={imports} columns={columns} maxHeight="600px" />

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-border-primary">
                <p className="text-xs font-semibold text-text-secondary">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} imports
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="btn-secondary py-1.5 px-3 disabled:opacity-50 text-xs font-bold"
                  >
                    Previous
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setPagination((prev) => ({ ...prev, page }))}
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
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
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
            <FileCheck className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
            <p className="text-text-secondary font-bold">No import sessions recorded yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
