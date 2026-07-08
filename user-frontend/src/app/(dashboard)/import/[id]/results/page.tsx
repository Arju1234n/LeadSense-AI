'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import DataTable from '@/components/DataTable';
import LoadingOverlay from '@/components/LoadingOverlay';
import ImportSummary from '@/components/ImportSummary';
import { ColumnDef } from '@tanstack/react-table';
import {
  CheckCircle,
  AlertTriangle,
  FileCheck,
  Clock,
  Download,
  ArrowLeft,
} from 'lucide-react';
import { importService } from '@/services/import.service';
import { ImportHistory, Lead, SkippedRecord } from '@/types';
import { formatFileSize, formatNumber } from '@/lib/utils';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function ResultsPage() {
  const router = useRouter();
  const params = useParams();
  const importId = params?.id as string;
  
  const [importData, setImportData] = useState<ImportHistory | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'successful' | 'skipped'>('successful');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (importId) {
      fetchResults();
    }
  }, [importId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await importService.getImportResults(importId);
      
      if (response.success && response.data) {
        setImportData(response.data.import);
        setLeads(response.data.leads);
      } else {
        setError(response.message || 'Failed to fetch results');
      }
    } catch (err: any) {
      console.error('Failed to fetch results:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (leads.length === 0) return;
    
    // Define headers
    const headers = [
      'Name',
      'Email',
      'Phone',
      'Company',
      'City',
      'State',
      'Country',
      'CRM Status',
      'Description',
      'Created At'
    ];

    // Map leads to rows
    const rows = leads.map(lead => [
      `"${(lead.name || '').replace(/"/g, '""')}"`,
      `"${(lead.email || '').replace(/"/g, '""')}"`,
      `"${((lead.country_code || '') + (lead.mobile_without_country_code || '')).replace(/"/g, '""')}"`,
      `"${(lead.company || '').replace(/"/g, '""')}"`,
      `"${(lead.city || '').replace(/"/g, '""')}"`,
      `"${(lead.state || '').replace(/"/g, '""')}"`,
      `"${(lead.country || '').replace(/"/g, '""')}"`,
      `"${(lead.crm_status || '').replace(/"/g, '""')}"`,
      `"${(lead.description || '').replace(/"/g, '""')}"`,
      `"${lead.created_at || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_import_${importId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <LoadingOverlay message="Loading import results..." />;
  }

  if (error || !importData) {
    return (
      <div className="card text-center py-12 max-w-xl mx-auto space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto animate-pulse" />
        <div>
          <h3 className="text-lg font-bold text-text-primary">Results Not Available</h3>
          <p className="text-sm text-text-secondary mt-1">{error || 'Data is missing'}</p>
        </div>
        <Link href="/history" className="btn-primary mt-2 inline-flex">
          View Import History
        </Link>
      </div>
    );
  }

  // Columns for successful leads
  const leadsColumns: ColumnDef<Lead>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <span className="font-semibold text-text-primary">{row.original.name}</span>
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => row.original.email
        ? <a href={`mailto:${row.original.email}`} className="text-accent hover:underline">{row.original.email}</a>
        : <span className="text-text-tertiary">-</span>,
    },
    {
      accessorKey: 'mobile_without_country_code',
      header: 'Phone',
      cell: ({ row }) =>
        row.original.mobile_without_country_code
          ? `${row.original.country_code || ''} ${row.original.mobile_without_country_code}`.trim()
          : '-',
    },
    {
      accessorKey: 'company',
      header: 'Company',
      cell: ({ row }) => row.original.company || '-',
    },
    {
      accessorKey: 'city',
      header: 'City',
      cell: ({ row }) => row.original.city || '-',
    },
    {
      accessorKey: 'state',
      header: 'State',
      cell: ({ row }) => row.original.state || '-',
    },
    {
      accessorKey: 'data_source',
      header: 'Source',
      cell: ({ row }) => row.original.data_source
        ? <span className="font-mono text-xs bg-bg-tertiary border border-border-primary px-2 py-0.5 rounded-lg">{row.original.data_source}</span>
        : <span className="text-text-tertiary">-</span>,
    },
    {
      accessorKey: 'crm_status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.crm_status;
        const statusStyles: Record<string, string> = {
          'GOOD_LEAD_FOLLOW_UP': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700',
          'DID_NOT_CONNECT': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-700',
          'BAD_LEAD': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-700',
          'SALE_DONE': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700',
        };
        const statusLabels: Record<string, string> = {
          'GOOD_LEAD_FOLLOW_UP': 'Follow Up',
          'DID_NOT_CONNECT': 'No Connect',
          'BAD_LEAD': 'Bad Lead',
          'SALE_DONE': 'Sale Done',
        };
        const badgeStyle = statusStyles[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border border-gray-200 dark:border-gray-700';
        const label = statusLabels[status] || status;
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${badgeStyle}`}>
            {label}
          </span>
        );
      },
    },
    {
      accessorKey: 'crm_note',
      header: 'Notes',
      cell: ({ row }) => row.original.crm_note
        ? <span className="text-xs text-text-secondary max-w-xs block truncate" title={row.original.crm_note}>{row.original.crm_note}</span>
        : <span className="text-text-tertiary">-</span>,
    },
  ];

  // Columns for skipped records
  const skippedColumns: ColumnDef<SkippedRecord>[] = [
    {
      accessorKey: 'row',
      header: 'Row #',
      cell: ({ row }) => <span className="font-bold text-text-secondary">#{row.original.row}</span>
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
      cell: ({ row }) => <span className="text-red-500 font-semibold text-xs">{row.original.reason}</span>
    },
    {
      accessorKey: 'data',
      header: 'Original Data',
      cell: ({ row }) => (
        <pre className="text-[10px] bg-bg-tertiary border border-border-primary rounded-xl p-3 max-w-md overflow-x-auto font-mono text-text-secondary">
          {JSON.stringify(row.original.data, null, 2)}
        </pre>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/upload"
        className="inline-flex items-center gap-2 text-accent hover:underline font-bold text-sm transition-colors"
      >
        + Import Another File
      </Link>

      {/* Summary Cards */}
      <ImportSummary
        totalRows={importData.totalRows}
        successfulRows={importData.successfulRows}
        skippedRows={importData.skippedRows}
        processingTime={importData.processingTime}
        aiProvider={importData.aiProvider}
      />

      {/* Import Metadata Detail */}
      <div className="card p-6">
        <h3 className="text-base font-bold text-text-primary mb-4">Ingestion Audit Log</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold text-text-secondary">
          <div>
            <p className="text-text-tertiary uppercase tracking-wider text-[10px]">Filename</p>
            <p className="text-text-primary mt-1 truncate">{importData.filename}</p>
          </div>
          <div>
            <p className="text-text-tertiary uppercase tracking-wider text-[10px]">File Size</p>
            <p className="text-text-primary mt-1">
              {formatFileSize(importData.filesize)}
            </p>
          </div>
          <div>
            <p className="text-text-tertiary uppercase tracking-wider text-[10px]">Import Session</p>
            <p className="text-text-primary mt-1 font-mono">{importId.substring(0, 8)}...</p>
          </div>
          <div>
            <p className="text-text-tertiary uppercase tracking-wider text-[10px]">Timestamp</p>
            <p className="text-text-primary mt-1">
              {format(new Date(importData.createdAt), 'MMM dd, yyyy HH:mm')}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border-primary/80 pb-4 mb-6 gap-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('successful')}
              className={`pb-2 border-b-2 font-bold text-sm transition-colors ${
                activeTab === 'successful'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Successful Leads ({importData.successfulRows})
            </button>
            <button
              onClick={() => setActiveTab('skipped')}
              className={`pb-2 border-b-2 font-bold text-sm transition-colors ${
                activeTab === 'skipped'
                  ? 'border-amber-500 text-amber-500'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Skipped Records ({importData.skippedRows})
            </button>
          </div>
          {activeTab === 'successful' && leads.length > 0 && (
            <button 
              onClick={handleExportCSV}
              className="btn-secondary w-full sm:w-auto font-bold flex items-center justify-center gap-2 py-2 text-xs"
            >
              <Download className="w-4 h-4" />
              Export to CSV
            </button>
          )}
        </div>

        {/* Tables */}
        {activeTab === 'successful' ? (
          leads.length > 0 ? (
            <DataTable data={leads} columns={leadsColumns} maxHeight="450px" />
          ) : (
            <div className="text-center py-12 text-text-secondary font-bold text-sm">
              No successful imports
            </div>
          )
        ) : (
          importData.skippedRecords && importData.skippedRecords.length > 0 ? (
            <DataTable data={importData.skippedRecords} columns={skippedColumns} maxHeight="450px" />
          ) : (
            <div className="text-center py-12 text-text-secondary font-bold text-sm">
              No skipped records
            </div>
          )
        )}
      </div>
    </div>
  );
}
