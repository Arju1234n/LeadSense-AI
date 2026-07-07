'use client';

import { useState } from 'react';
import { Search, Filter, RefreshCw, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface SearchFilterProps {
  onSearch: (filters: {
    search: string;
    status: string;
    country: string;
    dataSource: string;
    startDate: string;
    endDate: string;
  }) => void;
  onClear: () => void;
  statusOptions?: string[];
  dataSourceOptions?: string[];
}

export default function SearchFilter({
  onSearch,
  onClear,
  statusOptions = ['new', 'contacted', 'qualified', 'lost'],
  dataSourceOptions = ['csv_import', 'manual_entry', 'web_form'],
}: SearchFilterProps) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [country, setCountry] = useState('');
  const [dataSource, setDataSource] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showAdvance, setShowAdvance] = useState(false);

  const handleApply = () => {
    onSearch({ search, status, country, dataSource, startDate, endDate });
  };

  const handleReset = () => {
    setSearch('');
    setStatus('');
    setCountry('');
    setDataSource('');
    setStartDate('');
    setEndDate('');
    onClear();
  };

  return (
    <div className="card space-y-4">
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-3 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search leads by name, email, company, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            className="input-with-icon w-full"
          />
        </div>
        <button onClick={handleApply} className="btn-primary py-2.5 px-6">
          Search
        </button>
        <button
          onClick={() => setShowAdvance(!showAdvance)}
          className={`btn-secondary py-2.5 flex items-center gap-1.5 ${showAdvance ? 'bg-bg-tertiary' : ''}`}
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
        <button onClick={handleReset} className="btn-icon border border-border-primary rounded-xl">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {showAdvance && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-border-primary"
        >
          <div>
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block mb-1">CRM Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="select w-full"
            >
              <option value="">All Statuses</option>
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block mb-1">Country</label>
            <input
              type="text"
              placeholder="e.g. United States"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input text-xs"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input text-xs"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
