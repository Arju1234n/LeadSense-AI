'use client';

import { useState, useEffect, useRef } from 'react';
import { importService } from '@/services/import.service';
import { ImportStatusResponse, IMPORT_STATUSES } from '@/types';
import { useRouter } from 'next/navigation';

export function useImport(importId: string) {
  const router = useRouter();
  const [status, setStatus] = useState<ImportStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startImport = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await importService.processImport(importId);
      if (response.success) {
        pollStatus();
      } else {
        setError(response.message || 'Failed to start import');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to start import');
      setLoading(false);
    }
  };

  const pollStatus = async () => {
    try {
      const response = await importService.getImportStatus(importId);
      if (response.success && response.data) {
        setStatus(response.data);
        setLoading(false);

        if (
          response.data.status === IMPORT_STATUSES.COMPLETED ||
          response.data.status === IMPORT_STATUSES.FAILED
        ) {
          router.push(`/import/${importId}/results`);
          return;
        }

        // Setup interval for subsequent polling
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        
        pollingIntervalRef.current = setInterval(async () => {
          try {
            const pollResponse = await importService.getImportStatus(importId);
            if (pollResponse.success && pollResponse.data) {
              setStatus(pollResponse.data);
              if (
                pollResponse.data.status === IMPORT_STATUSES.COMPLETED ||
                pollResponse.data.status === IMPORT_STATUSES.FAILED
              ) {
                if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                router.push(`/import/${importId}/results`);
              }
            }
          } catch (pollErr) {
            console.error('Polling error:', pollErr);
          }
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch import status');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (importId) {
      pollStatus();
    }
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [importId]);

  return {
    status,
    loading,
    error,
    startImport,
    pollStatus,
  };
}
