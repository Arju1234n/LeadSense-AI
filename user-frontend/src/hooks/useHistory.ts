'use client';

import { useState, useEffect, useCallback } from 'react';
import { importService } from '@/services/import.service';
import { ImportHistory } from '@/types';

export function useHistory() {
  const [history, setHistory] = useState<ImportHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await importService.getImportHistory(
        pagination.page,
        pagination.limit,
        sortBy,
        sortOrder
      );

      if (response.success && response.data) {
        setHistory(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        setError(response.message || 'Failed to fetch history');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, sortBy, sortOrder]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const setPage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  return {
    history,
    loading,
    error,
    pagination,
    sortBy,
    sortOrder,
    setPage,
    setSortBy,
    setSortOrder,
    refresh: fetchHistory,
  };
}
