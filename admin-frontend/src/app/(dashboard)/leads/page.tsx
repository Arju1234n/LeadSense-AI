'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/DataTable';
import SearchFilter from '@/components/SearchFilter';
import LeadDetailModal from '@/components/LeadDetailModal';
import { ColumnDef } from '@tanstack/react-table';
import { Database, Download, Eye, Trash2 } from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { formatNumber } from '@/lib/utils';
import { format } from 'date-fns';
import { Lead } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

export default function LeadsExplorerPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    country: '',
    dataSource: '',
    startDate: '',
    endDate: '',
  });
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchLeads();
  }, [filters.page, filters.status, filters.country, filters.startDate, filters.endDate]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await adminService.searchLeads(filters);
      if (response.success && response.data) {
        setLeads(response.data);
        if (response.pagination) {
          setTotalLeads(response.pagination.total);
          setTotalPages(response.pagination.pages);
        }
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (newFilters: any) => {
    setFilters((prev: any) => ({
      ...prev,
      ...newFilters,
      page: 1,
    }));
  };

  const handleClear = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: '',
      status: '',
      country: '',
      dataSource: '',
      startDate: '',
      endDate: '',
    });
  };

  const handleViewDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead? This action is irreversible.')) return;
    try {
      const response = await adminService.deleteLead(id);
      if (response.success) {
        setIsModalOpen(false);
        setSelectedLead(null);
        fetchLeads();
      }
    } catch (error) {
      console.error('Failed to delete lead:', error);
    }
  };

  const handleExport = () => {
    const url = adminService.getExportLeadsUrl(filters);
    window.open(url, '_blank');
  };

  const columns: ColumnDef<Lead>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <span className="font-bold text-text-primary text-sm">
          {row.original.name}
        </span>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => row.original.email || '-',
    },
    {
      accessorKey: 'mobile_without_country_code',
      header: 'Phone',
      cell: ({ row }) =>
        row.original.mobile_without_country_code
          ? `${row.original.country_code ? '+' + row.original.country_code : ''} ${row.original.mobile_without_country_code}`
          : '-',
    },
    {
      accessorKey: 'company',
      header: 'Company',
      cell: ({ row }) => row.original.company || '-',
    },
    {
      accessorKey: 'crm_status',
      header: 'CRM Status',
      cell: ({ row }) => (
        <span className="badge badge-primary text-[10px] uppercase font-bold">
          {row.original.crm_status}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewDetails(row.original)}
            className="p-1 text-accent hover:text-accent-dark transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteLead(row.original._id)}
            className="p-1 text-red-500 hover:text-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-text-primary">CRM Lead Explorer</h2>
          <p className="text-sm text-text-secondary mt-1">
            Search, filter, edit details, and delete lead contacts directly from the database catalog.
          </p>
        </div>
        {leads.length > 0 && (
          <button
            onClick={handleExport}
            className="btn-primary font-bold text-xs py-2.5 px-5 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Leads Catalog
          </button>
        )}
      </div>

      {/* Advanced Search Filter */}
      <SearchFilter onSearch={handleSearch} onClear={handleClear} />

      {/* Leads Table Card */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        ) : leads.length > 0 ? (
          <div className="space-y-6">
            <DataTable data={leads} columns={columns} maxHeight="600px" />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-border-primary">
                <p className="text-xs font-semibold text-text-secondary">
                  Showing {(filters.page - 1) * filters.limit + 1} to{' '}
                  {Math.min(filters.page * filters.limit, totalLeads)} of{' '}
                  {totalLeads} leads
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilters((prev: any) => ({ ...prev, page: prev.page - 1 }))}
                    disabled={filters.page === 1}
                    className="btn-secondary py-1.5 px-3 disabled:opacity-50 text-xs font-bold"
                  >
                    Previous
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setFilters((prev: any) => ({ ...prev, page }))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          page === filters.page
                            ? 'bg-accent text-white shadow-glow-sm'
                            : 'bg-bg-tertiary text-text-secondary hover:bg-border-primary'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setFilters((prev: any) => ({ ...prev, page: prev.page + 1 }))}
                    disabled={filters.page === totalPages}
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
            <Database className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
            <p className="text-text-secondary font-bold">No leads matched search filters</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <LeadDetailModal
            lead={selectedLead}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onDelete={handleDeleteLead}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
