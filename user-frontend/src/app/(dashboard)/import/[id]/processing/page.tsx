'use client';

import { useParams } from 'next/navigation';
import ProgressBar from '@/components/ProgressBar';
import LoadingOverlay from '@/components/LoadingOverlay';
import { CheckCircle, Clock, FileCheck, AlertTriangle } from 'lucide-react';
import { useImport } from '@/hooks/useImport';
import { calculatePercentage, formatNumber } from '@/lib/utils';
import { IMPORT_STATUSES } from '@/types';
import { motion } from 'framer-motion';

export default function ProcessingPage() {
  const params = useParams();
  const importId = params?.id as string;
  const { status, loading, error, startImport } = useImport(importId);

  if (loading || !status) {
    return <LoadingOverlay message="Fetching pipeline status..." />;
  }

  const progress = status.totalRows > 0
    ? calculatePercentage(status.successfulRows + status.skippedRows, status.totalRows)
    : 0;

  const isProcessing = status.status === IMPORT_STATUSES.PROCESSING;
  const isCompleted = status.status === IMPORT_STATUSES.COMPLETED;
  const isFailed = status.status === IMPORT_STATUSES.FAILED;

  const stepStatus = (stepMinProgress: number) => {
    if (isCompleted) return 'completed';
    if (isFailed && progress < stepMinProgress) return 'error';
    if (progress >= stepMinProgress) return 'completed';
    if (progress >= stepMinProgress - 20) return 'processing';
    return 'pending';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="card text-center flex flex-col items-center justify-center p-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-bg text-accent rounded-2xl shadow-sm mb-4">
          {isCompleted ? (
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          ) : isFailed ? (
            <AlertTriangle className="w-8 h-8 text-red-500" />
          ) : (
            <Clock className="w-8 h-8 text-indigo-500 animate-pulse" />
          )}
        </div>
        <h2 className="text-2xl font-black text-text-primary tracking-tight mb-2">
          {isCompleted
            ? 'Import Completed!'
            : isFailed
            ? 'Import Failed'
            : 'AI Extraction Pipeline Active'}
        </h2>
        <p className="text-sm font-semibold text-text-secondary max-w-lg leading-relaxed">
          {isCompleted
            ? 'Your spreadsheet has been successfully parsed, normalized, and imported into the CRM.'
            : isFailed
            ? error || status.errorMessage || 'An error occurred during row extraction.'
            : 'Please keep this window open while the AI mapping engine processes the rows in batches.'}
        </p>
      </div>

      {/* Progress */}
      <div className="card p-6">
        <h3 className="text-base font-bold text-text-primary mb-4">Batch Progress</h3>
        <ProgressBar
          progress={progress}
          status={
            isCompleted
              ? 'completed'
              : isFailed
              ? 'error'
              : 'processing'
          }
          message={`Completed rows ${status.successfulRows + status.skippedRows} of ${status.totalRows}`}
        />
        <div className="mt-4 flex justify-between items-center text-xs font-semibold text-text-secondary">
          <span>Started: {new Date(status.startedAt).toLocaleTimeString()}</span>
          <span>Elapsed Time: {Math.ceil(status.processingTime / 1000)}s</span>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-5 flex items-center gap-4">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl text-indigo-600 dark:text-indigo-400">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Total Rows</p>
            <p className="text-2xl font-black text-text-primary mt-1">
              {formatNumber(status.totalRows)}
            </p>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Successfully Mapped</p>
            <p className="text-2xl font-black text-emerald-500 mt-1">
              {formatNumber(status.successfulRows)}
            </p>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Skipped (No Contact)</p>
            <p className="text-2xl font-black text-amber-500 mt-1">
              {formatNumber(status.skippedRows)}
            </p>
          </div>
        </div>
      </div>

      {/* Processing Steps Timeline */}
      <div className="card p-6">
        <h3 className="text-base font-bold text-text-primary mb-6">Pipeline Step Tracking</h3>
        <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-bg-tertiary">
          {[
            { label: 'CSV File Structure Verification', min: 10, desc: 'Headers parsed, empty columns cleared.' },
            { label: 'Batched AI Attribute Extraction', min: 40, desc: 'LLM maps messy text fields to destination attributes.' },
            { label: 'Record Normalization', min: 70, desc: 'ISO dates, country code normalization, lowercase emails.' },
            { label: 'Duplication Checking & Merging', min: 90, desc: 'Validation across existing database records.' },
            { label: 'CRM Database Transaction', min: 100, desc: 'Batch inserting unique leads securely.' },
          ].map((step, idx) => {
            const state = stepStatus(step.min);
            return (
              <div key={idx} className="flex gap-4 items-start relative pl-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center border-2 z-10 transition-colors duration-300 ${
                    state === 'completed'
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : state === 'processing'
                      ? 'bg-bg-secondary border-indigo-500 text-indigo-500 shadow-glow-sm'
                      : state === 'error'
                      ? 'bg-red-500 border-red-500 text-white'
                      : 'bg-bg-secondary border-border-primary text-text-tertiary'
                  }`}
                >
                  {state === 'completed' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : state === 'processing' ? (
                    <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping" />
                  ) : state === 'error' ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <span className="w-1.5 h-1.5 bg-text-tertiary rounded-full" />
                  )}
                </div>
                <div>
                  <span
                    className={`text-sm font-bold block ${
                      state === 'completed' || state === 'processing'
                        ? 'text-text-primary'
                        : 'text-text-secondary'
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="text-xs text-text-secondary mt-1 block font-medium">
                    {step.desc}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
