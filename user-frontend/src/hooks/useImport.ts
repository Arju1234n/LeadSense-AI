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
  // Track whether we've shown the processing UI for at least one cycle
  const hasShownProcessingRef = useRef(false);
  // Minimum time (ms) to show the processing page before redirecting
  const MIN_DISPLAY_MS = 1500;
  const mountTimeRef = useRef<number>(Date.now());

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

  /**
   * Redirect to results, but always ensure the processing page has been
   * visible for at least MIN_DISPLAY_MS so the animation is seen.
   */
  const redirectToResults = () => {
    const elapsed = Date.now() - mountTimeRef.current;
    const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
    setTimeout(() => {
      router.push(`/import/${importId}/results`);
    }, remaining);
  };

  const pollStatus = async (isInitial = false) => {
    try {
      const response = await importService.getImportStatus(importId);
      if (response.success && response.data) {
        setStatus(response.data);
        setLoading(false);

        const isTerminal =
          response.data.status === IMPORT_STATUSES.COMPLETED ||
          response.data.status === IMPORT_STATUSES.FAILED;

        if (isTerminal) {
          // On the very first poll, if we're already done, still show the
          // processing UI for MIN_DISPLAY_MS so the animation plays.
          if (isInitial) {
            // Mark that processing was shown (even if briefly)
            hasShownProcessingRef.current = true;
            redirectToResults();
          } else {
            // Subsequent poll hit terminal — redirect with remaining time guard
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
            redirectToResults();
          }
          return;
        }

        // Still running — set up interval for subsequent polls
        hasShownProcessingRef.current = true;
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
                redirectToResults();
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
    mountTimeRef.current = Date.now();
    if (importId) {
      pollStatus(true);
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
