'use client';

import { CheckCircle, AlertTriangle, FileCheck, Clock } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ImportSummaryProps {
  totalRows: number;
  successfulRows: number;
  skippedRows: number;
  processingTime: number;
  aiProvider: string;
}

export default function ImportSummary({
  totalRows,
  successfulRows,
  skippedRows,
  processingTime,
  aiProvider,
}: ImportSummaryProps) {
  const successRate = totalRows > 0 ? Math.round((successfulRows / totalRows) * 100) : 0;
  const skipRate = totalRows > 0 ? Math.round((skippedRows / totalRows) * 100) : 0;
  
  // SVG donut metrics
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const successOffset = circumference - (successRate / 100) * circumference;
  const skipOffset = circumference - ((successRate + skipRate) / 100) * circumference;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Visual Chart Card */}
      <div className="card col-span-1 flex flex-col items-center justify-center p-6 text-center">
        <h4 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-4 self-start">
          Distribution Ratio
        </h4>
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle cx="60" cy="60" r={radius} className="fill-none stroke-bg-tertiary stroke-[8]" />
            {/* Success segment */}
            {successfulRows > 0 && (
              <motion.circle
                cx="60"
                cy="60"
                r={radius}
                className="fill-none stroke-emerald-500 stroke-[10] stroke-linecap-round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: successOffset }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            )}
            {/* Skipped segment */}
            {skippedRows > 0 && (
              <motion.circle
                cx="60"
                cy="60"
                r={radius}
                className="fill-none stroke-amber-500 stroke-[8]"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: skipOffset }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              />
            )}
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold text-text-primary">{successRate}%</span>
            <span className="text-[10px] font-bold text-text-secondary uppercase mt-0.5">Success</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-6 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-text-secondary">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Success ({successfulRows})</span>
          </div>
          <div className="flex items-center gap-1.5 text-text-secondary">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Skipped ({skippedRows})</span>
          </div>
        </div>
      </div>

      {/* Numerical Stats Grid */}
      <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total rows */}
        <motion.div
          whileHover={{ y: -2 }}
          className="border border-border-primary/80 bg-bg-secondary p-5 rounded-2xl flex items-center gap-4 shadow-sm"
        >
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl text-indigo-600 dark:text-indigo-400">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Total Rows</p>
            <p className="text-2xl font-black text-text-primary mt-1">{formatNumber(totalRows)}</p>
          </div>
        </motion.div>

        {/* Success */}
        <motion.div
          whileHover={{ y: -2 }}
          className="border border-border-primary/80 bg-bg-secondary p-5 rounded-2xl flex items-center gap-4 shadow-sm"
        >
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Successful Imports</p>
            <p className="text-2xl font-black text-emerald-500 mt-1">{formatNumber(successfulRows)}</p>
          </div>
        </motion.div>

        {/* Skipped */}
        <motion.div
          whileHover={{ y: -2 }}
          className="border border-border-primary/80 bg-bg-secondary p-5 rounded-2xl flex items-center gap-4 shadow-sm"
        >
          <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Skipped Records</p>
            <p className="text-2xl font-black text-amber-500 mt-1">{formatNumber(skippedRows)}</p>
          </div>
        </motion.div>

        {/* Speed */}
        <motion.div
          whileHover={{ y: -2 }}
          className="border border-border-primary/80 bg-bg-secondary p-5 rounded-2xl flex items-center gap-4 shadow-sm"
        >
          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl text-purple-600 dark:text-purple-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Processing Speed</p>
            <p className="text-2xl font-black text-text-primary mt-1">
              {Math.round(processingTime / 1000)}s
              <span className="text-xs font-medium text-text-secondary ml-1.5 capitalize">via {aiProvider}</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
