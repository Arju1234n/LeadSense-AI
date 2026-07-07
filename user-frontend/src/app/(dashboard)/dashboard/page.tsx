'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Upload, FileCheck, TrendingUp, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { importService } from '@/services/import.service';
import { ImportHistory, IMPORT_STATUSES } from '@/types';
import { formatNumber } from '@/lib/utils';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalImports: 0,
    totalLeads: 0,
    successRate: 0,
    lastImportDate: null as Date | null,
  });
  const [recentImports, setRecentImports] = useState<ImportHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await importService.getImportHistory(1, 5, 'createdAt', 'desc');
      
      if (response.success && response.data) {
        setRecentImports(response.data);
        
        const totalImports = response.pagination?.total || 0;
        const totalLeads = response.data.reduce((sum, imp) => sum + imp.successfulRows, 0);
        const totalRows = response.data.reduce((sum, imp) => sum + imp.totalRows, 0);
        const successRate = totalRows > 0 ? Math.round((totalLeads / totalRows) * 100) : 0;
        const lastImport = response.data[0];
        
        setStats({
          totalImports,
          totalLeads,
          successRate,
          lastImportDate: lastImport ? new Date(lastImport.createdAt) : null,
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<ImportHistory>[] = [
    {
      accessorKey: 'filename',
      header: 'Filename',
      cell: ({ row }) => (
        <span className="font-semibold text-text-primary text-sm">
          {row.original.filename}
        </span>
      ),
    },
    {
      accessorKey: 'totalRows',
      header: 'Total Rows',
      cell: ({ row }) => (
        <span className="font-medium text-text-secondary text-sm">
          {formatNumber(row.original.totalRows)}
        </span>
      ),
    },
    {
      accessorKey: 'successfulRows',
      header: 'Success',
      cell: ({ row }) => (
        <span className="text-emerald-500 font-semibold text-sm">
          {formatNumber(row.original.successfulRows)}
        </span>
      ),
    },
    {
      accessorKey: 'skippedRows',
      header: 'Skipped',
      cell: ({ row }) => (
        <span className="text-amber-500 font-semibold text-sm">
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
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-text-secondary font-medium text-xs">
          {format(new Date(row.original.createdAt), 'MMM dd, yyyy HH:mm')}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <button
          onClick={() => router.push(`/import/${row.original._id}/results`)}
          className="text-accent hover:text-accent-dark text-sm font-bold flex items-center gap-0.5 hover:underline"
        >
          View <ArrowRight className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  if (loading) {
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
    <div className="space-y-8">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-indigo-900 to-purple-900 text-white rounded-3xl p-8 overflow-hidden shadow-lg"
      >
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-grid opacity-10 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-Powered CSV Processing</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight mt-3">Welcome to GrowEasy Importer</h2>
            <p className="text-indigo-200 mt-2 max-w-xl text-sm font-medium leading-relaxed">
              Transform arbitrary CSV spreadsheets into clean, structured CRM leads automatically with deep learning validation.
            </p>
          </div>
          <Link href="/upload" className="btn-primary bg-white text-indigo-900 hover:bg-indigo-50 shadow-white/10 font-bold px-6">
            Upload CSV File
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>

      {/* Statistics */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatCard
          title="Total Imports"
          value={formatNumber(stats.totalImports)}
          icon={Upload}
          color="primary"
        />
        <StatCard
          title="Total Leads"
          value={formatNumber(stats.totalLeads)}
          icon={FileCheck}
          color="success"
        />
        <StatCard
          title="Success Rate"
          value={`${stats.successRate}%`}
          icon={TrendingUp}
          color="success"
          trend={{ value: 4.8, isPositive: true }}
        />
        <StatCard
          title="Last Import"
          value={
            stats.lastImportDate
              ? format(stats.lastImportDate, 'MMM dd, HH:mm')
              : 'No imports'
          }
          icon={Clock}
          color="primary"
        />
      </motion.div>

      {/* Recent Imports */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-text-primary">Recent Imports</h3>
            <p className="text-xs text-text-secondary mt-0.5">Summary of the latest data processing jobs</p>
          </div>
          <Link
            href="/history"
            className="text-accent hover:text-accent-dark text-sm font-bold flex items-center gap-1 hover:underline"
          >
            View All History <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {recentImports.length > 0 ? (
          <DataTable data={recentImports} columns={columns} maxHeight="400px" />
        ) : (
          <div className="text-center py-12">
            <Upload className="w-12 h-12 text-text-tertiary mx-auto mb-4 animate-bounce-slow" />
            <p className="text-text-secondary font-bold mb-4">No imports yet</p>
            <Link href="/upload" className="btn-primary">
              Upload Your First CSV
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
